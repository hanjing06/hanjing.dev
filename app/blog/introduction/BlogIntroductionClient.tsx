'use client';

import { track } from '@vercel/analytics/react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const paragraphs = [
  'hello :) my name is hanjing and i’m an engineer. from a very young age, i really wanted a blog. somewhere to express myself in a format that i enjoy which is writing or video.',
  'i started this not because i have anything valuable or astounding to say but i like to document my thoughts in order so when i come back to this time, im able to recall what i was making, thinking or doing at that time.',
  'in my blog you’ll find notes on: engineering, tech, what i’m learning/what i’ve learned, and think pieces.',
  'although i’m not an incredible writer, my main goal with my blog is to inspire. whether that’s creating, thinking, or revisiting a certain interest, if any of this helps you start, then my mission here is complete.',
  'thank you for taking your time to visit, i hope we meet again.',
  'in the mean time, feel free to look around my website.',
];

export default function BlogIntroductionClient() {
  useEffect(() => {
    const sessionKey = 'blog-read:introduction';

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    sessionStorage.setItem(sessionKey, 'true');
    track('blog_read', {
      slug: 'introduction',
      title: 'an introduction',
    });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <motion.article
        variants={container}
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
            start here - july 2026
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-3 max-w-[12ch] text-4xl tracking-tight text-black sm:text-5xl md:text-6xl"
          >
            an introduction.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="relative mt-8 aspect-[16/10] w-full overflow-hidden bg-neutral-100 sm:aspect-[16/9]"
          >
            <Image
              src="/blog-intro.jpeg"
              alt="A nighttime street photo introducing the blog"
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

            <p className="pt-4 text-neutral-700">- hanjing</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-2 text-[1.05rem] tracking-wide text-[#BEBEBE]"
          >
            <Image
              src="/eye.png"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
              className="opacity-60"
            />
            <span>1 reads</span>
          </motion.div>
        </div>
      </motion.article>
    </main>
  );
}
