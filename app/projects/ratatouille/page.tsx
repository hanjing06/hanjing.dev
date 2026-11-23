'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ArticleTableOfContents from '@/components/ArticleTableOfContents';
import ExpandableImage from '@/components/ExpandableImage';
import { getProject } from '@/content/projects';
import { backLink, detailTop, pageTitle } from '@/lib/layout';
import { articleContainer, fadeUp } from '@/lib/motion';

const { tags, tools, summary } = getProject('ratatouille');
const DEVPOST = 'https://devpost.com/software/ratatouille-u86zig';
const REPO = 'https://github.com/dwseoh/ratatouille';
const articleSections = [
  { id: 'overview', title: 'Overview' },
  { id: 'schematics', title: 'Schematics' },
  { id: 'proof-of-concept', title: 'Proof of concept' },
];

const prose = 'mt-6 space-y-5 text-base leading-relaxed text-neutral-700';

export default function RatatouillePage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={articleContainer}
        initial="hidden"
        animate="show"
        className={`site-container min-w-0 break-words ${detailTop} pb-16 sm:pb-24`}
      >
        <motion.div variants={fadeUp}>
          <Link href="/projects" className={backLink}>
            ← back to projects
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <h1 className={pageTitle}>Ratatouille</h1>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="-m-2 inline-flex size-11 shrink-0 items-center justify-center"
          >
            <Image
              src="/icons/github.png"
              alt="View the Ratatouille repository on GitHub"
              width={28}
              height={28}
              className="h-7 w-7 opacity-70 transition-opacity duration-200 hover:opacity-100"
            />
          </a>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-3 text-lg text-neutral-600">
          {summary}
        </motion.p>
        <motion.p variants={fadeUp} className="mt-4 text-sm text-neutral-600">
          November 2026 · Hack Western 13
        </motion.p>
        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-[#e0b24c] px-3 py-1 text-xs text-black">
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10">
          <ExpandableImage src="/projects/ratatouille/cover.jpg" alt="The Ratatouille logo next to Remy, a cartoon rat in a chef’s hat" width={1600} height={900} priority />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />
        <ArticleTableOfContents sections={articleSections} />

        {/* Overview: the product */}
        <motion.section id="overview" variants={fadeUp} className="scroll-mt-32 pt-14">
          <h2 className="text-2xl text-black">Overview</h2>
          <div className={prose}>
            <p>
              Built at Hack Western 13 by a team of three, Ratatouille is a chest-worn cooking coach for anyone a
              written recipe gets in the way of: you talk to it, its camera watches your counter, and it points a red
              laser at the next ingredient. An ESP32 camera and an ESP32-S3 driving pan/tilt servos, the laser and a
              small display stream over Wi-Fi to a Python hub on a laptop, which runs object detection, the voice
              pipeline, and Claude as the coach.
            </p>
            <p>
              Ask <em>“where’s the lime?”</em> and a local intent router moves the laser before Claude has even
              answered, while Pipecat, Silero VAD and Deepgram stream speech both ways so replies land in about 1 to
              1.5 s. Off-the-shelf YOLO-World found almost nothing in our cheap camera’s frames, so we fine-tuned it on
              a few hundred of our own, taking detection from near 0% to 90–100%.
            </p>
          </div>
        </motion.section>

        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Schematics */}
        <motion.section id="schematics" variants={fadeUp} className="scroll-mt-32 pt-14">
          <h2 className="text-2xl text-black">Schematics</h2>

          <div className="mt-8">
            <ExpandableImage src="/projects/ratatouille/schematic.png" alt="KiCad schematic of the wearable: USB-C power input, ESP32 camera, ESP32-S3 with servo, laser and display connections" width={1408} height={1043} caption="The wiring, drawn in KiCad: one power bank feeds both boards, the servos and the laser." />
          </div>
          <div className="mt-8">
            <ExpandableImage src="/projects/ratatouille/enclosure.png" alt="Three views of the 3D-printed enclosure showing the pan-tilt laser on top, the camera window, and both boards on a perfboard carrier" width={1800} height={647} caption="The 3D-printed box: pan-tilt laser on top, camera behind a window, both boards on one carrier." />
          </div>
        </motion.section>

        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Proof of concept */}
        <motion.section id="proof-of-concept" variants={fadeUp} className="scroll-mt-32 pt-14">
          <h2 className="text-2xl text-black">Proof of concept</h2>
          <div className="mt-8">
            <ExpandableImage src="/projects/ratatouille/detections.jpg" alt="A grid of camera frames from a kitchen counter with boxes labelled tomato, lime and avocado" width={1408} height={1024} caption="Frames from the chest camera with the tomato, lime and avocado the detector learned to find." />
          </div>
        </motion.section>

        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Devpost */}
        <motion.div variants={fadeUp} className="mt-14">
          <a
            href={DEVPOST}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-black/10 px-6 py-5 text-base text-neutral-700 transition-colors duration-200 hover:bg-black/[0.02] hover:text-black"
          >
            <span>Read the full story on Devpost</span>
            <span aria-hidden="true">↗</span>
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-14 pb-8">
          <h2 className="text-2xl text-black">Tools & Skills</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span key={tool} className="bg-[#e0b24c] px-3 py-1 text-xs">
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
