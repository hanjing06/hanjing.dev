import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OWN_MATERIAL, boardMaterial } from './boardLook';

/**
 * A small three.js scene for one circuit board (blender/boards.py), held in
 * the hands: orbit to look around, click its switches and buttons. The lab
 * components (VcuLab, FsmLab) own the behaviour; this owns the renderer,
 * the camera, picking, tweens and cleanup.
 */

export type Tween = { obj: THREE.Object3D; t: number; dur: number; update: (k: number) => void; done?: () => void };
/** Printed or glass layers lying on a part: they'd only shadow the part under them. */
const FLAT_ROLES = new Set(['vcu_silk', 'de_silk', 'fpga_print', 'glcd']);
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export type BoardScene = {
  root: THREE.Object3D;
  node: (name: string) => THREE.Object3D | null;
  mesh: (name: string) => THREE.Mesh | null;
  /** Animate `obj` for `dur` seconds; `update` gets an eased 0..1. */
  tween: (obj: THREE.Object3D, dur: number, update: (k: number) => void, done?: () => void) => void;
  /** Called every frame with the delta and the elapsed time, in seconds. Returns an unsubscribe. */
  onFrame: (callback: (dt: number, time: number) => void) => () => void;
  /** Called when the part under the pointer changes (its name, from `hoverable`), or null. */
  onHover: (callback: (name: string | null) => void) => () => void;
  /** Names (or prefixes, ending in `*`) of parts that explain themselves on hover; controls are included. */
  setHoverable: (names: string[]) => void;
  /** Where a part's top sits on the canvas, in CSS pixels; null if it's missing or behind the camera. */
  screenOf: (name: string) => { x: number; y: number } | null;
  /** Called with the clicked part's name (the nearest named ancestor in `pickable`). */
  onPick: (callback: (name: string) => void) => void;
  /** Names (or prefixes, ending in `*`) of parts that react to a click. */
  setPickable: (names: string[]) => void;
  dispose: () => void;
};

type Options = {
  /** Metres: the longer side of the board, to frame it. */
  size: number;
  /** Prefers reduced motion: skip tweens. */
  reducedMotion?: boolean;
  /** The GPU dropped the canvas (driver reset, too many tabs): show a message instead of a frozen board. */
  onContextLost?: () => void;
};

/**
 * Phones, tablets and small laptops: render lighter so the lab never makes
 * a device stutter or heat up (no shadows, 1x pixels, 30 fps).
 */
function isLowPower() {
  if (typeof navigator === 'undefined') return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  return memory <= 4 || cores <= 4 || window.matchMedia('(pointer: coarse)').matches;
}

export async function createBoardScene(container: HTMLElement, url: string, { size, reducedMotion = false, onContextLost }: Options): Promise<BoardScene> {
  const lowPower = isLowPower();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: lowPower ? 'default' : 'high-performance' });
  renderer.setPixelRatio(lowPower ? 1 : Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none' });
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.005, 10);
  const distance = size * 1.9;
  camera.position.set(0, distance * 0.8, distance * 0.6);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = size * 0.4;
  controls.maxDistance = size * 3;
  controls.maxPolarAngle = THREE.MathUtils.degToRad(82);
  controls.target.set(0, 0, 0);

  const resources: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(resource: T) => {
    resources.push(resource);
    return resource;
  };
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = track(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
  scene.environmentIntensity = 0.55;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#dfe8f3', '#4a4036', 0.9));
  const key = new THREE.DirectionalLight('#fff1dc', 2.2);
  key.position.set(-size * 0.6, size * 1.4, size * 0.9);
  key.castShadow = !lowPower;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.01;
  key.shadow.camera.far = size * 5;
  key.shadow.camera.left = key.shadow.camera.bottom = -size;
  key.shadow.camera.right = key.shadow.camera.top = size;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.002;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#cfe0ff', 0.8);
  fill.position.set(size, size * 0.6, -size * 0.8);
  scene.add(fill);
  // a soft shadow underneath, as if it's held over the desk
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(size * 4, size * 4)), track(new THREE.ShadowMaterial({ opacity: 0.35 })));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -size * 0.08;
  ground.receiveShadow = true;
  if (!lowPower) scene.add(ground);

  // a lost context stops drawing instead of throwing every frame
  let running = true;
  let frame = 0;
  const onLost = (event: Event) => {
    event.preventDefault();
    running = false;
    cancelAnimationFrame(frame);
    onContextLost?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const release = () => {
    canvas.removeEventListener('webglcontextlost', onLost);
    for (const r of resources) r.dispose();
    renderer.dispose();
    // hand the GPU context back now rather than at garbage collection: browsers
    // only allow a handful at once, and the desk behind needs its own
    renderer.forceContextLoss();
    canvas.remove();
  };

  let gltf: Awaited<ReturnType<GLTFLoader['loadAsync']>>;
  try {
    gltf = await new GLTFLoader().loadAsync(url);
  } catch (error) {
    release();
    throw error;
  }
  const root = gltf.scene;
  const materials = new Map<string, THREE.Material>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const role = (mesh.material as THREE.Material).name;
    mesh.userData.role = role;
    track(mesh.geometry);
    track(mesh.material as THREE.Material);
    const shared = materials.get(role) ?? boardMaterial(role, { track });
    if (!shared) return;
    if (!materials.has(role)) materials.set(role, track(shared));
    if (OWN_MATERIAL.has(role)) {
      const own = track(shared.clone()) as THREE.MeshStandardMaterial;
      own.userData.offColor = own.color?.getStyle();
      mesh.material = own;
    } else {
      mesh.material = shared;
    }
    mesh.castShadow = !FLAT_ROLES.has(role);
    mesh.receiveShadow = true;
  });
  scene.add(root);

  // picking: a click (not a drag) on a part named in `pickable`
  let pickable: string[] = [];
  let pickHandler: ((name: string) => void) | null = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const meshes: THREE.Object3D[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o);
  });
  let hoverable: string[] = [];
  const hoverHandlers = new Set<(name: string | null) => void>();
  let hovered: string | null = null;
  const matches = (list: string[], name: string) => list.some((p) => (p.endsWith('*') ? name.startsWith(p.slice(0, -1)) : name === p));
  const partAt = (clientX: number, clientY: number, list: string[]): string | null => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    for (const hit of raycaster.intersectObjects(meshes, false)) {
      let o: THREE.Object3D | null = hit.object;
      while (o && o !== root) {
        if (matches(list, o.name)) return o.name;
        o = o.parent;
      }
      return null; // the first thing hit isn't one of them: it's in the way
    }
    return null;
  };
  const pickAt = (x: number, y: number) => partAt(x, y, pickable);
  const setHovered = (name: string | null) => {
    if (name === hovered) return;
    hovered = name;
    for (const cb of hoverHandlers) cb(name);
  };
  let down: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6;
    down = null;
    if (moved) return;
    const name = pickAt(e.clientX, e.clientY);
    if (name) pickHandler?.(name);
  };
  const onMove = (e: PointerEvent) => {
    if (down) return;
    canvas.style.cursor = pickAt(e.clientX, e.clientY) ? 'pointer' : 'grab';
    setHovered(partAt(e.clientX, e.clientY, [...pickable, ...hoverable]));
  };
  const onLeave = () => setHovered(null);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  // label anchors: the top centre of a part, found once
  const anchors = new Map<string, THREE.Vector3>();
  const projected = new THREE.Vector3();
  const screenOf = (name: string) => {
    let anchor = anchors.get(name);
    if (!anchor) {
      const node = root.getObjectByName(name);
      if (!node) return null;
      const box = new THREE.Box3().setFromObject(node);
      anchor = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
      anchors.set(name, anchor);
    }
    projected.copy(anchor).project(camera);
    if (projected.z > 1) return null;
    return { x: ((projected.x + 1) / 2) * container.clientWidth, y: ((1 - projected.y) / 2) * container.clientHeight };
  };

  // loop
  const frameCallbacks: ((dt: number, time: number) => void)[] = [];
  let tweens: Tween[] = [];
  const clock = new THREE.Clock();
  let last = 0;
  const loop = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    if (lowPower && now - last < 1000 / 30 - 2) return;
    last = now;
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;
    for (const t of [...tweens]) {
      t.t += dt;
      const k = Math.min(1, t.t / t.dur);
      t.update(ease(k));
      if (k >= 1) {
        tweens.splice(tweens.indexOf(t), 1);
        t.done?.();
      }
    }
    controls.update();
    for (const cb of [...frameCallbacks]) cb(dt, time);
    renderer.render(scene, camera);
  };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  frame = requestAnimationFrame(loop);

  return {
    root,
    node: (name) => root.getObjectByName(name) ?? null,
    mesh: (name) => (root.getObjectByName(name) as THREE.Mesh | undefined) ?? null,
    tween: (obj, dur, update, done) => {
      tweens = tweens.filter((t) => t.obj !== obj);
      tweens.push({ obj, t: 0, dur: reducedMotion ? 0.001 : dur, update, done });
    },
    onFrame: (cb) => {
      frameCallbacks.push(cb);
      return () => {
        const i = frameCallbacks.indexOf(cb);
        if (i >= 0) frameCallbacks.splice(i, 1);
      };
    },
    onHover: (cb) => {
      hoverHandlers.add(cb);
      return () => hoverHandlers.delete(cb);
    },
    setHoverable: (names) => {
      hoverable = names;
    },
    screenOf,
    onPick: (cb) => {
      pickHandler = cb;
    },
    setPickable: (names) => {
      pickable = names;
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      hoverHandlers.clear();
      controls.dispose();
      release();
    },
  };
}
