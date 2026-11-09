import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { CONTACT_ITEM, DESK_ITEMS } from './items';
import { applyLook } from './look';
import { OUTLINE_LAYER, SilhouetteOutlinePass } from './SilhouetteOutlinePass';
import type { DeskFonts } from './textures';

const MODEL_URL = '/desk/desk.glb';

/** Hover/selection targets reported to React. */
export type DeskTarget = string; // an item id, 'case', or 'contact'

export type DeskEvents = {
  onHover?: (target: DeskTarget | null, state: { lidOpen: boolean; inCase: boolean }) => void;
  onSelect?: (id: string | null) => void;
  onOpen?: (href: string) => void;
  onHint?: (hint: string) => void;
};

// ---------------------------------------------------------------- layout (metres, three.js axes)

const MAT_Y = 0.002; // cutting-mat surface
const DRAG_Y = 0.04; // carry height while dragging
const LID_OPEN = -1.95; // CaseLid rotation.x when open (~112 deg)
/** Inside of the pencil case, for "drop it back in". */
const CASE_BOUNDS = { minX: -0.125, maxX: 0.125, minZ: -0.035, maxZ: 0.075 };
/** Where parts can be set down on the mat. */
const MAT_BOUNDS = { minX: -0.28, maxX: 0.28, minZ: -0.19, maxZ: 0.19 };
/** Spots used when a part is tapped out (touch) instead of dragged. */
const TAP_SLOTS: [number, number][] = [
  [-0.21, -0.12], [-0.07, -0.15], [0.08, -0.14], [0.22, -0.11], [-0.22, 0.14], [0.22, 0.14], [0.0, 0.15],
];

// camera: from the front, looking down at the mat
const FOV = 32;
const PITCH = THREE.MathUtils.degToRad(52);
const TARGET = new THREE.Vector3(0, 0.0, 0.0);
const FRAME_HALF_WIDTH = { wide: 0.5, narrow: 0.19 };
const NO_SHADOW_CAST = new Set(['label_1', 'label_2', 'screen', 'sticky_face', 'card_face', 'note_face', 'print', 'mat', 'desk_wood']);
const MAX_PIXEL_RATIO = 1.5;
const DRAG_THRESHOLD_PX = 5;
const DOUBLE_CLICK_MS = 350;

type Item = {
  id: string;
  href: string;
  root: THREE.Object3D;
  homePos: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  out: boolean;
};

type Tween = {
  obj: THREE.Object3D;
  t: number;
  dur: number;
  update: (k: number) => void;
  done?: () => void;
};

type Disposable = { dispose: () => void };

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * Owns the WebGL renderer, the desk scene, and the pencil-case interaction:
 * click the case to open it, drag parts out onto the mat (tap on touch),
 * drop them back in, double-click a part to visit its page.
 *
 * React only creates it, listens to its events, and disposes it.
 */
export class DeskEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 20);
  private composer: EffectComposer;
  private output = new OutputPass();
  private outline: SilhouetteOutlinePass;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2(9, 9);
  private parallax = new THREE.Vector2();
  private timer = new THREE.Timer();
  private resizeObserver: ResizeObserver;
  private visibilityObserver: IntersectionObserver;
  private reducedMotion: boolean;
  private frame = 0;
  private running = false;
  private disposed = false;
  private distance = 1;
  private resources: Disposable[] = [];
  private tweens: Tween[] = [];

  private items: Item[] = [];
  private caseRoot: THREE.Object3D | null = null;
  private lid: THREE.Object3D | null = null;
  private tapeRoot: THREE.Object3D | null = null;
  private pickRoots = new Map<THREE.Object3D, DeskTarget>();
  private pickMeshes: THREE.Object3D[] = [];
  private lidOpen = false;
  private hovered: THREE.Object3D | null = null;
  private outlined: THREE.Object3D | null = null;

  // pointer / drag state
  private down: { x: number; y: number; root: THREE.Object3D | null; touch: boolean } | null = null;
  private drag: { item: Item; offset: THREE.Vector3; target: THREE.Vector3; last: THREE.Vector3 } | null = null;
  private lastClick = { root: null as THREE.Object3D | null, time: 0 };
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_Y);
  private hit = new THREE.Vector3();

  constructor(
    private container: HTMLElement,
    private fonts: DeskFonts,
    private events: DeskEvents = {},
  ) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' });
    container.appendChild(canvas);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(this.output);
    this.outline = new SilhouetteOutlinePass(this.scene, this.camera);
    this.outline.enabled = false;
    this.composer.addPass(this.outline);

    this.timer.connect(document);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.visibilityObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? this.start() : this.stop()));
    this.visibilityObserver.observe(container);
    this.resize();

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
  }

  async load() {
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
    if (this.disposed) return;
    const model = gltf.scene;

    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const role = (mesh.material as THREE.Material).name;
      mesh.userData.role = role;
      mesh.castShadow = !NO_SHADOW_CAST.has(role);
      mesh.receiveShadow = true;
      this.resources.push(mesh.geometry, mesh.material as THREE.Material);
    });

    this.caseRoot = model.getObjectByName('Case') ?? null;
    this.lid = model.getObjectByName('CaseLid') ?? null;
    this.tapeRoot = model.getObjectByName(CONTACT_ITEM.node) ?? null;
    if (this.caseRoot) this.pickRoots.set(this.caseRoot, 'case');
    if (this.tapeRoot) this.pickRoots.set(this.tapeRoot, 'contact');
    for (const info of DESK_ITEMS) {
      const root = model.getObjectByName(info.node);
      if (!root) continue;
      this.items.push({ id: info.id, href: info.href, root, homePos: root.position.clone(), homeQuat: root.quaternion.clone(), out: false });
      this.pickRoots.set(root, info.id);
    }
    for (const root of this.pickRoots.keys()) {
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) this.pickMeshes.push(o);
      });
    }

    this.scene.add(model);
    applyLook({
      scene: this.scene,
      renderer: this.renderer,
      model,
      fonts: this.fonts,
      addPass: (pass) => this.composer.insertPass(pass, this.composer.passes.indexOf(this.output)),
      track: (resource) => {
        this.resources.push(resource);
        return resource;
      },
    });
    this.renderer.compile(this.scene, this.camera);
    this.events.onHint?.('click the pencil case to open it');
  }

  /** Put every part back in the case and close the lid. */
  packUp() {
    this.items.forEach((item, i) => {
      if (!item.out) return;
      window.setTimeout(() => this.sendHome(item), i * 70);
    });
    window.setTimeout(() => this.setLid(false), this.reducedMotion ? 0 : 750);
    this.events.onSelect?.(null);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.resizeObserver.disconnect();
    this.visibilityObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointercancel', this.onPointerCancel);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    for (const pass of this.composer.passes) pass.dispose();
    this.composer.dispose();
    for (const resource of this.resources) resource.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    canvas.remove();
  }

  // ---------------------------------------------------------------- actions

  private setLid(open: boolean) {
    if (!this.lid || open === this.lidOpen) return;
    this.lidOpen = open;
    const lid = this.lid;
    const from = lid.rotation.x;
    const to = open ? LID_OPEN : 0;
    this.tween(lid, 0.7, (k) => {
      lid.rotation.x = from + (to - from) * ease(k);
    });
    this.events.onHint?.(open ? 'drag things out onto the mat' : 'click the pencil case to open it');
  }

  /** Move an item to (x, z) on the mat, or home if `home`. */
  private move(item: Item, to: THREE.Vector3, quat: THREE.Quaternion, arc: number, dur = 0.55) {
    const root = item.root;
    const p0 = root.position.clone();
    const q0 = root.quaternion.clone();
    this.tween(root, dur, (k) => {
      const e = ease(k);
      root.position.lerpVectors(p0, to, e);
      root.position.y += arc * Math.sin(Math.PI * e);
      root.quaternion.slerpQuaternions(q0, quat, e);
    });
  }

  private sendHome(item: Item) {
    item.out = false;
    this.move(item, item.homePos, item.homeQuat, 0.05);
  }

  private setDown(item: Item, x: number, z: number) {
    const wasOut = this.items.some((i) => i.out);
    item.out = true;
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 0.35);
    const quat = item.homeQuat.clone().premultiply(yaw);
    this.move(item, new THREE.Vector3(x, MAT_Y, z), quat, 0, 0.35);
    this.events.onSelect?.(item.id);
    if (!wasOut) this.events.onHint?.('double-click anything to visit that page');
  }

  /** Touch: pop an item out to the next free spot. */
  private tapOut(item: Item) {
    const taken = this.items.filter((i) => i.out).map((i) => i.root.position);
    const free = TAP_SLOTS.find(([x, z]) => taken.every((p) => Math.hypot(p.x - x, p.z - z) > 0.06)) ?? TAP_SLOTS[0];
    const wasOut = this.items.some((i) => i.out);
    item.out = true;
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 0.35);
    this.move(item, new THREE.Vector3(free[0], MAT_Y, free[1]), item.homeQuat.clone().premultiply(yaw), 0.08, 0.6);
    this.events.onSelect?.(item.id);
    if (!wasOut) this.events.onHint?.('tap a part again to see where it goes');
  }

  private click(root: THREE.Object3D | null, touch: boolean) {
    const target = root ? this.pickRoots.get(root) : null;
    if (!root || !target) {
      this.events.onSelect?.(null);
      return;
    }
    if (target === 'case') {
      this.setLid(!this.lidOpen);
      return;
    }
    if (target === 'contact') {
      this.events.onSelect?.(CONTACT_ITEM.id);
      return;
    }
    const item = this.items.find((i) => i.root === root);
    if (!item) return;
    const now = performance.now();
    const double = this.lastClick.root === root && now - this.lastClick.time < DOUBLE_CLICK_MS;
    this.lastClick = { root, time: now };
    if (double) {
      this.events.onOpen?.(item.href);
      return;
    }
    if (!item.out && !this.lidOpen) {
      this.setLid(true);
      return;
    }
    if (!item.out && touch) {
      this.tapOut(item);
      return;
    }
    this.events.onSelect?.(item.id);
  }

  // ---------------------------------------------------------------- pointer

  private updateNdc(event: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  }

  private pick(): THREE.Object3D | null {
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickMeshes, false)[0];
    let o: THREE.Object3D | null = hit?.object ?? null;
    while (o && !this.pickRoots.has(o)) o = o.parent;
    return o;
  }

  private onPointerDown = (event: PointerEvent) => {
    this.updateNdc(event);
    this.down = { x: event.clientX, y: event.clientY, root: this.pick(), touch: event.pointerType === 'touch' };
  };

  private onPointerMove = (event: PointerEvent) => {
    this.updateNdc(event);
    const down = this.down;
    if (down && !this.drag && !down.touch && Math.hypot(event.clientX - down.x, event.clientY - down.y) > DRAG_THRESHOLD_PX) {
      const item = this.items.find((i) => i.root === down.root);
      if (item && (item.out || this.lidOpen)) this.beginDrag(item, event);
    }
    if (this.drag) this.updateDragTarget();
  };

  /** Where the dragged part should be: under the pointer, on a plane just above the mat. */
  private updateDragTarget() {
    if (!this.drag) return;
    const { offset, target } = this.drag;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.dragPlane, this.hit)) return;
    target.set(
      THREE.MathUtils.clamp(this.hit.x + offset.x, MAT_BOUNDS.minX - 0.04, MAT_BOUNDS.maxX + 0.04),
      DRAG_Y,
      THREE.MathUtils.clamp(this.hit.z + offset.z, MAT_BOUNDS.minZ - 0.04, MAT_BOUNDS.maxZ + 0.04),
    );
  }

  private onPointerUp = (event: PointerEvent) => {
    this.updateNdc(event);
    const down = this.down;
    this.down = null;
    if (this.drag) {
      this.endDrag();
      return;
    }
    if (down) this.click(this.pick() === down.root ? down.root : null, down.touch);
  };

  private onPointerCancel = () => {
    this.down = null;
    if (this.drag) this.endDrag();
  };

  private onPointerLeave = () => {
    if (!this.drag) this.ndc.set(9, 9);
  };

  private beginDrag(item: Item, event: PointerEvent) {
    this.renderer.domElement.setPointerCapture(event.pointerId);
    this.tweens = this.tweens.filter((t) => t.obj !== item.root);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.raycaster.ray.intersectPlane(this.dragPlane, this.hit);
    const offset = new THREE.Vector3(item.root.position.x - this.hit.x, 0, item.root.position.z - this.hit.z);
    this.drag = { item, offset, target: item.root.position.clone().setY(DRAG_Y), last: item.root.position.clone() };
    this.renderer.domElement.style.cursor = 'grabbing';
    this.events.onSelect?.(item.id);
  }

  private endDrag() {
    // drop where the pointer is, not where the smoothed position has caught up to
    const { item, target } = this.drag!;
    this.drag = null;
    this.renderer.domElement.style.cursor = '';
    const { x, z } = target;
    const overCase = x > CASE_BOUNDS.minX && x < CASE_BOUNDS.maxX && z > CASE_BOUNDS.minZ && z < CASE_BOUNDS.maxZ;
    if (overCase) {
      if (!this.lidOpen) this.setLid(true);
      this.sendHome(item);
      this.events.onSelect?.(null);
      return;
    }
    this.setDown(
      item,
      THREE.MathUtils.clamp(x, MAT_BOUNDS.minX, MAT_BOUNDS.maxX),
      THREE.MathUtils.clamp(z, MAT_BOUNDS.minZ, MAT_BOUNDS.maxZ),
    );
  }

  // ---------------------------------------------------------------- loop

  private tween(obj: THREE.Object3D, dur: number, update: (k: number) => void, done?: () => void) {
    this.tweens = this.tweens.filter((t) => t.obj !== obj);
    this.tweens.push({ obj, t: 0, dur: this.reducedMotion ? 0.001 : dur, update, done });
  }

  private setOutlined(root: THREE.Object3D | null) {
    if (root === this.outlined) return;
    this.outlined?.traverse((o) => o.layers.disable(OUTLINE_LAYER));
    root?.traverse((o) => o.layers.enable(OUTLINE_LAYER));
    this.outlined = root;
  }

  private start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.timer.reset();
    this.frame = requestAnimationFrame(this.loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private resize = () => {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.outline.setThickness(2 * this.renderer.getPixelRatio());
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const halfWidth = this.camera.aspect >= 1 ? FRAME_HALF_WIDTH.wide : FRAME_HALF_WIDTH.narrow;
    this.distance = halfWidth / (Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * this.camera.aspect);
  };

  private loop = () => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.loop);
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.1);

    for (const t of [...this.tweens]) {
      t.t += dt;
      const k = Math.min(1, t.t / t.dur);
      t.update(k);
      if (k >= 1) {
        this.tweens.splice(this.tweens.indexOf(t), 1);
        t.done?.();
      }
    }

    // camera: fixed framing + gentle parallax (held still while dragging)
    const inView = Math.abs(this.ndc.x) <= 1 && Math.abs(this.ndc.y) <= 1;
    const goal = this.reducedMotion || !inView || this.drag ? new THREE.Vector2() : this.ndc;
    this.parallax.lerp(goal, 1 - Math.exp(-dt * 2.5));
    const yaw = this.parallax.x * 0.03;
    const pitch = PITCH + this.parallax.y * 0.015;
    this.camera.position.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(this.distance).add(TARGET);
    this.camera.lookAt(TARGET);

    // dragging: ease toward the pointer, tilting with motion
    if (this.drag) {
      const { item, target, last } = this.drag;
      this.updateDragTarget();
      const root = item.root;
      root.position.lerp(target, 1 - Math.exp(-dt * 18));
      const vx = (root.position.x - last.x) / Math.max(dt, 1e-3);
      const vz = (root.position.z - last.z) / Math.max(dt, 1e-3);
      last.copy(root.position);
      const tilt = new THREE.Euler(THREE.MathUtils.clamp(vz * 0.6, -0.35, 0.35), 0, THREE.MathUtils.clamp(-vx * 0.6, -0.35, 0.35));
      const tiltQ = new THREE.Quaternion().setFromEuler(tilt);
      root.quaternion.slerp(item.homeQuat.clone().premultiply(tiltQ), 1 - Math.exp(-dt * 10));
    }

    // hover -> white outline + tooltip
    let root: THREE.Object3D | null = null;
    if (this.drag) root = this.drag.item.root;
    else if (inView && this.pickMeshes.length) root = this.pick();
    if (root !== this.hovered) {
      this.hovered = root;
      const target = root ? this.pickRoots.get(root) ?? null : null;
      const item = this.items.find((i) => i.root === root);
      if (!this.drag) this.renderer.domElement.style.cursor = root ? (item && (item.out || this.lidOpen) ? 'grab' : 'pointer') : '';
      this.events.onHover?.(this.drag ? null : target, { lidOpen: this.lidOpen, inCase: !!item && !item.out });
    }
    if (root) this.setOutlined(root);
    const easing = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 25);
    this.outline.opacity += ((root ? 1 : 0) - this.outline.opacity) * easing;
    if (!root && this.outline.opacity < 0.01) {
      this.outline.opacity = 0;
      this.setOutlined(null);
    }
    this.outline.enabled = this.outline.opacity > 0;

    this.composer.render(dt);
  };
}
