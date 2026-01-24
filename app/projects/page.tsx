"use client";

import ProjectCard from "../components/ProjectCard";
import {useState} from 'react';

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

    function nextProject(){
        setIndex((index + 1) % collections.length);
    }

    function backProject(){
        setIndex((index - 1 + collections.length) % collections.length);
    }

    let project = collections[index];

return (
    <section id ="projects">
        <h1 className="text-center mt-5 mb-3">Projects</h1>
        <div className="flex justify-center items-center gap-15">
            <button onClick={backProject} className="cursor-pointer">{'<'}</button>
        <div>
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
        </div>
            <button onClick={nextProject} className="cursor-pointer">{'>'}</button>
        </div>
    </section>
    );
};