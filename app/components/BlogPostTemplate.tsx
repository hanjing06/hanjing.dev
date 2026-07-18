'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import ArticleTableOfContents from './ArticleTableOfContents';

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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

export type BlogPostSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

type BlogPostTemplateProps = {
  topic: string;
  dateLabel: string;
  title: string;
  intro: string[];
  sections: BlogPostSection[];
  signOff: string[];
  hero: ReactNode;
};

export default function BlogPostTemplate({
  topic,
  dateLabel,
  title,
  intro,
  sections,
  signOff,
  hero,
}: BlogPostTemplateProps) {
  const articleSections = [
    { id: 'opening', title: 'Opening' },
    ...sections.map(({ id, title: sectionTitle }) => ({
      id,
      title: sectionTitle,
    })),
    { id: 'sign-off', title: 'Sign off' },
  ];

  return (
    <main className="min-h-screen">
      <motion.article
        variants={container}
        initial="hidden"
        animate="show"
        className="site-container min-w-0 break-words py-16 sm:py-24"
      >
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
          className="mt-10 text-sm uppercase tracking-[0.2em] text-neutral-600"
        >
          {topic} - {dateLabel}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="mt-4 text-4xl tracking-tight text-black sm:text-5xl"
        >
          {title}
        </motion.h1>

        <motion.div variants={fadeUp} className="mt-12">
          {hero}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <ArticleTableOfContents sections={articleSections} />

        <motion.section
          id="opening"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <div className="space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.section>

        {sections.map((section) => (
          <motion.section
            key={section.id}
            id={section.id}
            variants={fadeUp}
            className="scroll-mt-32 pt-14"
          >
            <div className="border-t border-black/10 pb-14 pt-14">
              <h2 className="text-2xl tracking-tight text-black">
                {section.title}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.section>
        ))}

        <motion.section
          id="sign-off"
          variants={fadeUp}
          className="scroll-mt-32 border-t border-black/10 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">Sign off</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            {signOff.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.section>
      </motion.article>
    </main>
  );
}
