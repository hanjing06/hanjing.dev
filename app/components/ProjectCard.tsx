"use client";
import About from "../components/page";

interface ProjectCard{
    title: string;
    description: string;
    tags: string[];
    logo: string;
    link: string;
    demoVideo: string;
    insideDesc: string;
    date: string;
}

export default function ProjectCard({title, description, tags, logo, link, demoVideo, insideDesc, date}: ProjectCard){
    return ( 
    <section>
        <div className="card m-10 rounded-xl bg-gray-50 place-content-center h-60">
            <img></img>
            <div className ="text-center">{title}</div>
            <div className ="text-center">{description}</div>
            <div className = "flex-row flex gap-2 place-content-center">
                {tags.map((tag, index) => {
                    return(
                    <span key = {index} className = "bg-gray-100 rounded-xl w-30 text-center">
                        {tag}
                    </span>
                )})}
            </div>
        </div>
    </section>
    );
};