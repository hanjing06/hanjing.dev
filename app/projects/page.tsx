"use client";

import ProjectCard from "../components/ProjectCard";

export default function About(){
    const collections = [
    {   title: "title",
        description: "description",
        tags: ["Java", "C#"],
        logo: "",
        link: "",
        demoVideo: "",
        insideDesc: "",
        date: "",
    },
    {   title: "title",
        description: "description",
        tags: ["Languages"],
        logo: "",
        link: "",
        demoVideo: "",
        insideDesc: "",
        date: "",
    }
];

return (
    <main>
    <section>
      <div>
         <div>
            {collections.map((item, i)=>(
                <ProjectCard
                key = {i}
                title = {item.title}
                description = {item.description}
                tags = {item.tags}
                logo = {item.logo}
                link = {item.link}
                demoVideo = {item.demoVideo}
                insideDesc = {item.insideDesc}
                date = {item.date}        
                />
            ))}
         </div>
      </div>
    </section>
    </main>
    );
};