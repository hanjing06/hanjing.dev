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
            className="text-6xl tracking-tight text-black mb-10"
        >
            let's talk.
        </motion.h1>

        <motion.div 
        variants={fadeUp}
        className="space-y-6">
            <p className="text-neutral-500 text-2xl tracking-[7.20px]">
                EMAIL</p>

        <a href="mailto:hlin389@uwo.ca"
              className="text-neutral-500 border-b border-black/30 hover:border-black transition-colors duration-200 text-[20px]">
              hlin389@uwo.ca
        </a>
    
            <p className="text-neutral-500 text-2xl tracking-[7.20px] mt-10">
                GITHUB<br/></p>

         <a href="https://www.github.com/hanjing06"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 border-b border-black/30 hover:border-black transition-colors duration-200 text-[20px]">
              https://www.github.com/hanjing06
        </a>

            <p className="text-neutral-500 text-2xl tracking-[7.20px] mt-10">
                LINKEDIN<br/></p>

        <a href="https://www.linkedin.com/in/hanjing-lin-790252113/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 border-b border-black/30 hover:border-black transition-colors duration-200 text-[20px]">
              https://www.linkedin.com/in/hanjing-lin-790252113/
        </a>
        </motion.div>
        
        </motion.div>
    </main>
    );
}
