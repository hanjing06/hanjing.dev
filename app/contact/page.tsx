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
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
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
          <div>
            <p className="text-sm tracking-normal text-neutral-500">Email</p>
            <a
              href="mailto:hlin389@uwo.ca"
              className="mt-2 inline-block break-all border-b border-black/30 text-lg tracking-normal text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              hlin389@uwo.ca
            </a>
          </div>

          <div>
            <p className="text-sm tracking-normal text-neutral-500">GitHub</p>
            <a
              href="https://www.github.com/hanjing06"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block break-all border-b border-black/30 text-lg tracking-normal text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              github.com/hanjing06
            </a>
          </div>

          <div>
            <p className="text-sm tracking-normal text-neutral-500">LinkedIn</p>
            <a
              href="https://www.linkedin.com/in/hanjing-lin-790252113/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block break-all border-b border-black/30 text-lg tracking-normal text-neutral-700 transition-colors duration-200 hover:border-black hover:text-black"
            >
              linkedin.com/in/hanjing-lin-790252113
            </a>
          </div>
        </motion.div>
        
        </motion.div>
    </main>
    );
}
