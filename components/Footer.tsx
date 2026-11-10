import { mailto, site } from '@/lib/site';

const LINKS = [
  { label: 'LinkedIn', href: site.linkedin.url, external: true },
  { label: 'GitHub', href: site.github.profileUrl, external: true },
  { label: 'Email', href: mailto, external: false },
];

/** Contact links and copyright, on every page. */
export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-black/10 bg-white">
      <div className="site-container flex flex-col gap-3 py-6 text-[15px] text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex items-center gap-6">
          {LINKS.map(({ label, href, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-black"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div>© 2026 Hanjing Lin.</div>
      </div>
    </footer>
  );
}
