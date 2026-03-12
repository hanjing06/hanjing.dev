"use client";

const tools = [
  [
    { name: "IntelliJ",        
      desc: "> I create backend systems in Java using IntelliJ",                          
      iconW: "w-16", iconH: "h-16", rounded: "",
      icon: "/Intellij.png" },
  ],
  [
    { name: "KiCAD",           
      desc: "> For PCB Designs",                                                         
      iconW: "w-16", iconH: "h-16", rounded: "" ,
      icon: "/KiCad.png" },
    { name: "Altium Designer", 
      desc: "> Another software for PCB Designs",                                        
      iconW: "w-16", iconH: "h-16", rounded: "rounded-[20px]",
      icon: "/Altium.png"},
  ],
  [
    { name: "Unity",          
      desc: "> The game engine I use for game development",                              
      iconW: "w-16", iconH: "h-20", rounded: "",
      icon: "/Unity.png" },
    { name: "Rider",           
      desc: "> I code in C# (.NET) along with Unity for game development",              
      iconW: "w-16", iconH: "h-16", rounded: "",
      icon: "/Rider.png" },
  ],
  [
    { name: "Vercel",          
      desc: "> The service I use to host the frontend",                                  
      iconW: "w-16", iconH: "h-16", rounded: "rounded-[20px]",
      icon: "/Vercel.png" },
    { name: "Supabase",        
      desc: "> The backend I use",                                                       
      iconW: "w-16", iconH: "h-16", rounded: "",
      icon: "/Supabase.png" },
  ],
  [
    { name: "Spring Boot",     
      desc: "> A framework I love",                                                      
      iconW: "w-16", iconH: "h-16", rounded: "",
      icon: "/SpringBoot.png" },
    { name: "Next.js",         
      desc: "> Another framework I cannot live without", 
      iconW: "w-16", iconH: "h-16", rounded: "",
      icon: "/Vercel.png" },
    { name: "Vaadin Flow",     
      desc: "> The framework I use to make web applications in Java",                    
      iconW: "w-16", iconH: "h-16", rounded: "rounded-[20px]",
      icon: "/Vaadin.png" },
  ],
];

export default function TechStackPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-16 my-20 text-3xl">My Tech Stack:</div>

       <section className="mx-auto max-w-[1100px] md:px-16 pb-20">
        {tools.map((group, gi) => (
          <div key={gi} className="mb-10">
            {group.map((tool, i) => (
              <div key={i} className="flex items-start gap-4 mb-2">
                <img
                  className={`${tool.iconW} ${tool.iconH} ${tool.rounded} shrink-0`}
                  src={tool.icon}
                />
                <div>
                  <div className="text-3xl">{tool.name}</div>
                  <div className="text-neutral-600 text-3xl">{tool.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}