'use client';
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
          <span>
            Hanjing Lin
          </span>
        </Link>

        <ul className="flex items-center gap-0 sm:gap-6 md:gap-9">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center sm:min-w-0"
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`relative text-xs tracking-wide transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-black after:transition-[width] after:duration-300 hover:text-black hover:after:w-full sm:text-sm sm:tracking-widest ${
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
