"use client";

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
        <div className="rounded-xl bg-blue-500 flex items-center justify-center w-100 h-100">
            <div className="flex flex-col items-center text-center gap-2">
                <div>{title}</div>
                <div>{description}</div>

                <div className = "flex flex-wrap gap-2 justify-center flex">
                    {tags.map((tag, index) => {
                        return(
                        <span key = {index} className = "bg-gray-100 rounded-xl w-30 text-center">
                            {tag}
                        </span>
                    )})}
                </div>

            </div>
        </div>
    </section>
    );
};