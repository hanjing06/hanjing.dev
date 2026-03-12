'use client';

const tags = ["Computer Vision", "Machine Learning"];
const tools = ["OpenCV",  "Python", "YOLOv8", "PyTorch", "NumPy", "RoboFlow", "Google Colab"];

export default function SquatPage(){
    return(
        <main className="min-h-screen">
        <section className="mx-auto max-w-[1100px] px-8 py-20 md:px-16">
            <a href="/projects"><div className="justify-start text-neutral-600">← back to projects</div></a>
            <img className="w-[550px] h-24 mt-[42px]" src="/https://placehold.co/550x94" />
            <div className="justify-start text-neutral-600 mt-[17px]">Ongoing · Passion Project</div>
            <div className="justify-start text-black text-3xl mt-[22px]">The Perfect Squat
                <a href="https://github.com/hanjing06/Sunstang-VCU-2026.git" target="_blank"><img className="w-9 h-9 inline ml-[21px] mb-2" src="/github.png" /></a>
            </div>
            <div className="w-[1054px] h-12 justify-start text-stone-500 text-xl">Developing a computer vision program that detects the bar path of your squat.</div>
            <div className="flex flex-wrap gap-3">
            {tags.map((tags) => (
                <span className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
                {tags}
                </span>
            ))}
            </div>
            <div className="justify-start text-black text-3xl mt-[30px]">Overview</div>
            <div className="w-[1081px] justify-start text-black text-xl mt-3">
                The Perfect Squat is a passion project that <a href="https://www.linkedin.com/in/mats-leis-4b9911271/" target="_blank" className="underline text-[#C85A3F] transition duration-300 ease-in-out hover:text-[#f6d053]">Mats Leis</a> and I started second semester of our second year. 
                This came about when we were discussing about a LinkedIn post we both saw exploring MediaPipe's pose model detection.
                It got us thinking about how we could utilize these tools into our everyday lives.
            <div className="mt-5">
                That's when 'The Perfect Squat' came alive.
            </div>
            <div className="mt-5">
                A computer vision system that analyzes barbell trajectory during a squat using the YOLOv8 pose model and OpenCV to process videos. 
            </div></div>
        <div className="justify-start text-black text-3xl mt-[62px]">Tools &amp; Skills</div>
        <div className="flex flex-wrap gap-3 mt-[14px]">
            {tools.map((tags) => (
                <span className="bg-[#e0b24c] px-3 py-1 text-[14px] text-black">
                {tags}
                </span>
            ))}
            </div>
            </section>
        </main>
    )
}