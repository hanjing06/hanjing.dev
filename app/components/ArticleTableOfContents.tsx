'use client';

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useState } from 'react';

type TableOfContentsSection = {
  id: string;
  title: string;
};

export default function ArticleTableOfContents({
  sections,
}: {
  sections: TableOfContentsSection[];
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const firstSection = document.getElementById(sections[0]?.id ?? '');
    const lastSection = document.getElementById(
      sections[sections.length - 1]?.id ?? '',
    );

    if (!firstSection || !lastSection) {
      setIsVisible(false);
      return;
    }

    setIsVisible(
      firstSection.getBoundingClientRect().top <= window.innerHeight * 0.4 &&
        lastSection.getBoundingClientRect().bottom >= 120,
    );
  });

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0, 0.2, 0.6],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setIsMobileOpen(false);
  };

  const sectionButtons = sections.map(({ id, title }) => {
    const isActive = activeSection === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => scrollToSection(id)}
        aria-current={isActive ? 'location' : undefined}
        className={`-mx-2 flex min-h-11 w-[calc(100%+1rem)] cursor-pointer items-center break-words px-2 text-left transition-[background-color,color,scale] duration-300 active:scale-[0.96] 2xl:min-h-0 ${
          isActive
            ? 'bg-black/[0.035] text-black'
            : 'text-neutral-600 hover:bg-black/[0.025] hover:text-black'
        }`}
      >
        {title}
      </button>
    );
  });

  return (
    <>
      <motion.aside
        className={`group sticky top-[49px] z-40 -mx-6 border-y border-black/[0.06] bg-white/95 px-6 py-3 backdrop-blur-md 2xl:hidden ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Table of contents"
      >
        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-[10px] uppercase tracking-[0.16em] text-neutral-600"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-toc-nav"
        >
          <span>Contents</span>
          <span
            aria-hidden="true"
            className={`text-sm leading-none transition-transform duration-300 ${
              isMobileOpen ? 'rotate-45' : ''
            }`}
          >
            +
          </span>
        </button>

        <div className="relative mt-3 h-px overflow-hidden bg-black/15">
          <motion.div
            className="absolute inset-y-0 left-0 bg-black"
            style={{ width: progressWidth }}
          />
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isMobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <nav id="mobile-toc-nav" className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 gap-x-5 gap-y-1 pt-4 text-sm leading-snug sm:grid-cols-2">
              {sectionButtons}
            </div>
          </nav>
        </div>
      </motion.aside>

      <motion.aside
        className={`group fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 items-stretch gap-4 border border-black/[0.06] bg-white/95 py-4 pr-4 backdrop-blur-md 2xl:left-5 2xl:flex ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Table of contents"
      >
        <div className="flex h-64 flex-none flex-col items-center gap-3">
          <span
            aria-hidden="true"
            className="text-sm leading-none text-neutral-600 transition-transform duration-300 group-hover:rotate-45 group-focus-within:rotate-45"
          >
            +
          </span>
          <div className="relative min-h-0 w-px flex-1 overflow-hidden bg-black/15">
            <motion.div
              className="absolute inset-x-0 top-0 bg-black"
              style={{ height: progressHeight }}
            />
          </div>
        </div>

        <nav className="flex h-64 max-w-0 -translate-x-3 flex-col justify-between overflow-hidden text-xs leading-snug tracking-wide opacity-0 transition-[max-width,opacity,transform] duration-300 ease-out group-hover:max-w-48 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:max-w-48 group-focus-within:translate-x-0 group-focus-within:opacity-100">
          {sectionButtons}
        </nav>
      </motion.aside>
    </>
  );
}
