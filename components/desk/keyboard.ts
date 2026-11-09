import * as THREE from 'three';
import type { DeskFonts } from './textures';

/**
 * The desk keyboard mirrors the visitor's real one: each mesh is named
 * `Key_<KeyboardEvent.code>` (see KEY_ROWS in blender/desk_scene.py), so a
 * key press sinks and tints the matching key.
 *
 * Keycap legends come from one generated texture laid out from the keys' own
 * positions in the model, so the layout only lives in the Blender script.
 */

const LEGENDS: Record<string, string> = {
  Escape: 'esc', Minus: '-', Equal: '=', Backspace: 'delete', Delete: 'del', Tab: 'tab', BracketLeft: '[',
  BracketRight: ']', Backslash: '\\', PageUp: 'pgup', CapsLock: 'caps', Semicolon: ';', Quote: "'", Enter: 'return',
  PageDown: 'pgdn', ShiftLeft: 'shift', Comma: ',', Period: '.', Slash: '/', ShiftRight: 'shift', ArrowUp: '↑',
  End: 'end', ControlLeft: 'ctrl', AltLeft: 'opt', MetaLeft: 'cmd', Space: '', MetaRight: 'cmd', AltRight: 'opt',
  ControlRight: 'ctrl', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→',
};

/** Physical keys that aren't on a 65% board, mapped to the closest one that is. */
const ALIASES: Record<string, string> = {
  Backquote: 'Escape', Home: 'Delete', IntlBackslash: 'ShiftLeft', NumpadEnter: 'Enter', OSLeft: 'MetaLeft', OSRight: 'MetaRight',
};

const ACCENT = new Set(['Escape', 'Enter']);
const PRESS_DEPTH = 0.0035;

type Key = { mesh: THREE.Mesh; baseY: number; pressed: boolean };

function legendFor(code: string) {
  if (code in LEGENDS) return LEGENDS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return '';
}

export function setupKeyboard(root: THREE.Object3D, fonts: DeskFonts, track: <T extends { dispose: () => void }>(r: T) => T) {
  const keys = new Map<string, Key>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh.name.startsWith('Key_')) keys.set(mesh.name.slice(4), { mesh, baseY: mesh.position.y, pressed: false });
  });

  // key rectangles in the keyboard's own (top-down) space
  const rects = new Map<string, THREE.Box3>();
  const all = new THREE.Box3();
  for (const [code, { mesh }] of keys) {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!.clone().translate(mesh.position);
    rects.set(code, box);
    all.union(box);
  }
  const width = all.max.x - all.min.x;
  const depth = all.max.z - all.min.z;

  // one legend atlas for every keycap (top of the canvas = far row)
  const W = 2048;
  const H = Math.round((W * depth) / width);
  const el = document.createElement('canvas');
  el.width = W;
  el.height = H;
  const ctx = el.getContext('2d')!;
  ctx.fillStyle = '#ece6da';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [code, box] of rects) {
    const x = ((box.min.x - all.min.x) / width) * W;
    const y = ((box.min.z - all.min.z) / depth) * H;
    const w = ((box.max.x - box.min.x) / width) * W;
    const h = ((box.max.z - box.min.z) / depth) * H;
    const legend = legendFor(code);
    const modifier = legend.length > 1 && !ACCENT.has(code);
    ctx.fillStyle = ACCENT.has(code) ? '#6cc2f7' : modifier ? '#d6cebf' : '#ece6da';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ACCENT.has(code) ? '#0f3550' : '#3a3836';
    const size = legend.length > 1 ? h * 0.26 : h * 0.42;
    ctx.font = `600 ${size}px ${fonts.tape}`;
    ctx.fillText(legend.length > 1 ? legend.toUpperCase() : legend, x + w / 2, y + h / 2);
  }
  const atlas = track(new THREE.CanvasTexture(el));
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.flipY = false;
  atlas.anisotropy = 8;

  const material = track(new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.55 }));
  const pressedMaterial = track(material.clone());
  pressedMaterial.color.set('#cfe9fb');
  pressedMaterial.emissive.set('#2f6f9a');
  pressedMaterial.emissiveIntensity = 0.35;

  // planar UVs so each keycap shows its own patch of the atlas
  for (const { mesh } of keys.values()) {
    const position = mesh.geometry.getAttribute('position');
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i += 1) {
      uv[i * 2] = (position.getX(i) + mesh.position.x - all.min.x) / width;
      uv[i * 2 + 1] = (position.getZ(i) + mesh.position.z - all.min.z) / depth;
    }
    mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    mesh.material = material;
  }

  const resolve = (code: string) => {
    const name = ALIASES[code] ?? code;
    return keys.has(name) ? name : null;
  };

  return {
    press(code: string) {
      const key = keys.get(resolve(code) ?? '');
      if (!key || key.pressed) return;
      key.pressed = true;
      key.mesh.material = pressedMaterial;
    },
    release(code: string) {
      const key = keys.get(resolve(code) ?? '');
      if (!key) return;
      key.pressed = false;
      key.mesh.material = material;
    },
    releaseAll() {
      for (const key of keys.values()) {
        key.pressed = false;
        key.mesh.material = material;
      }
    },
    /** Ease keys toward their pressed / released height. */
    update(dt: number) {
      const k = 1 - Math.exp(-dt * 40);
      for (const key of keys.values()) {
        const goal = key.baseY - (key.pressed ? PRESS_DEPTH : 0);
        key.mesh.position.y += (goal - key.mesh.position.y) * k;
      }
    },
  };
}

export type DeskKeyboard = ReturnType<typeof setupKeyboard>;
