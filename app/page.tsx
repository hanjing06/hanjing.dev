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
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 2.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const buttonGroup: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.67,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 -mt-16">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        {/* Name */}
        <motion.div
          variants={fadeUp}
          className="text-black text-6xl tracking-[6.40px]"
        >
          Hanjing
        </motion.div>

        {/* What I do */}
        <motion.div
          variants={fadeUp}
          transition={{delay:0.09}}
          className="mt-3 text-neutral-600 text-xl tracking-widest"
        >
          building intelligent systems that interact with the real world.
        </motion.div>

        {/* Buttons */}
        <motion.div
          variants={buttonGroup}
          className="mt-8 flex gap-4"
        >
         <Link href="/projects">
            <motion.button
              whileHover={{ y: -2, cursor:'pointer' }}
              transition={{ ease: 'easeInOut', duration: 0.34 }}
              className="w-36 py-2.5 text-base tracking-wider border-[1.5px] border-transparent bg-[#1d1d1f] text-[#f5f5f7] transition-colors duration-200 hover:bg-[#3a3a3c]"
            >
              projects →
            </motion.button>
          </Link>

          <Link href="/about">
            <motion.button
              whileHover={{ y: -2, cursor:'pointer' }}
              transition={{ ease: 'easeInOut', duration: 0.34 }}
              className="w-36 py-2.5 text-base tracking-wider border-[1.5px] border-[#1d1d1f] text-[#1d1d1f] transition-colors duration-200 hover:bg-[#1d1d1f] hover:text-[#f5f5f7]"
            >
              about →
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}