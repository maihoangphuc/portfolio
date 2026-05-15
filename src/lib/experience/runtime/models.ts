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
const clayDiffuseWrapScale = (1 + CLAY_DIFFUSE_WRAP).toFixed(2);
clayMaterial.onBeforeCompile = (shader) => {
  const needle =
    "const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometryNormal, directLight.direction ) );";
  const wrapped = `const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + ${CLAY_DIFFUSE_WRAP.toFixed(2)} ) / ${clayDiffuseWrapScale} );`;
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

export async function loadModels(
  scene: THREE.Scene,
  onProgress: (pct: number) => void,
) {
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

  const glbUrls = ["/3d.glb", "/rock.glb"] as const;
  type GlbUrl = (typeof glbUrls)[number];
  const fileProgress: Partial<Record<GlbUrl, { loaded: number; total: number }>> = {};

  const getTargetPct = () => {
    let sumLoaded = 0;
    let sumTotal = 0;
    let anyWithoutTotal = false;
    for (const u of glbUrls) {
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
      const started = glbUrls.filter((u) => fileProgress[u] && fileProgress[u]!.loaded > 0).length;
      return Math.min(99, (started / glbUrls.length) * 55);
    }
    return 0;
  };

  const loadGLB = (url: GlbUrl) =>
    new Promise<import("three/examples/jsm/loaders/GLTFLoader.js").GLTF>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const prev = fileProgress[url];
          fileProgress[url] = {
            loaded: prev?.total && prev.total > 0 ? prev.total : 1,
            total: prev?.total && prev.total > 0 ? prev.total : 1,
          };
          onProgress(getTargetPct());
          resolve(gltf);
        },
        (xhr) => {
          const total = xhr.lengthComputable ? xhr.total : 0;
          fileProgress[url] = { loaded: xhr.loaded, total };
          onProgress(getTargetPct());
        },
        reject,
      );
    });

  const [figure, rock] = await Promise.all([loadGLB("/3d.glb"), loadGLB("/rock.glb")]);

  onProgress(99);
  syncClayMaterialColorFromCss();

  const group = new THREE.Group();
  figure.scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = clayMaterial;
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    }
  });
  figure.scene.scale.setScalar(2.5);
  figure.scene.position.y = 0.4;
  group.add(figure.scene);

  rock.scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  rock.scene.scale.setScalar(3.9);
  rock.scene.position.y = -1.5;
  group.add(rock.scene);

  // 3D "Hoang Phuc" intro plane: world-anchored backdrop behind the figure.
  // Lives in the scene root (NOT parented to the figure group) so it never
  // rotates or scales with the model. Visibility is driven by explore/return
  // transitions just like the original DOM bg-name's `hidden` class — fades
  // in on intro, out on Explore, back in on Return.
  const nameTex = await new THREE.TextureLoader().loadAsync("/text-bg.webp");
  nameTex.anisotropy = 4;
  // We sample only the green channel as an alpha mask — flag it as raw data
  // so the GPU doesn't run an sRGB→linear conversion on every fetch.
  nameTex.colorSpace = THREE.NoColorSpace;
  // Read both RGB and alpha from --palette-web-name so the 3D plane matches
  // the original 2D `bg-web-name` color exactly (e.g. #1c132459 → opacity ~0.35).
  const rawName = getComputedStyle(document.documentElement)
    .getPropertyValue("--palette-web-name")
    .trim();
  const nameMatch = rawName.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  const nameColor = nameMatch ? parseInt(nameMatch[1], 16) : 0xffffff;
  const nameAlpha = nameMatch && nameMatch[2] ? parseInt(nameMatch[2], 16) / 255 : 1;

  const NAME_BASE_W = 10;
  // ShaderMaterial so the outro reveal can run as a per-pixel right-to-left
  // wipe (matches the original CSS linear-gradient mask). Intro state uses
  // `uIntroOpacity` directly (no wipe); outro state ramps `uOutroOpacity`
  // and slides `uReveal` from 0 → 1 to expose the text from the right edge.
  const introMat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: nameTex },
      uColor: { value: new THREE.Color(nameColor).convertSRGBToLinear() },
      uIntroOpacity: { value: 0 },
      uOutroOpacity: { value: 0 },
      uReveal: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uIntroOpacity;
      uniform float uOutroOpacity;
      uniform float uReveal;
      varying vec2 vUv;
      void main() {
        float mask = texture2D(uMap, vUv).g;
        // Right-to-left wipe (vUv.x=1 reveals first, vUv.x=0 last).
        // Mirrors: linear-gradient(to right, transparent T-0.25, black T).
        float t = 1.0 - uReveal;
        float wipe = smoothstep(t - 0.25, t, vUv.x);
        float a = mask * max(uIntroOpacity, uOutroOpacity * wipe);
        if (a < 0.005) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  const nameMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(NAME_BASE_W, NAME_BASE_W / 2),
    introMat,
  );
  nameMesh.position.set(0, 0.5, -2);
  nameMesh.name = "bgName3DIntro";
  scene.add(nameMesh);

  // Auto-fit cache + opacity-blend state for the single name plane.
  const FOV_HALF_TAN = Math.tan((50 * Math.PI) / 180 / 2);
  const tmpWorld = new THREE.Vector3();
  let cachedFrac = 1;
  let cachedWidth = -1;
  // `introCurrent` lerps toward `introTarget` (Explore/Return). The outro
  // uniforms are written directly by setOutroReveal — no lerp needed because
  // outroProgress already drives them smoothly via scroll.
  let introTarget = nameAlpha;
  let introCurrent = 0;
  nameMesh.onBeforeRender = (_r, _s, camera) => {
    if (innerWidth !== cachedWidth) {
      cachedWidth = innerWidth;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const padRem = innerWidth < 768 ? 2.5 : 5;
      cachedFrac = Math.max(0.1, (innerWidth - 2 * padRem * remPx) / innerWidth);
    }
    nameMesh.getWorldPosition(tmpWorld);
    const dist = Math.max(0.1, camera.position.distanceTo(tmpWorld));
    const visW = 2 * dist * FOV_HALF_TAN * (camera as THREE.PerspectiveCamera).aspect;
    nameMesh.scale.setScalar(Math.min(1, (visW * cachedFrac) / NAME_BASE_W));
    introCurrent += (introTarget - introCurrent) * 0.08;
    if (Math.abs(introCurrent - introTarget) < 0.001) introCurrent = introTarget;
    introMat.uniforms.uIntroOpacity.value = introCurrent;
  };
  scene.userData.setNameIntroShown = (shown: boolean) => {
    introTarget = shown ? nameAlpha : 0;
  };
  // Outro reveal: `uReveal` is the linear wipe position; `uOutroOpacity`
  // follows the same FAINT/RAMP density curve the original DOM mask used.
  scene.userData.setOutroReveal = (progress: number) => {
    const FAINT = 0.28;
    const RAMP_START = 0.85;
    const factor =
      progress < RAMP_START
        ? FAINT * (progress / RAMP_START)
        : FAINT + (1 - FAINT) * ((progress - RAMP_START) / (1 - RAMP_START));
    introMat.uniforms.uReveal.value = progress;
    introMat.uniforms.uOutroOpacity.value = nameAlpha * factor;
  };

  group.position.set(0, -0.8, 0);
  group.scale.setScalar(2.6);
  scene.add(group);

  return group;
}
