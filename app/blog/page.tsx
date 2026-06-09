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


export default function Blog(){
    return(
        <main className="min-h-screen">
            <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="site-container py-32"
                  >
            <motion.h1
                variants={fadeUp}
                className="mb-10 text-6xl tracking-tight text-black"
            >
                blog.
            </motion.h1>

            <motion.div
                variants={fadeUp}
                className="space-y-6 text-neutral-700 text-base leading-relaxed tracking-wide max-w-2xl"
            >
            <p>Under Construction. Come back soon!</p>
            </motion.div>
            </motion.div>

        </main>
    );
}
