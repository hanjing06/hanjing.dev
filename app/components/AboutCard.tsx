"use client";

interface AboutCard {
    title: string;
    heading: Description[];
}

interface Description{
    description: string;
    tags: string[];
}

export default function AboutCard({title, heading}: AboutCard){
return (
    <section>
    <div className="text-center">{title == "now"}</div>
    {heading.map((desc, i) => (
        <div key={i} className="text-center">
            {desc.description}
            <div className="flex flex-row gap-2 justify-center mt-2">
                {desc.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 rounded-xl px-3 py-1 text-center">
                        {tag}
                    </span>
                ))}
            </div>
        </div> 
    ))}
</section>
)

}