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
  const { scrollYProgress } = useScroll();
  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

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
  };

  const showLabels = activeSection === sections[0]?.id;

  return (
    <motion.aside
      className={`group fixed left-5 top-1/2 z-40 flex -translate-y-1/2 items-stretch gap-4 rounded-r-sm bg-[#f8f7f5]/90 py-4 pr-4 backdrop-blur-md ${
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
        className={`flex h-64 flex-col justify-between overflow-hidden text-xs tracking-wide transition-all duration-300 ease-out group-hover:max-w-[280px] group-hover:translate-x-0 group-hover:opacity-100 ${
          showLabels
            ? 'max-w-[280px] translate-x-0 opacity-100'
            : 'max-w-0 -translate-x-3 opacity-0'
        }`}
      >
        {sections.map(({ id, title }) => {
          const isActive = activeSection === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`cursor-pointer whitespace-nowrap text-left transition-colors duration-200 ${
                isActive ? 'text-black' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {title}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
