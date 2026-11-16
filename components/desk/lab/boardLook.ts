import * as THREE from 'three';
import { deSilkTexture, vcuSilkTexture } from '../textures';

/**
 * Materials for the circuit boards built by blender/boards.py, matched by
 * material name ("role"). Used twice: by the desk (look.ts) for the
 * miniatures in the pencil case, and by the lab views for the full-size
 * boards. Parts the labs light up (LEDs, 7-segment digits, button caps,
 * the LCD) get a material of their own per mesh, see `OWN_MATERIAL`.
 */

const plastic = (color: string, roughness = 0.4) => new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat: 0.6, clearcoatRoughness: 0.3 });
const metal = (color: string, roughness = 0.3) => new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness });
const matte = (color: string, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });

/** Roles whose meshes change on their own (lit or not): never share these between meshes. */
export const OWN_MATERIAL = new Set(['led_off', 'hex_seg', 'btn_cap', 'vcu_lcd']);

type Context = { track: <T extends { dispose: () => void }>(resource: T) => T };

export function boardMaterial(role: string, { track }: Context): THREE.Material | undefined {
  switch (role) {
    case 'pcb_green': return matte('#1f6b45', 0.45);
    case 'pcb_blue': return matte('#2552a8', 0.45);
    case 'pcb_white': return matte('#f2efe6', 0.55);
    case 'vcu_silk': return silk(track(vcuSilkTexture()));
    case 'de_silk': return silk(track(deSilkTexture()));
    case 'chip_black': return matte('#15181a', 0.35);
    case 'chip_silver': return metal('#d9dde2', 0.35);
    case 'gold': return metal('#d9ab4c', 0.3);
    case 'plastic_white': return matte('#f1f2ef', 0.5);
    // unlit LEDs read as frosted grey; lit ones take their colour (see `glow`)
    case 'led_off': return new THREE.MeshStandardMaterial({ color: '#8f8b84', roughness: 0.35, emissive: '#000000', emissiveIntensity: 1 });
    case 'switch_black': return plastic('#1b1d20', 0.5);
    case 'switch_lever': return plastic('#d8dbdf', 0.4);
    case 'btn_cap': return new THREE.MeshPhysicalMaterial({ color: '#f3f1ea', roughness: 0.3, clearcoat: 0.7, emissive: '#000000', emissiveIntensity: 1 });
    case 'knob_black': return plastic('#202326', 0.45);
    case 'lcd_frame': return matte('#0f2a1f', 0.5);
    // unlit, like a backlit display; the VCU lab draws the characters onto it
    case 'vcu_lcd': return new THREE.MeshBasicMaterial({ color: '#3b4a2a' });
    case 'hex_bg': return matte('#2b1414', 0.6);
    case 'hex_seg': return new THREE.MeshStandardMaterial({ color: '#3a0f0f', roughness: 0.5, emissive: '#ff2a1d', emissiveIntensity: 0 });
    case 'key_cap': return plastic('#3a3d42', 0.5);
    case 'header_black': return matte('#17191c', 0.6);
    case 'fuse_grey': return plastic('#9aa0a6', 0.5);
    case 'connector_metal': return metal('#b8bec6', 0.35);
    case 'heatsink': return metal('#c9ced4', 0.45);
    case 'usb_silver': return metal('#b0b6bd', 0.3);
    default: return undefined;
  }
}

function silk(map: THREE.Texture) {
  return new THREE.MeshStandardMaterial({ map, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
}

/** Light a part up (an LED, a digit segment, a button cap), or put it out with `null`. */
export function glow(mesh: THREE.Mesh | null | undefined, color: string | null, intensity = 1.8) {
  const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
  if (!material || !('emissive' in material)) return;
  // a saturated emissive reads as its colour after tone mapping; a bright one washes out to white
  material.emissive.set(color ?? '#000000');
  material.emissiveIntensity = color ? Math.min(intensity, 1.1) : 0;
  if (color && material.color) material.color.set(color);
  else if (material.color) material.color.set(material.userData.offColor ?? '#8f8b84');
  // lit, it skips tone mapping so red stays red (filmic tone mapping turns a bright red orange)
  const toneMapped = !color;
  if (material.toneMapped !== toneMapped) {
    material.toneMapped = toneMapped;
    material.needsUpdate = true;
  }
}
