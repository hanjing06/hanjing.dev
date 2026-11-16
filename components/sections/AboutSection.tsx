'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { aboutLinks, aboutParagraphs, aboutSignoff } from '@/content/about';
import { mailto, site } from '@/lib/site';
import { fadeUp, pageContainer } from '@/lib/motion';
import { reveal, type SectionProps } from './reveal';

const LINK_WORDS = new RegExp(`(${Object.keys(aboutLinks).join('|')})`);
const linkClass =
  'font-semibold text-neutral-700 underline decoration-black/30 underline-offset-4 transition-colors duration-200 hover:text-black hover:decoration-black';

/** Turns the words listed in `aboutLinks` into links (also used on the desk's ID card). */
export function withLinks(paragraph: string, className = linkClass) {
  return paragraph.split(LINK_WORDS).map((part, i) =>
    aboutLinks[part] ? (
      <a key={i} href={aboutLinks[part]} target="_blank" rel="noopener noreferrer" className={className}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}

/** About: portrait and bio, signing off with a "say hi" email link. `children` render under the bio. */
export default function AboutSection({ heading = 'h1', inView = false, children }: SectionProps & { children?: ReactNode }) {
  const Heading = heading === 'h1' ? motion.h1 : motion.h2;
  return (
    <motion.section
      variants={pageContainer}
      {...reveal(inView)}
      id="about"
      className={`site-container scroll-mt-16 ${inView ? 'py-16' : 'py-32'}`}
    >
      <Heading
        variants={fadeUp}
        className="mb-10 text-5xl text-black sm:text-6xl"
      >
        about me.
      </Heading>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)] md:gap-10"
      >
        <div className="relative aspect-[3/4] w-full max-w-[120px] overflow-hidden bg-neutral-100 md:max-w-[280px]">
          <Image
            src="/about/hanjing.jpeg"
            alt="Hanjing Lin standing in front of an outdoor wall"
            fill
            priority
            sizes="(min-width: 768px) 280px, 120px"
            className="object-cover object-[50%_48%]"
          />
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-neutral-700 sm:text-base md:space-y-6">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{withLinks(paragraph)}</p>
          ))}

          <p>
            {aboutSignoff.before}
            <a
              href={mailto}
              title={site.email}
              className={linkClass}
            >
              {aboutSignoff.link}
            </a>
            {aboutSignoff.after}
          </p>

          {children}
        </div>
      </motion.div>
    </motion.section>
  );
}
