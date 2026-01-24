"use client";

import Link from "next/link";

export default function NavBar(){
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
    return (
    <div className="mt-8 sm:mt-18 flex justify-center items-center gap-6">
        <Link href="#" onClick={(e) => handleClick(e, 'home')}>home</Link>    
        <Link href="#projects" onClick={(e) => handleClick(e, 'projects')}>projects</Link>
        <Link href="#about" onClick={(e) => handleClick(e, 'about')}>about</Link>
    </div>
    );
}


