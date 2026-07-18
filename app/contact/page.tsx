'use client';

import { motion, Variants } from 'framer-motion';

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

export default function Contact(){
    return(
    <main className="min-h-screen">
        <motion.div
            variants={container}
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
              href="mailto:hlin389@uwo.ca"
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              hlin389 [at] uwo [dot] com
            </a>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 text-lg tracking-normal">
            <span className="text-neutral-600">github:</span>
            <a
              href="https://www.github.com/hanjing06"
              target="_blank"
              rel="noopener noreferrer"
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              github.com/hanjing06
            </a>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 text-lg tracking-normal">
            <span className="text-neutral-600">linkedin:</span>
            <a
              href="https://www.linkedin.com/in/hanjing-lin-790252113/"
              target="_blank"
              rel="noopener noreferrer"
              className="break-all border-b border-black/30 text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              linkedin.com/in/hanjing-lin-790252113
            </a>
          </div>
        </motion.div>
        
        </motion.div>
    </main>
    );
}
