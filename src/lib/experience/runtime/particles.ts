import * as THREE from "three";
import { rootCssVarToHexInt } from "@/utils/rootCssColor";

/**
 * Dust particles orbiting the figure, ported from theyearofgreta.com:
 * 50 tiny white gl.POINTS whose positions are fully shader-driven —
 * each seed orbits a vertical cylinder hugging the model (radius pulsing
 * between uRange.x and uRange.y), drifts upward on a looping `fract` ramp,
 * and twinkles with a depth-keyed sine on alpha (max 0.5). The whole cloud
 * fades in (uOpacity 0 -> 1, sine.out over 2s) the first time it renders,
 * matching the reference's "Landing/In" opacity tween.
 *
 * The reference tuned its cylinder for a ~1-unit-tall figure (radius
 * 0.3–0.41, height 1, base at the feet); here everything is scaled by the
 * figure's actual bounding box so the cloud hugs our model identically.
 * The Points object is parented to the figure group, so it follows the
 * model's position/scale through intro, scroll and exit — matching the
 * original, whose particle scene lived inside the scaling world group.
 */

const COUNT = 50;
// Cylinder radius limits as a fraction of figure height (reference: 0.3/0.41
// around a height-1 figure).
const RANGE_MIN = 0.3;
const RANGE_MAX = 0.41;
// Per-frame uTime increments — orbit (x) and rise (y) speeds from the
// reference's update loop.
const ORBIT_STEP = 0.005;
const RISE_STEP = 0.0015;
// Opacity fade-in. The reference starts the dust at uOpacity 0 and ramps it to 1
// with a `sine.out` ease over 2s when the figure flies in (its "Landing/In"
// gsap timeline). We reproduce that on the first frame the cloud renders.
const FADE_IN_MS = 2000;
// gl_PointSize in CSS pixels. The reference sets gl_PointSize=2 on a renderer
// with a FIXED pixelRatio of 2 — i.e. 1 CSS px specks.
const SIZE_PX = 1;

const VERTEX_SHADER = /* glsl */ `
uniform vec2 uTime;
uniform vec2 uRange;
uniform float uSize;
uniform float uBaseY;
uniform float uHeight;

varying float v_depth;

float getRange() {
  float minRange = uRange.x;
  float rangeDelta = uRange.y - uRange.x;
  // unique per-seed phase, translated by time — pulses the orbit radius
  float factor = 0.5 + cos(position.x * position.y + uTime.x) * 0.5;
  return minRange + (rangeDelta * factor);
}

void main() {
  vec3 pos = position;
  // first/second half of the circle — seeds orbit at getRange() radius
  pos.x = sin(uTime.x + position.x) * getRange();
  // looping upward drift across the figure's height, starting at its feet
  pos.y = uBaseY + fract(uTime.y + position.y) * uHeight;
  pos.z = cos(uTime.x + position.x) * getRange();

  v_depth = pos.z;

  gl_PointSize = uSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
#define DEPTH_MULT 20.0
uniform vec3 uColor;
uniform float uOpacity;

uniform vec2 uTime;

varying float v_depth;

void main(void) {
  gl_FragColor = vec4(uColor, (sin(uTime.x + DEPTH_MULT * v_depth) * uOpacity) * 0.5);
}
`;

export type FigureParticles = {
  object: THREE.Points;
  /** Advance the orbit/rise clocks one frame. */
  update: () => void;
  dispose: () => void;
};

/**
 * @param figureBox figure's bounding box in the parent group's local space —
 *   sizes the cylinder (radius/height) and anchors its base at the feet.
 */
export function createFigureParticles(
  figureBox: THREE.Box3,
  pixelRatio: number,
): FigureParticles {
  const height = figureBox.max.y - figureBox.min.y;
  const uniforms = {
    uTime: { value: new THREE.Vector2() },
    uRange: { value: new THREE.Vector2(RANGE_MIN * height, RANGE_MAX * height) },
    uColor: { value: new THREE.Color(rootCssVarToHexInt("--color-web-white")) },
    uSize: { value: SIZE_PX * pixelRatio },
    // Starts invisible; ramps to 1 over FADE_IN_MS — see update().
    uOpacity: { value: 0 },
    uBaseY: { value: figureBox.min.y },
    uHeight: { value: height },
  };

  // Seeds: random points in [-π, π]³ — pure phase inputs, the vertex shader
  // derives every actual position from them.
  const TAU = Math.PI * 2;
  const seeds = new Float32Array(COUNT * 3);
  for (let i = 0; i < seeds.length; i++) {
    seeds[i] = Math.random() * TAU - 0.5 * TAU;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(seeds, 3));
  // Shader-driven positions never leave the figure's surroundings; skip
  // frustum culling so the seeds' raw bounds don't cull the cloud.
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms,
    transparent: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  // Stamped on the first update() so the fade-in starts when the cloud first
  // renders (the reference fades in as the figure flies into the landing).
  let fadeStartMs: number | null = null;

  return {
    object: points,
    update() {
      uniforms.uTime.value.x += ORBIT_STEP;
      uniforms.uTime.value.y += RISE_STEP;

      if (fadeStartMs === null) fadeStartMs = performance.now();
      const t = Math.min(1, (performance.now() - fadeStartMs) / FADE_IN_MS);
      // sine.out ease, matching the reference's gsap tween.
      uniforms.uOpacity.value = Math.sin((t * Math.PI) / 2);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
