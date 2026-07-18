'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: '/about', label: 'about' },
  { href: '/projects', label: 'projects' },
  { href: '/blog', label: 'blog' },
  { href: '/contact', label: 'contact' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur-md">
      <nav aria-label="Main navigation" className="site-container flex items-center justify-between py-0.5">
        <Link href="/" className="brand-wordmark inline-flex min-h-11 items-center text-[16px] sm:text-[20px]">
          <motion.span transition={{ duration: 0.2, ease: "easeOut" }}>
            Hanjing Lin
          </motion.span>
        </Link>

        <ul className="flex items-center gap-0 sm:gap-6 md:gap-9">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex min-h-11 min-w-11 items-center justify-center sm:min-w-0"
                aria-current={
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "page"
                    : undefined
                }
              >
                <motion.span
                  className={`relative text-xs tracking-wide transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-black after:transition-[width] after:duration-300 hover:text-black hover:after:w-full sm:text-sm sm:tracking-widest ${
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? 'text-black after:w-full'
                      : 'text-neutral-700 after:w-0'
                  }`}
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
