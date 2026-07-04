const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = 'v2025-02-19';

export const sanityStudioUrl = import.meta.env.PUBLIC_SANITY_STUDIO_URL || 'https://www.sanity.io/manage';
export const hasSanityConfig = Boolean(projectId && projectId !== 'your-project-id');

export type SanityPost = {
	title: string;
	description: string;
	slug: string;
	publishedAt: string;
	updatedAt?: string;
	heroImageUrl?: string;
	body?: PortableTextBlock[];
};

type PortableTextChild = {
	text?: string;
	marks?: string[];
};

type PortableTextBlock = {
	_type: string;
	style?: string;
	listItem?: string;
	children?: PortableTextChild[];
};

const postFields = `{
  title,
  "description": coalesce(description, excerpt, ""),
  "slug": slug.current,
  publishedAt,
  "updatedAt": _updatedAt,
  heroImage,
  body
}`;

const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) ${postFields}`;

export async function getSanityPosts(): Promise<SanityPost[]> {
	if (!hasSanityConfig) return [];

	const url = `https://${projectId}.api.sanity.io/${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(postsQuery)}`;
	const response = await fetch(url);

	if (!response.ok) {
		console.warn(`Sanity query failed: ${response.status} ${response.statusText}`);
		return [];
	}

	const json = await response.json();
	return (json.result || []).map((post: any) => ({
		title: post.title,
		description: post.description,
		slug: post.slug,
		publishedAt: post.publishedAt || post.updatedAt,
		updatedAt: post.updatedAt,
		heroImageUrl: getSanityImageUrl(post.heroImage),
		body: post.body || [],
	}));
}

export function getSanityImageUrl(image: any) {
	const ref = image?.asset?._ref;
	if (!ref || !hasSanityConfig) return undefined;

	const match = ref.match(/^image-(.+)-(\d+x\d+)-([a-z0-9]+)$/i);
	if (!match) return undefined;

	const [, id, dimensions, format] = match;
	return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
}

export function renderPortableText(blocks: PortableTextBlock[] = []) {
	let html = '';
	let openList: 'ul' | 'ol' | null = null;

	const closeList = () => {
		if (openList) {
			html += `</${openList}>`;
			openList = null;
		}
	};

	for (const block of blocks) {
		if (block._type !== 'block') continue;

		const content = (block.children || []).map(renderSpan).join('');
		if (!content.trim()) continue;

		if (block.listItem) {
			const listTag = block.listItem === 'number' ? 'ol' : 'ul';
			if (openList !== listTag) {
				closeList();
				html += `<${listTag}>`;
				openList = listTag;
			}
			html += `<li>${content}</li>`;
			continue;
		}

		closeList();
		const style = block.style || 'normal';
		if (style === 'h2') html += `<h2>${content}</h2>`;
		else if (style === 'h3') html += `<h3>${content}</h3>`;
		else if (style === 'blockquote') html += `<blockquote>${content}</blockquote>`;
		else html += `<p>${content}</p>`;
	}

	closeList();
	return html;
}

function renderSpan(span: PortableTextChild) {
	let text = escapeHtml(span.text || '');
	for (const mark of span.marks || []) {
		if (mark === 'strong') text = `<strong>${text}</strong>`;
		if (mark === 'em') text = `<em>${text}</em>`;
		if (mark === 'code') text = `<code>${text}</code>`;
	}
	return text;
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
