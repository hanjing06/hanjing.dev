'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { pageContainer, fadeUp } from '@/lib/motion';
import { aboutParagraphs } from '@/content/about';
import { mailto, site } from '@/lib/site';

export default function About() {
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
          about me.
        </motion.h1>

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

          <div className="space-y-4 text-sm leading-relaxed tracking-wide text-neutral-700 sm:text-base md:space-y-6">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p>
              If you have any inquiries or questions, you can email me at{' '}
              <a
                href={mailto}
                className="font-semibold text-neutral-700 transition-colors duration-200 hover:text-black"
              >
                {site.emailLabel}
              </a>{' '}
              or send me a message on LinkedIn.
            </p>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
