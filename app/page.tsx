'use client';


import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {

  return (
    <main>
      <section className="my-20 mx-50 max-w-[920px]">
      <div className="max-w-2xl w-full px-4 flex flex-col items-start text-left gap-10">
        
        {/* Line 1: Name */}
        <h1 className="firstLine text-[32px] whitespace-nowrap">
          Hi! I'm Hanjing.
          <br />I am a software engineer based in London ⇄ Toronto.
        </h1>

        {/* Line 2: Projects */}
        <h1 className="secondLine text-[32px] whitespace-nowrap">
          My projects revolve around my interest in electronics.{' '}
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
        <p className="thirdLine text-[32px] whitespace-nowrap">I am currently a second year student at University of Western Ontario.</p>

        {/* Line 4: Tech stack */}
        <p className="fourthLine text-[32px] whitespace-nowrap">
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
      </section>
    </main>
  );
}