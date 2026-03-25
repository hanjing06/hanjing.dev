'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState } from 'react';

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

const instruments: Record<string, string> = {
  guitar: '6 months',
  piano: '12 yrs (inactive)',
  'tenor sax': '3.5 yrs',
};

function InstrumentWord({ name }: { name: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="border-b border-dashed border-neutral-400 cursor-default">
        {name}
      </span>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            {/* Bubble */}
            <div className="bg-[#1d1d1f] text-[#f5f5f7] text-xs tracking-wider font-['Lora'] px-3 py-1.5 rounded-md whitespace-nowrap">
              {instruments[name]}
            </div>
            {/* Arrow */}
            <div className="flex justify-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid #1d1d1f',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function About() {
  return (
    <main className="min-h-screen px-6 mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[920px] py-32 md:px-3"
      >
        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="text-6xl tracking-tight text-black mb-10"
        >
          about me.
        </motion.h1>

        {/* Body */}
        <motion.div
          variants={fadeUp}
          className="space-y-6 text-neutral-700 text-base leading-relaxed tracking-wide max-w-2xl"
        >
          <p>
            I'm Hanjing — a second year software engineering student at the University of Western
            Ontario. I am based in London, Ontario and Toronto.
          </p>

          <p>
            I like building things that revolve around real-time analysis, computer vision and low
            level systems. Outside of regular school projects, I have shipped a PCB for my team's
            vehicle control unit. I am currently improving an AI model built for tracking and
            analyzing the biomechanics of a barbell back squat.
          </p>

          <p>
            Besides from academics, music and art is my life. I play the{' '}
            <InstrumentWord name="guitar" />, <InstrumentWord name="piano" />,{' '}
            <InstrumentWord name="tenor sax" />, and I am in the process of learning my first brass
            instrument: the trumpet. Creativity and curiosity are my driving factors that inspire me
            to keep building and creating.
          </p>

          <p>
            If you have any inquiries or questions, you can email me at{' '}
            
            <a href="mailto:hlin389@uwo.ca"
              className="border-b border-black/30 hover:border-black transition-colors duration-200">
              hlin389@uwo.ca
            </a>
            {' '}
            or send a message on{' '}
            
            <a href="https://www.linkedin.com/in/hanjing-lin-790252113/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-black/30 hover:border-black transition-colors duration-200">
              LinkedIn
            </a>
            .
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}