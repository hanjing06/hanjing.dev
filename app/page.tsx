'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { createFadeUp, easeOutQuint, fadeUp, pageContainer } from '@/lib/motion';

const buttonGroup = createFadeUp(easeOutQuint, 0.2);

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 -mt-16">
      <motion.div
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className="brand-wordmark text-6xl text-black"
        >
          Hanjing Lin
        </motion.h1>

        {/* What I do */}
        <motion.div
          variants={fadeUp}
          className="mt-3 text-neutral-600 text-xl tracking-widest"
        >
          building intelligent systems that interact with the real world.
        </motion.div>

        {/* Buttons */}
        <motion.div
          variants={buttonGroup}
          className="mt-8 flex gap-4"
        >
          <motion.div
              whileHover={{ y: -2, cursor:'pointer' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
            <Link
              href="/projects"
              className="inline-flex min-h-11 w-36 items-center justify-center border-[1.5px] border-transparent bg-[#1d1d1f] py-2.5 text-base tracking-wider text-[#f5f5f7] transition-[background-color,scale] duration-200 hover:bg-[#3a3a3c] active:scale-[0.96]"
            >
              projects →
            </Link>
          </motion.div>

          <motion.div
              whileHover={{ y: -2, cursor:'pointer' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
            <Link
              href="/about"
              className="inline-flex min-h-11 w-36 items-center justify-center border-[1.5px] border-[#1d1d1f] py-2.5 text-base tracking-wider text-[#1d1d1f] transition-[background-color,color,scale] duration-200 hover:bg-[#1d1d1f] hover:text-[#f5f5f7] active:scale-[0.96]"
            >
              about →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
