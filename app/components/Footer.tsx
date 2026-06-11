'use client'

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-black/10 bg-[#efefec]">
      <div className="site-container flex flex-col gap-3 py-6 text-[15px] text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="mailto:hlin389@uwo.ca"
          className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-black"
        >
          hlin389@uwo.ca
        </a>

        <div>© 2026 Hanjing Lin.</div>
      </div>
    </footer>
  );
}
