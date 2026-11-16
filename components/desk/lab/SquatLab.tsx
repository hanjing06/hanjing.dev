'use client';

import { useEffect, useRef, useState } from 'react';
import { StageHint } from './ProjectLab';

/**
 * The Perfect Squat's pipeline, replayed on a screen: a lifter squats, the
 * pose model's keypoints are drawn over them, an ArUco tag on the bar is
 * tracked, its path is traced, and the bar velocity is plotted rep by rep,
 * the way squat-tracker's barbellVelocityTracker.py does it from video.
 */

const W = 960;
const H = 540;
const REP_S = 3.4;
/** Millimetres per pixel, from the tag's printed size (the real tracker's `mmpp`). */
const TAG_MM = 60;
const TAG_PX = 24;
const MMPP = TAG_MM / TAG_PX;
const ARUCO = [
  [1, 0, 1, 1],
  [0, 1, 0, 1],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
];
const MONO = 'Menlo, Consolas, "SFMono-Regular", monospace';

type Overlays = { skeleton: boolean; path: boolean; velocity: boolean };
type Pose = Record<'nose' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'toe' | 'bar', [number, number]>;

/** The lifter's joints for a squat depth 0 (standing) to 1 (bottom). Side view, facing right. */
function pose(depth: number): Pose {
  const ankle: [number, number] = [430, 440];
  const shin = 96;
  const thigh = 100;
  const torso = 118;
  const shinTilt = depth * 0.42; // forward
  const thighTilt = depth * 1.75; // back from vertical
  const lean = depth * 0.62;
  const knee: [number, number] = [ankle[0] + Math.sin(shinTilt) * shin, ankle[1] - Math.cos(shinTilt) * shin];
  const hip: [number, number] = [knee[0] - Math.sin(thighTilt) * thigh, knee[1] - Math.cos(thighTilt) * thigh];
  const shoulder: [number, number] = [hip[0] + Math.sin(lean) * torso, hip[1] - Math.cos(lean) * torso];
  const nose: [number, number] = [shoulder[0] + Math.sin(lean) * 30 + 10, shoulder[1] - Math.cos(lean) * 30];
  // high-bar: on the upper back, just behind the neck
  const bar: [number, number] = [shoulder[0] - 18, shoulder[1] - 4];
  const wrist: [number, number] = [bar[0] + 12, bar[1] + 3];
  const elbow: [number, number] = [shoulder[0] - 6, shoulder[1] + 30];
  const toe: [number, number] = [ankle[0] + 34, ankle[1] + 2];
  return { nose, shoulder, elbow, wrist, hip, knee, ankle, toe, bar };
}

/** Squat depth over one rep: pause, descend, pause at the bottom, drive up. */
function depthAt(phase: number) {
  const ease = (k: number) => k * k * (3 - 2 * k);
  if (phase < 0.12) return 0;
  if (phase < 0.5) return ease((phase - 0.12) / 0.38);
  if (phase < 0.6) return 1;
  if (phase < 0.9) return 1 - ease((phase - 0.6) / 0.3);
  return 0;
}

export default function SquatLab({ onStatus }: { onStatus: (text: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useRef(onStatus);
  const [overlays, setOverlays] = useState<Overlays>({ skeleton: true, path: true, velocity: true });
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const settings = useRef({ overlays, paused, speed });

  useEffect(() => {
    status.current = onStatus;
  }, [onStatus]);
  useEffect(() => {
    settings.current = { overlays, paused, speed };
  }, [overlays, paused, speed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === ' ') setPaused((p) => !p);
      else if (event.key.toLowerCase() === 's') setOverlays((o) => ({ ...o, skeleton: !o.skeleton }));
      else if (event.key.toLowerCase() === 'b') setOverlays((o) => ({ ...o, path: !o.path }));
      else if (event.key.toLowerCase() === 'v') setOverlays((o) => ({ ...o, velocity: !o.velocity }));
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let frame = 0;
    let last = performance.now();
    let t = 0;
    let reps = 0;
    let prevPhase = 0;
    let prevBarY = pose(0).bar[1];
    let peak = 0;
    const trail: [number, number][] = [];
    const velocity: { t: number; v: number }[] = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastStatus = '';

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dtReal = Math.min((now - last) / 1000, 0.1);
      last = now;
      const { overlays: show, paused: stop, speed: rate } = settings.current;
      const dt = stop || reducedMotion ? 0 : dtReal * rate;
      t += dt;

      const phase = (t % REP_S) / REP_S;
      if (phase < prevPhase) reps += 1;
      prevPhase = phase;
      const d = depthAt(phase);
      const p = pose(d);
      // a little forward drift on the way up, like a real bar path
      p.bar[0] += Math.sin(phase * Math.PI * 2) * 7 * d;
      const vPx = dt > 0 ? (prevBarY - p.bar[1]) / dt : 0; // up is positive
      prevBarY = p.bar[1];
      const v = (vPx * MMPP) / 1000; // m/s
      if (dt > 0) {
        velocity.push({ t, v });
        while (velocity.length && velocity[0].t < t - 8) velocity.shift();
        if (v > peak) peak = v;
        trail.push([p.bar[0], p.bar[1]]);
        if (trail.length > 140) trail.shift();
      }
      const moving = Math.abs(v) > 0.05;
      const phaseName = !moving ? (d > 0.5 ? 'bottom' : 'standing') : v > 0 ? 'concentric' : 'eccentric';

      // fit the 960x540 frame into the canvas
      const dpr = Math.min(window.devicePixelRatio, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      const scale = Math.min(cw / W, ch / H);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, (dpr * (cw - W * scale)) / 2, (dpr * (ch - H * scale)) / 2);
      ctx.clearRect(-W, -H, W * 3, H * 3);

      // the video frame: a gym wall, floor, and the rack
      ctx.fillStyle = '#2a2d31';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1f2124';
      ctx.fillRect(0, 445, W, H - 445);
      ctx.strokeStyle = '#3a3e44';
      ctx.lineWidth = 10;
      for (const x of [300, 640]) {
        ctx.beginPath();
        ctx.moveTo(x, 90);
        ctx.lineTo(x, 445);
        ctx.stroke();
      }
      ctx.fillStyle = '#3a3e44';
      for (let y = 140; y < 420; y += 48) for (const x of [293, 633]) ctx.fillRect(x, y, 14, 6);
      ctx.strokeStyle = '#4b5058';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 445);
      ctx.lineTo(W, 445);
      ctx.stroke();

      // the lifter (a stick figure with some weight to them)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#d8d2c4';
      ctx.lineWidth = 14;
      const bone = (a: [number, number], b: [number, number]) => {
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.stroke();
      };
      bone(p.ankle, p.knee);
      bone(p.knee, p.hip);
      bone(p.hip, p.shoulder);
      bone(p.shoulder, p.elbow);
      bone(p.elbow, p.wrist);
      ctx.lineWidth = 9;
      bone(p.ankle, p.toe);
      ctx.fillStyle = '#d8d2c4';
      ctx.beginPath();
      ctx.arc(p.nose[0] - 8, p.nose[1] - 2, 19, 0, Math.PI * 2);
      ctx.fill();
      // the bar and a plate (end-on), with the tag taped to the plate
      ctx.strokeStyle = '#9aa0a8';
      ctx.lineWidth = 5;
      bone([p.bar[0] - 44, p.bar[1]], [p.bar[0] + 44, p.bar[1]]);
      ctx.fillStyle = '#17191c';
      ctx.beginPath();
      ctx.arc(p.bar[0], p.bar[1], 27, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#30343a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.bar[0], p.bar[1], 20, 0, Math.PI * 2);
      ctx.stroke();
      // the ArUco tag, centred on the bar
      const cell = TAG_PX / 6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.bar[0] - TAG_PX / 2, p.bar[1] - TAG_PX / 2, TAG_PX, TAG_PX);
      ctx.fillStyle = '#000000';
      ctx.fillRect(p.bar[0] - TAG_PX / 2 + cell, p.bar[1] - TAG_PX / 2 + cell, TAG_PX - 2 * cell, TAG_PX - 2 * cell);
      ctx.fillStyle = '#ffffff';
      ARUCO.forEach((row, j) => row.forEach((bit, i) => bit && ctx.fillRect(p.bar[0] - TAG_PX / 2 + cell * (1 + i), p.bar[1] - TAG_PX / 2 + cell * (1 + j), cell, cell)));

      // overlays: what the model sees
      if (show.path) {
        // mid-foot reference and the bar's path
        ctx.setLineDash([6, 8]);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pose(0).bar[0], 70);
        ctx.lineTo(pose(0).bar[0], 445);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `11px ${MONO}`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('mid-foot', pose(0).bar[0] + 6, 84);
        for (let i = 1; i < trail.length; i += 1) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${(i / trail.length) * 0.9})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(...trail[i - 1]);
          ctx.lineTo(...trail[i]);
          ctx.stroke();
        }
      }
      // tag detection box
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.bar[0] - TAG_PX / 2 - 4, p.bar[1] - TAG_PX / 2 - 4, TAG_PX + 8, TAG_PX + 8);
      ctx.fillStyle = '#4ade80';
      ctx.font = `bold 11px ${MONO}`;
      ctx.fillText('aruco id 7', p.bar[0] + TAG_PX / 2 + 8, p.bar[1] - TAG_PX / 2);
      ctx.fillText(`${v >= 0 ? '+' : ''}${v.toFixed(2)} m/s`, p.bar[0] + TAG_PX / 2 + 8, p.bar[1] - TAG_PX / 2 + 14);
      if (show.skeleton) {
        const xs = Object.values(p).map((q) => q[0]);
        const ys = Object.values(p).map((q) => q[1]);
        const x0 = Math.min(...xs) - 30;
        const y0 = Math.min(...ys) - 30;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.strokeRect(x0, y0, Math.max(...xs) - x0 + 30, Math.max(...ys) - y0 + 12);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x0, y0 - 16, 92, 16);
        ctx.fillStyle = '#0b1220';
        ctx.font = `bold 11px ${MONO}`;
        ctx.fillText('person 0.93', x0 + 5, y0 - 4);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        const links: [keyof Pose, keyof Pose][] = [['nose', 'shoulder'], ['shoulder', 'elbow'], ['elbow', 'wrist'], ['shoulder', 'hip'], ['hip', 'knee'], ['knee', 'ankle'], ['ankle', 'toe']];
        for (const [a, b] of links) bone(p[a], p[b]);
        for (const key of ['nose', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'] as const) {
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(p[key][0], p[key][1], 5, 0, Math.PI * 2);
          ctx.fill();
        }
        // the joint angle the model reads at the knee
        const ang = Math.round(180 - d * 112);
        ctx.fillStyle = '#fde68a';
        ctx.font = `11px ${MONO}`;
        ctx.fillText(`knee ${ang}°`, p.knee[0] + 14, p.knee[1] + 4);
      }

      // the velocity chart, bottom of the frame
      if (show.velocity) {
        const gx = 24;
        const gy = 350;
        const gw = 250;
        const gh = 150;
        ctx.fillStyle = 'rgba(10,12,14,0.78)';
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, gy + gh / 2);
        ctx.lineTo(gx + gw, gy + gh / 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `11px ${MONO}`;
        ctx.fillText('bar velocity (m/s), last 8 s', gx + 8, gy + 14);
        ctx.fillText('+1', gx + 4, gy + 30);
        ctx.fillText('-1', gx + 4, gy + gh - 6);
        const yOf = (val: number) => gy + gh / 2 - Math.max(-1, Math.min(1, val)) * (gh / 2 - 10);
        // concentric phases shaded
        for (let i = 1; i < velocity.length; i += 1) {
          const a = velocity[i - 1];
          const b = velocity[i];
          if (b.v > 0.05) {
            ctx.fillStyle = 'rgba(74,222,128,0.12)';
            const xa = gx + gw - (t - a.t) * (gw / 8);
            const xb = gx + gw - (t - b.t) * (gw / 8);
            ctx.fillRect(xa, gy + 20, Math.max(1, xb - xa), gh - 24);
          }
        }
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        velocity.forEach((pt, i) => {
          const x = gx + gw - (t - pt.t) * (gw / 8);
          const y = yOf(pt.v);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 12px ${MONO}`;
        ctx.fillText(`rep ${reps}`, gx + gw - 60, gy + 14);
        ctx.font = `11px ${MONO}`;
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`peak ${peak.toFixed(2)} m/s`, gx + gw - 100, gy + 28);
      }
      // the recording's corner
      ctx.fillStyle = '#ff3b30';
      ctx.beginPath();
      ctx.arc(W - 26, 24, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `11px ${MONO}`;
      ctx.fillText(stop ? 'PAUSED' : `REC ${(t % 60).toFixed(1).padStart(4, '0')}s`, W - 110, 28);
      ctx.fillText('squat-tracker · yolov8-pose + aruco', 24, 28);

      const text = `rep ${reps} · ${phaseName} · bar ${v >= 0 ? '+' : ''}${v.toFixed(2)} m/s · depth ${Math.round(d * 100)}%`;
      if (text !== lastStatus) {
        lastStatus = text;
        status.current(text);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      status.current('');
    };
  }, []);

  const toggle = (key: keyof Overlays) => setOverlays((o) => ({ ...o, [key]: !o[key] }));
  const chip = (on: boolean) => `rounded px-2 py-0.5 ${on ? 'bg-white/90 text-[#121314]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`;

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 pb-12 pt-10">
      {/* the monitor the tracker runs on */}
      <div className="relative aspect-video max-h-full w-full max-w-full rounded-lg bg-[#0b0c0d] p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block h-full w-full rounded-sm bg-[#2a2d31]" aria-label="A lifter squatting, with pose keypoints, the tracked bar path and a bar-velocity chart drawn over the video" />
      </div>
      <StageHint>space to pause · s, b, v toggle the overlays</StageHint>
      <div className="absolute bottom-9 right-4 flex items-center gap-1.5 font-mono text-[11px]">
        <button type="button" onClick={() => toggle('skeleton')} aria-pressed={overlays.skeleton} className={chip(overlays.skeleton)}>skeleton</button>
        <button type="button" onClick={() => toggle('path')} aria-pressed={overlays.path} className={chip(overlays.path)}>bar path</button>
        <button type="button" onClick={() => toggle('velocity')} aria-pressed={overlays.velocity} className={chip(overlays.velocity)}>velocity</button>
        <span className="mx-1 h-4 w-px bg-white/20" aria-hidden="true" />
        {[0.5, 1, 2].map((rate) => (
          <button key={rate} type="button" onClick={() => setSpeed(rate)} aria-pressed={speed === rate} className={chip(speed === rate)}>
            {rate}×
          </button>
        ))}
        <button type="button" onClick={() => setPaused((p) => !p)} className={chip(false)}>
          {paused ? 'play' : 'pause'}
        </button>
      </div>
    </div>
  );
}
