'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import DeskHero from '@/components/desk/DeskHero';
import SimpleHome from '@/components/SimpleHome';
import LampGate from './gates/LampGate';
import { GateShell } from './gates/shared';
import { clearSimple, returnToSimple, wantsSimple } from './returnToSimple';

/**
 * The home page flow:
 *
 *   choose ──3d──▶ loading (desk loads behind the start screen) ──▶ revealing ──▶ desk
 *     │                                                                          │
 *     └──simple──▶ simple ◀──────────── sticky notes / `simple` ───────────────┘
 *
 * The start screen ("gate") is only the first choice of a visit. After that
 * the desk's sticky notes go straight to the simple site, and the simple
 * site's lamp goes straight back into 3D (the gate then only shows loading,
 * and only the first time). Both sides stay mounted once visited, so moving
 * between them is instant and remembers where you were.
 */

type Stage = 'choose' | 'loading' | 'revealing' | 'desk' | 'simple';

const REVEAL_MS = 700;

let lowEnd: boolean | null = null;
/** True when WebGL is missing, the machine is low-end, motion is reduced, or data saver is on. */
function prefersSimple() {
  if (lowEnd !== null) return lowEnd;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const probe = document.createElement('canvas');
    webgl = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    webgl = false;
  }
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 && (nav.deviceMemory ?? 8) <= 4;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  lowEnd = !webgl || weak || reduced || !!nav.connection?.saveData;
  return lowEnd;
}
const noSubscribe = () => () => {};

/** How long the desk takes to dissolve into the simple site (matches `desk-leave`). */
const LEAVE_MS = 700;

export default function HomeExperience() {
  // coming back from another page via the navbar's name: skip the start screen
  const [stage, setStage] = useState<Stage>(() => (wantsSimple() ? 'simple' : 'choose'));
  // once loaded, each side stays mounted (just hidden) so switching back is
  // instant and lands where the visitor left it: the desk's lid, parts, lamp
  // and terminal, and the simple page's scroll position
  const [deskLoaded, setDeskLoaded] = useState(false);
  const [simpleSeen, setSimpleSeen] = useState(() => wantsSimple());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const recommendSimple = useSyncExternalStore(noSubscribe, prefersSimple, () => null);
  const revealTimer = useRef<number | null>(null);
  // leaving the desk for the simple site: the desk fades and blurs away over the page first
  const [leaving, setLeaving] = useState(false);
  /** Back on the desk from the simple site: it fades in (the first visit has the lamp's reveal instead). */
  const [returning, setReturning] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  // the start screen and the desk cover the window; the page underneath shouldn't scroll
  const covering = stage !== 'simple';
  useEffect(() => {
    if (!covering) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [covering]);

  useEffect(() => () => {
    if (revealTimer.current) window.clearTimeout(revealTimer.current);
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
  }, []);

  const enter = useCallback(() => {
    clearSimple();
    if (deskLoaded) {
      setReturning(true);
      setStage('desk');
      return;
    }
    setError(false);
    setProgress(0);
    setStage('loading');
  }, [deskLoaded]);
  const ready = useCallback(() => {
    setDeskLoaded(true);
    setProgress(1);
    setStage('revealing');
    revealTimer.current = window.setTimeout(() => setStage('desk'), REVEAL_MS);
  }, []);
  const simple = useCallback(() => {
    returnToSimple();
    setSimpleSeen(true);
    const fromDesk = stage === 'desk' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fromDesk) {
      setStage('simple');
      return;
    }
    // the simple page mounts underneath; the desk dissolves off it
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      setLeaving(false);
      setStage('simple');
    }, LEAVE_MS);
  }, [stage]);
  const failed = useCallback(() => {
    setError(true);
    setStage('choose');
  }, []);

  const inSimple = stage === 'simple';
  const deskMounted = deskLoaded || stage === 'loading' || stage === 'revealing' || stage === 'desk';

  return (
    <>
      {/* underneath the desk while in 3D: out of reach, but keeps its scroll position */}
      {simpleSeen ? (
        <div inert={!inSimple} aria-hidden={!inSimple}>
          <SimpleHome onEnter3D={enter} />
        </div>
      ) : null}
      {/* hidden while on the simple page; hiding it also pauses its rendering and keyboard */}
      {deskMounted ? (
        // fixed like the desk itself, so its fade and blur don't collapse the desk's own fixed box
        <div
          hidden={inSimple}
          className={`fixed inset-0 z-[60] ${leaving ? 'pointer-events-none animate-[desk-leave_0.7s_cubic-bezier(0.4,0,0.2,1)_forwards]' : returning && stage === 'desk' ? 'motion-safe:animate-[desk-enter_0.6s_ease-out]' : ''}`}
        >
          <DeskHero onSimple={simple} onProgress={setProgress} onReady={ready} onError={failed} />
        </div>
      ) : null}
      {stage !== 'desk' && !inSimple ? (
        <GateShell leaving={stage === 'revealing'}>
          <LampGate
            stage={stage === 'choose' ? 'choose' : 'loading'}
            progress={progress}
            recommendSimple={recommendSimple}
            error={error}
            onEnter={enter}
            onSimple={simple}
          />
        </GateShell>
      ) : null}
    </>
  );
}
