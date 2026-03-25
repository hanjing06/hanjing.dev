'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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


const tags = ["Computer Vision", "Machine Learning"];
const tools = ["OpenCV", "Python", "YOLOv8", "PyTorch", "NumPy", "RoboFlow", "Google Colab"];

export default function SquatPage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[920px] px-6 py-24 md:px-3"
      >
        {/* Back */}
        <motion.div variants={fadeUp}>
          <Link
            href="/projects"
            className="text-sm text-neutral-500 hover:text-black transition-colors duration-200"
          >
            ← back to projects
          </Link>
        </motion.div>

        {/* Meta */}
        <motion.div
          variants={fadeUp}
          className="mt-10 text-sm text-neutral-500"
        >
          Ongoing · Passion Project
        </motion.div>

        {/* Title + GitHub */}
        <motion.div variants={fadeUp} className="mt-4 flex items-center gap-4">
          <h1 className="text-4xl tracking-tight text-black">
            The Perfect Squat
          </h1>
          
            <a href="https://github.com/hanjing06/the-perfect-squat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/github.png"
              className="w-7 h-7 opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg tracking-wide text-neutral-500"
        >
          Developing a computer vision program that detects the bar path of your squat.
        </motion.p>

        {/* Tags */}
        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#e0b24c] px-3 py-1 text-xs font-['Lora'] tracking-widest text-black"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Overview */}
        <motion.div variants={fadeUp} className="mt-14">
          <h2 className="text-2xl tracking-tight">
            Overview
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The Perfect Squat is a passion project that{' '}
              
                <a href="https://www.linkedin.com/in/mats-leis-4b9911271/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C85A3F] border-b border-[#C85A3F]/30 hover:text-[#e0b24c] hover:border-[#e0b24c]/30 transition-colors duration-300"
              >
                Mats Leis
              </a>{' '}
              and I started second semester of our second year. This came about when we were
              discussing a LinkedIn post we both saw exploring MediaPipe's pose model detection. It
              got us thinking about how we could utilize these tools in our everyday lives.
            </p>
            <p>That's when 'The Perfect Squat' came alive.</p>
            <p>
              A computer vision system that analyzes barbell trajectory during a squat using the
              YOLOv8 pose model and OpenCV to process videos.
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Tools */}
        <motion.div variants={fadeUp} className="mt-14 pb-8">
          <h2 className="text-2xl tracking-tight text-black">
            Tools & Skills
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="bg-[#e0b24c] px-3 py-1 text-xs"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}