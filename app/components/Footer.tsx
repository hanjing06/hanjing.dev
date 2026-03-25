'use client'

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1130px] px-8 md:px-16 mt-auto pb-8">
      <div className="h-px border-t-0 bg-black"></div>
      <hr className="h-px my-4 bg-neutral-quaternary border-0"></hr>

      <div className="flex justify-between text-black text-[15px]">
        <a href="mailto:hlin389@uwo.ca">hlin389@uwo.ca</a>

        <div>© 2026 Hanjing Lin.</div>
      </div>
    </footer>
  );
}