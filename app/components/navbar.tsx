'use client';
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#efefec]/70 backdrop-blur-md">
      <nav className="mx-100 flex max-w-[920px] items-center justify-between py-7 md:px-10">
        <a href="/" className="text-[32px]">
         <motion.span
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              Hanjing Lin.
            </motion.span>
        </a>
      </nav>
    </header>
  );
}