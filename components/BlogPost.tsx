'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { pageContainer, fadeUp } from '@/lib/motion';

export type BlogPostProps = {
  /** Small line above the title, e.g. "start here - july 2026". */
  kicker: string;
  title: string;
  /** Hero image, usually `/blog/<slug>/cover.jpeg`. */
  cover: { src: string; alt: string };
  paragraphs: string[];
  signature?: string;
};

/** Layout shared by every blog post: back link, kicker, title, hero, body. */
export default function BlogPost({
  kicker,
  title,
  cover,
  paragraphs,
  signature = '- hanjing',
}: BlogPostProps) {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <motion.article
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="site-container min-w-0 break-words py-20 sm:py-32"
      >
        <div className="mx-auto w-full max-w-[880px] min-w-0">
          <motion.div variants={fadeUp}>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-black"
            >
              ← back to blog
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-10 text-lg tracking-normal text-neutral-600"
          >
            {kicker}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-3 max-w-[12ch] text-4xl tracking-tight text-black sm:text-5xl md:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="relative mt-8 aspect-[16/10] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/9]"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="(min-width: 1024px) 880px, calc(100vw - 48px)"
              className="object-cover"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 max-w-[860px] space-y-6 text-sm leading-relaxed tracking-wide text-neutral-600 sm:space-y-8 sm:text-base md:text-[1.05rem]"
          >
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p className="pt-4 text-neutral-700">{signature}</p>
          </motion.div>
        </div>
      </motion.article>
    </main>
  );
}
