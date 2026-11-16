'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { glow } from './boardLook';
import { createBoardScene, type BoardScene } from './boardScene';
import PartGuide, { type BoardGuide, type BoardPart } from './PartGuide';

const MODEL = '/desk/de1soc.glb';
const RED = '#ff3b30';
const GREEN = '#22c55e';
const KNOB_TRAVEL = 0.0042;
/** The green glow around LEDR0 when z is on (candela, at board scale). */
const Z_LIGHT = 0.02;
const CAP_PRESS = 0.0012;

/**
 * The detector from the lab (see public/projects/moore-fsm-sequence-detector/state-diagram.png):
 * NEXT[state][x]. z is 1 in S4–S7. 1 0 1 0 turns z on, 1 0 0 0 turns it off.
 */
const NEXT = [
  [0, 1],
  [2, 1],
  [0, 3],
  [4, 1],
  [4, 5],
  [6, 5],
  [7, 5],
  [0, 5],
] as const;
export const ON_SEQUENCE = [1, 0, 1, 0];
export const OFF_SEQUENCE = [1, 0, 0, 0];
const SEGMENTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;
/** Which segments light for each digit. */
const DIGITS: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', ' ': '' };

/** What each part is, for the hover labels. */
const PARTS: BoardPart[] = [
  { match: 'FsmSw0*', anchor: 'FsmSw0Housing', label: 'SW0 = x', tip: 'the input bit: click to flip (up = 1)' },
  ...Array.from({ length: 9 }, (_, i) => ({ match: `FsmSw${i + 1}*`, anchor: `FsmSw${i + 1}Housing`, label: `SW${i + 1}`, tip: 'not used by the detector' })),
  { match: 'FsmKey0*', anchor: 'FsmKey0Cap', label: 'KEY0 = clock', tip: 'click to clock x in' },
  { match: 'FsmKey1*', anchor: 'FsmKey1Cap', label: 'KEY1 = reset', tip: 'back to S0' },
  { match: 'FsmKey2*', anchor: 'FsmKey2Cap', label: 'KEY2', tip: 'not used by the detector' },
  { match: 'FsmKey3*', anchor: 'FsmKey3Cap', label: 'KEY3', tip: 'not used by the detector' },
  { match: 'FsmHex0*', anchor: 'FsmHex0', label: 'HEX0', tip: 'the current state, S0–S7' },
  { match: 'FsmHex1*', anchor: 'FsmHex1', label: 'HEX1', tip: 'blank, a gap' },
  ...[2, 3, 4, 5].map((n) => ({ match: `FsmHex${n}*`, anchor: `FsmHex${n}`, label: `HEX${n}`, tip: 'your last four bits (newest on the right)' })),
  { match: 'FsmLedr0', anchor: 'FsmLedr0', label: 'LEDR0 = z', tip: 'the output: on after 1 0 1 0' },
  ...[1, 2, 3].map((i) => ({ match: `FsmLedr${i}`, anchor: `FsmLedr${i}`, label: `LEDR${i}`, tip: `state bit ${i - 1}` })),
  ...[4, 5, 6, 7, 8, 9].map((i) => ({ match: `FsmLedr${i}`, anchor: `FsmLedr${i}`, label: `LEDR${i}`, tip: 'not used by the detector' })),
  { match: 'FsmHeatsink*', anchor: 'FsmHeatsinkBase', label: 'Cyclone V FPGA', tip: 'the detector, as three flip-flops and logic' },
  { match: 'FsmFpga', anchor: 'FsmHeatsinkBase', label: 'Cyclone V FPGA', tip: 'the detector, as three flip-flops and logic' },
];

type Machine = { x: 0 | 1; state: number; bits: (0 | 1)[] };

/**
 * The DE1-SoC running the Moore FSM sequence detector. SW0 is x, KEY0 is
 * the clock, KEY1 resets; the HEX displays show the state and the last four
 * bits, LEDR0 is z. The keyboard works too: 1, 0 and r.
 */
export default function FsmLab({ onStatus }: { onStatus: (text: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const status = useRef(onStatus);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<Machine>({ x: 0, state: 0, bits: [] });
  const [board, setBoard] = useState<BoardScene | null>(null);
  /** For a moment after z changes, the guide points at LEDR0 instead. */
  const [zFlash, setZFlash] = useState<0 | 1 | null>(null);
  const lastZ = useRef(false);
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    status.current = onStatus;
  }, [onStatus]);

  // z just changed: show it on LEDR0 for a couple of seconds
  useEffect(() => {
    const z = view.state >= 4;
    if (z === lastZ.current) return;
    lastZ.current = z;
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => {
      flashTimer.current = null;
      setZFlash(null);
    }, 2600);
    const id = window.setTimeout(() => setZFlash(z ? 1 : 0), 0);
    return () => window.clearTimeout(id);
  }, [view.state]);
  useEffect(
    () => () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let scene: BoardScene | null = null;
    let cancelled = false;
    let onKey: ((event: KeyboardEvent) => void) | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    createBoardScene(el, MODEL, { size: 0.16, reducedMotion })
      .then((s) => {
        if (cancelled) return s.dispose();
        scene = s;
        setLoading(false);
        setBoard(s);
        const board = runFsm(s, (text) => status.current(text), setView);
        onKey = (event) => {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          if (event.key === '0' || event.key === '1') board.enter(event.key === '1' ? 1 : 0);
          else if (event.key === ' ' || event.key === 'Enter') board.clock();
          else if (event.key.toLowerCase() === 'r') board.reset();
          else return;
          event.preventDefault();
        };
        window.addEventListener('keydown', onKey);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (onKey) window.removeEventListener('keydown', onKey);
      scene?.dispose();
      status.current('');
    };
  }, []);

  const z = view.state >= 4;
  const target = z ? OFF_SEQUENCE : ON_SEQUENCE;
  const matched = view.state % 4;
  // the next thing to do: set SW0 to the bit the sequence needs, then clock it in
  const needed = target[matched];
  // (labels go under the parts so the LEDs above the switches stay in view)
  const guide: BoardGuide =
    zFlash !== null
      ? { anchor: 'FsmLedr0', text: zFlash ? 'z = 1: LEDR0 is on!' : 'z = 0: LEDR0 is off', below: true }
      : view.x === needed
        ? { anchor: 'FsmKey0Cap', text: `press KEY0 to clock in ${needed}`, below: true }
        : { anchor: 'FsmSw0Housing', text: `flip SW0 to ${needed}`, below: true };

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" />
      {board ? <PartGuide scene={board} parts={PARTS} guide={guide} /> : null}
      {/* the exercise, like the lab sheet */}
      <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-[#0e0f10]/70 px-4 py-3 text-right font-mono text-[12px] text-white/70 ring-1 ring-white/10 backdrop-blur">
        <p>enter this sequence to turn z {z ? 'off' : 'on'}:</p>
        <p className="mt-1 text-2xl tracking-[0.35em] text-white">
          {target.map((bit, i) => (
            <span key={i} className={i < matched ? 'text-[#7fd3a3]' : i === matched ? 'text-[#f6c177]' : 'text-white/50'}>
              {bit}
            </span>
          ))}
        </p>
        <p className="mt-1">
          state <span className="text-white">S{view.state}</span> · x = <span className="text-white">{view.x}</span> · z ={' '}
          <span className={z ? 'font-semibold text-[#4ade80]' : 'text-white'}>{z ? 1 : 0}</span>
        </p>
        <p className="mt-2 border-t border-white/10 pt-2 text-white/50">
          shortcut: type <kbd className="rounded bg-white/10 px-1 text-white">1</kbd> <kbd className="rounded bg-white/10 px-1 text-white">0</kbd> · <kbd className="rounded bg-white/10 px-1 text-white">r</kbd> resets
        </p>
      </div>
      {loading && !failed ? <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-white/50">loading the board…</p> : null}
      {failed ? <p className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white/60">the board couldn’t load here.</p> : null}
    </div>
  );
}

function runFsm(s: BoardScene, status: (text: string) => void, onChange: (m: Machine) => void) {
  const m: Machine = { x: 0, state: 0, bits: [] };
  const knobs = Array.from({ length: 10 }, (_, i) => s.node(`FsmSw${i}Knob`));
  const knobHome = knobs.map((k) => k?.position.z ?? 0);
  const switches = Array(10).fill(false) as boolean[];
  const caps = Array.from({ length: 4 }, (_, i) => s.mesh(`FsmKey${i}Cap`));
  const capHome = caps.map((c) => c?.position.y ?? 0);
  const leds = Array.from({ length: 10 }, (_, i) => s.mesh(`FsmLedr${i}`));
  const segs = Array.from({ length: 6 }, (_, n) => SEGMENTS.map((k) => s.mesh(`FsmHex${n}Seg${k}`)));
  glow(s.mesh('FsmPowerLed'), GREEN, 1.6);
  // LEDR0 is tiny: when z is on it also casts a green glow onto the board around it
  const zLight = new THREE.PointLight(GREEN, 0, 0.035, 2);
  zLight.position.set(0, 0.004, 0);
  leds[0]?.add(zLight);
  let zGlow = 0;
  s.onFrame((dt, time) => {
    const target = m.state >= 4 ? 1 : 0;
    zGlow += (target - zGlow) * Math.min(1, dt * 10);
    zLight.intensity = zGlow * Z_LIGHT * (0.85 + 0.15 * Math.sin(time * 4));
  });

  const slide = (i: number, up: boolean) => {
    const k = knobs[i];
    if (!k) return;
    const from = k.position.z;
    const to = knobHome[i] - (up ? KNOB_TRAVEL : 0);
    s.tween(k, 0.14, (e) => {
      k.position.z = from + (to - from) * e;
    });
  };
  const press = (i: number) => {
    const cap = caps[i];
    if (!cap) return;
    s.tween(cap, 0.2, (e) => {
      cap.position.y = capHome[i] - CAP_PRESS * Math.sin(Math.PI * e);
    });
  };
  const showDigit = (n: number, ch: string) => {
    const on = DIGITS[ch] ?? '';
    SEGMENTS.forEach((k, i) => glow(segs[n][i], on.includes(k) ? RED : null, 2.4));
  };
  const show = () => {
    const z = m.state >= 4;
    showDigit(0, String(m.state));
    showDigit(1, ' ');
    const last = m.bits.slice(-4);
    for (let i = 0; i < 4; i += 1) {
      // HEX2 shows the newest bit, HEX5 the oldest of the last four
      const bit = last[last.length - 1 - i];
      showDigit(2 + i, bit === undefined ? ' ' : String(bit));
    }
    glow(leds[0], z ? GREEN : null, 2.4); // green: the sequence was detected
    for (let b = 0; b < 3; b += 1) glow(leds[1 + b], (m.state >> b) & 1 ? RED : null, 1.8);
    const target = z ? OFF_SEQUENCE : ON_SEQUENCE;
    status(`S${m.state} · z=${z ? 1 : 0} · entered: ${m.bits.length ? m.bits.join(' ') : 'nothing yet'} · next: ${target.join(' ')} turns z ${z ? 'off' : 'on'}`);
    onChange({ ...m, bits: [...m.bits] });
  };

  const setX = (x: 0 | 1) => {
    if (m.x === x) return;
    m.x = x;
    switches[0] = x === 1;
    slide(0, switches[0]);
    show();
  };
  const clock = () => {
    press(0);
    m.state = NEXT[m.state][m.x];
    m.bits = [...m.bits, m.x].slice(-12);
    show();
  };
  const reset = () => {
    press(1);
    m.state = 0;
    m.bits = [];
    show();
  };

  s.setPickable(['FsmSw*', 'FsmKey*']);
  s.onPick((name) => {
    const sw = name.match(/^FsmSw(\d)/);
    if (sw) {
      const i = Number(sw[1]);
      if (i === 0) setX(m.x ? 0 : 1);
      else {
        switches[i] = !switches[i];
        slide(i, switches[i]);
      }
      return;
    }
    const key = name.match(/^FsmKey(\d)/);
    if (!key) return;
    const i = Number(key[1]);
    if (i === 0) clock();
    else if (i === 1) reset();
    else press(i);
  });
  show();

  return {
    clock,
    reset,
    /** Set x and clock it in, like typing the bit. */
    enter: (x: 0 | 1) => {
      setX(x);
      window.setTimeout(clock, 120);
    },
  };
}
