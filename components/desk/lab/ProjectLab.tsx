'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { getLab } from '@/content/labs';
import { projectHref, type Project } from '@/content/projects';
import PickedUp, { CloseButton } from '../PickedUp';

// the board labs load through the desk's three.js module, so they share its copy of three.js
const VcuLab = dynamic(() => import('../runtime').then((m) => m.loadVcuLab()), { ssr: false });
const FsmLab = dynamic(() => import('../runtime').then((m) => m.loadFsmLab()), { ssr: false });
const SquatLab = dynamic(() => import('./SquatLab'), { ssr: false });

const MONO = 'font-mono';
const TABS = ['overview', 'controls', 'tools & skills', 'q&a'] as const;
type Tab = (typeof TABS)[number];

/**
 * A project picked up off the desk: the thing itself to play with on the
 * left (the VCU powered up, the FPGA running the detector, the squat
 * tracker replaying), and a terminal-style panel on the right with the
 * overview, the controls, the tools and a few questions. Everything but
 * the model comes from content/projects.ts and content/labs.ts.
 */
export default function ProjectLab({ project, onClose }: { project: Project; onClose: () => void }) {
  const lab = getLab(project.slug);
  const [tab, setTab] = useState<Tab>(lab ? 'controls' : 'overview');
  const [status, setStatus] = useState('');

  return (
    <PickedUp onClose={onClose} hint="esc to put it down" wide>
      <div className="relative flex h-[min(760px,86svh)] w-[min(1240px,100%)] flex-col overflow-hidden rounded-2xl text-[#e6e8e3] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/15 motion-safe:animate-[lab-in_0.5s_cubic-bezier(0.22,1,0.36,1)] md:flex-row">
        <CloseButton className="right-3 top-2 text-white" />

        {/* the stage: the model */}
        {/* see-through: the desk shows behind it, blurred */}
        <div className="relative min-h-0 flex-1 bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-150">
          <Stage slug={project.slug} project={project} onStatus={setStatus} />
          {status ? (
            <p
              key={status}
              className={`${MONO} pointer-events-none absolute bottom-3 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-[#0e0f10]/75 px-4 py-1.5 text-center text-[12px] text-white/85 ring-1 ring-white/10 backdrop-blur motion-safe:animate-[caption-in_0.25s_ease-out]`}
            >
              {status}
            </p>
          ) : null}
        </div>

        {/* the panel: a terminal that knows this project */}
        <aside className={`${MONO} flex h-[42%] w-full shrink-0 flex-col border-t border-white/10 bg-[#0e0f10]/90 text-[13px] leading-relaxed backdrop-blur-xl md:h-auto md:w-[360px] md:border-l md:border-t-0`}>
          <div className="border-b border-white/10 px-4 pt-3 pb-2">
            <p className="text-[#7fd3a3]">
              hanjing@desk<span className="text-white/50">:</span>
              <span className="text-[#8ab4f8]">~/projects/{project.slug}</span>
              <span className="text-white/50">$</span> <span className="text-white">ls</span>
            </p>
            <nav className="mt-2 flex flex-wrap gap-x-3 gap-y-1" aria-label="Project sections">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={`${tab === t ? 'bg-[#e6e8e3] text-[#0e0f10]' : 'text-[#8ab4f8] hover:underline'} px-1`}
                >
                  {t.replace(/ /g, '_')}/
                </button>
              ))}
              <a
                href={projectHref(project.slug)}
                target="_blank"
                rel="noopener"
                onClick={(event) => {
                  // always a new tab, whatever the modifier keys say
                  event.preventDefault();
                  window.open(projectHref(project.slug), '_blank', 'noopener');
                }}
                className="px-1 text-[#f6c177] hover:underline"
              >
                write-up ↗
              </a>
            </nav>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scroll-quiet">
            <p className="text-white/50">
              $ cat {tab.replace(/ /g, '_')}
            </p>
            <div className="mt-2">
              {tab === 'overview' ? (
                <>
                  <p className="text-[#f6c177]">{project.title}</p>
                  <p className="mt-1 text-white/60">{project.summary}</p>
                  {lab ? <p className="mt-3 italic text-white/70">{lab.intro}</p> : null}
                  {project.overview.map((p) => (
                    <p key={p} className="mt-3 text-white/85">{p}</p>
                  ))}
                </>
              ) : null}
              {tab === 'controls' ? (
                lab ? (
                  <dl>
                    {lab.controls.map((c) => (
                      <div key={c.what} className="mt-2 grid grid-cols-[7.5rem_1fr] gap-2">
                        <dt className="text-[#7fd3a3]">{c.what}</dt>
                        <dd className="text-white/80">{c.does}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-white/60">nothing to press here yet: this one is a photo. the write-up has the details.</p>
                )
              ) : null}
              {tab === 'tools & skills' ? (
                <ul>
                  {project.tools.map((tool, i) => (
                    <li key={tool} className="mt-1 text-white/85">
                      <span className="text-white/40">{String(i + 1).padStart(2, '0')} </span>
                      {tool}
                    </li>
                  ))}
                  <li className="mt-3 text-white/50">tags: {project.tags.map((t) => t.toLowerCase()).join(', ')}</li>
                </ul>
              ) : null}
              {tab === 'q&a' ? (
                lab ? (
                  <Questions items={lab.questions} />
                ) : (
                  <p className="text-white/60">no questions written up yet.</p>
                )
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </PickedUp>
  );
}

function Stage({ slug, project, onStatus }: { slug: string; project: Project; onStatus: (text: string) => void }) {
  if (slug === 'sunstang-vcu-2026') return <VcuLab onStatus={onStatus} />;
  if (slug === 'moore-fsm-sequence-detector') return <FsmLab onStatus={onStatus} />;
  if (slug === 'the-perfect-squat') return <SquatLab onStatus={onStatus} />;
  return (
    <div className="relative h-full w-full">
      <Image src={project.cover} alt="" fill sizes="(min-width: 768px) 880px, 100vw" className={`object-cover ${project.coverPosition ?? ''}`} />
    </div>
  );
}

function Questions({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.q} className="mt-2">
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="text-left text-[#8ab4f8] hover:underline">
            <span className="text-white/40">{open === i ? '▾' : '▸'} </span>
            {item.q}
          </button>
          {open === i ? <p className="mt-1 pl-4 text-white/80">{item.a}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** The hint in brackets at the top-left of a stage. */
export function StageHint({ children }: { children: ReactNode }) {
  return <p className={`${MONO} pointer-events-none absolute left-4 top-3 text-[12px] text-white/50`}>({children})</p>;
}
