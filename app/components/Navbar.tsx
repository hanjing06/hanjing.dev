'use client';
import { motion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { href: '/about', label: 'about' },
  { href: '/projects', label: 'projects' },
  { href: '/blog', label: 'blog' },
  { href: '/contact', label: 'contact' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#efefec]/70 backdrop-blur-md">
      <nav className="site-container flex items-center justify-between py-3">
        <Link href="/" className="brand-wordmark text-[16px] sm:text-[20px]">
          <motion.span transition={{ duration: 0.2, ease: "easeOut" }}>
            Hanjing
          </motion.span>
        </Link>

        <ul className="flex items-center gap-3 sm:gap-6 md:gap-9">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href}>
                <motion.span
                  className="relative text-xs tracking-wide text-neutral-700 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:text-black hover:after:w-full sm:text-sm sm:tracking-widest"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {label}
                </motion.span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
