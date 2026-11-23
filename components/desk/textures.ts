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
const LABEL_STRIPS = [{ text: 'PROPERTY OF HANJING LIN', length: 0.152 }];

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

/**
 * The data side of a CD, seen from above: silver with two broad rainbow
 * sweeps, fine tracks, the bare ring and the clear hub. Mapped flat onto
 * the disc (the engine gives it top-down UVs), so the colours turn with it.
 */
export function discTexture() {
  const size = 1024;
  const { el, ctx } = canvas(size, size);
  const c = size / 2;
  const ring = (r: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
  };
  // silver base
  const base = ctx.createRadialGradient(c, c, 0, c, c, c);
  base.addColorStop(0, '#e6e9ed');
  base.addColorStop(0.5, '#aab1b9');
  base.addColorStop(0.75, '#c9ced4');
  base.addColorStop(1, '#8f969e');
  ring(c, base);
  // the rainbow: two sweeps with silver between, like light caught from one side
  const rainbow = ctx.createConicGradient(Math.PI * 1.1, c, c);
  const sweep = ['#ff4fb8', '#ffc93a', '#4dff9e', '#36b7ff', '#8f63ff', '#ff4fb8'];
  for (const start of [0, 0.5]) {
    sweep.forEach((color, k) => rainbow.addColorStop(start + k * 0.048, color));
    rainbow.addColorStop(start + 0.31, '#c7ccd3');
    rainbow.addColorStop(start + 0.37, '#dfe3e8');
    rainbow.addColorStop(start + 0.43, '#c7ccd3');
  }
  rainbow.addColorStop(1, '#ff4fb8');
  ctx.globalAlpha = 0.9;
  ring(c, rainbow);
  ctx.globalAlpha = 1;
  // the tracks
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let r = c * 0.32; r < c; r += 3) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // the rim
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(c, c, c - 4, 0, Math.PI * 2);
  ctx.stroke();
  // the bare ring between the data and the hub, then the clear hub
  const bare = ctx.createRadialGradient(c, c, c * 0.2, c, c, c * 0.32);
  bare.addColorStop(0, '#d7dbe0');
  bare.addColorStop(0.7, '#8d939a');
  bare.addColorStop(1, '#5d6369');
  ring(c * 0.32, bare);
  const hub = ctx.createRadialGradient(c, c, c * 0.1, c, c, c * 0.24);
  hub.addColorStop(0, '#9aa0a7');
  hub.addColorStop(0.6, '#c9ced4');
  hub.addColorStop(1, '#7b8188');
  ring(c * 0.24, hub);
  // a speck on the ring, so you can see it turn
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(c - 22, c - c * 0.3, 44, 10);
  // the hole
  ctx.globalCompositeOperation = 'destination-out';
  ring(c * 0.12, '#000');
  ctx.globalCompositeOperation = 'source-over';
  return toTexture(el);
}

/**
 * Placeholder CD cover (used until content/music.ts names a cover image):
 * paper, a painted sun, and the song in small type.
 */
export function coverTexture(fonts: DeskFonts, title: string, artist: string) {
  const { el, ctx } = canvas(512, 512);
  ctx.fillStyle = '#efe2c4';
  ctx.fillRect(0, 0, 512, 512);
  const sun = ctx.createRadialGradient(300, 210, 10, 300, 210, 170);
  sun.addColorStop(0, '#e2462a');
  sun.addColorStop(0.7, '#c9301c');
  sun.addColorStop(1, 'rgba(201, 48, 28, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(300, 210, 170, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1a10';
  ctx.font = `500 40px ${fonts.serif}`;
  ctx.fillText(title, 40, 430);
  ctx.fillStyle = '#6b4a2e';
  ctx.font = `italic 30px ${fonts.serif}`;
  ctx.fillText(artist, 40, 472);
  return toTexture(el);
}

/** The small paper label on the journal's cover. */
export function journalLabelTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(384, 256);
  ctx.fillStyle = '#f6efdc';
  ctx.fillRect(0, 0, 384, 256);
  ctx.strokeStyle = '#7a2e24';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 356, 228);
  ctx.fillStyle = '#2b1a10';
  ctx.textAlign = 'center';
  ctx.font = `italic 62px ${fonts.serif}`;
  ctx.fillText('journal', 192, 128);
  ctx.font = `30px ${fonts.serif}`;
  ctx.fillStyle = '#6b4a2e';
  ctx.fillText('& guest book', 192, 182);
  return toTexture(el);
}

/** Handwritten sticky note texture (yellow paper, dark blue ink). */
function noteCanvas(fonts: DeskFonts, lines: [string, number][], top = 170) {
  const { el, ctx } = canvas(512, 512);
  ctx.fillStyle = '#ffe873';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#26315f';
  lines.forEach(([text, size], i) => {
    ctx.font = `italic ${size}px ${fonts.serif}`;
    ctx.fillText(text, 44, top + i * 78);
  });
  return toTexture(el);
}

/** Sticky note inside the case lid: click it (or its tape) for the normal site. */
export function stickyTexture(fonts: DeskFonts) {
  return noteCanvas(fonts, [
    ['just want', 70],
    ['the normal', 70],
    ['website?', 70],
  ], 220);
}

/** The strip of clear tape holding the note up (see blender/desk_scene.py). */
export function stickyTapeTexture() {
  const { el, ctx } = canvas(512, 160);
  // clear tape: a faint white film with jagged cut ends
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.moveTo(6, 4);
  for (let y = 4; y <= 156; y += 10) ctx.lineTo(y % 20 ? 0 : 8, y);
  ctx.lineTo(506, 156);
  for (let y = 156; y >= 4; y -= 10) ctx.lineTo(y % 20 ? 512 : 504, y);
  ctx.closePath();
  ctx.fill();
  // a soft glint along it
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(12, 18, 488, 22);
  return toTexture(el);
}

/** Sticky note on the wall (terminal view): back to the normal site. */
export function wallNoteTexture(fonts: DeskFonts) {
  return noteCanvas(fonts, [
    ['too techy?', 64],
    ['← back to the', 52],
    ['normal site', 52],
  ], 180);
}

// ---------------------------------------------------------------- circuit boards (blender/boards.py)

/** Silkscreen text on the VCU, from the KiCad layout: [text, x, y] in board mm, centred. */
const VCU_SILK: [string, number, number][] = [
  ['LV Switch', 86.5, 157.5], ['HV Switch', 105, 157.75], ['Blue LEDs', 127.9, 159.5], ['Green LEDs', 154.2, 159],
  ['Pre-charge', 135, 161.75], ['Mode Select', 141, 101.5], ['Gear Select', 112, 100.5], ['Left Signal', 93, 128.5],
  ['Hazard', 120, 128.5], ['Right Signal', 146.6, 128.5], ['SUNSTANG', 167.7, 154.8], ['+12V', 255, 152.5],
  ['GND', 259.5, 157], ['+3V3', 251, 157], ['+5V', 239, 162.5], ['CANH', 247, 196], ['CANL', 241, 196], ['GND', 236, 196],
  ['+12V', 253, 196], ['LV', 100.5, 105.4], ['HV', 100.5, 110], ['HVIL', 101.3, 114.6], ['FAULT', 102, 119.2],
  ['J1', 116, 185.5], ['J2', 196, 185.5], ['U5', 254, 72], ['DS1', 80, 99],
];

/** Silkscreen labels of the parts you can press or read, drawn larger. */
const VCU_CONTROL_LABELS = new Set(['LV Switch', 'HV Switch', 'Blue LEDs', 'Green LEDs', 'Pre-charge', 'Mode Select', 'Gear Select', 'Left Signal', 'Hazard', 'Right Signal', 'LV', 'HV', 'HVIL', 'FAULT']);

/**
 * The Sunstang VCU's silkscreen (10 px per board mm, transparent): labels,
 * the Nucleo and LCD outlines, the header pads, the team's names.
 */
export function vcuSilkTexture() {
  const { el, ctx } = canvas(1995, 1400);
  const px = (x: number, y: number): [number, number] => [(x - 70) * 10, (y - 58.5) * 10];
  const white = 'rgba(255,255,255,0.9)';
  ctx.strokeStyle = white;
  ctx.lineWidth = 3;
  // outlines: the Nucleo (dashed) and the LCD
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(...px(182.7, 66.9), 700, 825);
  ctx.setLineDash([]);
  ctx.strokeRect(...px(79, 67), 720, 280);
  // header pads: two 20-pin rows (J1, J2) and the 4-pin (J3)
  const pad = (x: number, y: number) => {
    const [cx, cy] = px(x, y);
    ctx.fillStyle = '#d9ab4c';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b1f1d';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const x0 of [116.25, 196.25]) for (let i = 0; i < 10; i += 1) for (const dy of [0, 3.5]) pad(x0 + i * 3.5, 187.3 + dy);
  for (let i = 0; i < 4; i += 1) pad(247.5 + i * 2.7, 192);
  // small passives drawn as outlines so the board doesn't look bare
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  const rects: [number, number, number, number][] = [
    [88, 105.5, 3.2, 1.6], [88, 110, 3.2, 1.6], [88, 114.5, 3.2, 1.6], [88, 119, 3.2, 1.6],
    [121.75, 162.5, 3.2, 1.6], [121.75, 167.1, 3.2, 1.6], [121.75, 171.7, 3.2, 1.6], [121.75, 176.3, 3.2, 1.6], [121.75, 180.9, 3.2, 1.6],
    [160.75, 163, 3.2, 1.6], [160.75, 167.5, 3.2, 1.6], [160.75, 172, 3.2, 1.6], [160.75, 176.4, 3.2, 1.6], [160.75, 180.9, 3.2, 1.6],
    [181.15, 174.3, 3.2, 1.6], [194.5, 174.3, 3.2, 1.6], [207.9, 174.3, 3.2, 1.6], [221.3, 174.3, 3.2, 1.6], [234.65, 174.3, 3.2, 1.6],
    [181.15, 177.8, 3.2, 1.6], [194.5, 177.8, 3.2, 1.6], [207.9, 177.8, 3.2, 1.6], [221.3, 177.8, 3.2, 1.6], [234.65, 177.8, 3.2, 1.6],
    [109.4, 99, 1.6, 3.2], [114.4, 99, 3.2, 1.6], [114.4, 103, 3.2, 1.6], [123.9, 99.5, 3.2, 1.6], [104.8, 106.2, 1.6, 3.2], [104.8, 118.7, 1.6, 3.2],
    [123.8, 106.2, 1.6, 3.2], [165.5, 92.5, 1.6, 3.2], [165.5, 103, 1.6, 3.2], [193, 149.5, 3.2, 1.6], [193, 153, 3.2, 1.6], [246, 164.5, 3.2, 1.6],
    [99.7, 134.5, 1.6, 3.2], [99.7, 140.5, 1.6, 3.2], [126.9, 134.5, 1.6, 3.2], [126.9, 140.5, 1.6, 3.2], [153.4, 134.5, 1.6, 3.2], [153.4, 140.5, 1.6, 3.2],
  ];
  for (const [x, y, w, h] of rects) {
    const [cx, cy] = px(x, y);
    ctx.strokeRect(cx - w * 5, cy - h * 5, w * 10, h * 10);
  }
  // a few traces, for the feel of a routed board
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 4;
  const trace = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...px(...p)) : ctx.moveTo(...px(...p))));
    ctx.stroke();
  };
  trace([[150, 95], [175, 95], [200, 120]]);
  trace([[150, 90], [178, 90], [205, 117]]);
  trace([[130, 145], [130, 155], [180, 155], [200, 145]]);
  trace([[160, 185], [160, 170], [172, 158], [205, 158]]);
  trace([[250, 100], [250, 150]]);
  // labels
  ctx.fillStyle = white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [text, x, y] of VCU_SILK) {
    // the controls get big, bold labels so the board explains itself; the rest stay small
    const size = text === 'SUNSTANG' ? 26 : VCU_CONTROL_LABELS.has(text) ? 24 : 15;
    ctx.font = `${VCU_CONTROL_LABELS.has(text) ? 800 : 600} ${size}px ${MONO}`;
    ctx.fillText(text, ...px(x, y));
  }
  ctx.textAlign = 'left';
  ctx.font = `600 15px ${MONO}`;
  ctx.fillText('Sunstang VCU 2026   Hanjing Lin   Sahil Sharma   Xiuting Shi', ...px(92.5, 151.5));
  // the little sun over the car, next to the team name
  const [sx, sy] = px(167.7, 147);
  ctx.strokeStyle = white;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy, 16, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * 22, sy + Math.sin(a) * 22);
    ctx.lineTo(sx + Math.cos(a) * 30, sy + Math.sin(a) * 30);
    ctx.stroke();
  }
  return toTexture(el);
}

/**
 * The DE10-Standard's silkscreen (10 px per board mm, transparent, origin at
 * the board centre). Positions follow build_de10 in blender/boards.py.
 */
export function deSilkTexture() {
  const { el, ctx } = canvas(1620, 1120);
  const px = (x: number, y: number): [number, number] => [(x * 1000 + 81) * 10, (56 - y * 1000) * 10];
  const white = 'rgba(255,255,255,0.92)';
  const text = (t: string, x: number, y: number, size: number, weight = 600, rotate = 0) => {
    ctx.font = `${weight} ${size}px ${MONO}`;
    if (!rotate) return ctx.fillText(t, ...px(x, y));
    ctx.save();
    ctx.translate(...px(x, y));
    ctx.rotate(rotate);
    ctx.fillText(t, 0, 0);
    ctx.restore();
  };
  // a few traces first, under everything
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 4;
  const trace = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...px(...p)) : ctx.moveTo(...px(...p))));
    ctx.stroke();
  };
  trace([[-0.004, 0.0], [-0.016, 0.0]]);
  trace([[-0.004, 0.008], [-0.016, 0.008]]);
  trace([[0.028, 0.012], [0.038, 0.012]]);
  trace([[0.012, -0.012], [0.012, -0.016], [-0.002, -0.016]]);
  trace([[0.0275, 0.016], [0.05, 0.016], [0.053, 0.019]]);
  trace([[0.0, 0.0195], [0.0, 0.026], [0.009, 0.034]]);
  trace([[-0.052, 0.003], [-0.052, -0.004], [-0.035, -0.004]]);
  // the footprint of the LCD's pins and the HSMC's mounting tabs
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(...px(-0.074, -0.0148), 280, 185);
  ctx.strokeRect(...px(0.0685, 0.037), 80, 560);

  ctx.fillStyle = white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // the board's name, next to the push buttons like the real one
  text('DE10-Standard', 0.0245, -0.0195, 40, 800);
  text('terasic', 0.0245, -0.0262, 15, 600);
  text('ECE 2277A', -0.031, 0.0262, 15, 600);
  text('Moore FSM detector', -0.031, 0.0225, 15, 600);
  // the parts the detector uses get big labels
  for (let n = 0; n < 6; n += 1) text(`HEX${n}`, -0.002 - n * 0.0079, -0.0135, 18, 800);
  for (let i = 0; i < 10; i += 1) {
    const x = -0.0125 - i * 0.0068;
    text(`LEDR${i}`, x, -0.0395, i <= 3 ? 15 : 12, i <= 3 ? 800 : 600);
    text(`SW${i}`, x, -0.0535, i === 0 ? 20 : 15, i === 0 ? 800 : 600);
  }
  for (let i = 0; i < 4; i += 1) text(`KEY${i}`, 0.0445 - i * 0.0118, -0.0372, i <= 1 ? 20 : 15, i <= 1 ? 800 : 600);
  // what the used ones do, in small print under them
  text('clock', 0.0445, -0.0525, 14);
  text('reset', 0.0327, -0.0525, 14);
  // everything else, small, like the real board
  for (const [t, x, y] of [
    ['MIC', -0.066, 0.0425], ['LINE IN', -0.0565, 0.0425], ['LINE OUT', -0.047, 0.0425], ['VIDEO IN', -0.036, 0.0425],
    ['VGA', -0.0145, 0.0425], ['ETHERNET', 0.0145, 0.0355], ['USB', 0.032, 0.0425], ['USB', 0.0475, 0.0425], ['UART', 0.064, 0.0475],
    ['PS/2', -0.0645, 0.018], ['BLASTER', -0.0645, 0.0065], ['DC 12V', -0.0645, -0.003], ['POWER', -0.0655, -0.0155],
    ['ADC', -0.078, -0.0168], ['LCD', -0.06, -0.0142], ['HPS DDR3', -0.026, -0.0048], ['SDRAM', 0.036, 0.0185],
    ['MSEL', 0.063, -0.0278], ['IR', 0.0605, -0.0345], ['LED', 0.0605, -0.0405], ['MICRO SD', 0.0745, 0.0365],
  ] as const) text(t, x, y, 12);
  for (const [t, x] of [['WARM', 0.0555], ['HPS RST', 0.0635], ['HPS KEY', 0.0735]] as const) text(t, x, -0.0545, 9);
  text('GPIO 0', 0.0515, -0.012, 13, 600, -Math.PI / 2);
  text('HSMC', 0.0655, 0.022, 13, 600, -Math.PI / 2);
  text('LTC', 0.0755, -0.0405, 11);
  return toTexture(el);
}

/** The marking on the Cyclone V SoC's lid (DE10-Standard). */
export function fpgaPrintTexture() {
  const { el, ctx } = canvas(512, 512);
  ctx.fillStyle = '#26282c';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 484, 484);
  // pin-1 dimple
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.arc(52, 460, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(236,236,236,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 64px ${MONO}`;
  ctx.fillText('Cyclone V', 256, 190);
  ctx.font = `600 40px ${MONO}`;
  ctx.fillText('SoC', 256, 250);
  ctx.font = `500 30px ${MONO}`;
  ctx.fillText('5CSXFC6D6F31C6N', 256, 330);
  ctx.fillStyle = 'rgba(236,236,236,0.55)';
  ctx.font = `500 24px ${MONO}`;
  ctx.fillText('K2044A  1721', 256, 376);
  return toTexture(el);
}
