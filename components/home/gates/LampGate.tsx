'use client';

import { useState } from 'react';
import LampSketch from '../LampSketch';
import { COPY, GATE_FONT, loadingLabel, type GateProps } from './shared';

/**
 * The start screen: a line drawing of the desk. The architect's lamp switches
 * on while you hover "enter", and warms up as the 3D desk loads.
 */
export default function LampGate({ stage, progress, recommendSimple, error, onEnter, onSimple }: GateProps) {
  const [hoverEnter, setHoverEnter] = useState(false);
  const hover = (on: boolean) => {
    setHoverEnter(on);
    if (on) warmUpDesk();
  };
  const loading = stage === 'loading';
  const glow = loading ? 0.35 + 0.65 * progress : hoverEnter ? 1 : 0;
  const simpleFirst = !!recommendSimple || error;

  const enter = (
    <ChoiceButton
      primary={!simpleFirst}
      label={COPY.enter}
      detail={COPY.enterDetail}
      onClick={onEnter}
      onHover={hover}
    />
  );
  const simple = <ChoiceButton primary={simpleFirst} label={COPY.simple} detail={COPY.simpleDetail} onClick={onSimple} />;

  return (
    <main className={`${GATE_FONT} flex h-full flex-col items-center justify-center gap-8 px-6 text-center`}>
      <LampSketch glow={glow} className="w-full max-w-[460px]" />

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl sm:text-6xl">{COPY.title}</h1>
        <p className="text-lg text-neutral-500">pull up a chair.</p>
      </div>

      {loading ? (
        <div className="flex w-64 flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="relative h-px w-full bg-neutral-200">
            <div className="absolute inset-y-0 left-0 bg-black transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="text-sm text-neutral-500">{loadingLabel(progress)}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {simpleFirst ? simple : enter}
            {simpleFirst ? enter : simple}
          </div>
          {error || recommendSimple ? <p className="max-w-sm text-sm text-neutral-500">{error ? COPY.error : COPY.recommend}</p> : null}
        </div>
      )}
    </main>
  );
}

function ChoiceButton({
  primary,
  label,
  detail,
  onClick,
  onHover,
}: {
  primary: boolean;
  label: string;
  detail: string;
  onClick: () => void;
  onHover?: (hovering: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      className={`flex min-h-11 w-64 flex-col items-center gap-0.5 border-[1.5px] px-5 py-3 transition-[background-color,color,scale] duration-200 active:scale-[0.97] ${
        primary
          ? 'border-transparent bg-[#1d1d1f] text-[#f5f5f7] hover:bg-[#3a3a3c]'
          : 'border-[#1d1d1f] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-[#f5f5f7]'
      }`}
    >
      <span className="text-lg">{label} →</span>
      <span className={`text-xs ${primary ? 'text-[#f5f5f7]/70' : 'opacity-70'}`}>{detail}</span>
    </button>
  );
}

let warmedUp = false;
/**
 * Pointing at (or tabbing to) "enter" is a good sign the visitor will go in:
 * start fetching the desk's code and model then, quietly, so it's mostly
 * there by the time they click. Both land in the browser's cache, where the
 * desk picks them up.
 */
function warmUpDesk() {
  if (warmedUp) return;
  warmedUp = true;
  void import('@/components/desk/runtime').catch(() => undefined);
  void fetch('/desk/desk.glb', { priority: 'low' } as RequestInit).catch(() => undefined);
}
