'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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
          <img src="/SunstangLogo.png" className="h-16 w-auto object-contain" />
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
            <img src="/github.png" className="w-7 h-7 opacity-70 hover:opacity-100 transition-opacity duration-200" />
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
          className="mt-14 w-full object-cover"
          style={{ maxHeight: '560px' }}
        />

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Overview */}
        <motion.div variants={fadeUp} className="mt-14">
          <h2 className="text-2xl tracking-tight text-black">
            Overview
          </h2>
          <p className="mt-8 text-base leading-relaxed tracking-wide text-neutral-700">
            The Sunstang VCU 2026 is a custom-designed Vehicle Control Unit PCB developed in KiCad v6+.
            The board integrates driver inputs, pedal interfaces, high-voltage enable logic, lighting control,
            safety interlocks, and vehicle state management into a centralized low-voltage control system.
            The system is built around the STM32 Nucleo-F302R8 development board (ARM Cortex-M4, 3.3V logic).
            This PCB acts as the hardware interface between the microcontroller (3.3V) and the vehicle's 12V automotive systems.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* High-level diagram */}
        <motion.div variants={fadeUp} className="mt-14">
          <img src="/SunstangHighLevel.png" className="w-full object-cover" />
          <p className="mt-2 text-xs text-neutral-400">
            High-Level Diagram
          </p>
        </motion.div>

        {/* Functional Responsibilities */}
        <motion.div variants={fadeUp} className="mt-14">
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
        </motion.div>

        {/* Schematic */}
        <motion.div variants={fadeUp} className="mt-14">
          <img src="/SunstangSchematic.png" className="w-full object-cover" />
          <p className="mt-2 text-xs text-neutral-400">PCB Schematic</p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <img src="/SunstangPCB.png" className="w-full object-cover" />
          <p className="mt-2 text-xs text-neutral-400">PCB Board</p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <img src="/SunstangBoard.jpg" className="w-full object-cover" />
          <p className="mt-2 text-xs text-neutral-400">PCB</p>
        </motion.div>

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
