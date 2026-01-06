"use client";
import Link from "next/link";

export default function NavBar(){
    return (
    <nav>
        <Link href="/app/page">home</Link>
        <Link href="/app/projects/page">projects</Link>
            
    </nav>
    );
}

