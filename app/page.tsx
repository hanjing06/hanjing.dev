'use client';

import Projects from "./projects/page";
import About from "./about/page";

export default function Home() {
  return (
    <main>
    <section id="home" className = "m-10 text-center">
    {/*main title*/}
    <h1>i'm hanjing!</h1>

    {/*header*/}
    <p><span>se @ western university</span></p>

    {/*buttons*/}
    <p><a href="mailto:hanjinglin8@gmail.com" target="_blank">
      <span>
        seeking 2026 summer co-op
      </span>
    </a></p>
    </section>

    <div className="m-auto flex justify-center">
      <a href="https://github.com/hanjing06" target="loading"><img src="/github.png" alt="hanjing's github"  className="w-5"/></a>
      <a href="https://www.linkedin.com/in/hanjing-lin-790252113/" target="loading"><img src="/linkedin.png" alt="hanjing's linkedin" className="w-5"/></a>
    </div>

    {/*projects*/}
    <section id="projects">
    <Projects />
    </section>

    {/*about*/}
    <section id="about">
    <About />
    </section>

    </main>
   );
};
