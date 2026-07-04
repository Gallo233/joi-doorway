import * as THREE from "./assets/three.module.js";

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
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.16, 8.2);

  const group = new THREE.Group();
  group.rotation.set(-0.05, -0.16, -0.03);
  scene.add(group);

  const ambient = new THREE.HemisphereLight(0xfffbec, 0xb6d3ff, 2.15);
  const key = new THREE.DirectionalLight(0xffffff, 4.8);
  key.position.set(-3.8, 4.8, 6.2);
  const rim = new THREE.DirectionalLight(0xb9d8ff, 2.6);
  rim.position.set(4.6, 2.1, 4.4);
  const warm = new THREE.PointLight(0xfff3b7, 4.8, 12);
  warm.position.set(-2.8, -1.2, 3.4);
  const glint = new THREE.PointLight(0xffffff, 9, 9);
  glint.position.set(1.6, 1.8, 3.4);
  scene.add(ambient, key, rim, warm, glint);

  const tubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc8dcff,
    emissive: 0x7f9ed6,
    emissiveIntensity: 0.08,
    metalness: 0.02,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    reflectivity: 0.7,
    transparent: true,
    opacity: 0,
  });

  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdbe7ff,
    emissive: 0x9db8e8,
    emissiveIntensity: 0.06,
    metalness: 0.02,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    transparent: true,
    opacity: 0,
  });

  const shineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  let textWidth = 1;
  let startTime = performance.now();
  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  function v(x, y, z = 0) {
    return new THREE.Vector3(x, y, z);
  }

  function ellipse(cx, cy, rx, ry, count = 28, z = 0, start = 0) {
    return Array.from({ length: count }, (_, index) => {
      const a = start + (index / count) * Math.PI * 2;
      return v(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z + Math.sin(a) * 0.04);
    });
  }

  function addCap(point, radius, material) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.04, 28, 18),
      material,
    );
    cap.position.copy(point);
    group.add(cap);
    return cap;
  }

  function makeTube(points, radius = 0.18, closed = false, material = tubeMaterial) {
    const curve = new THREE.CatmullRomCurve3(points, closed, "catmullrom", 0.42);
    const geometry = new THREE.TubeGeometry(curve, closed ? 120 : 88, radius, 28, closed);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    if (!closed) {
      addCap(points[0], radius, material);
      addCap(points[points.length - 1], radius, material);
    }

    return { curve, mesh };
  }

  function makeShine(points, radius = 0.034, closed = false) {
    const lifted = points.map((point) => v(point.x - 0.035, point.y + 0.09, point.z + 0.17));
    const curve = new THREE.CatmullRomCurve3(lifted, closed, "catmullrom", 0.42);
    const geometry = new THREE.TubeGeometry(curve, closed ? 90 : 64, radius, 12, closed);
    const mesh = new THREE.Mesh(geometry, shineMaterial);
    group.add(mesh);
    return mesh;
  }

  function buildWord() {
    const strokes = [
      { points: ellipse(-3.75, -0.24, 0.42, 0.58, 32, 0.02, 0.32), closed: true },
      {
        points: [v(-3.38, 0.42, 0.06), v(-3.18, 0.12, 0.08), v(-2.95, -0.55, 0.05), v(-2.68, -0.82, 0.02)],
      },
      {
        points: [v(-2.3, -0.92), v(-2.36, -0.15, 0.04), v(-2.28, 1.18, 0.12), v(-2.02, 1.5, 0.08), v(-1.86, 0.98)],
      },
      {
        points: [v(-1.42, -0.94), v(-1.5, -0.1, 0.04), v(-1.43, 1.22, 0.13), v(-1.17, 1.48, 0.08), v(-1.02, 0.95)],
      },
      {
        points: [v(0.05, 1.1, 0.06), v(-0.02, 0.2, 0.1), v(-0.13, -1.18, 0.05), v(-0.48, -1.44, 0.04), v(-0.78, -1.05, 0.02)],
      },
      { points: ellipse(1.06, -0.18, 0.54, 0.62, 34, 0.07, 0.1), closed: true, material: sideMaterial },
      {
        points: [v(2.05, -0.92, 0.04), v(2.06, -0.18, 0.08), v(2.09, 0.78, 0.12)],
        material: sideMaterial,
      },
    ];

    strokes.forEach(({ points, closed = false, material = tubeMaterial }) => {
      makeTube(points, 0.19, closed, material);
      makeShine(points, closed ? 0.026 : 0.032, closed);
    });

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 34, 22), sideMaterial);
    dot.position.set(2.12, 1.28, 0.08);
    group.add(dot);
    const dotShine = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 10), shineMaterial);
    dotShine.position.set(2.04, 1.38, 0.31);
    group.add(dotShine);

    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    group.position.sub(center);
    textWidth = Math.max(size.x, 1);
  }

  function setOpacity(value) {
    tubeMaterial.opacity = value * 0.56;
    sideMaterial.opacity = value * 0.48;
    shineMaterial.opacity = value * 0.24;
  }

  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1.2 ? 9.8 : 8.2;
    camera.updateProjectionMatrix();

    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const scalar = Math.min(0.96, Math.max(0.46, (visibleWidth * 0.7) / textWidth));
    group.scale.setScalar(scalar);
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
    pointer.x += (target.x - pointer.x) * 0.075;
    pointer.y += (target.y - pointer.y) * 0.075;
    const intro = reduceMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 0.1, 1.36);
    setOpacity(intro);

    group.rotation.x = -0.06 - pointer.y * 0.22 + Math.sin(elapsed * 0.65) * 0.028;
    group.rotation.y = -0.16 + pointer.x * 0.36 + Math.sin(elapsed * 0.42) * 0.04;
    group.rotation.z = -0.035 - pointer.x * 0.03;
    group.position.x = pointer.x * 0.2;
    group.position.y = -0.08 - pointer.y * 0.12 + Math.sin(elapsed * 0.78) * 0.035;
    group.position.z = intro * 0.16;

    glint.position.x = 1.4 + Math.sin(elapsed * 0.72) * 2.2 + pointer.x * 2.4;
    glint.position.y = 1.8 + Math.cos(elapsed * 0.53) * 0.7 - pointer.y * 1.6;
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  try {
    buildWord();
    resize();
    stage.classList.add("is-three-ready");
    startTime = performance.now();
    window.requestAnimationFrame(tick);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);
  } catch (error) {
    stage.classList.add("is-three-failed");
    console.warn("Unable to build All Joi soft 3D title", error);
  }
}
