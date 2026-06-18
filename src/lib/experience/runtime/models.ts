import * as THREE from "three";
import { rootCssVarToHexInt } from "@/utils/rootCssColor";
import { LG_BREAKPOINT } from "@/constants/experience";
import { FigureParticles } from "@/lib/experience/runtime/particles";

export const clayMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.95,
  metalness: 0.0,
  reflectivity: 0.5,
  envMapIntensity: 0.65,
  clearcoat: 0.0,
});

const CLAY_DIFFUSE_WRAP = 0.5;
clayMaterial.onBeforeCompile = (shader) => {
  const wrapScale = (1 + CLAY_DIFFUSE_WRAP).toFixed(2);
  const needle =
    "const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometryNormal, directLight.direction ) );";
  const wrapped = `const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + ${CLAY_DIFFUSE_WRAP.toFixed(2)} ) / ${wrapScale} );`;
  if (!shader.fragmentShader.includes(needle)) return;
  shader.fragmentShader = shader.fragmentShader.replace(needle, wrapped);
};
clayMaterial.customProgramCacheKey = () => `clay-wrap-${CLAY_DIFFUSE_WRAP}`;

export function syncClayMaterialColorFromCss() {
  const hex =
    rootCssVarToHexInt("--color-web-scene-neutral") ||
    rootCssVarToHexInt("--palette-web-scene-neutral");
  if (hex !== 0) clayMaterial.color.setHex(hex);
}

const GLB_URLS = ["/3d.glb", "/rock.glb"] as const;
type GlbUrl = (typeof GLB_URLS)[number];

async function makeGltfLoader() {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.register((parser) => {
    const tl = new THREE.TextureLoader(parser.options.manager);
    tl.setCrossOrigin(parser.options.crossOrigin);
    tl.setRequestHeader(parser.options.requestHeader);
    parser.textureLoader = tl;
    return { name: "EXPERIENCE_texture_loader_compat" };
  });
  return loader;
}

function makeProgressTracker(onProgress: (pct: number) => void) {
  const fileProgress: Partial<Record<GlbUrl, { loaded: number; total: number }>> = {};
  const compute = () => {
    let sumLoaded = 0;
    let sumTotal = 0;
    let anyWithoutTotal = false;
    for (const u of GLB_URLS) {
      const p = fileProgress[u];
      if (!p) continue;
      if (p.total > 0) {
        sumLoaded += p.loaded;
        sumTotal += p.total;
      } else if (p.loaded > 0) {
        anyWithoutTotal = true;
      }
    }
    if (sumTotal > 0) return Math.min(99, (sumLoaded / sumTotal) * 100);
    if (anyWithoutTotal) {
      const started = GLB_URLS.filter((u) => fileProgress[u] && fileProgress[u]!.loaded > 0).length;
      return Math.min(99, (started / GLB_URLS.length) * 55);
    }
    return 0;
  };
  return {
    update(url: GlbUrl, loaded: number, total: number) {
      fileProgress[url] = { loaded, total };
      onProgress(compute());
    },
    complete(url: GlbUrl) {
      const prev = fileProgress[url];
      const total = prev?.total && prev.total > 0 ? prev.total : 1;
      fileProgress[url] = { loaded: total, total };
      onProgress(compute());
    },
  };
}

function applyShadowFlags(root: THREE.Object3D, receive: boolean) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = receive;
  });
}

// 3D "Hoang Phuc" intro/outro plane. World-anchored backdrop behind the figure,
// lives in the scene root (not parented to the figure group) so it never
// inherits rotation/scale.
// Simplex 2D noise (Ashima Arts, MIT). Reused for the wavy vertex
// displacement on the intro/outro name plane — matches the technique
// theyearofgreta.com uses for its background heading.
const SIMPLEX_2D_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

// Render the "Hoang Phuc" heading to a canvas in the brand serif (Blaak Bold)
// instead of shipping a baked image. theyearofgreta.com sets its heading in
// clean, level, evenly-tracked brand type (the previous baked image had the
// text slanted and unevenly spaced). Two left-aligned lines, the block
// centred, sized so the widest line fills ~92% of the canvas — used as a
// luminance mask by the name-plane shader.
async function makeNameTexture(): Promise<THREE.CanvasTexture> {
  const W = 3072;
  const H = 1536;
  const lines = ["Hoang", "Phuc"];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;

  // Ensure the brand serif is loaded before measuring/drawing — otherwise the
  // canvas falls back to a default serif and the metrics are wrong.
  try {
    await document.fonts.load('700 400px "Blaak"');
    await document.fonts.ready;
  } catch {
    /* fall back to the generic serif below */
  }

  const fontAt = (px: number) => `700 ${px}px "Blaak", serif`;
  c.font = fontAt(100);
  const widthsAt100 = lines.map((l) => c.measureText(l).width);
  const maxW100 = Math.max(...widthsAt100);
  const fontPx = (100 * (W * 0.92)) / maxW100;
  const maxW = maxW100 * (fontPx / 100);
  const leftX = (W - maxW) / 2;

  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);
  c.font = fontAt(fontPx);
  c.fillStyle = "#fff";
  c.textAlign = "left";
  c.textBaseline = "middle";
  const gap = fontPx * 0.92;
  const y0 = H / 2 - gap / 2;
  lines.forEach((l, i) => c.fillText(l, leftX, y0 + i * gap));

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

async function addNamePlane(scene: THREE.Scene) {
  const nameTex = await makeNameTexture();
  // Sampled as a single-channel mask — flag raw so GPU skips sRGB→linear.
  nameTex.colorSpace = THREE.NoColorSpace;

  // Match the original 2D `bg-web-name` color: both RGB and alpha read from
  // --palette-web-name (e.g. #1c132459 → opacity ~0.35).
  const rawName = getComputedStyle(document.documentElement)
    .getPropertyValue("--palette-web-name")
    .trim();
  const nameMatch = rawName.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  const nameColor = nameMatch ? parseInt(nameMatch[1], 16) : 0xffffff;
  const nameAlpha = nameMatch && nameMatch[2] ? parseInt(nameMatch[2], 16) / 255 : 1;
  // Pass the raw sRGB channel values straight through. The fragment shader
  // writes gl_FragColor directly to the (sRGB) framebuffer without any
  // linear→sRGB encoding, so the uniform must already hold sRGB values —
  // otherwise the displayed colour comes out far too dark (e.g. #352d40 → near
  // black). Don't use THREE.Color here: with ColorManagement on it would
  // convert the hex to linear, which is exactly the double-darkening we avoid.
  const nameRgb = new THREE.Vector3(
    ((nameColor >> 16) & 0xff) / 255,
    ((nameColor >> 8) & 0xff) / 255,
    (nameColor & 0xff) / 255,
  );

  const NAME_BASE_W = 11.5;
  // Effect ported from theyearofgreta.com: simplex-noise vertex displacement
  // + soft sine wipe reveal (uReveal 1→0 = wipe in, 0→1 = wipe out).
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: nameTex },
      uColor: { value: nameRgb },
      uOpacity: { value: nameAlpha },
      // Following theyearofgreta.com convention: tween uReveal 0→1 in both
      // directions; uDirection both flips wipe side AND inverts uReveal's
      // meaning. With (direction=1, reveal=1): plane is fully hidden.
      uReveal: { value: 1 },
      uDirection: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader: `
      ${SIMPLEX_2D_GLSL}
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        // Ported from theyearofgreta.com's heading shader: a single scrolling
        // noise field displaces the plane on Z (depth) ONLY. With a perspective
        // camera that depth ripple reads as a gentle liquid bulge — the text
        // breathes toward/away from the viewer while staying level. (Displacing
        // on Y instead bobs the letters up/down at different heights, which
        // looks like a wrong, skewed wobble — greta never does that.)
        // greta's heading is nearly still: the text stays level and crisp, with
        // only a slow, barely-there depth shimmer (one broad noise blob drifting
        // diagonally). Keep uIntensity small so letters don't visibly bulge —
        // just a faint living drift. (greta's raw uniforms are uSize 1.0,
        // uSpeed 0.5, uIntensity 1.0, but their plane geometry is unit-sized and
        // scaled differently; in our local plane units a small amplitude gives
        // the same near-static read.) scale.z is kept at 1 (see below).
        float uSpeed = 0.14;
        float uSize = 1.0;
        float uIntensity = 0.19;
        float offset = uTime * uSpeed;
        float noise = snoise(uv * uSize + offset) * uIntensity;
        vec3 displaced = position;
        displaced.z += noise;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uReveal;
      uniform float uDirection;
      varying vec2 vUv;
      void main() {
        float mask = texture2D(uMap, vUv).g;
        float x = 1.0 - vUv.x;
        float reveal = uReveal;
        if (uDirection <= 0.0) {
          x = vUv.x;
          reveal = 1.0 - uReveal;
        }
        float gradient = 1.0 - (sin(x * reveal) + reveal);
        float a = mask * max(0.0, gradient) * uOpacity;
        if (a < 0.005) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    // depthWrite off so the plane doesn't block things behind it from
    // rendering. depthTest stays ON so the (opaque, depth-writing) figure
    // and rock in front naturally occlude the plane where they overlap.
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // 48×48 subdivisions (greta uses 50×50) so the Z depth-ripple stays smooth
  // across the plane instead of faceting on a coarse grid.
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(NAME_BASE_W, NAME_BASE_W / 2, 48, 48), mat);
  mesh.position.set(0, 1.5, -6);
  mesh.name = "bgName3DIntro";
  scene.add(mesh);

  // Per-mode world-Y deltas. All constants so screen position depends only on
  // viewport, not innerHeight (no resize drift). The intro text-bg is a wide
  // element, so it lifts up below xl (bottom margin) to clear the UI. The name
  // only ever shows in the intro (theyearofgreta.com's outro has no background
  // name), so these are all intro tuning.
  const BASE_POS_Y = mesh.position.y;
  const XL_BREAKPOINT = 1280;
  const SM_BREAKPOINT = 640;
  const XS_BREAKPOINT = 480;
  const NARROW_Y_DELTA = 1.0; // intro: lift up below xl so it clears the bottom (lower = a bit more top margin)
  const SM_Y_DELTA = 1.8; // intro: at sm and below lift higher (more bottom margin) so the heading reaches the figure's neck
  const NARROW_SCALE_MULT = 0.82; // intro: extra shrink below xl for breathing room
  const SM_SCALE_MULT = 0.78; // intro: shrink more at sm and below
  const XS_SCALE_MULT = 0.92; // intro: bump back up at xs and below (narrow fit makes it read small)
  // Global shrink applied to the name scale — keeps the text a touch smaller
  // than the full padding-fit.
  const NAME_SCALE_MULT = 0.9;
  const FOV_HALF_TAN = Math.tan((50 * Math.PI) / 180 / 2);

  const tmpWorld = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const clock = new THREE.Clock();
  let cachedFrac = 1;
  let cachedWidth = -1;
  // Reveal animation state — matches theyearofgreta.com's GSAP timeline:
  //   wipe-in:  direction=-1, uReveal tweens 0→1 over 1.6s, sine.out
  //   wipe-out: direction= 1, uReveal tweens 0→1 over 0.8s, sine.in
  // (uReveal+uDirection interplay decides whether 0 or 1 means visible.)
  const WIPE_IN_MS = 1600;
  const WIPE_OUT_MS = 800;
  let revealCurrent = 1; // hidden at startup — with direction=1, reveal=1 → gradient=0
  let revealTarget = 1;
  let revealFrom = 1;
  let revealStartMs: number | null = null;
  let revealDurationMs = WIPE_IN_MS;
  let revealEaseFn: (t: number) => number = (t) => Math.sin((t * Math.PI) / 2);
  const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
  const easeInSine = (t: number) => 1 - Math.cos((t * Math.PI) / 2);

  mesh.onBeforeRender = (_r, _s, camera) => {
    if (innerWidth !== cachedWidth) {
      cachedWidth = innerWidth;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // Insets match the CSS layout breakpoint (lg): 2.5rem each side below it.
      const padRem = innerWidth < LG_BREAKPOINT ? 2.5 : 5;
      cachedFrac = Math.max(0.1, (innerWidth - 2 * padRem * remPx) / innerWidth);
    }
    mesh.getWorldPosition(tmpWorld);
    const dist = Math.max(0.1, camera.position.distanceTo(tmpWorld));
    const visH = 2 * dist * FOV_HALF_TAN;
    const visW = visH * (camera as THREE.PerspectiveCamera).aspect;

    const belowXl = innerWidth < XL_BREAKPOINT;
    const belowSm = innerWidth < SM_BREAKPOINT;
    const belowXs = innerWidth < XS_BREAKPOINT;
    const yDelta = belowSm ? SM_Y_DELTA : belowXl ? NARROW_Y_DELTA : 0;
    mesh.position.y = BASE_POS_Y + yDelta;

    // Horizontal centre: world x=0 doesn't project to screen centre because the
    // camera is yawed (theta in loop.ts). Cast the camera's view-ray to the
    // plane's depth and sit the plane there, so it's centred at any width.
    camera.getWorldDirection(camDir);
    if (Math.abs(camDir.z) > 1e-4) {
      const tCenter = (mesh.position.z - camera.position.z) / camDir.z;
      mesh.position.x = camera.position.x + tCenter * camDir.x;
    }

    // Billboard around Y so the plane always faces the camera head-on. The
    // camera is yawed (theta in loop.ts); a world-fixed plane would keystone
    // and the text would slant. theyearofgreta keeps its heading flat to the
    // camera so it stays level — match that by yawing the plane to the camera
    // (kept upright: only Y rotates, no pitch).
    mesh.rotation.y = Math.atan2(
      camera.position.x - mesh.position.x,
      camera.position.z - mesh.position.z,
    );

    const fitScale = Math.min(1, (visW * cachedFrac) / NAME_BASE_W);
    const baseScale =
      fitScale *
      (belowXs
        ? XS_SCALE_MULT
        : belowSm
          ? SM_SCALE_MULT
          : belowXl
            ? NARROW_SCALE_MULT
            : 1);
    const s = baseScale * NAME_SCALE_MULT;
    // Keep scale.z at 1 so the simplex-noise vertex displacement (local Z)
    // isn't squashed when the plane is fit to a narrow viewport.
    mesh.scale.set(s, s, 1);

    mat.uniforms.uTime.value = clock.getElapsedTime();

    if (revealStartMs !== null) {
      const t = Math.min(1, (performance.now() - revealStartMs) / revealDurationMs);
      revealCurrent = revealFrom + (revealTarget - revealFrom) * revealEaseFn(t);
      if (t >= 1) {
        revealStartMs = null;
        revealCurrent = revealTarget;
      }
    }
    mat.uniforms.uReveal.value = revealCurrent;
  };

  scene.userData.setNameIntroShown = (shown: boolean) => {
    if (shown) {
      // Wipe IN: direction=-1, tween uReveal 0→1, sine.out, 1.6s
      mat.uniforms.uDirection.value = -1;
      revealFrom = 0;
      revealTarget = 1;
      revealCurrent = 0;
      revealDurationMs = WIPE_IN_MS;
      revealEaseFn = easeOutSine;
    } else {
      // Wipe OUT: direction=1, tween uReveal 0→1, sine.in, 0.8s
      mat.uniforms.uDirection.value = 1;
      revealFrom = 0;
      revealTarget = 1;
      revealCurrent = 0;
      revealDurationMs = WIPE_OUT_MS;
      revealEaseFn = easeInSine;
    }
    revealStartMs = performance.now();
  };
  // theyearofgreta.com's outro shows ONLY the figure plus the right-side
  // statement block on a clean background — the big background name belongs to
  // the intro and never returns. So the name plane stays hidden throughout the
  // outro (the loop still calls this on every outro frame; we just keep it out).
  // With direction=1 + uReveal=1 the wipe gradient collapses to 0 → fully
  // hidden, the same resting state `setNameIntroShown(false)` leaves it in.
  scene.userData.setOutroReveal = () => {
    mat.uniforms.uDirection.value = 1;
    revealCurrent = 1;
    revealTarget = 1;
    revealStartMs = null;
  };
}

export async function loadModels(
  scene: THREE.Scene,
  onProgress: (pct: number) => void,
): Promise<{ group: THREE.Group; particles: FigureParticles | null }> {
  const loader = await makeGltfLoader();
  const tracker = makeProgressTracker(onProgress);

  const loadGLB = (url: GlbUrl) =>
    new Promise<import("three/examples/jsm/loaders/GLTFLoader.js").GLTF>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          tracker.complete(url);
          resolve(gltf);
        },
        (xhr) => tracker.update(url, xhr.loaded, xhr.lengthComputable ? xhr.total : 0),
        reject,
      );
    });

  const [figure, rock] = await Promise.all([loadGLB("/3d.glb"), loadGLB("/rock.glb")]);

  onProgress(99);
  syncClayMaterialColorFromCss();

  figure.scene.traverse((child) => {
    const m = child as THREE.Mesh;
    if (m.isMesh) m.material = clayMaterial;
  });
  applyShadowFlags(figure.scene, false);
  figure.scene.scale.setScalar(2.5);
  figure.scene.position.y = 0.4;

  applyShadowFlags(rock.scene, true);
  rock.scene.scale.setScalar(3.9);
  rock.scene.position.y = -1.5;

  const group = new THREE.Group();
  group.add(figure.scene);
  group.add(rock.scene);

  await addNamePlane(scene);

  group.position.set(0, -0.8, 0);
  group.scale.setScalar(2.6);
  scene.add(group);

  return { group, particles: null };
}
