"use client";

interface ProjectCard{
    title: string;
    description: string;
    tags: string;
    logo: string;
    link: string;
    demoVideo: string;
    insideDesc: string;
    date: string;
}

export default function ProjectCard(card: ProjectCard){
    return ( <div className="">
            <img></img>
            <h2>{card.title}</h2>
            <p>Projects</p>
        </div>
       
    );
};