'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { aboutParagraphs, aboutSignoff, idCard } from '@/content/about';
import { mailto, site } from '@/lib/site';
import { withLinks } from '@/components/sections/AboutSection';
import PickedUp from './PickedUp';

const SERIF = "font-['Times_New_Roman',Times,serif]";

const CONTACTS = [
  { label: 'LinkedIn', href: site.linkedin.url, external: true },
  { label: 'GitHub', href: site.github.profileUrl, external: true },
  { label: 'Email', href: mailto, external: false },
];

const LINK = 'underline decoration-[#4f2683]/40 underline-offset-2 hover:decoration-[#4f2683]';

/**
 * The student ID, picked up off the desk. The front is the card (photo,
 * name, school and work, contact links); click or press enter to flip it for the about paragraphs.
 * Words live in content/about.ts.
 */
export default function IdCard({ onClose }: { onClose: () => void }) {
  const [back, setBack] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => cardRef.current?.focus(), []);

  return (
    <PickedUp onClose={onClose} hint={back ? 'click to flip back · esc to put it down' : 'click to flip · esc to put it down'}>
      <div className="relative w-[min(600px,92vw)] motion-safe:animate-[pick-up_0.45s_cubic-bezier(0.22,1,0.36,1)]" style={{ perspective: 1600 }}>
        {/* not a <button>: the back holds links */}
        <div
          ref={cardRef}
          tabIndex={0}
          onClick={(event) => {
            // links on the back open without flipping the card
            if (!(event.target as HTMLElement).closest('a')) setBack((b) => !b);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            setBack((b) => !b);
          }}
          aria-label={back ? 'Student card, back. Press enter to flip to the front.' : 'Student card. Press enter to flip it over.'}
          className="relative block aspect-[1.586] w-full cursor-pointer text-left outline-none [container-type:inline-size] transition-transform duration-700 [transform-style:preserve-3d]"
          // the site's global :focus-visible outline would draw a square box around the card
          style={{ transform: back ? 'rotateY(180deg)' : 'none', outline: 'none' }}
        >
          {/* front */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[#fbfbfa] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
            <div className="h-[13%] shrink-0 bg-[#4f2683]" aria-hidden="true" />
            <div className="flex min-h-0 flex-1 gap-[5%] p-[5%]">
              <div className="relative aspect-[3/4] h-full shrink-0 overflow-hidden rounded-md bg-neutral-200">
                <Image src={idCard.photo} alt={`Photo of ${idCard.name}`} fill sizes="200px" className="object-cover object-[50%_40%]" />
              </div>
              <div className={`${SERIF} flex min-w-0 flex-1 flex-col text-[#1b1f1d]`}>
                <p className="text-[5.4cqw] leading-tight">{idCard.name}</p>
                {idCard.lines.map((line) => (
                  <p key={line} className="mt-[1.2cqw] text-[2.9cqw] leading-snug text-[#3c4440]">{line}</p>
                ))}
                <ul className="mt-auto flex gap-[4cqw] text-[2.7cqw]">
                  {CONTACTS.map(({ label, href, external }) => (
                    <li key={label}>
                      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={LINK}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* back */}
          <div
            className={`${SERIF} absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[#fbfbfa] text-[#1b1f1d] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]`}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="mt-[5%] h-[9%] w-full shrink-0 bg-[#1b1f1d]" aria-hidden="true" />
            <div className="flex flex-1 flex-col justify-center gap-[0.7em] overflow-y-auto px-[6%] py-[3.5%] text-[clamp(10px,2.45cqw,15px)] leading-[1.45]">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{withLinks(paragraph, LINK)}</p>
              ))}
              <p>
                {aboutSignoff.before}
                <a href={mailto} title={site.email} className={`${LINK} text-[#4f2683]`}>
                  {aboutSignoff.link}
                </a>
                {aboutSignoff.after}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PickedUp>
  );
}
