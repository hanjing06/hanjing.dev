'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import ArticleTableOfContents from '../../components/ArticleTableOfContents';
import ExpandableImage from '../../components/ExpandableImage';

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
  { id: 'film-costs', title: 'Films are so expensive' },
  { id: 'image-processing-learning', title: 'I have no idea how image processing works' },
  { id: 'relearning', title: 'Lots of relearning' },
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
            className="inline-flex min-h-11 items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-black"
          >
            ← back to projects
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 text-sm text-neutral-600"
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
          className="mt-3 text-lg tracking-wide text-neutral-600"
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

        <motion.div variants={fadeUp} className="mt-14">
          <ExpandableImage
            src="/tiny-squares-camera.jpg"
            alt="ESP32 camera prototype connected to a thermal printer"
            width={1800}
            height={1350}
            className="max-h-[620px] w-full object-cover"
            priority
          />
        </motion.div>

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
              Tiny Squares is a compact camera system built around the
              ESP32-Wrover-Kit by Espressif alongside the OV3660 camera module
              and a thermal printer.
            </p>
            <p>
              This system combines camera control, constrained image processing,
              serial communication, and power management in one small, embedded
              pipeline. Each stage must operate within the ESP32&apos;s limited
              memory while still producing an image that remains recognizable on
              a thermal print.
            </p>
            <p>
              In this post, the first part will be more of a personal story of
              how this came to be. The second part will be the technical aspect
              of the system.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="film-costs"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Films are so expensive
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Lately, I&apos;ve noticed a growing trend of people intentionally
              disconnecting from their phones. Whether it&apos;s building custom
              cyberdecks, carrying dedicated MP3 players, or using standalone
              cameras, many people are creating devices that replicate functions
              already available on a smartphone.
            </p>
            <p>
              I&apos;ve always been a fan of physical media, which is a big
              reason why I enjoy shooting photos with my Fujifilm Instax.
              There&apos;s something satisfying about holding a printed photo
              instead of scrolling through a camera roll.
            </p>
            <p>The problem is that Instax films are expensive.</p>
            <p>So, I decided to build my own instant camera.</p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="image-processing-learning"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            I have no idea how image processing works
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Before starting this project, my experience was mostly embedded
              systems and PCB design. I understood microcontrollers,
              communication protocols, and hardware design, but image processing
              was almost entirely new territory.
            </p>
            <p>
              I knew thermal printers could print graphics, and I knew camera
              modules could capture images. The challenge was figuring out
              everything in between.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="relearning"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Lots of relearning
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Since it was summer and I hadn&apos;t worked with some embedded
              concepts in a while, a large part of the project involved
              refreshing old knowledge. I found myself revisiting UART
              communication, power distribution, breadboarding, and debugging
              techniques. Some of that theory came back surprisingly quickly
              after spending time experimenting in TinkerCAD.
            </p>
            <p>
              The first step was getting the camera operational. I configured
              the ESP32 to connect to a local Wi-Fi network and host a
              lightweight web server over the TCP/IP stack, allowing me to
              stream camera frames through a browser. This provided a fast way
              to verify image capture and debug the camera before integrating
              the printer.
            </p>
            <p>
              Once image capture was working, I configured UART communication
              between the ESP32 and the thermal printer. Before attempting image
              printing, I tested basic communication by sending simple text and
              graphics commands.
            </p>
            <p>
              Next, I added a momentary push button that would act as the camera
              shutter. Using the Arduino serial monitor, I verified that button
              presses were being detected correctly by the microcontroller.
            </p>
            <p>
              To validate the entire capture process, I initially wrote a Python
              receiver that could accept and save photos transmitted by the
              ESP32. Once image capture was reliable, I connected everything
              together: a button press triggered the camera, the ESP32 processed
              the image, and the thermal printer produced a physical copy.
            </p>
            <p>
              The biggest challenge came when I realized that the printer
              couldn&apos;t directly understand the JPEG image produced by the
              camera. The JPEG first had to be decoded, resized, converted into
              a monochrome bitmap, and optimized for thermal printing. This led
              me down a rabbit hole of image processing techniques, eventually
              landing on dithering, which I&apos;ll explain in the technical
              section below.
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
          <p className="mt-3 text-sm tracking-wide text-neutral-500">
            Updated: June 11, 2026
          </p>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The current prototype can capture camera frames and produce
              recognizable monochrome prints using a process called dithering.
              The next steps include supplying more current to the printer and
              creating a camera enclosure with Fusion 360.
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
