"use client";
import {motion, Variants} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
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
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const projectGrid: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const projectCard: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
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

export default function ProjectsPage() {
  const projects = [
    {
      title: "Sunstang VCU 2026",
      description: "Designing the vehicle control unit for a solar powered car.",
      image: "/SunstangThumbnail.jpeg",
      tags: ["Embedded Systems", "PCB Design", "Hardware"],
      href: "/projects/sunstang-vcu-2026",
    },
    {
      title: "The Perfect Squat",
      description: "Developing a computer vision program that detects the bar path of your squat.",
      image: "/perfect-squat-cover.jpg",
      tags: ["Computer Vision", "Machine Learning"],
      href: "/projects/the-perfect-squat",
    },
    {
      title: "Tiny Squares: Camera System",
      description: "Engineering a camera that shoots, converts image, bitmaps jpg, and prints instantly.",
      image: "/tiny-squares-camera.jpg",
      tags: ["Embedded Systems", "Computer Vision", "Image Processing"],
      href: "/projects/tiny-squares-camera-system",
    },
    {
      title: "Moore FSM: A Sequence Detector",
      description: "Designing and implementing a digital logic sequence detector with a Moore FSM.",
      image: "/moore-fsm/cover-photo-hq.jpg",
      imagePosition: "object-top",
      tags: ["Digital Logic", "FPGA", "FSM Design"],
      href: "/projects/moore-fsm-sequence-detector",
    }
  ];

  return (
    <main className="min-h-screen">
      <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              className="site-container py-32"
            >

        <motion.h1
          variants={fadeUp}
          className="mb-10 text-6xl tracking-tight text-black"
        >
          projects.
        </motion.h1>

        <motion.div
          variants={projectGrid}
          className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2"
        >
          {projects.map((project, index) => (
            <motion.article
            key={project.title}
            className="h-full"
            variants={projectCard}
            custom={index}
            initial="hidden"
            animate="show"
            whileHover="hover"
            >
        <Link
          href={project.href}
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
              src={project.image}
              alt=""
              fill
              sizes="(min-width: 768px) 436px, calc(100vw - 48px)"
              className={`object-cover ${project.imagePosition ?? ""}`}
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
            {project.description}
            </p>

            <div className="pt-3 flex flex-wrap gap-3">
            {project.tags.map((tag) => (
                <span key={tag} className="bg-[#e0b24c] px-3 py-1 text-xs tracking-widest text-black">
                {tag}
                </span>
            ))}
            </div>
          </div>
        </Link>
        </motion.article>
))}
</motion.div>
</motion.section>
</main>
  );
}
