'use client';

import { motion } from 'framer-motion';
import { pageContainer, fadeUp } from '@/lib/motion';
import { mailto, site } from '@/lib/site';

export default function Contact(){
    return(
    <main className="min-h-screen">
        <motion.div
            variants={pageContainer}
            initial="hidden"
            animate="show"
            className="site-container py-32"
        >

         {/* Title */}
        <motion.h1
            variants={fadeUp}
            className="mb-10 text-5xl tracking-tight text-black sm:text-6xl"
        >
            let&apos;s talk.
        </motion.h1>

        <motion.div
          variants={fadeUp}
          className="space-y-10"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 text-lg tracking-normal">
            <span className="text-neutral-600">email:</span>
            <a
              href={mailto}
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              {site.emailLabel}
            </a>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 text-lg tracking-normal">
            <span className="text-neutral-600">github:</span>
            <a
              href={site.github.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              {site.github.label}
            </a>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 text-lg tracking-normal">
            <span className="text-neutral-600">linkedin:</span>
            <a
              href={site.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              {site.linkedin.label}
            </a>
          </div>
        </motion.div>
        
        </motion.div>
    </main>
    );
}
