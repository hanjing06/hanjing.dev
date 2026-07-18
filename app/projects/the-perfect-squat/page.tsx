'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ArticleTableOfContents from '../../components/ArticleTableOfContents';
import ExpandableImage from '../../components/ExpandableImage';

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};


const tags = ["Computer Vision", "Machine Learning"];
const tools = ["OpenCV", "Python", "YOLOv8", "PyTorch", "NumPy", "RoboFlow", "Google Colab"];
const articleSections = [
  { id: 'overview', title: 'Overview' },
  { id: 'the-beginning', title: 'The Beginning' },
  { id: 'tech-stack', title: 'Figuring out the tech stack' },
  { id: 'current-stage', title: 'Current stage' },
];
const linkedInPost =
  'https://www.linkedin.com/posts/hanjing-lin-790252113_we-locked-in-and-it-actually-worked-activity-7443047991311007744-aKQE?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAABxVrtwBRMk0uRF6R3XVVWeCli2jUS9r7K8';

export default function SquatPage() {
  return (
    <main className="min-h-screen">
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="site-container min-w-0 break-words py-16 sm:py-24"
      >
        {/* Back */}
        <motion.div variants={fadeUp}>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-black"
          >
            ← back to projects
          </Link>
        </motion.div>

        {/* Meta */}
        <motion.div
          variants={fadeUp}
          className="mt-10 text-sm text-neutral-600"
        >
          Ongoing · Passion Project
        </motion.div>

        {/* Title + GitHub */}
        <motion.div variants={fadeUp} className="mt-4 flex items-center gap-4">
          <h1 className="text-4xl tracking-tight text-black">
            The Perfect Squat
          </h1>

            <a
              href="https://github.com/hanjing06/the-perfect-squat"
              target="_blank"
              rel="noopener noreferrer"
              className="-m-2 inline-flex size-11 shrink-0 items-center justify-center"
          >
            <Image
              src="/github.png"
              alt="View The Perfect Squat repository on GitHub"
              width={28}
              height={28}
              className="w-7 h-7 opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
          </a>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg tracking-wide text-neutral-600"
        >
          Developing a computer vision program that detects the bar path of your squat.
        </motion.p>

        {/* Tags */}
        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#e0b24c] px-3 py-1 text-xs font-['Lora'] tracking-widest text-black"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <ArticleTableOfContents sections={articleSections} />

        {/* Overview */}
        <motion.section
          id="overview"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight">
            Overview
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
            <p>
              The Perfect Squat is a passion project that{' '}
              
                <a href="https://www.linkedin.com/in/mats-leis-4b9911271/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-[#8f3f2c]/40 text-[#8f3f2c] transition-colors duration-300 hover:border-[#6f301f] hover:text-[#6f301f]"
              >
                Mats Leis
              </a>{' '}
              and I started second semester of our second year. This came about when we were
              discussing a LinkedIn post we both saw exploring MediaPipe&apos;s pose model detection. It
              got us thinking about how we could utilize these tools in our everyday lives.
            </p>
            <p>That&apos;s when &apos;The Perfect Squat&apos; came alive.</p>
            <p>
              A computer vision system that analyzes barbell trajectory during a squat using the
              YOLOv8 pose model and OpenCV to process videos.
            </p>
          </div>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <motion.section
          id="the-beginning"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight text-black">
            The Beginning
          </h2>

        <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
          <p>
            Right when Google&apos;s MediaPipe framework was growing immense traction back in November of 2025,
            it got Mats and I thinking about all the possibilites that could be possible with this technology.
          </p>

          <p>The main problem was that we were unfamiliar and inexperience.</p>

          <p>We had no idea where to start.</p>

          <p>That&apos;s when we started to fall in the hole of tutorial hell.</p>

          </div>

        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <motion.section
          id="tech-stack"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight">
            Figuring out the tech stack
          </h2>

          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
          <p>
            We knew from the get go that we wanted to track the linearity of a bar path but in order to do this,
            we needed to think about the: model, framework, data, libraries, and the gpu.
          </p>

          <p>
            First, we needed to choose a model to train. For this, we decided to choose Ultralytics YOLOv8-pose model
            due to its fast but precise performance. It is a smaller model than the YOLO11, however, for our task,
            the YOLOv8 was enough.
          </p>

          <p>
            Next, is a dataset fit for the size of our model. Thanks to Roboflow Universe, they had a set of annotated
            images that we were able to use to train our model.
          </p>

          <p>
            Since the primary programming language is Python, the many libraries that are used to track, analyze and visualize data include:
            OpenCV, PyTorch, NumPy and Matplotlib.
          </p>

          <p>
            Finally, due to limited access to a powerful gpu, Google Colab is used to train, test and validate the model.
          </p>

          </div>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        <motion.section
          id="current-stage"
          variants={fadeUp}
          className="scroll-mt-32 pt-14"
        >
          <h2 className="text-2xl tracking-tight">
            Current stage
          </h2>

          <p><i className="text-neutral-600">Updated: March 27 2026</i></p>

          <div className="mt-6 space-y-5 text-base leading-relaxed tracking-wide text-neutral-700">
          <p>
            Currently, we have a working MVP. Being able to detect and track keypoints of a barbell and
            visualize this data to display the linearity of its path via video and graph.
          </p>

          <p>
            We demoed our project at the Canadian Tech Summit and Alchemy.
          </p>

          </div>

          <article className="mt-10 overflow-hidden border border-black/10 bg-white/30">
            <div className="flex items-start justify-between gap-5 p-6">
              <div>
                <p className="text-base tracking-wide text-black">
                  Hanjing Lin
                </p>
                <p className="mt-1 text-xs tracking-wide text-neutral-600">
                  The Perfect Squat · Project update
                </p>
              </div>
              <span
                className="text-xs font-semibold tracking-wide text-[#0a66c2]"
                aria-label="LinkedIn"
              >
                in
              </span>
            </div>

            <div className="px-6 pb-6 text-base leading-relaxed tracking-wide text-neutral-700">
              <p className="text-xl leading-relaxed text-black">
                We locked in and it actually worked.
              </p>
              <p className="mt-4">
                A working computer vision pipeline that detects the barbell,
                tracks its movement, and turns a squat video into a measurable
                bar path. We presented the project, demonstrated the MVP, and
                shared what we learned while building it.
              </p>
            </div>

            <ExpandableImage
              src="/perfect-squat-cover.jpg"
              alt="The Perfect Squat team presenting their project poster"
              width={1800}
              height={2400}
              className="max-h-[680px] w-full object-cover object-center"
            />

            <a
              href={linkedInPost}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border-t border-black/10 px-6 py-4 text-sm tracking-wide text-neutral-600 transition-colors duration-200 hover:bg-black/[0.02] hover:text-black"
            >
              <span>View the original post on LinkedIn</span>
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </motion.section>

        {/* Divider */}
        <motion.div variants={fadeUp} className="mt-16 border-t border-black/10" />

        {/* Tools */}
        <motion.div variants={fadeUp} className="mt-14 pb-8">
          <h2 className="text-2xl tracking-tight text-black">
            Tools & Skills
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="bg-[#e0b24c] px-3 py-1 text-xs"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
