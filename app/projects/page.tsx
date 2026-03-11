"use client";
import {motion} from "framer-motion";


export default function ProjectsPage() {
  const projects = [
    {
      title: "Sunstang VCU 2026",
      description: "Designing the vehicle control unit for a solar powered car.",
      image: "/SunstangThumbnail.jpeg",
      tags: ["Embedded Systems", "PCB Design", "Hardware"],
    },
    {
      title: "The Perfect Squat",
      description: "Developing a computer vision program that detects the bar path of your squat.",
      image: "/projects/project-2.jpg",
      tags: ["Computer Vision", "Machine Learning"],
    },
    {
      title: "Project Three",
      description: "Short description for the third project.",
      image: "/projects/project-3.jpg",
      tags: ["Computer Vision", "AI"],
    },
    {
      title: "Project Four",
      description: "Short description for the fourth project.",
      image: "/projects/project-4.jpg",
      tags: ["Web App", "Full Stack"],
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1100px] px-8 py-20 md:px-16">

        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
          {projects.map((project) => (
            <motion.article
            key={project.title}
            className="flex h-full flex-col cursor-pointer"
            whileHover="hover"
            initial="rest"
            animate="rest"
            onClick={() => window.location.href = `/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
        <div className="aspect-[16/9] w-full overflow-hidden bg-black/10">
            <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
            />
        </div>

        <div className="mt-3 flex flex-1 flex-col">
            <motion.span className="relative inline-block text-[20px] text-black w-fit">
            {project.title}
            <motion.span
                className="absolute bottom-1 left-0 h-[1px] bg-black"
                variants={{
                rest: { width: '0%' },
                hover: { width: '100%' },
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            </motion.span>

            <p className="mt-1 min-h-[20px] text-[16px] text-black/55">
            {project.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
            {project.tags.map((tag) => (
                <span key={tag} className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
                {tag}
                </span>
            ))}
            </div>
        </div>
        </motion.article>
))}
</div>
</section>
</main>
  );
}