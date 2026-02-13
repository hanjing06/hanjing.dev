'use client';

import Projects from "./projects/page";
import About from "./about/page";
import {motion, AnimatePresence} from "framer-motion";
import {useState} from "react";
import Link from "next/link"

interface Project {
  id: number;
  name: string;
  icon: string;
}

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  
  const projects = [
    {   id: 1,
        name: "name1",
        icon: ""
    },
    {   id: 2,
        name: "name2",
        icon: ""
    }
    ];

  return (
  <main className="flex justify-center">
  <div className="max-w-2xl w-full px-4 m-20">

  {/* Line 1: Name*/}
  <h1 className="firstLine text-left mb-5">Hi! I'm Hanjing. <p>I am a software engineer based in London ⇄ Toronto.</p></h1>

  {/* Line 2: Projects*/}
  <div className="secondLine">
    
    <h1 className="Text text-left mb-5">I build projects that solve my problems.

    <div className="project-icons inline-block align-middle ml-3">
      {/*on hover, the project icons will spread in a straight line, on individual icon hover, "notification" like popup with project name
      current "boiler plate for it"*/}
      <motion.div className="projectSpread relative" 
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "10px",
          height: "10px",
          cursor: "pointer"
          }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // Spreads out on hover
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: "#fcfcfc" 
      }}
      transition={{ type: "spring", stiffness: 100 }}>
    
      <motion.div className="projectName absolute bottom-11 left-1/2 -translate-x-1/2 bg-slate-800 w-20 h-5 cursor-pointer rounded-full align-middle"
        animate={isHovered?{opacity:1}:{opacity:0}}
        transition={{duration:0.2}}
        style={{
          color: "white",
          display: "flex",
          fontSize:"10px",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Project one
      </motion.div>
    </motion.div>
    </div>
  </h1>
  </div>

  {/*Line 3: Education*/}
  <p className="thirdLine text-left mb-5">I currently study at the University of Western Ontario.</p>

  {/*Line 4: Tech stack*/}
  <p className="fourthLine text-left mb-5">
    Curious about what powers my projects?{' '}
  
  <Link href="/techstack" className="tech-link">
    <motion.span
      whileHover={{ x: 5, color: "#f6d053" }}
      animate={{ color: "#C85A3F"}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      // className="underline"
  >
    Click here.
    </motion.span>
  </Link>
  </p>

  <p className="fifthLine text-left mb-5">Socials</p>
  
</div>

</main>
   );
};
