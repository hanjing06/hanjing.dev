"create client";
import AboutCard from "../components/AboutCard";

const collections = [

{   title: "background",
    heading: [
        {description: "i did freelance video editing for all of covid"}] 
},

{   title: "now",
    heading: [
        {description:"second year at western"},
        {description:"??"}],
    tags: ["SE2203", "SE2250"]  
}, 

{   title: "next",
    description: "incoming @"
}]

export default function About(){
    return (
        <section id="about">
        <p className = "text-center m-10">about me is under construction</p>
        <div>
            {collections.map((item, i)=>(
                <AboutCard
                key = {i}
                title = {item.title}
                heading = {[]}   
                />
             ))}
        </div>
        </section>
    )
}