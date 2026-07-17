'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

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

export default function About() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={container}
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
          className="grid items-start gap-10 md:grid-cols-[280px_minmax(0,1fr)]"
        >
          <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden bg-neutral-100">
            <Image
              src="/about-hanjing.jpeg"
              alt="Hanjing Lin standing in front of an outdoor wall"
              fill
              priority
              sizes="(min-width: 768px) 280px, calc(100vw - 48px)"
              className="object-cover object-[50%_48%]"
            />
          </div>

          <div className="space-y-6 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              hi! im hanjing. i&apos;m a third year studying software enginerring
              student at the university of western ontario.
            </p>

            <p>
              i build things that revolve around computer vision, embedded
              systems and RTOS.
            </p>

            <p>
              currently, i&apos;m working at interninsider as a creative. i&apos;m
              focusing on learning the fundamentals of hardware design and
              grinding leetcode!
            </p>

            <p>
              outside of regular school projects, i have shipped a PCB for my
              teams vehicle control unit, a computer vision project for physio,
              and a instant camera using ESP32.
            </p>

            <p>
              besides from academics, music and art is my life. i play the
              guitar, piano, and tenor sax. creativity and curiosity are my
              driving factors that inspire me to keep building and creating.
            </p>

            <p>
              If you have any inquiries or questions, you can email me at{' '}
              <a
                href="mailto:hlin389@uwo.ca"
                className="font-semibold text-neutral-700 transition-colors duration-200 hover:text-black"
              >
                hlin389 [at] uwo [dot] com
              </a>{' '}
              or send me a message on LinkedIn.
            </p>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
