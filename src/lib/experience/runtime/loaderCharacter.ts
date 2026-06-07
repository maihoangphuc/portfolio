import * as THREE from "three";
import { rootCssVarToHexInt } from "@/utils/rootCssColor";
import { easeOutCubic01 } from "@/lib/experience/runtime/math";

/**
 * Wavy outlined letter "p" shown behind the model-load HUD, ported from
 * theyearofgreta.com's preloader "g":
 *  - a 1×1 plane (50×50 segments) whose vertices are displaced along z by
 *    2D Perlin noise sampled at `uv * uSize + uOffset + uTime * uSpeed`;
 *  - the fragment shader uses an outline mask texture's red channel as alpha
 *    (mask = black canvas with a thin white strokeText of the glyph);
 *  - LAYERS copies are stacked with a different noise phase (`LAYER_OFFSET*i`)
 *    and decreasing opacity, which reads as a floating multi-layer 3D outline.
 */

// The reference mask is its brand font's "g": a chunky geometric rounded sans
// whose outline fills the whole 512px texture with a ~1px hairline stroke.
// Fredoka 600 (loaded in layout.tsx as --font-loader-glyph) is the closest
// match for that letterform.
const GLYPH = "p";
const GLYPH_FONT_CSS_VAR = "--font-loader-glyph";
const GLYPH_FONT_WEIGHT = 600;
const MASK_SIZE = 512;

// Tuning values lifted verbatim from the reference site's "Intro" state.
const NOISE_SIZE = 4;
const NOISE_SPEED = 1;
const LAYERS = 4;
const LAYER_OFFSET = 10;
const LAYER_OPACITY_FALLOFF = 0.2;

// Show: short delay then a slow, clearly visible ramp (opacity 0→1, noise
// intensity 1.4→0.4, scale 1→1.2). Hide mirrors it when loading completes
// (opacity →0, intensity →0.8), dissolving while the scene canvases fade in.
const SHOW_DELAY_MS = 300;
const SHOW_DURATION_MS = 1800;
const HIDE_DELAY_MS = 100;
const HIDE_DURATION_MS = 1300;

/** Total fade-out length — callers sequence the scene reveal after this. */
export const LOADER_CHAR_HIDE_MS = HIDE_DELAY_MS + HIDE_DURATION_MS;
const INTENSITY_FROM = 1.4;
const INTENSITY_SHOWN = 0.4;
const INTENSITY_HIDDEN = 0.8;
const SCALE_FROM = 1;
const SCALE_SHOWN = 1.2;

const easeSineInOut = (t: number) => -(Math.cos(Math.PI * Math.min(1, Math.max(0, t))) - 1) / 2;
const easeSineOut = (t: number) => Math.sin((Math.min(1, Math.max(0, t)) * Math.PI) / 2);
const easeCubicInOut = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const VERTEX_SHADER = /* glsl */ `
// Classic Perlin 2D noise "cnoise" — Stefan Gustavson (MIT),
// https://github.com/ashima/webgl-noise — same include the reference uses.
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

varying vec2 vUv;

uniform float uTime;
uniform float uSpeed;
uniform float uSize;
uniform float uIntensity;
uniform float uScale;
uniform float uOffset;

void main() {
  vUv = uv;
  float offset = uOffset + (uTime * uSpeed);
  float noise = cnoise((uv * uSize) + offset) * uIntensity;
  vec3 displaced = position * uScale;
  displaced.z += noise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
uniform sampler2D uMask;

varying vec2 vUv;

void main() {
  vec4 mask = texture2D(uMask, vUv);
  float alpha = mask.r * uOpacity;
  gl_FragColor = vec4(uColor, alpha);
}
`;

/**
 * Black square with a thin white outline of the glyph — the white line is
 * the only thing the fragment shader lets through (mask.r as alpha), so
 * these two literals are texture data, not themed UI colors.
 *
 * The outline is extracted from a solid fill (fill − 1px erosion) rather than
 * strokeText: stroking exposes the font's raw overlapping contours (the stem
 * path crossing through the bowl), while the reference mask is the contour of
 * the merged letter shape.
 */
function drawGlyphMask(canvas: HTMLCanvasElement) {
  const c2d = canvas.getContext("2d")!;
  const S = canvas.width;

  // Probe at a fixed size, then rescale so the glyph fills ~98% of the mask —
  // the reference glyph runs nearly edge to edge.
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue(GLYPH_FONT_CSS_VAR)
      .trim() || "sans-serif";
  const probePx = 100;
  const fontFor = (px: number) => `${GLYPH_FONT_WEIGHT} ${px}px ${family}`;
  c2d.font = fontFor(probePx);
  const probe = c2d.measureText(GLYPH);
  const probeH =
    probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent || probePx;
  const fontPx = (probePx * S * 0.98) / probeH;

  // Solid merged letter (non-zero winding collapses contour overlaps).
  const solid = document.createElement("canvas");
  solid.width = solid.height = S;
  const sc = solid.getContext("2d")!;
  sc.font = fontFor(fontPx);
  sc.textAlign = "center";
  const m = sc.measureText(GLYPH);
  const y = S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  sc.fillStyle = "#fff";
  sc.fillText(GLYPH, S / 2, y);

  // 1px 8-neighbourhood erosion: keep only pixels white in every shifted copy.
  const eroded = document.createElement("canvas");
  eroded.width = eroded.height = S;
  const ec = eroded.getContext("2d")!;
  ec.drawImage(solid, 0, 0);
  ec.globalCompositeOperation = "destination-in";
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx !== 0 || dy !== 0) ec.drawImage(solid, dx, dy);
    }
  }

  // Outline ring = solid − eroded.
  const ring = document.createElement("canvas");
  ring.width = ring.height = S;
  const rc = ring.getContext("2d")!;
  rc.drawImage(solid, 0, 0);
  rc.globalCompositeOperation = "destination-out";
  rc.drawImage(eroded, 0, 0);

  c2d.fillStyle = "#000";
  c2d.fillRect(0, 0, S, S);
  // Soft hairline — the reference mask is a ~1px line blurred by JPEG
  // compression, which is what keeps the letter faint.
  c2d.filter = "blur(0.5px)";
  c2d.drawImage(ring, 0, 0);
  c2d.filter = "none";
}

export type LoaderCharacter = {
  /** Advance + render one frame. Returns false once the hide has finished. */
  update: () => boolean;
  /** Begin the fade-out (call when models finish loading). */
  startHide: () => void;
  dispose: () => void;
};

export function createLoaderCharacter(canvas: HTMLCanvasElement): LoaderCharacter {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  // Camera sits far back on purpose: the noise displaces vertices along z, so
  // a close camera turns that into harsh perspective warping (sharp creases).
  // At distance 6 the same amplitude reads as the reference's gentle wobble.
  const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 20);
  cam.position.set(0, 0, 6);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = MASK_SIZE;
  maskCanvas.height = MASK_SIZE;
  drawGlyphMask(maskCanvas);
  const maskTexture = new THREE.CanvasTexture(maskCanvas);
  maskTexture.minFilter = THREE.LinearFilter;
  maskTexture.generateMipmaps = false;
  // The webfont may not be ready on first paint — redraw the mask once it is.
  const glyphFamily = getComputedStyle(document.documentElement)
    .getPropertyValue(GLYPH_FONT_CSS_VAR)
    .trim();
  if (glyphFamily) {
    document.fonts
      ?.load(`${GLYPH_FONT_WEIGHT} ${MASK_SIZE}px ${glyphFamily}`)
      .then(() => {
        drawGlyphMask(maskCanvas);
        maskTexture.needsUpdate = true;
      })
      .catch(() => {});
  }

  const color = new THREE.Color(rootCssVarToHexInt("--color-web-loader-char"));
  const geometry = new THREE.PlaneGeometry(1, 1, 50, 50);
  const group = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];
  for (let i = 0; i < LAYERS; i++) {
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uColor: { value: color },
        uOpacity: { value: 0 },
        uMask: { value: maskTexture },
        uTime: { value: 0 },
        uSpeed: { value: NOISE_SPEED },
        uSize: { value: NOISE_SIZE },
        uOffset: { value: LAYER_OFFSET * i },
        uIntensity: { value: INTENSITY_FROM },
        uScale: { value: SCALE_FROM },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    materials.push(material);
    group.add(new THREE.Mesh(geometry, material));
  }
  scene.add(group);

  const startMs = performance.now();
  let hideStartMs = 0;
  // Values frozen at the moment startHide() is called, so a hide that
  // interrupts the show animation fades from wherever it actually was.
  let hideFromOpacity = 1;
  let hideFromIntensity = INTENSITY_SHOWN;
  let disposed = false;
  let lastW = 0;
  let lastH = 0;

  function animatedValues(nowMs: number) {
    const showT = (nowMs - startMs - SHOW_DELAY_MS) / SHOW_DURATION_MS;
    let opacity = easeSineInOut(showT);
    let intensity = INTENSITY_FROM + (INTENSITY_SHOWN - INTENSITY_FROM) * easeCubicInOut(showT);
    const scale = SCALE_FROM + (SCALE_SHOWN - SCALE_FROM) * easeOutCubic01(showT);
    if (hideStartMs > 0) {
      const hideT = (nowMs - hideStartMs - HIDE_DELAY_MS) / HIDE_DURATION_MS;
      opacity = hideFromOpacity * (1 - easeSineOut(hideT));
      intensity = hideFromIntensity + (INTENSITY_HIDDEN - hideFromIntensity) * easeCubicInOut(hideT);
    }
    return { opacity, intensity, scale };
  }

  return {
    update() {
      if (disposed) return false;
      const nowMs = performance.now();
      if (hideStartMs > 0 && nowMs >= hideStartMs + HIDE_DELAY_MS + HIDE_DURATION_MS) {
        return false;
      }

      if (innerWidth !== lastW || innerHeight !== lastH) {
        lastW = innerWidth;
        lastH = innerHeight;
        cam.aspect = lastW / lastH;
        cam.updateProjectionMatrix();
        renderer.setSize(lastW, lastH, false);
        // Match the reference: the fully-shown letter (plane × SCALE_SHOWN)
        // spans ~31% of the viewport height, clamped on narrow viewports.
        const visibleH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        const target = Math.min(visibleH * 0.31, visibleH * cam.aspect * 0.5);
        group.scale.setScalar(target / SCALE_SHOWN);
      }

      const { opacity, intensity, scale } = animatedValues(nowMs);
      const time = (nowMs - startMs) / 1000;
      for (let i = 0; i < materials.length; i++) {
        const u = materials[i].uniforms;
        u.uTime.value = time;
        u.uIntensity.value = intensity;
        u.uScale.value = scale;
        u.uOpacity.value = Math.max(0, opacity - LAYER_OPACITY_FALLOFF * i);
      }
      renderer.render(scene, cam);
      return true;
    },
    startHide() {
      if (hideStartMs > 0) return;
      hideStartMs = performance.now();
      const current = animatedValues(hideStartMs);
      hideFromOpacity = current.opacity;
      hideFromIntensity = current.intensity;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      maskTexture.dispose();
      for (const m of materials) m.dispose();
      renderer.dispose();
      // Leave no stale frame behind on the transparent canvas.
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
