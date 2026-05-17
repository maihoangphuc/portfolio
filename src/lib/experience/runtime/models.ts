import * as THREE from "three";
import { rootCssVarToHexInt } from "@/utils/rootCssColor";

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

async function addNamePlane(scene: THREE.Scene) {
  const nameTex = await new THREE.TextureLoader().loadAsync("/text-bg.webp");
  nameTex.anisotropy = 4;
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

  const NAME_BASE_W = 11.5;
  // Effect ported from theyearofgreta.com: simplex-noise vertex displacement
  // + soft sine wipe reveal (uReveal 1→0 = wipe in, 0→1 = wipe out).
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: nameTex },
      uColor: { value: new THREE.Color(nameColor).convertSRGBToLinear() },
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
        // Exact constants from theyearofgreta.com's heading vertex shader:
        // speed=0.2, intensity=0.05, size=0.5 — low frequency, gentle wave.
        // Our plane is wider/farther, so we scale intensity up to keep the
        // perceived wave amplitude similar.
        float speed = 0.2;
        float intensity = 0.35;
        float size = 0.5;
        float n = snoise((uv * size) + (uTime * speed)) * intensity;
        vec3 displaced = position;
        displaced.z = n;
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

  // 10×10 subdivisions so the simplex noise displacement has enough
  // resolution to read as a smooth wave (a single quad would clip flat).
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(NAME_BASE_W, NAME_BASE_W / 2, 10, 10), mat);
  mesh.position.set(0, 1.5, -6);
  mesh.name = "bgName3DIntro";
  scene.add(mesh);

  // Per-mode world-Y deltas (intro vs outro × md+ vs <md). All constants so
  // screen position depends only on viewport, not innerHeight (no resize drift).
  const BASE_POS_Y = mesh.position.y;
  const MOBILE_BREAKPOINT = 768;
  const MOBILE_Y_DELTA = 2;
  const OUTRO_Y_DELTA_DESKTOP = -1.6;
  const OUTRO_Y_DELTA_MOBILE = -0.3;
  const MOBILE_SCALE_MULT = 0.82;
  const FOV_HALF_TAN = Math.tan((50 * Math.PI) / 180 / 2);

  const tmpWorld = new THREE.Vector3();
  const clock = new THREE.Clock();
  let cachedFrac = 1;
  let cachedWidth = -1;
  let outroMode = false;
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
  // Outro reveal driven directly by scroll progress; bypasses the timed lerp.
  let outroRevealValue = 1;
  const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
  const easeInSine = (t: number) => 1 - Math.cos((t * Math.PI) / 2);

  mesh.onBeforeRender = (_r, _s, camera) => {
    if (innerWidth !== cachedWidth) {
      cachedWidth = innerWidth;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const padRem = innerWidth < MOBILE_BREAKPOINT ? 2.5 : 5;
      cachedFrac = Math.max(0.1, (innerWidth - 2 * padRem * remPx) / innerWidth);
    }
    mesh.getWorldPosition(tmpWorld);
    const dist = Math.max(0.1, camera.position.distanceTo(tmpWorld));
    const visH = 2 * dist * FOV_HALF_TAN;
    const visW = visH * (camera as THREE.PerspectiveCamera).aspect;

    const isMobile = innerWidth < MOBILE_BREAKPOINT;
    const yDelta = outroMode
      ? (isMobile ? OUTRO_Y_DELTA_MOBILE : OUTRO_Y_DELTA_DESKTOP)
      : (isMobile ? MOBILE_Y_DELTA : 0);
    mesh.position.y = BASE_POS_Y + yDelta;

    const fitScale = Math.min(1, (visW * cachedFrac) / NAME_BASE_W);
    const s = isMobile ? fitScale * MOBILE_SCALE_MULT : fitScale;
    // Keep scale.z at 1 so the simplex-noise vertex displacement (local Z)
    // isn't squashed when the plane is fit to a narrow viewport.
    mesh.scale.set(s, s, 1);

    mat.uniforms.uTime.value = clock.getElapsedTime();

    if (outroMode) {
      mat.uniforms.uReveal.value = outroRevealValue;
    } else {
      if (revealStartMs !== null) {
        const t = Math.min(1, (performance.now() - revealStartMs) / revealDurationMs);
        revealCurrent = revealFrom + (revealTarget - revealFrom) * revealEaseFn(t);
        if (t >= 1) {
          revealStartMs = null;
          revealCurrent = revealTarget;
        }
      }
      mat.uniforms.uReveal.value = revealCurrent;
    }
  };

  scene.userData.setNameIntroShown = (shown: boolean) => {
    if (shown) outroMode = false;
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
  scene.userData.setOutroReveal = (progress: number) => {
    outroMode = progress > 0;
    if (outroMode) {
      // Outro wipes right-to-left (direction=1); uReveal 1→0 = hidden→visible.
      mat.uniforms.uDirection.value = 1;
    }
    // smoothstep eases the wipe at both ends — matches the gentle reveal feel.
    const u = progress * progress * (3 - 2 * progress);
    outroRevealValue = 1 - u;
    if (!outroMode) {
      // Returning to intro/scroll zone — keep the plane hidden. With
      // direction=1, uReveal=1 = hidden, so it stays out until
      // `setNameIntroShown(true)` triggers the intro wipe-in.
      mat.uniforms.uDirection.value = 1;
      revealCurrent = 1;
      revealTarget = 1;
      revealStartMs = null;
    }
  };
}

export async function loadModels(
  scene: THREE.Scene,
  onProgress: (pct: number) => void,
) {
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

  return group;
}
