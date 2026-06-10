'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import ArticleTableOfContents from '../../components/ArticleTableOfContents';

const container: Variants = {
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

const tags = ['Embedded Systems', 'Computer Vision', 'Image Processing'];
const tools = [
  'ESP32',
  'Camera Module',
  'Embedded C++',
  'JPEG',
  'Bitmap Processing',
  'Thermal Printing',
];
const articleSections = [
  { id: 'overview', title: 'Overview' },
  { id: 'capture-pipeline', title: 'From capture to print' },
  { id: 'image-processing', title: 'Converting the image' },
  { id: 'thermal-printing', title: 'Printing instantly' },
  { id: 'current-stage', title: 'Current stage' },
];

export default function TinySquaresPage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="site-container min-w-0 break-words py-16 sm:py-24"
      >
        <motion.div variants={fadeUp}>
          <Link
            href="/projects"
            className="text-sm text-neutral-500 transition-colors duration-200 hover:text-black"
          >
            ← back to projects
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 text-sm text-neutral-500"
        >
          Ongoing · Embedded Camera System
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-4 text-4xl tracking-tight text-black"
        >
          Tiny Squares: Camera System
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg tracking-wide text-neutral-500"
        >
          Engineering a camera that shoots, converts image, bitmaps jpg, and
          prints instantly.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#e0b24c] px-3 py-1 text-xs tracking-widest text-black"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.img
          variants={fadeUp}
          src="/tiny-squares-camera.jpg"
          alt="ESP32 camera prototype connected to a thermal printer"
          className="mt-14 max-h-[620px] w-full object-cover"
        />

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <ArticleTableOfContents sections={articleSections} />

        <motion.section
          id="overview"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">Overview</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Tiny Squares is a compact camera system built around an ESP32
              camera module and a thermal printer. The goal is to make taking a
              photo feel physical again: press a button, capture an image,
              process it on the embedded device, and receive a printed copy
              seconds later.
            </p>
            <p>
              The project combines camera control, constrained image processing,
              serial communication, and power management in one small embedded
              pipeline. Each stage has to operate within the ESP32&apos;s limited
              memory while still producing an image that remains recognizable
              on a monochrome thermal print.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="capture-pipeline"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            From capture to print
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The system begins by capturing a JPEG frame from the camera. That
              compressed image is useful for storage and transport, but the
              thermal printer cannot interpret it directly. The ESP32 therefore
              has to decode the frame, resize it to the printer width, convert
              its pixels to grayscale, and prepare a one-bit bitmap.
            </p>
            <p>
              Treating the project as a pipeline makes each failure easier to
              isolate. A captured frame can be validated before conversion, the
              bitmap can be inspected before transmission, and the printer can
              be tested independently with known patterns.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="image-processing"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Converting the image
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              A thermal printer only produces black or white dots, so the
              captured color image must lose most of its original information.
              The important decision is how to preserve edges, faces, and
              contrast while reducing every pixel to a single bit.
            </p>
            <p>
              The processing stage converts RGB values into luminance and then
              applies thresholding or dithering. A fixed threshold is fast, but
              it can erase detail under uneven lighting. Dithering distributes
              error between nearby pixels, creating the appearance of additional
              shades while still producing a valid monochrome bitmap.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="thermal-printing"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Printing instantly
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Once the bitmap is packed into bytes, it is sent to the thermal
              printer one row at a time. The printer&apos;s width determines the
              final image dimensions, and its speed has to be balanced against
              heat, power draw, and print density.
            </p>
            <p>
              The printer is the highest-current part of the system, so it
              cannot be treated like a normal logic peripheral. Stable power,
              shared grounding, and controlled transmission timing are necessary
              to prevent resets and incomplete prints while the heating elements
              are active.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="current-stage"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">Current stage</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The current prototype can capture camera frames and produce
              recognizable monochrome prints. Development is focused on
              improving conversion quality, reducing the time between capture
              and print, and packaging the electronics into a portable camera
              enclosure.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section variants={fadeUp} className="mt-14 pb-8">
          <h2 className="text-2xl tracking-tight text-black">Tools & Skills</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="bg-[#e0b24c] px-3 py-1 text-xs text-black"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.section>
      </motion.section>
    </main>
  );
}
