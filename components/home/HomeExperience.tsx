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
 *     └──simple──▶ simple (the original landing page)        back to the start ◀─┘
 *
 * The start screen ("gate") shows on every visit. The 3D desk stays in 3D
 * until the visitor goes back to the start (a sticky note, or `simple`).
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

export default function HomeExperience() {
  // coming back from another page via the navbar's name: skip the start screen
  const [stage, setStage] = useState<Stage>(() => (wantsSimple() ? 'simple' : 'choose'));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const recommendSimple = useSyncExternalStore(noSubscribe, prefersSimple, () => null);
  const revealTimer = useRef<number | null>(null);

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
  }, []);

  const enter = useCallback(() => {
    clearSimple();
    setError(false);
    setProgress(0);
    setStage('loading');
  }, []);
  const ready = useCallback(() => {
    setProgress(1);
    setStage('revealing');
    revealTimer.current = window.setTimeout(() => setStage('desk'), REVEAL_MS);
  }, []);
  const leave = useCallback(() => {
    clearSimple();
    setStage('choose');
  }, []);
  const simple = useCallback(() => {
    returnToSimple();
    setStage('simple');
  }, []);
  const failed = useCallback(() => {
    setError(true);
    setStage('choose');
  }, []);

  if (stage === 'simple') return <SimpleHome onEnter3D={enter} />;

  const deskMounted = stage === 'loading' || stage === 'revealing' || stage === 'desk';

  return (
    <>
      {deskMounted ? <DeskHero onLeave={leave} onProgress={setProgress} onReady={ready} onError={failed} /> : null}
      {stage !== 'desk' ? (
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
