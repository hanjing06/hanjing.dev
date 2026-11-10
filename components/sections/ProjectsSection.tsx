'use client';

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projectHref, projects } from "@/content/projects";
import { createFadeUp, easeOutExpo, easeOutQuint, staggerContainer } from "@/lib/motion";

const container = staggerContainer(0.1, 0.08);
const fadeUp = createFadeUp(easeOutExpo);

const projectCard: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      delay: index * 0.12,
      ease: easeOutQuint,
    },
  }),
  hover: {
    y: -4,
    transition: {
      type: "spring",
      duration: 0.3,
      bounce: 0,
    },
  },
};

import { reveal, type SectionProps } from './reveal';

/** Projects: a card grid linking to each write-up. */
export default function ProjectsSection({ heading = 'h1', inView = false }: SectionProps) {
  const Heading = heading === 'h1' ? motion.h1 : motion.h2;
  return (
      <motion.section
              variants={container}
              {...reveal(inView)}
              id="projects"
              className={`site-container scroll-mt-16 ${inView ? 'pt-16 pb-24' : 'py-32'}`}
            >

        <Heading
          variants={fadeUp}
          className="mb-10 text-6xl text-black"
        >
          projects.
        </Heading>

        {/* Cards animate themselves (staggered by index), not via the parent. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
          {projects.map((project, index) => (
            <motion.article
            key={project.title}
            className="h-full"
            variants={projectCard}
            custom={index}
            {...reveal(inView)}
            whileHover="hover"
            >
        <Link
          href={projectHref(project.slug)}
          className="flex h-full flex-col transition-transform duration-200 active:scale-[0.96]"
          aria-label={`View project: ${project.title}`}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/10 outline outline-1 -outline-offset-1 outline-black/10">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              >
                <Image
              src={project.cover}
              alt=""
              fill
              sizes="(min-width: 768px) 436px, calc(100vw - 48px)"
              className={`object-cover ${project.coverPosition ?? ""}`}
              />
              </motion.div>
          </div>

          <div className="mt-3 flex flex-1 flex-col">
            <motion.span className="relative inline-block text-[20px] text-black w-fit">
            {project.title}
            <motion.span
                className="absolute bottom-1 left-0 h-[1px] bg-black"
                variants={{
                hidden: { width: '0%' },
                show: { width: '0%' },
                hover: { width: '100%' },
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            </motion.span>

            <p className="mt-1 min-h-[20px] text-[16px] text-black/65">
            {project.summary}
            </p>

            <div className="pt-3 flex flex-wrap gap-3">
            {project.tags.map((tag) => (
                <span key={tag} className="bg-[#e0b24c] px-3 py-1 text-xs text-black">
                {tag}
                </span>
            ))}
            </div>
          </div>
        </Link>
        </motion.article>
))}
</div>
</motion.section>
  );
}
