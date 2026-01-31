"use client";

interface ProjectCard{
    title: string;
    description: string;
    tags: string[];
    image: string;
    logo: string;
    link: string;
    demoVideo: string;
    insideDesc: string;
    date: string;
}

export default function ProjectCard({title, description, tags, image, logo, link, demoVideo, insideDesc, date}: ProjectCard){

    return ( 
    <section className="overflow-hidden">
        <a href={link} target="loading">
            <div className="grid grid-3 overflow-hidden rounded-xl bg-white shadow-md items-center justify-center w-[320px] h-[400px] md:w-xs hover:translate-y-[-4px] duration-300 ease-in-out">
                <img src={image} className="h-full w-xl rounded-t-lg object-cover"/>
                <div className="h-50 flex-col items-center text-center">
                    <div className="h-10 items-center justify-center w-full line-clamp-2">{title}</div>
                    <div className="h-10 overflow-hidden w-full line-clamp-3">{description}</div>

                    <div className = "h-20 w-full overflow-y-auto">
                        <div className="flex flex-wrap gap-2 justify-center">
                        {tags.map((tag, index) => {
                            return(
                            <span key = {index} className = "bg-gray-100 rounded-xl w-30 text-center">
                                {tag}
                            </span>
                        )})}
                        </div>
            
                </div>
                </div>
            </div>
        </a>
    </section>
    );
};