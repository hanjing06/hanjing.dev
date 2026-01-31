"use client";

import ProjectCard from "../components/ProjectCard";
import {useState} from 'react';
import {AnimatePresence, motion} from "motion/react"


export default function Projects(){
    const collections = [
    {   title: "project 1",
        description: "description",
        tags: ["Java", "C#"],
        image: "",
        logo: "",
        link: "https://github.com/hanjing06/workoutTracker",
        demoVideo: "",
        insideDesc: "",
        date: "",
    },
    {   title: "project 2",
        description: "description",
        tags: ["MySQL", "Python", "RestAPI", "Language"],
        image: "",
        logo: "",
        link: "https://github.com/hanjing06/Course-Selector",
        demoVideo: "",
        insideDesc: "",
        date: "",
    }
    ];

    const[index, setIndex] = useState(0);
    const[direction, setDirection] = useState(1);

    function nextProject(){
        setDirection(1);
        setIndex((index + 1) % collections.length);
    }

    function backProject(){
        setDirection(-1);
        setIndex((index - 1 + collections.length) % collections.length);
    }

    let project = collections[index];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0
        })
    };

return (
    <section id ="projects">
        <h1 className="text-center mt-5 mb-3">Projects</h1>
        <div className="flex justify-center items-center gap-15">
            <button onClick={backProject} className="cursor-pointer text-3xl font-bold px-4 py-2 hover:scale-110 transition-transform">{'<'}</button>

        <div className="relative md:w-xs overflow-hidden">
             <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={index}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 400, damping: 35 },
                            opacity: { duration: 0.15 }
                            }}>

                    <ProjectCard
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    image={project.image}
                    logo={project.logo}
                    link={project.link}
                    demoVideo={project.demoVideo}
                    insideDesc={project.insideDesc}
                    date={project.date}        
                    />

                </motion.div>
            </AnimatePresence>
        </div>

            <button onClick={nextProject} className="cursor-pointer text-3xl font-bold px-4 py-2 hover:scale-110 transition-transform">{'>'}</button>
        </div>
    </section>
    );
};