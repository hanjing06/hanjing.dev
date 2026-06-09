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
      duration: 1.67,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};


const tags = ["Embedded Systems", "PCB Design"];
const tools = ["KiCad", "STM32", "Embedded C", "GPIO Control", "CAN", "UART"];
const articleSections = [
  { id: 'overview', title: 'Overview' },
  { id: 'functional-responsibilities', title: 'Functional Responsibilities' },
  { id: 'requirements-to-circuit', title: 'Turning requirements into a circuit' },
  { id: 'schematic-design', title: 'Building the schematic in KiCad' },
  { id: 'component-placement', title: 'Placement before routing' },
  { id: 'pcb-routing', title: 'Routing for clarity and reliability' },
];

export default function SunstangPage() {
  return (
    <main className="min-h-screen mx-auto">
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="site-container py-24"
      >
        {/* Back */}
        <motion.div variants={fadeUp}>
          <Link
            href="/projects"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
          >
            ← back to projects
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div variants={fadeUp} className="mt-4">
          <img
            src="/SunstangLogo.png"
            alt="Sunstang Solar Car Project"
            className="h-16 w-auto object-contain"
          />
        </motion.div>

        {/* Meta */}
        <motion.div
          variants={fadeUp}
          className="mt-4 text-sm text-neutral-500"
        >
          2026 · Sunstang Driver Controls
        </motion.div>

        {/* Title + GitHub */}
        <motion.div
          variants={fadeUp}
          className="mt-4 flex items-center gap-4"
        >
          <h1 className="text-4xl tracking-tight text-black">
            Sunstang VCU 2026
          </h1>
          <a href="https://github.com/hanjing06/Sunstang-VCU-2026.git" target="_blank" rel="noopener noreferrer">
            <img
              src="/github.png"
              alt="View the Sunstang VCU repository on GitHub"
              className="w-7 h-7 opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg tracking-wide text-neutral-500"
        >
          Designing the vehicle control unit for a solar powered car.
        </motion.p>

        {/* Tags */}
        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#e0b24c] px-3 py-1 text-xs text-black"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Hero image */}
        <motion.img
          variants={fadeUp}
          src="/SunstangThumbnail.jpeg"
          alt="Sunstang vehicle control unit development workspace"
          className="mt-14 w-full object-cover"
          style={{ maxHeight: '560px' }}
        />

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <ArticleTableOfContents sections={articleSections} />

        {/* Overview */}
        <motion.section
          id="overview"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Overview
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The Sunstang VCU 2026 is a custom vehicle control unit PCB developed
              in KiCad. It brings driver inputs, pedal interfaces, high-voltage
              enable logic, lighting control, safety interlocks, and vehicle state
              management into one low-voltage control system.
            </p>
            <p>
              The board is built around the STM32 Nucleo-F302R8. Its central
              engineering challenge was not simply connecting signals to a
              microcontroller; it was creating a dependable boundary between
              sensitive 3.3V logic and the car&apos;s 12V electrical system. Every
              input and output had to be considered in terms of voltage level,
              failure behavior, connector access, and how it would be diagnosed
              once installed in the vehicle.
            </p>
          </div>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* High-level diagram */}
        <motion.div variants={fadeUp} className="mt-14">
          <img
            src="/SunstangHighLevel.png"
            alt="High-level diagram of the Sunstang vehicle control unit"
            className="w-full object-cover"
          />
          <p className="mt-2 text-xs text-neutral-400">
            High-Level Diagram
          </p>
        </motion.div>

        {/* Functional Responsibilities */}
        <motion.section
          id="functional-responsibilities"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Functional Responsibilities
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: '1. Power & HV Control',
                items: ['LV switch interface', 'HV switch interface', 'Pre-charge button input', 'Pre-charge contactor feedback', 'Main contactor feedback', 'HV active indication', 'BMS interface signals'],
              },
              {
                title: '2. Driver Inputs',
                items: ['Accelerator pedal (ADC input)', 'Brake pedal (ADC/digital input)', 'Brake light trigger output'],
              },
              {
                title: '3. Mode Control',
                items: ['Ready mode switch', 'Charge mode switch', 'Mode select (SPDT)', 'Gear selector (SPST)'],
              },
              {
                title: '4. Lighting Control',
                items: ['Brake lights', 'Daytime running lights', 'Left turn signal', 'Right turn signal', 'Hazard lights', 'Rear signal outputs'],
              },
              {
                title: '5. Safety Inputs',
                items: ['HV active confirmation', 'Thermal shutdown', 'Pre-charge verification before main contactor closure'],
              },
            ].map(({ title, items }) => (
              <div key={title}>
                <p className="text-sm text-black">{title}</p>
                <ul className="mt-3 space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="text-sm leading-relaxed tracking-wide text-neutral-500">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <motion.section
          id="requirements-to-circuit"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Turning vehicle requirements into a circuit
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              As part of the Driver Controls Team, my main task was to build the
              PCB for the vehicle control unit. Its main role is to know what the
              driver was requesting, whether the high-voltage system was ready,
              and which outputs could be enabled safely. I grouped those
              requirements into power and contactor control, driver inputs, mode
              selection, lighting, and safety feedback. That list became the
              architecture of the board.
            </p>
            <p>
              This approach made each signal answer the same questions: where
              does it originate, what voltage can appear on it, what should the
              STM32 see, and what must happen if the signal is missing or invalid?
              Thinking in signal paths kept the design grounded in the actual
              vehicle instead of treating the PCB as an isolated electronics
              exercise.
            </p>
          </div>
        </motion.section>

        <motion.section
          id="schematic-design"
          variants={fadeUp}
          className="scroll-mt-32 pt-16"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Building the schematic in KiCad
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              We used KiCad because it is open source and easy to learn. There
              was also a legacy version of the old board that we were improving
              on top of. The hardest part was making sure all the parts and logic
              were correct and at the right values.
            </p>
          </div>

          <figure className="mt-10">
            <img
              src="/SunstangSchematic.png"
              alt="KiCad schematic for the Sunstang vehicle control unit"
              className="w-full object-cover"
            />
            <figcaption className="mt-2 text-xs text-neutral-400">
              Functional circuit blocks in the KiCad schematic.
            </figcaption>
          </figure>
        </motion.section>

        <motion.section
          id="component-placement"
          variants={fadeUp}
          className="scroll-mt-32 pt-16"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Placement before routing
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              There were a lot of iterations that were made before the final
              decision. It was important to think physically where everything
              was routed for the driver to easily understand as well.
            </p>
            <p>
              Therefore, the component placement had to be treated as a system
              problem. Connectors had to match how the board would be wired and
              serviced. Interface components needed to remain close to the
              signals they protected or conditioned. The Nucleo headers needed
              enough space for assembly while still keeping related signal paths
              short and understandable.
            </p>
            <p>
              I repeatedly moved functional groups until the board reflected the
              same flow as the schematic: vehicle connection, interface circuit,
              then controller. That reduced unnecessary crossings and made the
              final routing easier to inspect. It also left a more useful visual
              map for debugging because a physical area of the board corresponds
              to a specific vehicle function.
            </p>
          </div>

          <figure className="mt-10">
            <img
              src="/SunstangPCB.png"
              alt="KiCad PCB layout for the Sunstang vehicle control unit"
              className="w-full object-cover"
            />
            <figcaption className="mt-2 text-xs text-neutral-400">
              Component placement and routed board in KiCad.
            </figcaption>
          </figure>
        </motion.section>

        <motion.section
          id="pcb-routing"
          variants={fadeUp}
          className="scroll-mt-32 pt-16"
        >
          <h2 className="text-2xl tracking-tight text-black">
            Routing for clarity and reliability
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              Routing was a balancing act between electrical priorities and
              readability. I routed power and higher-current output paths first,
              then sensitive analog pedal signals, and finally the remaining
              digital control lines. Keeping those categories visually distinct
              helped avoid long parallel runs between noisy outputs and
              measurement signals.
            </p>
            <p>
              I also paid close attention to return paths, trace length, and the
              number of layer changes. A short-looking trace is not necessarily a
              good trace if its return current has to take a complicated path.
              Reviewing the board by functional loop, rather than one net at a
              time, made it easier to identify routing that could become fragile
              or difficult to diagnose.
            </p>
            <p>
              The final pass was deliberately methodical: verify connector pin
              order against the harness, confirm net classes and clearances, run
              KiCad&apos;s electrical and design-rule checks, and inspect each
              circuit against the schematic. Only after those checks did the
              layout feel ready to move from a screen to a manufactured board.
            </p>
          </div>

          <figure className="mt-10">
            <img
              src="/SunstangBoard.jpg"
              alt="Assembled Sunstang vehicle control unit PCB"
              className="w-full object-cover"
            />
            <figcaption className="mt-2 text-xs text-neutral-400">
              The manufactured PCB during assembly and validation.
            </figcaption>
          </figure>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Thanks */}
        <motion.div variants={fadeUp} className="mt-14">
          <h2 className="text-2xl tracking-tight text-black">
            A special thanks
          </h2>
          <p className="mt-4 text-base leading-relaxed tracking-wide text-neutral-700 max-w-2xl">
            I wanna give a special thank you to{' '}
            
            <a href="https://www.linkedin.com/in/xiuting-s/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C85A3F] border-b border-[#C85A3F]/30 hover:text-[#e0b24c] hover:border-[#e0b24c]/30 transition-colors duration-300">
              Xiuting Shi
            </a>{' '}
            for teaching and mentoring me through the whole process. From explaining what a MOSFET is, to finalizing the design, thank you.
          </p>
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
                className="bg-[#e0b24c] px-3 py-1 text-xs text-black"
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
