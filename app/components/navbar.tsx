import Link from "next/link";

export default function NavBar(){
    return (
    <div className="mt-8 sm:mt-18 flex justify-center items-center gap-6">
        <Link href="/">home</Link>
        <Link href="/projects">projects</Link>
        <Link href="/about">about</Link>
    </div>
    );
}


