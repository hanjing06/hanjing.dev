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
export const LABEL_STRIPS = [{ text: 'PROPERTY OF HANJING LIN', length: 0.152 }];

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

/** The strip of tape holding the note up, with the way out written on it (4:1, see blender/desk_scene.py). */
export function stickyTapeTexture(fonts: DeskFonts) {
  const { el, ctx } = canvas(1024, 256);
  // translucent washi tape with torn ends
  ctx.fillStyle = 'rgba(248, 244, 232, 0.82)';
  ctx.beginPath();
  ctx.moveTo(10, 8);
  for (let y = 8; y <= 248; y += 16) ctx.lineTo(y % 32 ? 0 : 14, y);
  ctx.lineTo(1014, 248);
  for (let y = 248; y >= 8; y -= 16) ctx.lineTo(y % 32 ? 1024 : 1010, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(20, 20, 984, 36);
  ctx.fillStyle = '#26315f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 70px ${fonts.tape}`;
  ctx.fillText('Click here for the normal website', 512, 134);
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

/** The DE1-SoC's silkscreen (10 px per board mm, transparent, origin at the board centre). */
export function deSilkTexture() {
  const { el, ctx } = canvas(1580, 1000);
  const px = (x: number, y: number): [number, number] => [(x * 1000 + 79) * 10, (50 - y * 1000) * 10];
  const white = 'rgba(255,255,255,0.9)';
  ctx.fillStyle = white;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 54px ${MONO}`;
  ctx.fillText('DE1-SoC', ...px(0.045, 0.012));
  ctx.font = `500 16px ${MONO}`;
  ctx.fillText('Cyclone V SoC', ...px(0.045, 0.004));
  ctx.fillText('terasic', ...px(0.045, -0.003));
  // the parts the detector uses get big labels; HEX labels sit above the displays
  ctx.font = `800 22px ${MONO}`;
  for (let n = 0; n < 6; n += 1) ctx.fillText(`HEX${n}`, ...px(0.017 - n * 0.0118, -0.0095));
  for (let i = 0; i < 10; i += 1) {
    const used = i <= 3;
    ctx.font = `${used ? 800 : 600} ${used ? 17 : 14}px ${MONO}`;
    ctx.fillText(`LEDR${i}`, ...px(0.028 - i * 0.0065, -0.0337));
    ctx.font = `${i === 0 ? 800 : 600} ${i === 0 ? 22 : 16}px ${MONO}`;
    ctx.fillText(`SW${i}`, ...px(0.028 - i * 0.0065, -0.0478));
  }
  for (let i = 0; i < 4; i += 1) {
    ctx.font = `${i <= 1 ? 800 : 600} ${i <= 1 ? 22 : 16}px ${MONO}`;
    ctx.fillText(`KEY${i}`, ...px(0.074 - i * 0.0105, -0.0465));
  }
  // what the used ones do, in small print under the big names
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('clock', ...px(0.074, -0.0488));
  ctx.fillText('reset', ...px(0.0635, -0.0488));
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('GPIO 0', ...px(-0.044, 0.0395));
  ctx.fillText('GPIO 1', ...px(0.016, 0.0395));
  ctx.fillText('VGA', ...px(-0.0715, 0.0155));
  ctx.fillText('POWER', ...px(-0.052, 0.0395));
  ctx.font = `600 15px ${MONO}`;
  ctx.fillText('ECE 2277A', ...px(0.055, -0.017));
  ctx.fillText('Moore FSM detector', ...px(0.055, -0.0215));
  // pin-1 marks and a few traces
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 4;
  const trace = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...px(...p)) : ctx.moveTo(...px(...p))));
    ctx.stroke();
  };
  trace([[-0.03, 0.021], [-0.03, 0.016], [-0.014, 0.016]]);
  trace([[0.03, 0.021], [0.03, 0.016], [0.014, 0.016]]);
  trace([[0.0, -0.002], [0.0, -0.012], [-0.02, -0.012]]);
  trace([[0.012, -0.002], [0.012, -0.024], [0.03, -0.024]]);
  trace([[-0.044, 0.041], [-0.044, 0.03], [-0.03, 0.03]]);
  return toTexture(el);
}
