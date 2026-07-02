'use client';

import { AnimatePresence, motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

const tags = ['Digital Logic', 'FPGA', 'FSM Design'];
const tools = [
  'Altera Quartus',
  'DE1-SoC',
  'Moore FSM',
  'D Flip-Flops',
  'Karnaugh Maps',
  'Boolean Algebra',
  'Gate-Level Design',
  'FPGA Implementation',
  'Testing',
  'Debugging',
  'Verification',
  'Simulation',
];
const articleSections = [
  { id: 'overview', title: 'Overview' },
  { id: 'state-design', title: 'State design' },
  { id: 'logic-minimization', title: 'Logic minimization' },
  { id: 'implementation', title: 'Implementation' },
  { id: 'takeaways', title: 'Takeaways' },
];

type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

const projectImages = {
  cover: {
    src: '/moore-fsm/cover-photo-hq.jpg',
    alt: 'DE10-Standard FPGA board used for the Moore FSM sequence detector',
    width: 2268,
    height: 3024,
  },
  stateDiagram: {
    src: '/moore-fsm/state-diagram.png',
    alt: 'State diagram showing the bit sequences and Moore FSM states S0 through S7',
    width: 1600,
    height: 1284,
    caption:
      'State diagram showing the target sequence, output states, and transitions.',
  },
  kMaps: {
    src: '/moore-fsm/k-maps.jpg',
    alt: 'Karnaugh maps and simplified Boolean equations for the Moore FSM',
    width: 1530,
    height: 2009,
    caption: 'K-maps used to simplify the next-state and output logic.',
  },
  quartusSchematic: {
    src: '/moore-fsm/quartus-schematic.png',
    alt: 'Quartus schematic for the Moore FSM sequence detector circuit',
    width: 1928,
    height: 994,
    caption:
      'Quartus gate-level schematic with D flip-flops, combinational logic, pins, and output z.',
  },
  waveform: {
    src: '/moore-fsm/simulation-waveform.png',
    alt: 'Quartus simulation waveform for CLK, Rx, x, and z',
    width: 1816,
    height: 504,
    caption: 'Simulation waveform verifying the detector output z.',
  },
} satisfies Record<string, ProjectImage>;

function ExpandableFigure({
  image,
  onOpen,
  priority = false,
  imageClassName = 'w-full border border-black/10 bg-white object-contain',
}: {
  image: ProjectImage;
  onOpen: (image: ProjectImage) => void;
  priority?: boolean;
  imageClassName?: string;
}) {
  return (
    <figure>
      <button
        type="button"
        onClick={() => onOpen(image)}
        className="group block w-full cursor-zoom-in text-left"
        aria-label={`Expand image: ${image.alt}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 920px) 872px, calc(100vw - 48px)"
          className={`${imageClassName} transition duration-300 group-hover:opacity-90`}
          priority={priority}
        />
      </button>
      {image.caption ? (
        <figcaption className="mt-2 text-xs text-neutral-600">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function MooreFsmPage() {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedImage]);

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
          2025 · ECE2277A Digital Logic Systems
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-4 text-4xl tracking-tight text-black"
        >
          Moore FSM: A sequence detector
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg tracking-wide text-neutral-600"
        >
          Designing a finite state machine that detects a bit sequence, compares
          state assignments, and verifies the final circuit in Quartus.
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
          <ExpandableFigure
            image={projectImages.cover}
            onOpen={setSelectedImage}
            priority
            imageClassName="h-[420px] w-full object-cover object-top sm:h-[560px]"
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
              This project was a complete Moore finite state machine sequence
              detector for ECE2277A. The circuit reads one input bit at a time,
              turns the output on after detecting a target four-bit sequence,
              and keeps that output high until a second four-bit sequence turns
              it back off.
            </p>
            <p>
              The interesting part was not only making the detector function.
              The assignment required two state-assignment strategies, Boolean
              simplification, gate-cost comparison, a structural implementation
              in Quartus, and a simulation waveform that proved the selected
              design behaved correctly.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="state-design"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Building the state design
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              I started by mapping the detector into states that represented how
              much of the current sequence had already been matched. Because the
              output in a Moore FSM depends on state instead of the immediate
              input, the state diagram had to carry both progress through the
              bit pattern and whether the output should be active.
            </p>
            <p>
              From there, I built a state table with current state, next state
              for x = 0 and x = 1, and output z. This made the design easier to
              reason about before touching gates: every transition had a clear
              purpose, and every output value could be traced back to a named
              state.
            </p>
          </div>

          <div className="mt-10">
            <ExpandableFigure
              image={projectImages.stateDiagram}
              onOpen={setSelectedImage}
            />
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="logic-minimization"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Comparing state assignments
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              I compared a guideline-based state assignment against a Gray-code
              assignment. The goal was to keep related states adjacent where it
              helped reduce the final logic, then use Karnaugh maps to derive
              the D flip-flop input equations and output equation.
            </p>
            <p>
              The selected implementation used three D flip-flops and simplified
              sum-of-products equations for Q1+, Q2+, Q3+, and z. After
              counting the required gates and gate inputs, the guideline-based
              assignment came out as the cleaner and lower-cost option, so that
              became the circuit I implemented.
            </p>
          </div>

          <div className="mt-10">
            <ExpandableFigure
              image={projectImages.kMaps}
              onOpen={setSelectedImage}
            />
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="implementation"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Implementing and verifying the circuit
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The final circuit was implemented structurally in Quartus with
              D flip-flops, AND gates, OR gates, and inverters. I kept the logic
              organized around the derived equations so the schematic stayed
              readable and each signal could be debugged from input x through
              the next-state logic.
            </p>
            <p>
              Verification came through waveform simulation. The test sequence
              stepped through the expected states on clock edges, then drove z
              high only after the valid pattern was received. That simulation
              was the bridge between the handwritten logic work and the FPGA
              implementation.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            <ExpandableFigure
              image={projectImages.quartusSchematic}
              onOpen={setSelectedImage}
            />
            <ExpandableFigure
              image={projectImages.waveform}
              onOpen={setSelectedImage}
            />
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          className="mt-16 border-t border-black/10"
        />

        <motion.section
          id="takeaways"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">Takeaways</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              This project made digital logic feel less abstract. A small change
              in state assignment could affect the amount of hardware needed,
              and the cleanest design was the one that stayed traceable from
              state diagram to truth table to K-map to schematic.
            </p>
            <p>
              It also gave me practice communicating engineering tradeoffs. The
              final answer was not just a working detector; it was a reasoned
              choice between two implementations, backed by cost analysis and
              verified through simulation.
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

      <AnimatePresence>
        {selectedImage ? (
          <motion.div
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded project image"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute right-4 top-4 z-10 flex size-12 cursor-pointer items-center justify-center border border-white/50 bg-black/45 text-4xl leading-none text-white transition-colors duration-200 hover:bg-white hover:text-black sm:right-6 sm:top-6"
              aria-label="Close expanded image"
            >
              ×
            </button>

            <div className="relative h-full max-h-[84vh] w-full max-w-7xl">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {selectedImage.caption ? (
              <p className="absolute bottom-4 left-4 right-4 text-center text-xs leading-relaxed text-white/85 sm:bottom-6">
                {selectedImage.caption}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
