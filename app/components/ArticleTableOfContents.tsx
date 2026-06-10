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

  const showLabels = activeSection === sections[0]?.id;
  const activeTitle =
    sections.find(({ id }) => id === activeSection)?.title ?? 'Contents';

  const sectionButtons = sections.map(({ id, title }) => {
    const isActive = activeSection === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => scrollToSection(id)}
        className={`w-full cursor-pointer break-words text-left transition-colors duration-200 ${
          isActive ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'
        }`}
      >
        {title}
      </button>
    );
  });

  return (
    <>
      <motion.aside
        className={`sticky top-[53px] z-40 -mx-6 border-y border-black/10 bg-[#f8f7f5]/95 px-6 py-3 backdrop-blur-md lg:hidden ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Table of contents"
      >
        <button
          type="button"
          onClick={() => setIsMobileOpen((isOpen) => !isOpen)}
          className="flex w-full min-w-0 items-center justify-between gap-4 text-left"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-article-contents"
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              Contents
            </span>
            <span className="mt-0.5 block truncate text-sm text-black">
              {activeTitle}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 text-lg transition-transform duration-200 ${
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
          id="mobile-article-contents"
          className={`grid transition-[grid-template-rows] duration-300 ${
            isMobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <nav className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 gap-3 pt-4 text-sm leading-snug sm:grid-cols-2">
              {sectionButtons}
            </div>
          </nav>
        </div>
      </motion.aside>

      <motion.aside
        className={`group fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 items-stretch gap-4 rounded-r-sm bg-[#f8f7f5]/95 py-4 pr-4 backdrop-blur-md lg:flex xl:left-5 ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-label="Table of contents"
      >
        <div className="relative h-64 w-px flex-none overflow-hidden bg-black/15">
          <motion.div
            className="absolute inset-x-0 top-0 bg-black"
            style={{ height: progressHeight }}
          />
        </div>

        <nav
          className={`flex h-64 flex-col justify-between overflow-hidden text-xs leading-snug tracking-wide transition-all duration-300 ease-out group-hover:max-w-32 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:max-w-32 group-focus-within:translate-x-0 group-focus-within:opacity-100 xl:group-hover:max-w-48 xl:group-focus-within:max-w-48 ${
            showLabels
              ? 'max-w-0 -translate-x-3 opacity-0 2xl:max-w-48 2xl:translate-x-0 2xl:opacity-100'
              : 'max-w-0 -translate-x-3 opacity-0'
          }`}
        >
          {sectionButtons}
        </nav>
      </motion.aside>
    </>
  );
}
