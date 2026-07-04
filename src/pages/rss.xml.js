import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getSanityPosts } from '../lib/sanity';

export async function GET(context) {
	const sanityPosts = await getSanityPosts();
	if (sanityPosts.length > 0) {
		return rss({
			title: SITE_TITLE,
			description: SITE_DESCRIPTION,
			site: context.site,
			items: sanityPosts.map((post) => ({
				title: post.title,
				description: post.description,
				pubDate: new Date(post.publishedAt),
				link: `/blog/${post.slug}/`,
			})),
		});
	}

	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}
