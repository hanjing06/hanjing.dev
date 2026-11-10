'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { returnToSimple } from "@/components/home/returnToSimple";

const navLinks = [
  { href: '/about', label: 'about', section: '#about' },
  { href: '/projects', label: 'projects', section: '#projects' },
  { href: '/blog', label: 'blog' },
];

/** True once the page has scrolled away from the top. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return scrolled;
}

export default function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  // the simple home page stacks about and projects, so jump to them
  const onHome = pathname === '/';

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md transition-colors duration-200 ${scrolled ? 'border-black/10' : 'border-transparent'}`}>
      <nav aria-label="Main navigation" className="site-container flex items-center justify-between py-0.5">
        <Link
          href="/"
          onClick={(event) => {
            // the name always leads to the simple landing page, never the start screen
            returnToSimple();
            if (!onHome) return;
            event.preventDefault();
            window.history.replaceState(null, '', '/');
            window.scrollTo({ top: 0 });
          }}
          className="inline-flex min-h-11 items-center text-[16px] sm:text-[20px]"
        >
          <span>
            Hanjing Lin
          </span>
        </Link>

        <ul className="flex items-center gap-0 sm:gap-6 md:gap-9">
          {navLinks.map(({ href, label, section }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={onHome && section ? section : href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center sm:min-w-0"
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`relative text-xs transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-black after:transition-[width] after:duration-300 hover:text-black hover:after:w-full sm:text-sm ${
                      isActive
                        ? 'text-black after:w-full'
                        : 'text-neutral-700 after:w-0'
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
