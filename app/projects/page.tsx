"use client";

import ProjectCard from "../components/ProjectCard";
import {useState} from 'react';

export default function Projects(){
    const collections = [
    {   title: "1",
        description: "description",
        tags: ["Java", "C#"],
        logo: "",
        link: "",
        demoVideo: "",
        insideDesc: "",
        date: "",
    },
    {   title: "2",
        description: "description",
        tags: ["MySQL", "Python", "RestAPI", "Language"],
        logo: "",
        link: "",
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
        <div className="flex justify-between items-center">
            <button onClick={backProject} className="cursor-pointer ml-30">{'<'}</button>
        <div>
            <ProjectCard
            title={project.title}
            description={project.description}
            tags={project.tags}
            logo={project.logo}
            link={project.link}
            demoVideo={project.demoVideo}
            insideDesc={project.insideDesc}
            date={project.date}        
            />
        </div>
            <button onClick={nextProject} className="cursor-pointer mr-30">{'>'}</button>
        </div>
    </section>
    );
};