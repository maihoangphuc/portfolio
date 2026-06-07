import * as THREE from "three";
import { RuntimeContext } from "@/lib/experience/runtime/types";
import { N, PW, PH } from "@/constants/experience";
import { PANELS } from "@/constants/panels";
import { DRAG_HINT_FADE_OUT_MS } from "@/lib/experience/runtime/world";

const PANEL_GEOMETRY = new THREE.PlaneGeometry(1, 1, 64, 64);

// Scratch Vector3 reused across the per-frame `updatePanels` calls. The old
// code allocated a new Vector3 (and a closure-captured `meshWorldPos`) every
// frame; hoisting saves ~120 allocations/second on a 40-panel scene.
const _tmpWp = new THREE.Vector3();

const VERTEX_SHADER = `
  #define PI 3.14159265358979323846264338327
  varying vec2 vUv;
  uniform float uDirection;
  uniform float uIntensity;
  uniform float uLimitCurve;
  uniform float uLimitShear;
  uniform float uHoverProgress;
  uniform vec2 uOffsetNoise;
  
  // Perlin noise for the wave effect
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi);
    vec4 ix = Pi.xzxz; vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz; vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    vec4 gy = abs(gx) - 0.5 ;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x); vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z); vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
  }

  float normalized(float value) { return (value + 1.0) * 0.5; }

  void main() {
    vUv = uv;
    vec3 displaced = position;
    
    float normalizedY = uv.y;
    float offsetCurve = uLimitCurve * uIntensity;
    float offsetShear = uLimitShear * uIntensity;
    
    float offset = sin(normalizedY * PI) * offsetCurve;
    
    displaced.x -= uDirection * offset;
    displaced.x -= (normalizedY * -offsetShear) * uDirection;
    
    // Gentle horizontal curve: parabolic, center protrudes ~0.04 over edges
    float curveU = vUv.x * 2.0 - 1.0;
    displaced.z += (1.0 - curveU * curveU) * 0.04;
    
    // Noise wave on hover (Matched from JS 119/121)
    float p = uHoverProgress;
    float n = normalized(cnoise((vUv * 2.) + uOffsetNoise)) * 0.5 + 0.5;
    float gradientSize = 0.3;
    float skewSize = 0.2;
    float progress = p + (p * 2.*gradientSize) + (p * 2.*skewSize) - gradientSize - skewSize;
    float start = progress - gradientSize;
    float end = progress + gradientSize;
    float y = smoothstep(start, end, vUv.x + ((1.0-vUv.y) * skewSize));
    float height = 1.0 - abs(y * 2. - 1.);
    displaced.z += (height * n) * 0.06;

    vec4 modelViewPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uHoverProgress;
  uniform vec3 uColor;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    
    // Matching the grayscale/tint blend from JS 118/120
    vec3 grayscaleTexture = mix(vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114))) * 0.95, uColor, 0.35);
    
    // Hover wave color transition
    float gradientSize = 0.1;
    float skewSize = 0.2;
    float progress = uHoverProgress + (uHoverProgress * 2.*gradientSize) + (uHoverProgress * 2.*skewSize) - gradientSize - skewSize;
    float start = progress - gradientSize;
    float end = progress + gradientSize;
    float y = smoothstep(start, end, vUv.x + ((1.0-vUv.y) * skewSize));
    
    vec3 gradedTexture = mix(tex.rgb, grayscaleTexture, 0.1);
    gradedTexture.r -= 0.01;

    vec3 color = mix(gradedTexture, grayscaleTexture, y);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

// Smoothly scales panels down on narrow viewports so they don't overflow the
// frame at sub-md widths. Linear ramp 1.0 (>=1024px) → 0.55 (<=480px).
function getResponsivePanelScale(): number {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w >= 488) return 1;
  // Below md: fit active panel exactly within (viewport width - global padding 5rem),
  // never larger. Camera at z=11, active panel world z ≈ 3 → distance ≈ 8; FOV vertical = 50°.
  const padding = 80; // 5rem (2.5rem each side)
  const camDist = 8;
  const fov = 50;
  const worldHeight = 2 * camDist * Math.tan(((fov * Math.PI) / 180) / 2);
  const worldWidthAtPanel = worldHeight * (w / h);
  const targetWorldWidth = ((w - padding) / w) * worldWidthAtPanel * 0.88;
  return Math.min(1, targetWorldWidth / PW);
}

function getResponsiveTitleBonus(): number {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 768) return 1;
  if (w <= 480) return 1.35;
  return 1 + ((768 - w) / (768 - 480)) * 0.35;
}

// Title plane local size, used to match canvas aspect to world plane aspect
// so the rasterized text isn't stretched.
const TITLE_PLANE_W = 0.6;
const TITLE_PLANE_H = 0.3;
const TITLE_CANVAS_W = 1024;
const TITLE_CANVAS_H = Math.round(
  (TITLE_CANVAS_W * TITLE_PLANE_H * PH) / (TITLE_PLANE_W * PW)
);
const TITLE_FONT_PX = Math.round(64 * (TITLE_CANVAS_H / 256));
const TITLE_LINE_H = Math.round(72 * (TITLE_CANVAS_H / 256));

function drawTitleOnCanvas(canvas: HTMLCanvasElement, title: string) {
  const ctx2d = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  ctx2d.clearRect(0, 0, W, H);
  ctx2d.fillStyle = "rgba(255,255,255,0.95)";
  const fontStack =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-roboto")
      .trim() || "sans-serif";
  ctx2d.font = `700 ${TITLE_FONT_PX}px "Blaak", ${fontStack}, ui-sans-serif, sans-serif`;
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";
  const lines = title.split("\n");
  const blockH = (lines.length - 1) * TITLE_LINE_H;
  lines.forEach((line, i) =>
    ctx2d.fillText(line, W / 2, H / 2 - blockH / 2 + i * TITLE_LINE_H)
  );
}

function createTitleTexture(title: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TITLE_CANVAS_W;
  canvas.height = TITLE_CANVAS_H;
  drawTitleOnCanvas(canvas, title);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;

  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.load(`700 ${TITLE_FONT_PX}px "Blaak"`).then(() => {
      drawTitleOnCanvas(canvas, title);
      tex.needsUpdate = true;
    });
  }

  return tex;
}

const TITLE_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 d = position;
    // Follow the panel's curve at this title's panel-local x.
    // Title is positioned at panel-local x = -0.5 with scale.x = 0.6,
    // so panel_local_x = 0.6 * position.x - 0.5  ->  curveU = 1.2*position.x - 1.0
    float panelCurveU = 1.2 * position.x - 1.0;
    d.z += (1.0 - panelCurveU * panelCurveU) * 0.04;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(d, 1.0);
  }
`;

const TITLE_FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform sampler2D uTitleTex;
  uniform float uTitleOpacity;
  void main() {
    vec4 t = texture2D(uTitleTex, vUv);
    gl_FragColor = vec4(t.rgb, t.a * uTitleOpacity);
  }
`;

export function createPanels(ctx: RuntimeContext) {
  const { panelGroup, scene } = ctx;
  const textureLoader = new THREE.TextureLoader();

  const panels: THREE.Mesh[] = [];

  for (let i = 0; i < N; i++) {
    const item = PANELS[i % PANELS.length];
    const texture = textureLoader.load(item.url);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uOpacity: { value: 0 },
        uHoverProgress: { value: 0 },
        uDirection: { value: 0 },
        uIntensity: { value: 0 },
        uLimitCurve: { value: 0.05 },
        uLimitShear: { value: 0.25 },
        uOffsetNoise: { value: new THREE.Vector2(0, 1) },
        uColor: { value: new THREE.Color(0x2d3e34) }, // Fixed color: 2965556 -> 0x2d3e34
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(PANEL_GEOMETRY, material);
    mesh.userData.index = i;
    // Set scale to match aspect ratio and PW
    mesh.scale.x = PW;
    mesh.scale.y = PH;

    const panelsPerTurn = 3.5;
    mesh.userData.angle = (i / panelsPerTurn) * Math.PI * -2;

    // Title plane: child of the panel so it inherits rotation/curve.
    // Local size relative to panel: ~half the panel's width, sits at upper-left.
    const titleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTitleTex: { value: createTitleTexture(item.title) },
        uTitleOpacity: { value: 0 },
      },
      vertexShader: TITLE_VERTEX_SHADER,
      fragmentShader: TITLE_FRAGMENT_SHADER,
      transparent: true,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const titleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 32, 8),
      titleMat
    );
    // Title centered vertically on the panel, half over the left edge.
    // Canvas aspect is 2:1 (512x256), so scale matches that ratio.
    titleMesh.scale.set(TITLE_PLANE_W, TITLE_PLANE_H, 1);
    titleMesh.position.set(-0.5, 0, 0.015);
    titleMesh.renderOrder = 5;
    mesh.userData.titleMesh = titleMesh;
    mesh.add(titleMesh);

    panelGroup.add(mesh);
    panels.push(mesh);
  }
  
  panelGroup.position.z = -2.5;
  // Nudge the whole ring right so the off-center side panels read as evenly
  // balanced (paired with the small `pt` left-offset in updatePanels, which
  // keeps the active panel centered on the 3D figure).
  panelGroup.position.x = 0.25;
  scene.add(panelGroup);
  return panels;
}

export function updatePanels(ctx: RuntimeContext) {
  const { state, panelGroup, raycaster, cam, mouse } = ctx;
  const { scrollForLayoutLast, scrollVelVis, introActive, experienceEntryActive, experienceExitActive, experienceExitStartMs, exitReverseMode } = state;

  const yDistance = 2.8;
  const baseRadius = 5.5;
  const panelsPerTurn = 3.5;
  // Camera in loop.ts is yawed by theta=-0.12 (looking from -x side toward origin),
  // so world x=0 projects right-of-center. Offset the panel ring's base rotation
  // so the active panel lands on the camera's view ray, not at world x=0.
  // Extra -0.03 nudges the active (front) panel slightly left to center it on
  // the 3D figure, net of the +0.25 group.position.x ring-balance offset.
  const pt = -0.5 * Math.PI - 0.073 - 0.05;

  const progress = scrollForLayoutLast / (N - 1);
  const edgeBuffer = 0.6;
  const distFromEdge = Math.min(scrollForLayoutLast, (N - 1) - scrollForLayoutLast);
  const edgeFade = Math.min(1, Math.max(0, distFromEdge / edgeBuffer));
  const intensity = Math.abs(scrollVelVis) * 18.0 * edgeFade;
  const direction = Math.sign(scrollVelVis);
  const inExperience = !introActive && !experienceEntryActive && !experienceExitActive;

  // Panels keep their natural helix motion past the last panel (rising and
  // rotating); only the timeline UI hides at progress = 1.
  panelGroup.position.y = progress * yDistance * (N - 1) + 0.3;
  panelGroup.rotation.y = pt + -2 * progress * Math.PI * ((N - 1) / panelsPerTurn);

  // Pass 1: write each panel's transform.
  const ps = getResponsivePanelScale();
  const titleBonus = getResponsiveTitleBonus();
  panelGroup.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    const index = mesh.userData.index;
    const angle = mesh.userData.angle;

    const s = index / (N - 1);
    const a = s - progress;

    // Keep panel size constant — no scale boost when crossing the active
    // center, so panels don't visibly swell while scrolling.
    mesh.scale.set(PW * ps, PH * ps, 1);

    const titleMesh = mesh.userData.titleMesh as THREE.Mesh | undefined;
    if (titleMesh) {
      titleMesh.scale.set(
        TITLE_PLANE_W * titleBonus,
        TITLE_PLANE_H * titleBonus,
        1
      );
    }

    const belowBoost = a > 0 ? THREE.MathUtils.smoothstep(a, 0, 0.1) * 4.0 : 0;
    const aboveBoost = a < 0 ? THREE.MathUtils.smoothstep(-a, 0, 0.1) * -2.0 : 0;
    const centerBoost = a >= 0
      ? Math.exp(-Math.pow(a * 10, 2)) * 0.8
      : Math.exp(-Math.pow(a * 30, 2)) * 0.8;
    const rightSideCos = Math.cos(angle - panelGroup.rotation.y);
    const rightBoost = Math.max(0, rightSideCos) * 1.5;
    const radius = baseRadius + belowBoost + aboveBoost + centerBoost + rightBoost + 5 * a;

    mesh.position.set(
      Math.cos(angle) * radius,
      -1 * index * yDistance,
      Math.sin(angle) * radius
    );

    mesh.rotation.z = THREE.MathUtils.degToRad(-170 * Math.abs(a));
    mesh.rotation.y = -1 * angle - 0.5 * Math.PI + Math.PI;
  });

  // Force matrix refresh so the raycaster sees this frame's positions.
  cam.updateMatrixWorld(true);
  panelGroup.updateMatrixWorld(true);

  // Identify the panel currently in front of the 3D model so only its title shows.
  let frontIndex = -1;
  {
    let frontAbsA = Infinity;
    panelGroup.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const idx = mesh.userData.index as number;
      const sIdx = idx / (N - 1);
      const absA = Math.abs(sIdx - progress);
      mesh.getWorldPosition(_tmpWp);
      if (absA < frontAbsA && _tmpWp.z > 0) {
        frontAbsA = absA;
        frontIndex = idx;
      }
    });
    if (frontAbsA > 0.04) frontIndex = -1;
  }

  let hoveredMesh: THREE.Object3D | null = null;
  if (inExperience) {
    mouse.set(state.mouseX, state.mouseY);
    raycaster.setFromCamera(mouse, cam);
    // Only allow hover on panels in front of the figure (worldZ > 0) and visible.
    const hittable = panelGroup.children.filter((c) => {
      const m = c as THREE.Mesh;
      const mat = m.material as THREE.ShaderMaterial;
      if (mat.uniforms.uOpacity.value < 0.05) return false;
      m.getWorldPosition(_tmpWp);
      return _tmpWp.z > 0;
    });
    const hits = raycaster.intersectObjects(hittable, false);
    if (hits.length > 0) hoveredMesh = hits[0].object;
  }

  // Pass 2: hover + opacity uniforms.
  panelGroup.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    const material = mesh.material as THREE.ShaderMaterial;
    const index = mesh.userData.index;

    const s = index / (N - 1);
    const a = s - progress;

    const isHovered = hoveredMesh === mesh;
    const targetHover = isHovered ? 1.0 : 0.0;
    material.uniforms.uHoverProgress.value = THREE.MathUtils.lerp(material.uniforms.uHoverProgress.value, targetHover, 0.07);

    let opacityMultiplier = 1.0;
    if (introActive) {
      opacityMultiplier = 0;
    } else if (experienceEntryActive) {
      // Hold panels invisible while the drag hint is fading out, then fade them in
      const elapsed = performance.now() - state.experienceEntryStartMs;
      const start = DRAG_HINT_FADE_OUT_MS;
      opacityMultiplier = elapsed < start
        ? 0
        : Math.min(1, (elapsed - start) / 1000);
    } else if (experienceExitActive) {
      opacityMultiplier = exitReverseMode
        ? 0
        : Math.max(0, 1 - (performance.now() - experienceExitStartMs) / 1200);
    }

    const finalOpacity = (1 - Math.abs(8 * a)) * opacityMultiplier;

    material.uniforms.uOpacity.value = Math.max(0, finalOpacity);
    material.uniforms.uIntensity.value = Math.min(1, intensity);
    material.uniforms.uDirection.value = direction;
    const hp = material.uniforms.uHoverProgress.value;
    material.uniforms.uOffsetNoise.value.set(hp * 3, hp * 3);

    mesh.visible = finalOpacity > 0;

    // Title visibility: only the front panel shows its title.
    const titleMesh = mesh.userData.titleMesh as THREE.Mesh | undefined;
    if (titleMesh) {
      const titleMat = titleMesh.material as THREE.ShaderMaterial;
      const target = inExperience && index === frontIndex ? 1 : 0;
      titleMat.uniforms.uTitleOpacity.value = THREE.MathUtils.lerp(
        titleMat.uniforms.uTitleOpacity.value,
        target,
        0.12
      );
      titleMesh.visible = titleMat.uniforms.uTitleOpacity.value > 0.01;
    }
  });
}
