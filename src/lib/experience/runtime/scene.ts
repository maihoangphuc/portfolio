import * as THREE from "three";
import { rootCssVarToHexInt } from "@/utils/rootCssColor";
import { Dom } from "@/lib/experience/runtime/types";

export function initScene(dom: Dom) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 80);
  cam.position.set(0, 0.5, 11);

  const renderer = new THREE.WebGLRenderer({
    canvas: dom.c,
    antialias: true,
    alpha: true,
  });
  // Cap pixel ratio at 1.5 — on Retina/4K screens, 2× would have the GPU shade
  // 4× more fragments for ~no visual gain on a stylized 3D scene like this.
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  // updateStyle=false: CSS `inset: 0` handles canvas dimensions, no need for
  // Three.js to write inline pixel styles that fight the rule each resize.
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  scene.add(new THREE.AmbientLight(rootCssVarToHexInt("--color-web-white"), 0.3));

  const sun = new THREE.DirectionalLight(rootCssVarToHexInt("--color-web-white"), 1.2);
  sun.position.set(5, 10, 7.5);
  sun.castShadow = true;
  // 1024² is plenty for a single contact-shadow under a stylized clay figure;
  // 2048² is 4× the GPU shadow-pass cost for an imperceptible quality bump.
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 30;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const back = new THREE.DirectionalLight(rootCssVarToHexInt("--color-web-white"), 0.6);
  back.position.set(-5, 3, -5);
  scene.add(back);

  const rim1 = new THREE.DirectionalLight(rootCssVarToHexInt("--color-web-white"), 1.5);
  rim1.position.set(-10, 5, -10);
  scene.add(rim1);

  const rim2 = new THREE.DirectionalLight(rootCssVarToHexInt("--color-web-white"), 1.0);
  rim2.position.set(10, 5, -10);
  scene.add(rim2);

  return { scene, cam, renderer, sun };
}
