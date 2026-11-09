import * as THREE from 'three';

/**
 * Canvas-drawn textures for the hero desk. Generated at runtime so text (the
 * label tape, the monitor's code, the notes) stays easy to edit.
 *
 * These go on glTF meshes, whose UVs use a top-left origin, so every texture
 * is created with `flipY = false`. On flat-lying surfaces the top of the
 * canvas is the far edge of the desk.
 */

export type DeskFonts = {
  /** Condensed sans for the embossed label-maker tape and the cutting mat. */
  tape: string;
  /** The site's serif (Lora), for handwritten-ish notes. */
  serif: string;
};

/** Tape strip height in metres (TAPE_H in the Blender script). */
const TAPE_HEIGHT = 0.016;

/**
 * Text on each label-tape strip. `length` must match LABEL_LENGTHS in
 * blender/desk_scene.py so the letters aren't stretched.
 */
export const LABEL_STRIPS = [
  { text: 'PROPERTY OF HANJING LIN', length: 0.152 },
  { text: 'RETURN TO QUALCOMM OFFICE', length: 0.162 },
];

const MONO = 'Menlo, Consolas, "SFMono-Regular", monospace';

function canvas(width: number, height: number) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  const ctx = el.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return { el, ctx };
}

function toTexture(el: HTMLCanvasElement, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) {
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = colorSpace;
  texture.flipY = false;
  texture.anisotropy = 8;
  return texture;
}

/** Seeded PRNG so procedural textures look the same on every load. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Embossed label-maker tape: glossy red plastic with raised, stretched-white
 * capitals at a fixed pitch. Returns a colour map and a bump map.
 */
export function tapeTextures(fonts: DeskFonts, index: number) {
  const { text, length } = LABEL_STRIPS[index];
  const h = 256;
  const w = Math.round((h * length) / TAPE_HEIGHT);
  const fontSize = Math.round(h * 0.6);
  const pad = h * 0.45;
  const pitch = Math.min(fontSize * 0.78, (w - pad * 2) / text.length);
  const startX = (w - pitch * text.length) / 2 + pitch / 2;
  const baseline = h * 0.52;

  const drawLetters = (ctx: CanvasRenderingContext2D, fill: string, dx = 0, dy = 0) => {
    ctx.font = `600 ${fontSize}px ${fonts.tape}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.06;
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    [...text].forEach((char, i) => {
      const x = startX + i * pitch + dx;
      ctx.fillText(char, x, baseline + dy);
      ctx.strokeText(char, x, baseline + dy);
    });
  };

  const color = canvas(w, h);
  const g = color.ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#d8222a');
  g.addColorStop(0.55, '#c4161c');
  g.addColorStop(1, '#a50f16');
  color.ctx.fillStyle = g;
  color.ctx.fillRect(0, 0, w, h);
  color.ctx.fillStyle = 'rgba(255,255,255,0.08)';
  color.ctx.fillRect(0, h * 0.08, w, h * 0.1);
  drawLetters(color.ctx, 'rgba(70, 0, 4, 0.45)', fontSize * 0.03, fontSize * 0.04);
  drawLetters(color.ctx, '#f3e4e4');

  const bump = canvas(w, h);
  bump.ctx.fillStyle = '#000';
  bump.ctx.fillRect(0, 0, w, h);
  bump.ctx.filter = 'blur(4px)';
  drawLetters(bump.ctx, '#fff');

  return { map: toTexture(color.el), bumpMap: toTexture(bump.el, THREE.NoColorSpace) };
}

/** Self-healing cutting mat (60 x 45 cm) with a cm grid, angle lines, and rulers. */
export function matTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(2048, 1536);
  const cm = el.width / 60;
  ctx.fillStyle = '#2c6b66';
  ctx.fillRect(0, 0, el.width, el.height);
  for (let i = 0; i <= 60; i += 1) {
    ctx.strokeStyle = i % 5 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.28)';
    ctx.lineWidth = i % 5 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(i * cm, 0);
    ctx.lineTo(i * cm, el.height);
    ctx.stroke();
  }
  for (let j = 0; j <= 45; j += 1) {
    ctx.strokeStyle = j % 5 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.28)';
    ctx.lineWidth = j % 5 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(0, j * cm);
    ctx.lineTo(el.width, j * cm);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (const [x0, y0, x1, y1] of [[0, el.height, el.height, 0], [el.width - el.height, el.height, el.width, 0]]) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(el.width, el.height, 12 * cm, Math.PI, 1.5 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 26px ${fonts.tape}`;
  for (let i = 5; i < 60; i += 5) ctx.fillText(String(i), i * cm + 5, 26);
  for (let j = 5; j < 45; j += 5) ctx.fillText(String(j), 8, j * cm - 6);
  ctx.font = `600 30px ${fonts.tape}`;
  ctx.fillText('SELF-HEALING CUTTING MAT · A2 · CM', 34 * cm, el.height - 18);
  return toTexture(el);
}

/** Light oak desk top. Applied with planar UVs (see look.ts). */
export function woodTexture() {
  const { el, ctx } = canvas(2048, 1152);
  ctx.fillStyle = '#c99d6d';
  ctx.fillRect(0, 0, el.width, el.height);
  const rand = seeded(5);
  for (let i = 0; i < 520; i += 1) {
    const y = rand() * el.height;
    ctx.strokeStyle = rand() > 0.5 ? '#8f5f33' : '#e2bd8c';
    ctx.globalAlpha = 0.04 + rand() * 0.1;
    ctx.lineWidth = 1 + rand() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= el.width; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.003 + i) * 7 + (rand() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(el);
}

/** Student card face. */
export function cardTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(856, 540);
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.fillStyle = '#4f2683';
  ctx.fillRect(0, 0, el.width, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 54px ${fonts.tape}`;
  ctx.fillText('STUDENT CARD', 40, 80);
  ctx.fillStyle = '#c9d2dc';
  ctx.fillRect(40, 160, 220, 280);
  ctx.fillStyle = '#9fb2c4';
  ctx.beginPath();
  ctx.arc(150, 260, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(70, 340, 160, 100);
  ctx.fillStyle = '#1b1f1d';
  ctx.font = `500 52px ${fonts.serif}`;
  ctx.fillText('Hanjing Lin', 300, 220);
  ctx.fillStyle = '#5b6460';
  ctx.font = `40px ${fonts.serif}`;
  ctx.fillText('Software Engineering', 300, 290);
  ctx.fillText('Year 3', 300, 345);
  ctx.fillStyle = '#1b1f1d';
  for (let i = 0; i < 38; i += 1) ctx.fillRect(300 + i * 12, 400, i % 3 ? 4 : 8, 70);
  return toTexture(el);
}

/** Folded note pointing at the blog. */
export function noteTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(840, 640);
  ctx.fillStyle = '#fffdf6';
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.strokeStyle = 'rgba(80, 120, 200, 0.3)';
  ctx.lineWidth = 3;
  for (let y = 150; y < el.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(el.width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(210, 70, 70, 0.4)';
  ctx.beginPath();
  ctx.moveTo(90, 0);
  ctx.lineTo(90, el.height);
  ctx.stroke();
  ctx.fillStyle = '#1f3fa8';
  ctx.font = `italic 500 92px ${fonts.serif}`;
  ctx.fillText('start here.', 130, 205);
  ctx.font = `italic 60px ${fonts.serif}`;
  ctx.fillText('→ read the blog', 130, 370);
  ctx.fillText('- hanjing', 470, 530);
  return toTexture(el);
}

/** Thermal print from the Tiny Squares camera: a dithered photo. */
export function printTexture() {
  const { el, ctx } = canvas(360, 440);
  ctx.fillStyle = '#f7f6f1';
  ctx.fillRect(0, 0, el.width, el.height);
  const size = 300;
  const img = ctx.createImageData(size, size);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sky = 0.85 - y / size * 0.5;
      const sun = Math.hypot(x - 200, y - 110) < 46 ? 1 : 0;
      const hill = y > 190 + Math.sin(x / 40) * 24 ? 0.18 : 0;
      const v = hill || Math.max(sky, sun);
      const on = v * 16 > bayer[(y % 4) * 4 + (x % 4)];
      const i = (y * size + x) * 4;
      const c = on ? 247 : 24;
      img.data[i] = c;
      img.data[i + 1] = c;
      img.data[i + 2] = c - (on ? 6 : 0);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 30, 30);
  ctx.fillStyle = '#222';
  ctx.font = `22px ${MONO}`;
  ctx.fillText('TINY SQUARES #042', 30, 365);
  ctx.fillText('esp32 · 1-bit', 30, 400);
  return toTexture(el);
}

/** Sticky note on the desk. */
export function stickyTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(512, 512);
  ctx.fillStyle = '#ffe873';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#26315f';
  ctx.font = `italic 64px ${fonts.serif}`;
  ctx.fillText('to do:', 40, 150);
  ctx.font = `italic 52px ${fonts.serif}`;
  ctx.fillText('· leetcode x2', 40, 245);
  ctx.fillText('· route VCU rev B', 40, 330);
  ctx.fillText('· practice sax', 40, 415);
  return toTexture(el);
}
