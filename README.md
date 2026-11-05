# hanjing.dev

Personal portfolio and blog for Hanjing Lin. Built with Next.js (App Router), React, Tailwind CSS v4, and Framer Motion. Deployed on Vercel.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

## Project structure

```
app/                     Routes only (Next.js App Router)
  layout.tsx             Root layout: global metadata, JSON-LD, navbar, footer
  page.tsx               Home
  about/ contact/        Static pages (layout.tsx holds metadata, page.tsx the UI)
  projects/
    page.tsx             Projects index, rendered from content/projects.ts
    <slug>/              One folder per project write-up
  blog/
    page.tsx             Blog index, rendered from content/posts.ts
    <slug>/page.tsx      One folder per post
  sitemap.ts robots.ts   Generated from content/ + lib/site.ts
  opengraph-image.tsx    Social preview image
  api/health/            Health-check endpoint

components/              Reusable UI (Navbar, Footer, BlogPost,
                         ArticleTableOfContents, ExpandableImage, ...)
content/
  projects.ts            Registry of projects: card info, tags, SEO
  posts.ts               Registry of blog posts: list info, SEO
lib/
  site.ts                Site URL, email, social links
  motion.ts              Shared Framer Motion variants and easings
  metadata.ts            pageMetadata() helper for per-route metadata

public/                  Static assets, grouped by page
  about/                 About-page images
  blog/<slug>/           Images for each blog post
  projects/<slug>/       Images for each project
  icons/                 Shared icons
  websitelogo.png        Favicon
```

Import shared code with the `@/` alias, e.g. `import { fadeUp } from '@/lib/motion'`.

## Adding a project

1. **Register it** in `content/projects.ts`. Add an entry with `slug`, `title`, `summary`, `cover`, `tags`, and `seo`. The order of the array is the order on `/projects`. This one entry adds the card to the index and the URL to the sitemap.
2. **Add images** to `public/projects/<slug>/`. Name the card image `cover.jpg`.
3. **Create the page.** Copy an existing project folder (for example `app/projects/tiny-squares-camera-system/`) to `app/projects/<slug>/`:
   - `layout.tsx`: change the slug in `projectMetadata('<slug>')`.
   - `page.tsx`: replace the content. Update `articleSections` so it matches the `id` of each `<motion.section>`, which keeps the table of contents in sync.

## Adding a blog post

1. **Register it** in `content/posts.ts`, newest first. Fill in `slug`, `listTitle`, `listSubtitle`, `dateLabel`, and `seo`.
2. **Add the hero image** at `public/blog/<slug>/cover.jpeg`.
3. **Create `app/blog/<slug>/page.tsx`**:

   ```tsx
   import BlogPost from '@/components/BlogPost';
   import { postMetadata } from '@/content/posts';

   export const metadata = postMetadata('<slug>');

   export default function Page() {
     return (
       <BlogPost
         kicker="topic - month year"
         title="post title."
         cover={{ src: '/blog/<slug>/cover.jpeg', alt: '...' }}
         paragraphs={['first paragraph', 'second paragraph']}
       />
     );
   }
   ```

The blog is currently `noIndex`, so search engines don't index it and it's left out of the sitemap. To change that, see `lib/metadata.ts` / `content/posts.ts` and `app/sitemap.ts`.

## Adding a top-level page

1. Create `app/<name>/page.tsx`, plus `app/<name>/layout.tsx` that exports `pageMetadata({ title, description, path })`.
2. Add the link to `navLinks` in `components/Navbar.tsx`.
3. Add the route to `app/sitemap.ts`.

## Changing personal details

Email, GitHub, LinkedIn, and the site URL are all in `lib/site.ts`.
