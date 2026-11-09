import * as THREE from 'three';
import { FullScreenQuad, Pass } from 'three/addons/postprocessing/Pass.js';

/** Objects on this layer get outlined. The engine toggles it on hover. */
export const OUTLINE_LAYER = 1;

/**
 * Crisp, solid outline around every mesh on `OUTLINE_LAYER` (no blur/glow).
 *
 * 1. Renders an MSAA mask: the whole scene in black (for occlusion), then the
 *    outlined meshes in white on top.
 * 2. Draws `color` in a ring `thickness` px wide just outside the white mask,
 *    plus a faint dark hairline beyond it so a white outline still reads on
 *    white backgrounds.
 *
 * Put it after OutputPass so the colour is exact (not tone-mapped).
 */
export class SilhouetteOutlinePass extends Pass {
  /** 0..1, lets the engine fade the outline in and out. */
  opacity = 0;

  private mask: THREE.WebGLRenderTarget;
  private black = new THREE.MeshBasicMaterial({ color: '#000000' });
  private white = new THREE.MeshBasicMaterial({ color: '#ffffff', depthFunc: THREE.LessEqualDepth });
  private quad: FullScreenQuad;
  private material: THREE.ShaderMaterial;
  private clearColor = new THREE.Color();

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    { color = '#ffffff', thickness = 2.5 }: { color?: string; thickness?: number } = {},
  ) {
    super();
    this.needsSwap = true;
    this.mask = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tMask: { value: this.mask.texture },
        texel: { value: new THREE.Vector2(1, 1) },
        thickness: { value: thickness },
        color: { value: new THREE.Color(color) },
        opacity: { value: 0 },
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
        uniform sampler2D tMask;
        uniform vec2 texel;
        uniform float thickness;
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;

        void main() {
          vec4 base = texture2D(tDiffuse, vUv);
          float inside = texture2D(tMask, vUv).r;
          float near = 0.0;
          float outer = 0.0;
          for (int i = 0; i < 16; i++) {
            float a = float(i) * 0.39269908; // 2pi / 16
            vec2 dir = vec2(cos(a), sin(a)) * texel;
            near = max(near, texture2D(tMask, vUv + dir * thickness).r);
            near = max(near, texture2D(tMask, vUv + dir * thickness * 0.5).r);
            outer = max(outer, texture2D(tMask, vUv + dir * (thickness + 1.5)).r);
          }
          float edge = clamp(near - inside, 0.0, 1.0) * opacity;
          float hairline = clamp(outer - near, 0.0, 1.0) * opacity * 0.3;
          vec3 rgb = mix(base.rgb, vec3(0.0), hairline);
          gl_FragColor = vec4(mix(rgb, color, edge), base.a);
        }
      `,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  setSize(width: number, height: number) {
    this.mask.setSize(width, height);
    this.material.uniforms.texel.value.set(1 / width, 1 / height);
  }

  /** Outline width in drawing-buffer pixels (scale by pixel ratio). */
  setThickness(px: number) {
    this.material.uniforms.thickness.value = px;
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
  ) {
    const { scene, camera } = this;
    const prev = {
      background: scene.background,
      fog: scene.fog,
      override: scene.overrideMaterial,
      layers: camera.layers.mask,
      autoClear: renderer.autoClear,
      shadows: renderer.shadowMap.autoUpdate,
      alpha: renderer.getClearAlpha(),
    };
    renderer.getClearColor(this.clearColor);

    scene.background = null;
    scene.fog = null;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.mask);
    renderer.setClearColor('#000000', 1);
    renderer.clear();
    renderer.autoClear = false;

    scene.overrideMaterial = this.black;
    renderer.render(scene, camera);
    scene.overrideMaterial = this.white;
    camera.layers.set(OUTLINE_LAYER);
    renderer.render(scene, camera);

    camera.layers.mask = prev.layers;
    scene.overrideMaterial = prev.override;
    scene.background = prev.background;
    scene.fog = prev.fog;
    renderer.autoClear = prev.autoClear;
    renderer.shadowMap.autoUpdate = prev.shadows;
    renderer.setClearColor(this.clearColor, prev.alpha);

    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.opacity.value = this.opacity;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this.quad.render(renderer);
  }

  dispose() {
    this.mask.dispose();
    this.black.dispose();
    this.white.dispose();
    this.material.dispose();
    this.quad.dispose();
  }
}
