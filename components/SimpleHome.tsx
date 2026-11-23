import Link from 'next/link';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import ProjectsSection from './sections/ProjectsSection';
import SimpleContent from './simple/SimpleContent';

/**
 * The simple (2D) home page, shown when a visitor picks the simple site on
 * the start screen: one scrolling page of landing (with a lamp that leads
 * into the 3D desk), about (with a small link to the blog), experience and
 * projects.
 * Each section is the same component its own route renders; the contact
 * links live in the footer.
 */
export default function SimpleHome({ onEnter3D }: { onEnter3D: () => void }) {
  return (
    <main>
      <section className="-mt-16">
        <SimpleContent onEnter3D={onEnter3D} />
      </section>

      <AboutSection heading="h2" inView>
        <p className="pt-2 text-sm">
          <Link href="/blog" className="text-neutral-500 underline underline-offset-4 transition-colors duration-200 hover:text-black">
            read the blog →
          </Link>
        </p>
      </AboutSection>
      <ExperienceSection heading="h2" inView />
      <ProjectsSection heading="h2" inView />
    </main>
  );
}
