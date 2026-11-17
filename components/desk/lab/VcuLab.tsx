'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { glow } from './boardLook';
import { createBoardScene, type BoardScene } from './boardScene';
import PartGuide, { type BoardGuide, type BoardPart } from './PartGuide';

const MODEL = '/desk/vcu.glb';
const MONO = 'Menlo, Consolas, "SFMono-Regular", monospace';
const BLUE = '#3b82f6';
const GREEN = '#22c55e';
const RED = '#ef4444';
const AMBER = '#f59e0b';
const WARM = '#fde68a';
/** How far a slide switch's knob travels (metres), and the button cap press. */
const KNOB_TRAVEL = 0.0116;
const CAP_PRESS = 0.0016;
const PRECHARGE_S = 2.2;
const MAIN_S = 1.6;

type Gear = 'N' | 'D' | 'R';
type Mode = 'READY' | 'CHARGE';
type Charge = 'idle' | 'charging' | 'ready';
type State = {
  lv: boolean;
  hv: boolean;
  charge: Charge;
  /** Seconds into the pre-charge sequence. */
  chargeT: number;
  gear: Gear;
  mode: Mode;
  left: boolean;
  right: boolean;
  hazard: boolean;
};

/** What each part is, for the hover labels. */
const PARTS: BoardPart[] = [
  { match: 'VcuSwitchLV*', anchor: 'VcuSwitchLVHousing', label: 'LV switch', tip: 'powers the low-voltage side' },
  { match: 'VcuSwitchHV*', anchor: 'VcuSwitchHVHousing', label: 'HV switch', tip: 'asks for high voltage' },
  { match: 'VcuBtnPrecharge*', anchor: 'VcuBtnPrechargeCap', label: 'pre-charge', tip: 'closes the contactors' },
  { match: 'VcuBtnLeft*', anchor: 'VcuBtnLeftCap', label: 'left signal', tip: 'click to toggle' },
  { match: 'VcuBtnHazard*', anchor: 'VcuBtnHazardCap', label: 'hazards', tip: 'both signals blink' },
  { match: 'VcuBtnRight*', anchor: 'VcuBtnRightCap', label: 'right signal', tip: 'click to toggle' },
  { match: 'VcuGear*', anchor: 'VcuGearKnob', label: 'gear select', tip: 'click to turn: N → D → R' },
  { match: 'VcuMode*', anchor: 'VcuModeLever', label: 'mode select', tip: 'click to flip: READY / CHARGE' },
  { match: 'VcuLcd*', anchor: 'VcuLcdFrame', label: 'LCD', tip: 'what the VCU is thinking' },
  { match: 'VcuBlue*', anchor: 'VcuBlue0', label: 'blue LEDs', tip: 'pre-charge contactor, fills while charging' },
  { match: 'VcuGreen*', anchor: 'VcuGreen0', label: 'green LEDs', tip: 'main contactor closed' },
  { match: 'VcuStatus0', anchor: 'VcuStatus0', label: 'LV light', tip: 'low voltage is on' },
  { match: 'VcuStatus1', anchor: 'VcuStatus1', label: 'HV light', tip: 'high voltage requested' },
  { match: 'VcuStatus2', anchor: 'VcuStatus2', label: 'HVIL light', tip: 'the interlock loop is closed: ready' },
  { match: 'VcuStatus3', anchor: 'VcuStatus3', label: 'FAULT light', tip: 'blinks when HV is asked for without LV' },
  { match: 'VcuNucleo*', anchor: 'VcuNucleoBoard', label: 'Nucleo-F302R8', tip: 'the microcontroller running it all' },
];

const GEAR_ANGLE: Record<Gear, number> = { N: 0, D: -0.75, R: 0.75 };
const NEXT_GEAR: Record<Gear, Gear> = { N: 'D', D: 'R', R: 'N' };

/**
 * The Sunstang VCU, powered up: flip LV, request HV, pre-charge, pick a
 * gear, signal. The board is public/desk/vcu.glb (blender/boards.py); the
 * behaviour follows the car's start-up as the VCU sees it.
 */
export default function VcuLab({ onStatus }: { onStatus: (text: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const status = useRef(onStatus);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [board, setBoard] = useState<BoardScene | null>(null);
  const [guide, setGuide] = useState<BoardGuide>(null);

  useEffect(() => {
    status.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let scene: BoardScene | null = null;
    let cancelled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    createBoardScene(el, MODEL, { size: 0.2, reducedMotion, onContextLost: () => setFailed(true) })
      .then((s) => {
        if (cancelled) return s.dispose();
        scene = s;
        setLoading(false);
        setBoard(s);
        runVcu(s, (text) => status.current(text), setGuide);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      scene?.dispose();
      status.current('');
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" />
      {board ? <PartGuide scene={board} parts={PARTS} guide={guide} /> : null}
      {loading && !failed ? <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-white/50">loading the board…</p> : null}
      {failed ? <p className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white/60">the board couldn’t load here.</p> : null}
    </div>
  );
}

/** Wires the model to the VCU's behaviour. */
function runVcu(s: BoardScene, status: (text: string) => void, onGuide: (guide: BoardGuide) => void) {
  const state: State = { lv: false, hv: false, charge: 'idle', chargeT: 0, gear: 'N', mode: 'READY', left: false, right: false, hazard: false };

  // the LCD is drawn onto a canvas: 2 lines of 20 characters
  const lcd = s.mesh('VcuLcdScreen');
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  const lcdMap = new THREE.CanvasTexture(canvas);
  lcdMap.flipY = false;
  lcdMap.colorSpace = THREE.SRGBColorSpace;
  if (lcd) {
    const material = lcd.material as THREE.MeshBasicMaterial;
    material.map = lcdMap;
    material.color.set('#ffffff');
    material.needsUpdate = true;
  }
  let lcdShown = '';
  const drawLcd = (lines: [string, string], on: boolean) => {
    const key = `${on}|${lines[0]}|${lines[1]}`;
    if (key === lcdShown || !ctx) return;
    lcdShown = key;
    ctx.fillStyle = on ? '#a7cc6e' : '#33402a';
    ctx.fillRect(0, 0, 640, 192);
    if (on) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let i = 0; i < 20; i += 1) for (let r = 0; r < 2; r += 1) ctx.fillRect(16 + i * 30.4, 18 + r * 82, 26, 68);
      ctx.fillStyle = '#17260f';
      ctx.font = `bold 46px ${MONO}`;
      ctx.textBaseline = 'middle';
      for (let r = 0; r < 2; r += 1) {
        const text = lines[r].padEnd(20).slice(0, 20);
        for (let i = 0; i < 20; i += 1) ctx.fillText(text[i], 18 + i * 30.4, 52 + r * 82);
      }
    }
    lcdMap.needsUpdate = true;
  };

  // the parts
  const knob = { lv: s.node('VcuSwitchLVKnob'), hv: s.node('VcuSwitchHVKnob') };
  const knobHome = { lv: knob.lv?.position.z ?? 0, hv: knob.hv?.position.z ?? 0 };
  const gearKnob = s.node('VcuGearKnob');
  const modeLever = s.node('VcuModeLever');
  const caps = { Left: s.mesh('VcuBtnLeftCap'), Hazard: s.mesh('VcuBtnHazardCap'), Right: s.mesh('VcuBtnRightCap'), Precharge: s.mesh('VcuBtnPrechargeCap') };
  const capHome = Object.fromEntries(Object.entries(caps).map(([k, m]) => [k, m?.position.y ?? 0])) as Record<keyof typeof caps, number>;
  const blue = [0, 1, 2, 3, 4].map((i) => s.mesh(`VcuBlue${i}`));
  const green = [0, 1, 2, 3, 4].map((i) => s.mesh(`VcuGreen${i}`));
  const statusLed = [0, 1, 2, 3].map((i) => s.mesh(`VcuStatus${i}`)); // LV, HV, HVIL, FAULT
  const nucleoLed = s.mesh('VcuNucleoLed');
  const nucleoPower = s.mesh('VcuNucleoPower');
  if (modeLever) modeLever.rotation.x = -0.45;

  // only touch a material when its light changes
  const lit = new Map<THREE.Mesh, string | null>();
  const set = (mesh: THREE.Mesh | null, color: string | null, intensity?: number) => {
    if (!mesh || lit.get(mesh) === color) return;
    lit.set(mesh, color);
    glow(mesh, color, intensity);
  };

  const slide = (which: 'lv' | 'hv', on: boolean) => {
    const k = knob[which];
    if (!k) return;
    const from = k.position.z;
    const to = knobHome[which] - (on ? KNOB_TRAVEL : 0);
    s.tween(k, 0.18, (e) => {
      k.position.z = from + (to - from) * e;
    });
  };
  const press = (which: keyof typeof caps) => {
    const cap = caps[which];
    if (!cap) return;
    const home = capHome[which];
    s.tween(cap, 0.22, (e) => {
      cap.position.y = home - CAP_PRESS * Math.sin(Math.PI * e);
    });
  };
  const turnGear = (gear: Gear) => {
    if (!gearKnob) return;
    const from = gearKnob.rotation.y;
    const to = GEAR_ANGLE[gear];
    s.tween(gearKnob, 0.3, (e) => {
      gearKnob.rotation.y = from + (to - from) * e;
    });
  };
  const flipMode = (mode: Mode) => {
    if (!modeLever) return;
    const from = modeLever.rotation.x;
    const to = mode === 'READY' ? -0.45 : 0.45;
    s.tween(modeLever, 0.2, (e) => {
      modeLever.rotation.x = from + (to - from) * e;
    });
  };

  /** Once the car is ready and in gear, the signals are the last thing to try. */
  let triedSignals = false;
  let lastGuide = '';
  const nextStep = (): BoardGuide => {
    if (!state.lv) return { anchor: 'VcuSwitchLVHousing', text: state.hv ? 'flip LV on first' : 'start here: flip LV on' };
    if (!state.hv) return { anchor: 'VcuSwitchHVHousing', text: 'now flip HV on' };
    if (state.charge === 'idle') return { anchor: 'VcuBtnPrechargeCap', text: 'press pre-charge' };
    if (state.charge === 'charging') return null;
    if (state.gear === 'N') return { anchor: 'VcuGearKnob', text: 'pick a gear' };
    if (!triedSignals) return { anchor: 'VcuBtnLeftCap', text: 'try the signals' };
    return null;
  };

  const hvOn = () => state.lv && state.hv;
  const fault = () => state.hv && !state.lv;
  const dropHv = () => {
    state.charge = 'idle';
    state.chargeT = 0;
  };

  s.setPickable(['VcuSwitchLV*', 'VcuSwitchHV*', 'VcuBtnLeft*', 'VcuBtnHazard*', 'VcuBtnRight*', 'VcuBtnPrecharge*', 'VcuGear*', 'VcuMode*']);
  s.onPick((name) => {
    if (name.startsWith('VcuSwitchLV')) {
      state.lv = !state.lv;
      slide('lv', state.lv);
      if (!state.lv) {
        dropHv();
        state.left = state.right = state.hazard = false;
      }
    } else if (name.startsWith('VcuSwitchHV')) {
      state.hv = !state.hv;
      slide('hv', state.hv);
      if (!state.hv) dropHv();
    } else if (name.startsWith('VcuBtnPrecharge')) {
      press('Precharge');
      if (hvOn() && state.charge === 'idle') {
        state.charge = 'charging';
        state.chargeT = 0;
      }
    } else if (name.startsWith('VcuBtnLeft')) {
      press('Left');
      triedSignals = true;
      if (state.lv) {
        state.left = !state.left;
        if (state.left) state.right = false;
      }
    } else if (name.startsWith('VcuBtnRight')) {
      press('Right');
      triedSignals = true;
      if (state.lv) {
        state.right = !state.right;
        if (state.right) state.left = false;
      }
    } else if (name.startsWith('VcuBtnHazard')) {
      press('Hazard');
      triedSignals = true;
      if (state.lv) state.hazard = !state.hazard;
    } else if (name.startsWith('VcuGear')) {
      state.gear = NEXT_GEAR[state.gear];
      turnGear(state.gear);
    } else if (name.startsWith('VcuMode')) {
      state.mode = state.mode === 'READY' ? 'CHARGE' : 'READY';
      flipMode(state.mode);
    }
  });

  let lastStatus = '';
  s.onFrame((dt, time) => {
    // the pre-charge sequence: blue LEDs fill, then green, then the car is ready
    if (state.charge === 'charging') {
      state.chargeT += dt;
      if (state.chargeT >= PRECHARGE_S + MAIN_S) state.charge = 'ready';
    }
    const blink = Math.sin(time * Math.PI * 3) > 0; // 1.5 Hz
    const heartbeat = time % 1 < 0.12;
    const ready = state.charge === 'ready';
    const blueOn = state.charge === 'idle' ? 0 : state.charge === 'ready' ? 5 : Math.min(5, Math.floor((state.chargeT / PRECHARGE_S) * 5) + 1);
    const greenOn = state.charge === 'ready' ? 5 : state.charge === 'charging' && state.chargeT > PRECHARGE_S ? Math.min(5, Math.floor(((state.chargeT - PRECHARGE_S) / MAIN_S) * 5) + 1) : 0;
    blue.forEach((m, i) => set(m, i < blueOn ? BLUE : null, 2.2));
    green.forEach((m, i) => set(m, i < greenOn ? GREEN : null, 2.2));
    set(statusLed[0], state.lv ? GREEN : null, 2);
    set(statusLed[1], hvOn() ? RED : null, 2);
    set(statusLed[2], ready ? AMBER : null, 2);
    set(statusLed[3], fault() && blink ? RED : null, 2.4);
    set(nucleoPower, state.lv ? RED : null, 1.6);
    set(nucleoLed, state.lv && heartbeat ? GREEN : null, 1.8);
    const leftOn = state.lv && (state.hazard || state.left) && blink;
    const rightOn = state.lv && (state.hazard || state.right) && blink;
    set(caps.Left, leftOn ? AMBER : null, 1.4);
    set(caps.Right, rightOn ? AMBER : null, 1.4);
    set(caps.Hazard, state.lv && state.hazard && blink ? RED : null, 1.4);
    set(caps.Precharge, state.charge === 'charging' ? (blink ? WARM : null) : ready ? GREEN : null, 1.2);

    // the display and the status line
    const signal = state.hazard ? ' <!>' : state.left ? ' <  ' : state.right ? '   >' : '';
    const hvLabel = !state.hv ? 'OFF' : !state.lv ? 'ERR' : ready ? 'RDY' : state.charge === 'charging' ? 'PRE' : 'REQ';
    let line2 = `${state.mode === 'CHARGE' ? 'CHG' : 'RDY'} ${state.gear}  HV:${hvLabel}`;
    if (fault()) line2 = 'FAULT: LV IS OFF';
    else if (state.gear !== 'N' && !ready) line2 = `${state.gear}? HV NOT READY`;
    drawLcd([`SUNSTANG VCU${signal.padStart(8)}`, line2], state.lv);

    let text: string;
    if (fault()) text = 'FAULT: HV requested with LV off. flip the LV switch on first';
    else if (!state.lv) text = 'board off. flip the LV switch (bottom-left) to power it';
    else if (!state.hv) text = 'LV on, nucleo running. flip the HV switch to request high voltage';
    else if (state.charge === 'idle') text = 'HV requested. press pre-charge to close the contactors';
    else if (state.charge === 'charging') text = state.chargeT < PRECHARGE_S ? 'pre-charging the motor controller…' : 'closing the main contactor…';
    else text = `HV ready · gear ${state.gear}${state.gear === 'N' ? ' (turn the knob)' : ''} · mode ${state.mode}${state.hazard ? ' · hazards' : state.left ? ' · left signal' : state.right ? ' · right signal' : ''}`;
    const step = nextStep();
    const stepKey = step ? `${step.anchor}|${step.text}` : '';
    if (stepKey !== lastGuide) {
      lastGuide = stepKey;
      onGuide(step);
    }
    if (text !== lastStatus) {
      lastStatus = text;
      status(text);
    }
  });
}
