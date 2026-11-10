import { pageMetadata } from '@/lib/metadata';

export type Post = {
  /** Folder name under `app/blog/` and `public/blog/`. */
  slug: string;
  /** Bold first line of the card on /blog. */
  listTitle: string;
  /** Second line of the card on /blog. */
  listSubtitle: string;
  /** Date line of the card on /blog. */
  dateLabel: string;
  /** Small line above the post title. */
  kicker: string;
  /** Post title. */
  title: string;
  /** Post body, one string per paragraph (also read by the desk terminal). */
  body: string[];
  /** Browser title + search description for the post page. */
  seo: {
    title: string;
    description: string;
  };
};

/**
 * Every blog post, newest first. Adding an entry here lists it on /blog and
 * gives the post page its metadata (via `postMetadata`).
 * The blog is currently hidden from search engines (`noIndex`).
 */
export const posts: Post[] = [
  {
    slug: 'introduction',
    listTitle: 'start here.',
    listSubtitle: 'an introduction',
    dateLabel: 'july 17, 2026',
    kicker: 'start here - july 2026',
    title: 'an introduction.',
    body: [
      'hello :) my name is hanjing and i’m an engineer. from a very young age, i really wanted a blog. somewhere to express myself in a format that i enjoy which is writing or video.',
      'i started this not because i have anything valuable or astounding to say but i like to document my thoughts in order so when i come back to this time, im able to recall what i was making, thinking or doing at that time.',
      'in my blog you’ll find notes on: engineering, tech, what i’m learning/what i’ve learned, and think pieces.',
      'although i’m not an incredible writer, my main goal with my blog is to inspire. whether that’s creating, thinking, or revisiting a certain interest, if any of this helps you start, then my mission here is complete.',
      'thank you for taking your time to visit, i hope we meet again.',
      'in the mean time, feel free to look around my website.',
    ],
    seo: {
      title: 'An Introduction',
      description: 'An introduction to Hanjing Lin and the writing behind this blog.',
    },
  },
];

export const postHref = (slug: string) => `/blog/${slug}`;

export function getPost(slug: string): Post {
  const post = posts.find((entry) => entry.slug === slug);
  if (!post) {
    throw new Error(`Unknown post slug "${slug}". Add it to content/posts.ts.`);
  }
  return post;
}

/** Metadata for `app/blog/<slug>/page.tsx`. */
export function postMetadata(slug: string) {
  const { seo } = getPost(slug);
  return pageMetadata({ ...seo, path: postHref(slug), noIndex: true });
}
