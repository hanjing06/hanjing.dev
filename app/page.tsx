'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex justify-center items-center mt-30 ml-30">
      <div className="max-w-2xl w-full px-4 flex flex-col items-start text-left gap-10">

        {/* Line 1: Name */}
        <h1 className="firstLine">
          Hi! I'm Hanjing.
          <p>I am a software engineer based in London ⇄ Toronto.</p>
        </h1>

        {/* Line 2: Projects */}
        <h1 className="secondLine">
          I like building projects that solve my problems.{' '}
          <Link href="/projects">
            <motion.span
              whileHover={{ x: 5, color: "#f6d053" }}
              animate={{ color: "#C85A3F" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              See my projects.
            </motion.span>
          </Link>
        </h1>

        {/* Line 3: Education */}
        <p className="thirdLine">I currently study at the University of Western Ontario.</p>

        {/* Line 4: Tech stack */}
        <p className="fourthLine">
          Curious about what powers my projects?{' '}
          <Link href="/techstack" className="tech-link">
            <motion.span
              whileHover={{ x: 5, color: "#f6d053" }}
              animate={{ color: "#C85A3F" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              Click here.
            </motion.span>
          </Link>
        </p>

      </div>
    </main>
  );
}