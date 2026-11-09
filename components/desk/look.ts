import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Pass } from 'three/addons/postprocessing/Pass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
  cardTexture,
  matTexture,
  noteTexture,
  printTexture,
  stickyTexture,
  tapeTextures,
  woodTexture,
  type DeskFonts,
} from './textures';

/**
 * The cozy, architectural desk at dusk: warm low sun through a mullioned
 * window, an architect's lamp pooling light on the cutting mat, the monitor's
 * glow, soft shadows, light bloom, and a vignette.
 *
 * Meshes are matched to materials by the material *name* exported from
 * blender/desk_scene.py (stored on `mesh.userData.role` by the engine).
 */

/** Objects on this layer cast shadows but are never seen by the camera. */
export const SHADOW_ONLY_LAYER = 2;

type LookContext = {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  model: THREE.Object3D;
  fonts: DeskFonts;
  /** Live texture for the monitor (the terminal). */
  screenMap: THREE.Texture;
  /** Add a post-processing pass (inserted before the output + outline). */
  addPass: (pass: Pass) => void;
  /** Register a GPU resource to free when the scene is disposed. */
  track: <T extends { dispose: () => void }>(resource: T) => T;
};

// ---------------------------------------------------------------- materials

const plastic = (color: string, roughness = 0.38) =>
  new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat: 0.6, clearcoatRoughness: 0.3 });
const metal = (color: string, roughness = 0.3) => new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness });
const matte = (color: string, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });
const mapped = (map: THREE.Texture, roughness = 0.85) => new THREE.MeshStandardMaterial({ map, roughness });

function material(role: string, { fonts, screenMap, track }: Pick<LookContext, 'fonts' | 'screenMap' | 'track'>): THREE.Material | undefined {
  switch (role) {
    // pencil case
    case 'case_body': return plastic('#6cc2f7');
    case 'case_lid': return plastic('#94d5fb');
    case 'case_button_a': return plastic('#ffd84a');
    case 'case_button_b': return plastic('#ff7eb6');
    case 'case_sharpener': return plastic('#e8eef2');
    case 'case_hinge': return plastic('#6fb3db');
    case 'case_hole': return matte('#2a2f36', 0.8);
    case 'label_1':
    case 'label_2': {
      const { map, bumpMap } = tapeTextures(fonts, role === 'label_1' ? 0 : 1);
      return new THREE.MeshPhysicalMaterial({
        map: track(map), bumpMap: track(bumpMap), bumpScale: 4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06,
      });
    }
    // items
    case 'pcb_green': return matte('#1f6b45', 0.45);
    case 'pcb_blue': return matte('#2552a8', 0.45);
    case 'chip_black': return matte('#15181a', 0.35);
    case 'chip_silver': return metal('#d9dde2', 0.35);
    case 'gold': return metal('#d9ab4c', 0.3);
    case 'plastic_white': return matte('#f1f2ef', 0.5);
    case 'led_red': return new THREE.MeshStandardMaterial({ color: '#ff4a3d', emissive: '#ff2a1d', emissiveIntensity: 1.6 });
    case 'cam_body': return plastic('#f4f3ef', 0.45);
    case 'cam_lens': return matte('#1d2022', 0.3);
    case 'glass': return new THREE.MeshPhysicalMaterial({ color: '#3a6ea8', roughness: 0.05, metalness: 0.2, clearcoat: 1 });
    case 'print': return mapped(track(printTexture()), 0.95);
    case 'chrome': return metal('#c9cfd4', 0.22);
    case 'plate_black': return matte('#202325', 0.5);
    case 'card': return matte('#fafafa', 0.5);
    case 'card_face': return new THREE.MeshPhysicalMaterial({ map: track(cardTexture(fonts)), roughness: 0.45, clearcoat: 0.4 });
    case 'note': return matte('#fffdf6', 0.95);
    case 'note_face': return mapped(track(noteTexture(fonts)), 0.95);
    case 'pick': return new THREE.MeshPhysicalMaterial({ color: '#f2a93b', roughness: 0.25, clearcoat: 1 });
    // desk
    case 'desk_wood': return new THREE.MeshPhysicalMaterial({ map: track(woodTexture()), roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5 });
    case 'mat': return mapped(track(matTexture(fonts)), 0.92);
    case 'kb_case': return matte('#3a3836', 0.6);
    // keycaps are set up in keyboard.ts (legend atlas + key presses)
    case 'monitor': return matte('#1c1d1f', 0.45);
    case 'screen':
      // unlit: a glowing display, no lamp glare across the text
      return new THREE.MeshBasicMaterial({ map: screenMap, color: '#e9edf2' });
    case 'lamp': return new THREE.MeshPhysicalMaterial({ color: '#efe9dc', roughness: 0.4, clearcoat: 0.8, side: THREE.DoubleSide });
    case 'lamp_joint': return metal('#b9bec4', 0.3);
    case 'lamp_bulb': return new THREE.MeshStandardMaterial({ color: '#fff2d6', emissive: '#ffd9a0', emissiveIntensity: 6 });
    case 'mug': return new THREE.MeshPhysicalMaterial({ color: '#9fb8a3', roughness: 0.35, clearcoat: 0.9 });
    case 'coffee': return new THREE.MeshPhysicalMaterial({ color: '#3b2416', roughness: 0.1, clearcoat: 1 });
    case 'pot': return matte('#c56f4a', 0.9);
    case 'soil': return matte('#3a2a1e', 1);
    case 'leaf': return new THREE.MeshStandardMaterial({ color: '#4f7d4a', roughness: 0.65, side: THREE.DoubleSide });
    case 'book_1': return matte('#2f4a6b', 0.8);
    case 'book_2': return matte('#c9b28a', 0.85);
    case 'book_3': return matte('#8a3b32', 0.8);
    case 'scale_ruler': return metal('#d6d9dc', 0.35);
    case 'sticky': return matte('#ffe873', 0.9);
    case 'sticky_face': return mapped(track(stickyTexture(fonts)), 0.9);
    default: return undefined;
  }
}

/** Box-unwrapped meshes (desk, mat) get flat top-down UVs so their textures map 1:1. */
function planarUVs(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;
  const position = geometry.getAttribute('position');
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uv[i * 2] = (position.getX(i) - min.x) / (max.x - min.x);
    uv[i * 2 + 1] = (position.getZ(i) - min.z) / (max.z - min.z);
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// ---------------------------------------------------------------- lighting

/** Vignette + warm grade, applied after bloom. */
function gradePass() {
  return new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      strength: { value: 0.5 },
      warmth: { value: new THREE.Vector3(1.04, 1.0, 0.94) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float strength;
      uniform vec3 warmth;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        float d = distance(vUv, vec2(0.5));
        color.rgb *= warmth;
        color.rgb *= mix(1.0, smoothstep(0.85, 0.3, d), strength);
        gl_FragColor = color;
      }
    `,
  });
}

/**
 * A window wall (opening + mullions) placed between the sun and the desk.
 * It only exists on SHADOW_ONLY_LAYER, so it shapes the light without being seen.
 */
function windowGobo(sunDirection: THREE.Vector3, centre: THREE.Vector3, track: LookContext['track']) {
  const wall = new THREE.Shape();
  wall.moveTo(-3, -3);
  wall.lineTo(3, -3);
  wall.lineTo(3, 3);
  wall.lineTo(-3, 3);
  const opening = new THREE.Path();
  const [w, h] = [0.95, 0.8];
  opening.moveTo(-w / 2, -h / 2);
  opening.lineTo(-w / 2, h / 2);
  opening.lineTo(w / 2, h / 2);
  opening.lineTo(w / 2, -h / 2);
  wall.holes.push(opening);
  const material = track(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const group = new THREE.Group();
  group.add(new THREE.Mesh(track(new THREE.ShapeGeometry(wall)), material));
  const bar = (bw: number, bh: number, x: number, y: number) => {
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(bw, bh, 0.02)), material);
    m.position.set(x, y, 0);
    group.add(m);
  };
  bar(0.03, h, -w / 6, 0);
  bar(0.03, h, w / 6, 0);
  bar(w, 0.03, 0, h * 0.12);
  group.traverse((o) => {
    o.layers.set(SHADOW_ONLY_LAYER);
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  group.position.copy(centre).addScaledVector(sunDirection, 0.75);
  group.lookAt(centre);
  return group;
}

export function applyLook({ scene, renderer, model, fonts, screenMap, addPass, track }: LookContext) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = new THREE.Color('#1b1714');

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = track(pmrem.fromScene(room, 0.04).texture);
  scene.environmentIntensity = 0.22;
  room.dispose();
  pmrem.dispose();

  // materials, one per role
  const byRole = new Map<string, THREE.Material | undefined>();
  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const role = mesh.userData.role as string;
    if (role === 'desk_wood' || role === 'mat') planarUVs(mesh);
    if (!byRole.has(role)) {
      const created = material(role, { fonts, screenMap, track });
      byRole.set(role, created && track(created));
    }
    const replacement = byRole.get(role);
    if (replacement) mesh.material = replacement;
  });

  const centre = new THREE.Vector3(0, 0, 0.02);

  // cool dusk sky fill
  scene.add(new THREE.HemisphereLight('#a8bedf', '#3a2a1f', 0.55));

  // low warm sun through the window (left, behind), shaped by the gobo
  const sunDirection = new THREE.Vector3(-0.9, 0.75, -0.55).normalize();
  const sun = new THREE.DirectionalLight('#ffb36b', 3.2);
  sun.position.copy(centre).addScaledVector(sunDirection, 2.5);
  sun.target.position.copy(centre);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.2, far: 5 });
  sun.shadow.camera.layers.enable(SHADOW_ONLY_LAYER);
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.004;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target, windowGobo(sunDirection, centre, track));

  // architect's lamp: warm pool on the mat
  const lampAt = model.getObjectByName('LampLight')?.getWorldPosition(new THREE.Vector3());
  const lampTarget = model.getObjectByName('LampTarget')?.getWorldPosition(new THREE.Vector3());
  if (lampAt && lampTarget) {
    const lamp = new THREE.SpotLight('#ffcf8f', 0.16, 0, 0.62, 0.75, 2);
    lamp.position.copy(lampAt);
    lamp.target.position.copy(lampTarget);
    lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.bias = -0.0004;
    lamp.shadow.radius = 4;
    scene.add(lamp, lamp.target);
  }

  // monitor glow
  const glow = new THREE.PointLight('#9ec5ff', 0.12, 1.2, 2);
  glow.position.set(0.02, 0.25, -0.5);
  scene.add(glow);

  addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.22, 0.45, 0.92));
  addPass(gradePass());
}
