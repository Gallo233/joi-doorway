import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const canvas = document.querySelector("#allJoiThreeCanvas");
const stage = document.querySelector("#threeTitleStage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && stage) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.08, 6.2);

  const ambient = new THREE.HemisphereLight(0xfff6e8, 0x5b4030, 2.1);
  const key = new THREE.DirectionalLight(0xffffff, 4.8);
  key.position.set(-2.4, 3.4, 5.2);
  const rim = new THREE.DirectionalLight(0xf2a84c, 2.4);
  rim.position.set(4.2, 1.2, 3.6);
  const glint = new THREE.PointLight(0xffffff, 14, 10);
  glint.position.set(-1.9, 1.4, 2.4);
  scene.add(ambient, key, rim, glint);

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x181510,
    metalness: 0.24,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    reflectivity: 0.82,
    transparent: true,
    opacity: 0,
  });

  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc88d45,
    metalness: 0.38,
    roughness: 0.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.16,
    transparent: true,
    opacity: 0,
  });

  let textMesh = null;
  let textWidth = 1;
  let startTime = performance.now();
  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  function setMaterialOpacity(value) {
    frontMaterial.opacity = value;
    sideMaterial.opacity = value;
  }

  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1.3 ? 7.2 : 6.1;
    camera.updateProjectionMatrix();

    if (textMesh) {
      const visibleHeight =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      const scalar = Math.min(1.32, Math.max(0.48, (visibleWidth * 0.84) / textWidth));
      textMesh.scale.setScalar(scalar);
    }
  }

  function onPointerMove(event) {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    target.x = THREE.MathUtils.clamp(x - 0.5, -0.5, 0.5);
    target.y = THREE.MathUtils.clamp(y - 0.5, -0.5, 0.5);
  }

  function onPointerLeave() {
    target.x = 0;
    target.y = 0;
  }

  function tick(now) {
    const elapsed = (now - startTime) / 1000;
    pointer.x += (target.x - pointer.x) * 0.08;
    pointer.y += (target.y - pointer.y) * 0.08;

    if (textMesh) {
      const intro = reduceMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 0.1, 1.28);
      setMaterialOpacity(intro);
      textMesh.rotation.x = -pointer.y * 0.34 + Math.sin(elapsed * 0.7) * 0.022;
      textMesh.rotation.y = pointer.x * 0.54 + Math.sin(elapsed * 0.45) * 0.03;
      textMesh.rotation.z = pointer.x * -0.05;
      textMesh.position.x = pointer.x * 0.22;
      textMesh.position.y = -0.04 + pointer.y * -0.13 + Math.sin(elapsed * 0.9) * 0.035;
      textMesh.position.z = intro * 0.12;
    }

    glint.position.x = -1.9 + Math.sin(elapsed * 0.65) * 1.7 + pointer.x * 2.2;
    glint.position.y = 1.35 + Math.cos(elapsed * 0.52) * 0.6 - pointer.y * 1.3;
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  async function boot() {
    try {
      const font = await new FontLoader().loadAsync(
        "assets/three-fonts/helvetiker_bold.typeface.json",
      );
      const geometry = new TextGeometry("all joi", {
        font,
        size: 1.1,
        height: 0.3,
        curveSegments: 18,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.024,
        bevelOffset: 0,
        bevelSegments: 6,
      });
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      textWidth = Math.max(box.max.x - box.min.x, 1);
      geometry.center();

      textMesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
      textMesh.rotation.set(0.08, -0.1, 0);
      scene.add(textMesh);

      stage.classList.add("is-three-ready");
      resize();
      startTime = performance.now();
      window.requestAnimationFrame(tick);
    } catch (error) {
      stage.classList.add("is-three-failed");
      console.warn("Unable to load All Joi 3D title", error);
    }
  }

  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("resize", resize);
  boot();
}
