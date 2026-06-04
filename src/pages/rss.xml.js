import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteMeta, sortByDateDesc, withBase } from '../lib/site';

export async function GET(context) {
  const posts = sortByDateDesc(await getCollection('posts', ({ data }) => !data.draft));

  return rss({
    title: siteMeta.name,
    description: siteMeta.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: withBase(`/blog/${post.id}/`),
    })),
  });
}
