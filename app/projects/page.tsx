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
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const projectGrid: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
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
      title: "Moore FSM: A sequence detector",
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

        <motion.div variants={projectGrid} className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
          {projects.map((project) => (
            <motion.article
            key={project.title}
            className="h-full"
            variants={fadeUp}
            whileHover="hover"
            >
        <Link
          href={project.href}
          className="flex h-full flex-col"
          aria-label={`View project: ${project.title}`}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/10">
              <Image
              src={project.image}
              alt=""
              fill
              sizes="(min-width: 768px) 436px, calc(100vw - 48px)"
              className={`object-cover ${project.imagePosition ?? ""}`}
              />
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

            <div className="mt-auto pt-3 flex flex-wrap gap-3">
            {project.tags.map((tag) => (
                <span key={tag} className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
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
