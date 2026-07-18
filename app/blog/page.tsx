'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={container}
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

        <motion.div variants={fadeUp} className="max-w-[280px]">
          <Link
            href="/blog/introduction"
            className="group inline-block text-black"
            aria-label="Read start here"
          >
            <p className="text-lg font-semibold tracking-normal text-black transition-colors duration-200 group-hover:text-neutral-600">
              start here.
            </p>
            <p className="text-lg tracking-normal text-neutral-800">
              an introduction
            </p>
            <p className="text-lg tracking-normal text-neutral-600">
              july 17, 2026
            </p>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 h-px w-full bg-black"
        />
      </motion.section>
    </main>
  );
}
