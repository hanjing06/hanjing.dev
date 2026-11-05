'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { postHref, posts } from '@/content/posts';
import { pageContainer, fadeUp } from '@/lib/motion';

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="site-container py-32"
      >
        <motion.h1
          variants={fadeUp}
          className="mb-10 text-5xl tracking-tight text-black sm:text-6xl"
        >
          hanjing&apos;s blog.
        </motion.h1>

        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            variants={fadeUp}
            className={index === 0 ? 'max-w-[280px]' : 'mt-8 max-w-[280px]'}
          >
            <Link
              href={postHref(post.slug)}
              className="group inline-block text-black"
              aria-label={`Read ${post.listTitle.replace(/\.$/, '')}`}
            >
              <p className="text-lg font-semibold tracking-normal text-black transition-colors duration-200 group-hover:text-neutral-600">
                {post.listTitle}
              </p>
              <p className="text-lg tracking-normal text-neutral-800">
                {post.listSubtitle}
              </p>
              <p className="text-lg tracking-normal text-neutral-600">
                {post.dateLabel}
              </p>
            </Link>
          </motion.div>
        ))}

        <motion.div
          variants={fadeUp}
          className="mt-10 h-px w-full bg-black"
        />
      </motion.section>
    </main>
  );
}
