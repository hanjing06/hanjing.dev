'use client';

import { motion } from 'framer-motion';
import { experience } from '@/content/experience';
import { fadeUp, pageContainer } from '@/lib/motion';
import { pageTitle, pageTop } from '@/lib/layout';
import { reveal, type SectionProps } from './reveal';

const linkClass =
  'text-neutral-500 underline decoration-black/30 underline-offset-4 transition-colors duration-200 hover:text-black hover:decoration-black';

/** Experience: one row per role, dates on the left, newest first. */
export default function ExperienceSection({ heading = 'h1', inView = false }: SectionProps) {
  const Heading = heading === 'h1' ? motion.h1 : motion.h2;
  return (
    <motion.section
      variants={pageContainer}
      {...reveal(inView)}
      id="experience"
      className={`site-container scroll-mt-16 ${inView ? 'py-16' : `${pageTop} pb-32`}`}
    >
      <Heading variants={fadeUp} className={`mb-10 ${pageTitle}`}>
        experience.
      </Heading>

      <ol className="divide-y divide-black/10 border-y border-black/10">
        {experience.map((job) => (
          <motion.li
            key={`${job.company} ${job.role}`}
            variants={fadeUp}
            className="grid gap-1 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10"
          >
            <p className="text-sm text-neutral-500 md:pt-1">{job.when}</p>

            <div>
              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl text-black">
                {job.role}
                {job.upcoming ? <span className="bg-[#e0b24c] px-2 py-0.5 text-xs text-black">incoming</span> : null}
              </h3>
              <p className="mt-0.5 text-base text-neutral-600">
                {job.companyHref ? (
                  <a href={job.companyHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.section>
  );
}
