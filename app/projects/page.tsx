"use client";
import {AnimatePresence, motion} from "framer-motion";


export default function ProjectsPage() {
  const projects = [
    {
      title: "Sunstang VCU 2026",
      description: "Designing the vehicle control unit for a solar powered car.",
      image: "/projects/sunstang.jpg",
      tags: ["Embedded Systems", "PCB Design"],
    },
    {
      title: "Project Two",
      description: "Short description for the second project.",
      image: "/projects/project-2.jpg",
      tags: ["Hardware", "Systems"],
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
    <main className="min-h-screen bg-[#efefec]">
      <section className="mx-auto max-w-[1100px] px-8 py-20 md:px-16">

        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.title} className="flex h-full flex-col">
              <div className="aspect-[16/9] w-full overflow-hidden bg-black/10">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-3 flex flex-1 flex-col">
                <h2 className="text-[20px] text-black">
                  {project.title}
                </h2>

                <p className="mt-1 min-h-[20px] text-[16px] text-black/55">
                  {project.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}