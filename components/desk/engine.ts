import * as THREE from 'three';
import { song } from '@/content/music';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { stickers } from '@/content/stickers';
import { CONTACT_ITEM, DESK_ITEMS, getDeskItem } from './items';
import { setupKeyboard, type DeskKeyboard } from './keyboard';
import { LAMP_SPOT, applyLook } from './look';
import { OUTLINE_LAYER, SilhouetteOutlinePass } from './SilhouetteOutlinePass';
import { Terminal, TerminalScreen } from './terminal';
import { coverTexture, type DeskFonts } from './textures';

const MODEL_URL = '/desk/desk.glb';

/** Hover/selection targets reported to React. */
export type DeskTarget = string; // an item id, 'case', 'contact', 'monitor', 'lamp', 'sticky', 'wall-note' or 'sticker:<id>'
export type DeskMode = 'desk' | 'terminal';

/** What React can ask the running desk to do. */
/** What's on the CD (content/music.ts, or the latest from Spotify). */
export type CdSong = { title: string; artist: string; cover?: string };

export type DeskControls = {
  /** Turn to the monitor and open a site path (e.g. "/projects/x") in the terminal. */
  openOnMonitor: (href: string) => void;
  /** Open (play) or close (stop) the CD case. */
  setMusic: (open: boolean) => void;
  /** While something covers the desk (the journal), the desk ignores the keyboard. */
  setCovered: (covered: boolean) => void;
  /** Put a song on the CD: its cover image, or a drawn cover with the title and artist. */
  setSong: (song: CdSong) => void;
};

export type DeskEvents = {
  onHover?: (target: DeskTarget | null, state: { lidOpen: boolean; inCase: boolean; lampOn: boolean }) => void;
  onSelect?: (id: string | null) => void;
  /** The CD case was opened (play) or closed (stop). */
  onMusic?: (open: boolean) => void;
  /** A part was picked up to look at over the desk (the ID, a project, the journal). */
  onOpen?: (id: string) => void;
  onHint?: (hint: string) => void;
  /** 'terminal' while the camera is on the monitor and typing goes to the terminal. */
  onMode?: (mode: DeskMode) => void;
  /** The visitor asked for the simple version (the wall note or `simple`). */
  onSimple?: () => void;
};

// ---------------------------------------------------------------- layout (metres, three.js axes)

const MAT_Y = 0.002; // cutting-mat surface

/** How far the CD case's lid opens (radians about its hinge). */
const CD_OPEN = 1.95;
/** How fast the disc spins while the case is open, radians per second. */
const CD_SPIN = 3;
/** How much bigger the CD gets on the mat while it plays. */
const CD_PLAYING_SCALE = 1.8;

/** Typing speed of commands the desk types for you, and the wait for the camera first. */
const AUTO_TYPE_MS = 28;
const AUTO_TYPE_DELAY_MS = 550;
const DRAG_Y = 0.04; // carry height while dragging
const LID_OPEN = -1.95; // CaseLid rotation.x when open (~112 deg)
/** Inside of the pencil case, for "drop it back in". */
const CASE_BOUNDS = { minX: -0.125, maxX: 0.125, minZ: -0.035, maxZ: 0.075 };
/** Where parts can be set down on the mat. */
const MAT_BOUNDS = { minX: -0.28, maxX: 0.28, minZ: -0.19, maxZ: 0.19 };
const WELCOME_HINT = 'start by opening the pencil case, or start typing to enter the terminal';
/** Spots used when a part is tapped out (touch) instead of dragged. */
const TAP_SLOTS: [number, number][] = [
  [-0.21, -0.12], [-0.07, -0.15], [0.08, -0.14], [0.22, -0.11], [-0.22, 0.14], [0.22, 0.14], [0.0, 0.15],
];

// camera: from the front, looking down at the mat
const FOV = 32;
const PITCH = THREE.MathUtils.degToRad(52);
const TARGET = new THREE.Vector3(0, 0.0, 0.0);
const FRAME_HALF_WIDTH = { wide: 0.5, narrow: 0.19 };
const NO_SHADOW_CAST = new Set(['cd_shell', 'cd_cover', 'label_1', 'screen', 'sticky_face', 'sticky_tape', 'card_face', 'journal_label', 'mat', 'desk_wood', 'wall', 'wall_note_face', ...stickers.map((s) => `sticker_${s.id}`)]);
const MAX_PIXEL_RATIO = 1.5;
const DRAG_THRESHOLD_PX = 5;
/** Padding (metres) around each part's invisible hit box. */
const HIT_PAD = 0.006;
const HIT_MATERIAL = new THREE.MeshBasicMaterial();
const DOUBLE_CLICK_MS = 350;

// terminal view: frame the monitor and the keyboard in front of it
const MONITOR_PITCH = THREE.MathUtils.degToRad(30);
const MONITOR_TARGET = new THREE.Vector3(0.02, 0.2, -0.46);
const MONITOR_FRAME: [number, number, number][] = [
  [-0.29, 0.465, -0.571], [0.33, 0.465, -0.571], [-0.29, 0.095, -0.571], [0.33, 0.095, -0.571], // screen
  [-0.16, 0.03, -0.24], [0.2, 0.03, -0.24], [-0.16, 0.03, -0.36], [0.2, 0.03, -0.36], // keyboard
];
const CURSOR_BLINK_S = 0.53;
const EXIT_DELAY_MS = 1200;
const WHEEL_ROW_PX = 40;

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
const isControl = (target: EventTarget | null) => target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;

type Item = {
  id: string;
  href: string;
  root: THREE.Object3D;
  homePos: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  /** How far the part reaches below its origin: lift it this much to sit on the mat, not sink into it. */
  lift: number;
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
/** Ease out with a small overshoot (about 3%), for things that swing into place. */
const settle = (k: number) => {
  const c = 0.9;
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
};
/** How long the camera takes between the desk and the terminal, in seconds. */
const VIEW_S = 1.1;

/**
 * Owns the WebGL renderer, the desk scene, and the pencil-case interaction:
 * click the case to open it, drag parts out onto the mat (tap on
 * touch), drop them back in, double-click a part to pick it up. Nothing
 * navigates away: parts open over the desk, pages open in the terminal.
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
  private cdCover: THREE.Mesh | null = null;
  private pendingSong: CdSong | null = null;
  private tweens: Tween[] = [];

  // typing: the desk keyboard mirrors real keys, the monitor runs a terminal
  private keyboard: DeskKeyboard | null = null;
  private terminal = new Terminal();
  private screen = new TerminalScreen();
  private mode: DeskMode = 'desk';
  private viewMix = 0;
  private monitorPosition = new THREE.Vector3();
  private cursorClock = 0;
  private cursorOn = true;
  private wheelRemainder = 0;

  private items: Item[] = [];
  private caseRoot: THREE.Object3D | null = null;
  private lid: THREE.Object3D | null = null;
  private tapeRoot: THREE.Object3D | null = null;
  private pickRoots = new Map<THREE.Object3D, DeskTarget>();
  private pickMeshes: THREE.Object3D[] = [];
  private lidOpen = false;
  private hovered: THREE.Object3D | null = null;
  /** The desk lamp: click it to switch it on or off. */
  private lampRoot: THREE.Object3D | null = null;
  private lampOn = true;
  /** The CD in its jewel case; open while its song plays. */
  private cd: { lid: THREE.Object3D; disc: THREE.Object3D | null } | null = null;
  private cdOpen = false;
  /** The disc's spin, radians per second (eases toward CD_SPIN while open, 0 when closed). */
  private cdSpin = 0;
  private readonly cdScaleKey = new THREE.Object3D();
  /** The selected part, if any (enter opens it). */
  private selectedId: string | null = null;
  private covered = false;
  /** Lamp brightness, 0 (off) to 1 (on), and what full brightness means. */
  private lampLevel = 1;
  private lamp: { spot: THREE.SpotLight; light: number; bulb: THREE.MeshStandardMaterial | null; glow: number } | null = null;
  private outlined: THREE.Object3D | null = null;

  // pointer / drag state
  private down: { x: number; y: number; root: THREE.Object3D | null; touch: boolean } | null = null;
  private drag: { item: Item; offset: THREE.Vector3; target: THREE.Vector3; last: THREE.Vector3 } | null = null;
  private lastClick = { root: null as THREE.Object3D | null, time: 0 };
  private lidToggledAt = 0;
  /** Pending keystroke of a command the desk is typing for the visitor. */
  private autoType: number | null = null;
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

    this.screen.draw(this.terminal, true);
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
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  /** Loads the model and applies the look. `onProgress` gets the download fraction (0 to 1). */
  async load(onProgress?: (fraction: number) => void) {
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL, (event) => {
      if (event.lengthComputable && event.total) onProgress?.(event.loaded / event.total);
    });
    if (this.disposed) return;
    const model = gltf.scene;

    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const role = (mesh.material as THREE.Material).name;
      mesh.userData.role = role;
      mesh.castShadow = !NO_SHADOW_CAST.has(role) && !role.startsWith('sticker_');
      mesh.receiveShadow = true;
      this.resources.push(mesh.geometry, mesh.material as THREE.Material);
    });

    this.caseRoot = model.getObjectByName('Case') ?? null;
    this.lid = model.getObjectByName('CaseLid') ?? null;
    this.tapeRoot = model.getObjectByName(CONTACT_ITEM.node) ?? null;
    if (this.caseRoot) this.pickRoots.set(this.caseRoot, 'case');
    const monitor = model.getObjectByName('Monitor');
    if (monitor) this.pickRoots.set(monitor, 'monitor');
    // the sticky note stuck inside the lid, and the stickers on top of it
    const sticky = model.getObjectByName('StickyNote');
    if (sticky) this.pickRoots.set(sticky, 'sticky');
    for (const sticker of stickers) {
      const node = model.getObjectByName(`Sticker_${sticker.id}`);
      if (node) this.pickRoots.set(node, `sticker:${sticker.id}`);
    }
    this.lampRoot = model.getObjectByName('Lamp') ?? null;
    if (this.lampRoot) this.pickRoots.set(this.lampRoot, 'lamp');
    const wallNote = model.getObjectByName('WallNote');
    if (wallNote) this.pickRoots.set(wallNote, 'wall-note');
    if (this.tapeRoot) this.pickRoots.set(this.tapeRoot, 'contact');
    for (const info of DESK_ITEMS) {
      const root = model.getObjectByName(info.node);
      if (!root) continue;
      // the boards' origins are on their top face with the PCB below, so a
      // part set down at MAT_Y would sit flush with the mat and flicker through it
      model.updateMatrixWorld(true);
      const bottom = new THREE.Box3().setFromObject(root).min.y;
      const lift = Math.max(0, root.getWorldPosition(new THREE.Vector3()).y - bottom) + 0.0002;
      this.items.push({ id: info.id, href: info.href, root, homePos: root.position.clone(), homeQuat: root.quaternion.clone(), lift, out: false });
      this.pickRoots.set(root, info.id);
    }
    const cdLid = model.getObjectByName('MusicLid');
    if (cdLid) this.cd = { lid: cdLid, disc: model.getObjectByName('MusicDisc') ?? null };
    // the disc's rainbow is painted flat, seen from above: give it top-down UVs
    const disc = this.cd?.disc as THREE.Mesh | null | undefined;
    if (disc?.isMesh) flatUvs(disc.geometry);
    this.cdCover = (model.getObjectByName('MusicCover') as THREE.Mesh | undefined) ?? null;
    if (this.pendingSong) this.setSong(this.pendingSong);
    else if (song.cover) this.setSong(song);
    for (const root of this.pickRoots.keys()) {
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) this.pickMeshes.push(o);
      });
    }
    // thin parts (the barbell, the cards) are hard to hit: give each part an
    // invisible, padded hit box so a click near it still finds it, not the case
    model.updateMatrixWorld(true);
    for (const item of this.items) {
      const box = new THREE.Box3().setFromObject(item.root);
      if (box.isEmpty()) continue;
      const size = box.getSize(new THREE.Vector3());
      const center = item.root.worldToLocal(box.getCenter(new THREE.Vector3()));
      const scale = item.root.getWorldScale(new THREE.Vector3());
      const geometry = new THREE.BoxGeometry(
        (size.x + HIT_PAD) / scale.x,
        Math.max(size.y + HIT_PAD, 0.012) / scale.y,
        (size.z + HIT_PAD) / scale.z,
      );
      const proxy = new THREE.Mesh(geometry, HIT_MATERIAL);
      proxy.name = `${item.root.name}Hit`;
      proxy.visible = false; // never drawn (or outlined), but still hit by the raycaster
      proxy.userData.role = 'hit'; // look.ts leaves it alone
      proxy.position.copy(center);
      item.root.add(proxy);
      this.pickMeshes.push(proxy);
      this.resources.push(geometry);
    }

    this.scene.add(model);
    applyLook({
      scene: this.scene,
      renderer: this.renderer,
      model,
      fonts: this.fonts,
      screenMap: this.screen.texture,
      addPass: (pass) => this.composer.insertPass(pass, this.composer.passes.indexOf(this.output)),
      track: (resource) => {
        this.resources.push(resource);
        return resource;
      },
    });
    const spot = this.scene.getObjectByName(LAMP_SPOT) as THREE.SpotLight | undefined;
    if (spot) {
      const bulb = ((this.lampRoot?.getObjectByName('LampBulb') as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined) ?? null;
      this.lamp = { spot, light: spot.intensity, bulb, glow: bulb?.emissiveIntensity ?? 0 };
    }
    const keyboardRoot = model.getObjectByName('Keyboard');
    if (keyboardRoot) {
      this.keyboard = setupKeyboard(keyboardRoot, this.fonts, (resource) => {
        this.resources.push(resource);
        return resource;
      });
    }
    this.renderer.compile(this.scene, this.camera);
    this.events.onHint?.(WELCOME_HINT);
  }

  dispose() {
    this.disposed = true;
    this.stopAutoType();
    this.stop();
    this.resizeObserver.disconnect();
    this.visibilityObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointercancel', this.onPointerCancel);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.screen.dispose();
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
    this.lidToggledAt = performance.now();
    const lid = this.lid;
    const from = lid.rotation.x;
    const to = open ? LID_OPEN : 0;
    // opening swings up and settles with a touch of overshoot; closing eases shut
    this.tween(lid, open ? 0.8 : 0.6, (k) => {
      lid.rotation.x = from + (to - from) * (open ? settle(k) : ease(k));
    });
    this.events.onHint?.(open ? 'drag things out onto the mat, or press any key to enter the terminal' : WELCOME_HINT);
    // refresh the caption now if the pointer is still on the case
    if (this.hovered && this.hovered === this.caseRoot) this.events.onHover?.('case', { lidOpen: open, inCase: false, lampOn: this.lampOn });
  }

  setCovered(covered: boolean) {
    this.covered = covered;
  }

  /**
   * Open a part: the CD plays (popping out onto the mat first); the ID card,
   * the projects and the journal are picked up and shown over the desk; the
   * case itself (or the label on it) opens or closes.
   */
  private activate(id: string) {
    if (id === 'music') {
      const cd = this.items.find((i) => i.id === 'music');
      if (cd && !cd.out) {
        if (!this.lidOpen) this.setLid(true);
        this.tapOut(cd);
      }
      this.setMusic(!this.cdOpen);
      return;
    }
    if (id === CONTACT_ITEM.id || id === 'case') {
      this.setLid(!this.lidOpen);
      return;
    }
    if (getDeskItem(id)) {
      this.select(id);
      this.events.onOpen?.(id);
    }
  }

  private select(id: string | null) {
    this.selectedId = id;
    this.events.onSelect?.(id);
  }

  /** Put a song on the CD (before the model loads, it waits until it has). */
  setSong(next: CdSong) {
    if (this.disposed) return;
    const mesh = this.cdCover;
    if (!mesh) {
      this.pendingSong = next;
      return;
    }
    this.pendingSong = null;
    const apply = (texture: THREE.Texture) => {
      if (this.disposed) return texture.dispose();
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.needsUpdate = true;
      this.resources.push(texture);
    };
    const drawn = () => apply(coverTexture(this.fonts, next.title, next.artist));
    if (next.cover) new THREE.TextureLoader().load(next.cover, apply, undefined, drawn);
    else drawn();
  }

  /** Open the CD case (its song plays) or close it. */
  setMusic(open: boolean) {
    if (!this.cd || open === this.cdOpen || this.disposed) return;
    this.cdOpen = open;
    // while it plays, the CD grows on the mat so its spinning disc is easy to see
    const player = this.items.find((i) => i.id === 'music')?.root;
    if (player) {
      const fromScale = player.scale.x;
      const toScale = open ? CD_PLAYING_SCALE : 1;
      // (its own tween key: the root's tween is the move onto the mat)
      this.tween(this.cdScaleKey, 0.7, (k) => {
        player.scale.setScalar(fromScale + (toScale - fromScale) * ease(k));
      });
    }
    const lid = this.cd.lid;
    const from = lid.rotation.z;
    const to = open ? CD_OPEN : 0;
    this.tween(lid, 0.6, (k) => {
      lid.rotation.z = from + (to - from) * ease(k);
    });
    this.events.onMusic?.(open);
  }

  /** Switch the desk lamp: its light and bulb fade together. */
  private setLamp(on: boolean) {
    if (on === this.lampOn) return;
    this.lampOn = on;
    const lamp = this.lamp;
    if (lamp) {
      const from = this.lampLevel;
      this.tween(lamp.spot, 0.25, (k) => {
        this.lampLevel = from + ((on ? 1 : 0) - from) * k;
        lamp.spot.intensity = lamp.light * this.lampLevel;
        if (lamp.bulb) lamp.bulb.emissiveIntensity = lamp.glow * this.lampLevel;
      });
    }
    if (this.hovered && this.hovered === this.lampRoot) this.events.onHover?.('lamp', { lidOpen: this.lidOpen, inCase: false, lampOn: on });
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
    if (item.id === 'music') this.setMusic(false);
    this.move(item, item.homePos, item.homeQuat, 0.05);
  }

  private setDown(item: Item, x: number, z: number) {
    const wasOut = this.items.some((i) => i.out);
    item.out = true;
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 0.35);
    const quat = item.homeQuat.clone().premultiply(yaw);
    this.move(item, new THREE.Vector3(x, MAT_Y + item.lift, z), quat, 0, 0.35);
    this.select(item.id);
    if (!wasOut) this.events.onHint?.('double-click anything to take a closer look');
  }

  /** Touch: pop an item out to the next free spot. */
  private tapOut(item: Item) {
    const taken = this.items.filter((i) => i.out).map((i) => i.root.position);
    const free = TAP_SLOTS.find(([x, z]) => taken.every((p) => Math.hypot(p.x - x, p.z - z) > 0.06)) ?? TAP_SLOTS[0];
    const wasOut = this.items.some((i) => i.out);
    item.out = true;
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * 0.35);
    this.move(item, new THREE.Vector3(free[0], MAT_Y + item.lift, free[1]), item.homeQuat.clone().premultiply(yaw), 0.08, 0.6);
    this.select(item.id);
    if (!wasOut) this.events.onHint?.('tap a part again to see where it goes');
  }

  private click(root: THREE.Object3D | null, touch: boolean) {
    const target = root ? this.pickRoots.get(root) : null;
    if (target === 'lamp') {
      // the lamp is a lamp in either view
      this.setLamp(!this.lampOn);
      return;
    }
    if (this.mode === 'terminal') {
      // in the terminal view: the wall note goes to the normal site, anything but the monitor goes back to the desk
      if (target === 'wall-note') this.events.onSimple?.();
      else if (target !== 'monitor') this.setMode('desk');
      return;
    }
    if (target === 'monitor') {
      this.setMode('terminal');
      return;
    }
    if (target === 'sticky') {
      // the note (and the tape on it) in the lid: the normal website
      this.events.onSimple?.();
      return;
    }
    if (!root || !target || target.startsWith('sticker:')) {
      this.select(null);
      return;
    }
    const now = performance.now();
    const double = this.lastClick.root === root && now - this.lastClick.time < DOUBLE_CLICK_MS;
    this.lastClick = { root, time: now };
    if (target === 'case' || target === 'contact') {
      // one click opens or closes the case (a double-click doesn't undo itself)
      if (now - this.lidToggledAt > DOUBLE_CLICK_MS) this.setLid(!this.lidOpen);
      return;
    }
    const item = this.items.find((i) => i.root === root);
    if (!item) return;
    if (double) {
      this.activate(item.id);
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
    this.select(item.id);
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
    if (down && !this.drag && !down.touch && this.mode === 'desk' && Math.hypot(event.clientX - down.x, event.clientY - down.y) > DRAG_THRESHOLD_PX) {
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
    const bounds = MAT_BOUNDS;
    const slack = 0.04;
    target.set(
      THREE.MathUtils.clamp(this.hit.x + offset.x, bounds.minX - slack, bounds.maxX + slack),
      DRAG_Y,
      THREE.MathUtils.clamp(this.hit.z + offset.z, bounds.minZ - slack, bounds.maxZ + slack),
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
    this.select(item.id);
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
      this.select(null);
      return;
    }
    this.setDown(
      item,
      THREE.MathUtils.clamp(x, MAT_BOUNDS.minX, MAT_BOUNDS.maxX),
      THREE.MathUtils.clamp(z, MAT_BOUNDS.minZ, MAT_BOUNDS.maxZ),
    );
  }

  // ---------------------------------------------------------------- keyboard + terminal

  private setMode(mode: DeskMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    // the terminal keeps its screen while you're away; only `clear` wipes it
    if (mode === 'desk') this.stopAutoType();
    this.redraw();
    if (mode === 'terminal') this.select(null);
    this.events.onMode?.(mode);
  }

  /**
   * Opens a site path on the monitor: the camera turns to it and the desk types
   * the matching `cd` for you, so it also shows how the terminal works.
   */
  openOnMonitor(href: string) {
    if (this.disposed) return;
    this.stopAutoType();
    this.select(null);
    this.setMode('terminal');
    const command = `cd ~/${href.replace(/^\/+|\/+$/g, '')}`;
    const t = this.terminal;
    t.input = '';
    this.redraw();
    let i = 0;
    const step = () => {
      if (this.disposed) return;
      if (i < command.length) {
        t.type(command[i++]);
        this.screen.follow();
        this.redraw();
        this.autoType = window.setTimeout(step, AUTO_TYPE_MS);
        return;
      }
      this.autoType = null;
      this.submit();
    };
    // let the camera arrive before typing starts
    this.autoType = window.setTimeout(step, AUTO_TYPE_DELAY_MS);
  }

  private stopAutoType() {
    if (this.autoType !== null) window.clearTimeout(this.autoType);
    this.autoType = null;
  }

  private submit() {
    const action = this.terminal.submit();
    this.redraw();
    if (action?.type === 'exit') window.setTimeout(() => this.setMode('desk'), EXIT_DELAY_MS);
    if (action?.type === 'simple') window.setTimeout(() => this.events.onSimple?.(), 500);
  }

  private redraw() {
    this.cursorOn = true;
    this.cursorClock = 0;
    this.screen.draw(this.terminal, true);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.running || this.disposed || this.covered || isEditable(event.target)) return;
    // typing yourself takes over from a command the desk was typing
    if (this.autoType !== null) {
      this.stopAutoType();
      this.terminal.input = '';
    }
    this.keyboard?.press(event.code);
    // leave focused buttons/links and browser shortcuts alone
    if (isControl(event.target) || event.metaKey) return;
    const t = this.terminal;
    if (event.ctrlKey) {
      if (this.mode === 'terminal' && event.key.toLowerCase() === 'c') {
        t.cancel();
        this.redraw();
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Escape') {
      if (this.mode === 'terminal') this.setMode('desk');
      return;
    }
    if (event.key.length === 1) {
      this.setMode('terminal');
      t.type(event.key);
      this.screen.follow();
      this.redraw();
      event.preventDefault();
      return;
    }
    if (this.mode !== 'terminal') {
      // on the desk, enter opens what you're pointing at, or else the selected part
      const pointed = this.hovered ? this.pickRoots.get(this.hovered) : undefined;
      const target = pointed && (getDeskItem(pointed) || pointed === 'case') ? pointed : this.selectedId;
      if (event.key === 'Enter' && target) {
        this.activate(target);
        event.preventDefault();
      }
      return;
    }
    switch (event.key) {
      case 'Backspace':
        t.backspace();
        this.screen.follow();
        break;
      case 'Enter':
        // friendly mode: enter on an empty prompt runs the highlighted choice
        if (!t.input && t.menu()) t.pickSelection();
        this.submit();
        break;
      case 'ArrowUp':
      case 'ArrowDown': {
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        // friendly mode moves the menu highlight; classic steps through history
        if (t.menu()) t.moveSelection(direction);
        else t.historyStep(direction);
        this.screen.follow();
        break;
      }
      case 'Tab':
        t.complete();
        this.screen.follow();
        break;
      case 'PageUp':
        this.screen.page(-1);
        break;
      case 'PageDown':
        this.screen.page(1);
        break;
      default:
        return;
    }
    this.redraw();
    event.preventDefault();
  };

  /** Mouse wheel / trackpad scrolls the terminal while it's open. */
  private onWheel = (event: WheelEvent) => {
    if (this.mode !== 'terminal') return;
    event.preventDefault();
    this.wheelRemainder += event.deltaMode === 1 ? event.deltaY * WHEEL_ROW_PX : event.deltaY;
    const rows = Math.trunc(this.wheelRemainder / WHEEL_ROW_PX);
    if (!rows) return;
    this.wheelRemainder -= rows * WHEEL_ROW_PX;
    this.screen.scrollBy(rows);
    this.redraw();
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keyboard?.release(event.code);
  };

  private onBlur = () => {
    this.keyboard?.releaseAll();
  };


  /** Camera position that frames the monitor and keyboard for the current aspect. */
  private fitMonitorView() {
    const dir = new THREE.Vector3(0, Math.sin(MONITOR_PITCH), Math.cos(MONITOR_PITCH));
    const points = MONITOR_FRAME.map((p) => new THREE.Vector3(...p));
    const cam = this.camera.clone();
    const fits = (d: number) => {
      cam.position.copy(dir).multiplyScalar(d).add(MONITOR_TARGET);
      cam.lookAt(MONITOR_TARGET);
      cam.updateMatrixWorld();
      return points.every((p) => {
        const q = p.clone().project(cam);
        return Math.abs(q.x) <= 0.92 && Math.abs(q.y) <= 0.86 && q.z < 1;
      });
    };
    let lo = 0.2;
    let hi = 4;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) hi = mid;
      else lo = mid;
    }
    this.monitorPosition.copy(dir).multiplyScalar(hi).add(MONITOR_TARGET);
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
    this.fitMonitorView();
  };

  private loop = () => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.loop);
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.1);

    // the disc turns while its song plays
    // the disc spins up when the case opens and winds down after it closes
    this.cdSpin += ((this.cdOpen ? CD_SPIN : 0) - this.cdSpin) * Math.min(1, dt * 1.6);
    if (this.cd?.disc && this.cdSpin > 0.01) this.cd.disc.rotation.y -= dt * this.cdSpin;

    for (const t of [...this.tweens]) {
      t.t += dt;
      const k = Math.min(1, t.t / t.dur);
      t.update(k);
      if (k >= 1) {
        this.tweens.splice(this.tweens.indexOf(t), 1);
        t.done?.();
      }
    }

    // camera: desk framing (with gentle parallax) blended with the terminal view
    const inView = Math.abs(this.ndc.x) <= 1 && Math.abs(this.ndc.y) <= 1;
    const goal = this.reducedMotion || !inView || this.drag ? new THREE.Vector2() : this.ndc;
    this.parallax.lerp(goal, 1 - Math.exp(-dt * 2.5));
    const yaw = this.parallax.x * 0.03;
    const pitch = PITCH + this.parallax.y * 0.015;
    const deskPosition = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
      .multiplyScalar(this.distance)
      .add(TARGET);
    const wanted = this.mode === 'terminal' ? 1 : 0;
    // a steady glide, eased at both ends (no lurch at the start)
    const step = dt / VIEW_S;
    this.viewMix = this.reducedMotion ? wanted : wanted > this.viewMix ? Math.min(wanted, this.viewMix + step) : Math.max(wanted, this.viewMix - step);
    const mix = ease(this.viewMix);
    this.camera.position.lerpVectors(deskPosition, this.monitorPosition, mix);
    this.camera.lookAt(new THREE.Vector3().lerpVectors(TARGET, MONITOR_TARGET, mix));

    // keys spring back; the terminal cursor blinks while it has focus
    this.keyboard?.update(dt);
    if (this.mode === 'terminal') {
      this.cursorClock += dt;
      if (this.cursorClock > CURSOR_BLINK_S) {
        this.cursorClock = 0;
        this.cursorOn = !this.cursorOn;
        this.screen.draw(this.terminal, this.cursorOn);
      }
    }

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
      this.events.onHover?.(this.drag ? null : target, { lidOpen: this.lidOpen, inCase: !!item && !item.out, lampOn: this.lampOn });
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

/** UVs for a flat round part (the CD), projected straight down onto its X/Z plane. */
function flatUvs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const position = geometry.getAttribute('position');
  if (!box || !position) return;
  const w = box.max.x - box.min.x || 1;
  const d = box.max.z - box.min.z || 1;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uv[i * 2] = (position.getX(i) - box.min.x) / w;
    uv[i * 2 + 1] = (position.getZ(i) - box.min.z) / d;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
