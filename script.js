const body = document.body;
const root = document.documentElement;

const dialogueText = {
  app: "“桌面这边交给我。代码、屏幕、任务和记忆，我会在旁边接住。”",
  map: "“出门的时候我换这套。侧边麻花辫是我的 Map 标记，很好认吧？”",
  autopilot: "“把想法交给工坊，我们让它一轮一轮长成真正能跑的东西。”",
  universe: "“角色、宠物、故事、世界观，都可以慢慢变成能被体验的入口。”",
};

const state = {
  current: "videoIntro",
  qteProgress: 0,
  dragging: false,
  dragStartY: 0,
  dragStartProgress: 0,
  completed: false,
  pointerFrame: 0,
  accent: 0.18,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const doorwayVideo = document.querySelector("#doorwayVideo");
const handleCanvas = document.querySelector("#handleCanvas");
const handleHotspot = document.querySelector("#handleHotspot");
const siteHome = document.querySelector("#siteHome");
const skipIntro = document.querySelector("#skipIntro");
const replayIntro = document.querySelector("#replayIntro");
const dialogue = document.querySelector("#joiDialogue");
const pointerHud = document.querySelector("#pointerHud");
const timeHud = document.querySelector("#timeHud");
const cards = Array.from(document.querySelectorAll("[data-joi-card]"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

let homeTimer = 0;
let shaderController = null;
let doorHandleController = null;
let doorHandleInitPromise = null;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function setQteProgress(value) {
  state.qteProgress = clamp(value);
  root.style.setProperty("--qte-progress", state.qteProgress.toFixed(3));
  doorHandleController?.setProgress(state.qteProgress);

  if (!state.completed && state.qteProgress >= 0.52) {
    completeDoorOpen();
  }
}

function setState(nextState) {
  window.clearTimeout(homeTimer);
  state.current = nextState;
  body.dataset.state = nextState;

  if (nextState === "home") {
    siteHome.removeAttribute("aria-hidden");
    initShader();
    window.requestAnimationFrame(() => {
      siteHome.focus({ preventScroll: true });
      revealVisible();
    });
    return;
  }

  siteHome.setAttribute("aria-hidden", "true");
}

function startIntro() {
  state.completed = false;
  state.dragging = false;
  setQteProgress(0);
  setState("videoIntro");
  window.scrollTo({ top: 0, behavior: "auto" });

  if (!doorwayVideo) {
    armQte();
    return;
  }

  doorwayVideo.muted = true;
  doorwayVideo.currentTime = 0;
  doorwayVideo.play().catch(() => {
    armQte();
  });
}

function armQte() {
  if (state.current === "home" || state.completed) return;
  initDoorHandle3d();
  setQteProgress(0);
  setState("qteLocked");
  handleHotspot?.focus({ preventScroll: true });
}

function completeDoorOpen() {
  if (state.completed) return;
  state.completed = true;
  state.dragging = false;
  setQteProgress(1);
  setState("doorOpen");

  homeTimer = window.setTimeout(
    () => {
      setState("home");
    },
    reduceMotion ? 80 : 680,
  );
}

function resetQteAfterRelease() {
  const start = state.qteProgress;
  const startedAt = performance.now();
  const duration = reduceMotion ? 40 : 240;

  function tick(now) {
    const t = clamp((now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    setQteProgress(start * (1 - eased));
    if (t < 1 && state.current === "qteLocked") {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

if (doorwayVideo) {
  doorwayVideo.addEventListener("ended", armQte);
  doorwayVideo.addEventListener("error", armQte);
  doorwayVideo.addEventListener("loadedmetadata", () => {
    if (state.current === "videoIntro" && doorwayVideo.paused) {
      doorwayVideo.play().catch(() => {});
    }
  });
}

if (handleHotspot) {
  handleHotspot.addEventListener("pointerdown", (event) => {
    if (state.current !== "qteLocked" && state.current !== "qteDragging") return;
    event.preventDefault();
    state.dragging = true;
    state.dragStartY = event.clientY;
    state.dragStartProgress = state.qteProgress;
    setState("qteDragging");
    handleHotspot.setPointerCapture(event.pointerId);
  });

  handleHotspot.addEventListener("pointermove", (event) => {
    if (!state.dragging || state.completed) return;
    const dragDistance = clamp(window.innerHeight * 0.14, 96, 140);
    const delta = event.clientY - state.dragStartY;
    setQteProgress(state.dragStartProgress + delta / dragDistance);
  });

  handleHotspot.addEventListener("pointerup", (event) => {
    if (handleHotspot.hasPointerCapture(event.pointerId)) {
      handleHotspot.releasePointerCapture(event.pointerId);
    }

    if (!state.dragging || state.completed) return;
    state.dragging = false;

    if (state.qteProgress >= 0.5) {
      completeDoorOpen();
      return;
    }

    setState("qteLocked");
    resetQteAfterRelease();
  });

  handleHotspot.addEventListener("pointercancel", () => {
    state.dragging = false;
    if (!state.completed) {
      setState("qteLocked");
      resetQteAfterRelease();
    }
  });

  handleHotspot.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      completeDoorOpen();
    }
  });
}

skipIntro?.addEventListener("click", () => {
  if (doorwayVideo) doorwayVideo.pause();
  setState("home");
});

replayIntro?.addEventListener("click", () => {
  startIntro();
});

function activateCard(card) {
  const key = card.dataset.joiCard;
  state.accent = Number(card.dataset.accent || state.accent);
  root.style.setProperty("--accent-mix", state.accent.toFixed(2));

  cards.forEach((item) => {
    const active = item === card;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-expanded", String(active));
  });

  if (dialogue && dialogueText[key]) {
    dialogue.textContent = dialogueText[key];
  }

  shaderController?.setAccent(state.accent);
}

cards.forEach((card) => {
  card.addEventListener("mouseenter", () => activateCard(card));
  card.addEventListener("focus", () => activateCard(card));
  card.addEventListener("click", () => activateCard(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard(card);
    }
  });
});

const observer =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        { threshold: 0.16 },
      )
    : null;

function revealVisible() {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      item.classList.add("is-visible");
    }
  });
}

if (observer) {
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealVisible();
}

function updateTimeHud() {
  if (!timeHud) return;
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  timeHud.textContent = `GMT+8 ${formatter.format(new Date())}`;
}

updateTimeHud();
window.setInterval(updateTimeHud, 30000);

window.addEventListener("pointermove", (event) => {
  const x = clamp(event.clientX / Math.max(window.innerWidth, 1));
  const y = clamp(event.clientY / Math.max(window.innerHeight, 1));

  if (pointerHud) {
    const px = String(Math.round(x * 9999)).padStart(4, "0");
    const py = String(Math.round(y * 9999)).padStart(4, "0");
    pointerHud.textContent = `${px} X / ${py} Y`;
  }

  if (state.pointerFrame) return;
  state.pointerFrame = window.requestAnimationFrame(() => {
    root.style.setProperty("--pointer-x", x.toFixed(4));
    root.style.setProperty("--pointer-y", y.toFixed(4));
    shaderController?.setPointer(x, y);
    state.pointerFrame = 0;
  });
});

window.addEventListener(
  "scroll",
  () => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = clamp(window.scrollY / maxScroll);
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    shaderController?.setScroll(progress);
    revealVisible();
  },
  { passive: true },
);

function initDoorHandle3d() {
  if (doorHandleController || doorHandleInitPromise || !handleCanvas) {
    return doorHandleInitPromise;
  }

  doorHandleInitPromise = import("./assets/vendor/three.module.js")
    .then((THREE) => {
      const shell = document.querySelector("#handleModelShell");
      if (!shell) return null;

      const renderer = new THREE.WebGLRenderer({
        canvas: handleCanvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0.18, 0.08, 7.2);

      const rootGroup = new THREE.Group();
      rootGroup.position.set(0.04, -0.08, 0);
      rootGroup.rotation.set(-0.03, -0.22, -0.01);
      scene.add(rootGroup);

      const brass = new THREE.MeshPhysicalMaterial({
        color: 0x9f672c,
        roughness: 0.42,
        metalness: 0.78,
        clearcoat: 0.45,
        clearcoatRoughness: 0.32,
      });
      const darkBrass = new THREE.MeshPhysicalMaterial({
        color: 0x6f421d,
        roughness: 0.46,
        metalness: 0.68,
      });
      const highlight = new THREE.MeshBasicMaterial({
        color: 0xffe1a4,
        transparent: true,
        opacity: 0.34,
      });
      const shadow = new THREE.MeshBasicMaterial({
        color: 0x1b120b,
        transparent: true,
        opacity: 0.2,
      });

      function roundedRectShape(width, height, radius) {
        const x = -width / 2;
        const y = -height / 2;
        const shape = new THREE.Shape();
        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        return shape;
      }

      const plateGeometry = new THREE.ExtrudeGeometry(roundedRectShape(1.26, 3.58, 0.3), {
        depth: 0.14,
        bevelEnabled: true,
        bevelSize: 0.045,
        bevelThickness: 0.045,
        bevelSegments: 9,
      });
      plateGeometry.center();
      const plate = new THREE.Mesh(plateGeometry, brass);
      plate.position.set(-0.84, -0.38, -0.12);
      rootGroup.add(plate);

      const plateShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.48, 3.76),
        shadow,
      );
      plateShadow.position.set(-0.7, -0.42, -0.28);
      plateShadow.rotation.z = -0.02;
      rootGroup.add(plateShadow);

      const screwGeometry = new THREE.CylinderGeometry(0.085, 0.085, 0.055, 32);
      screwGeometry.rotateX(Math.PI / 2);
      [
        [-1.28, 1.1],
        [-0.4, 1.1],
        [-1.28, -1.92],
        [-0.4, -1.92],
      ].forEach(([x, y]) => {
        const screw = new THREE.Mesh(screwGeometry, darkBrass);
        screw.position.set(x, y, 0.03);
        rootGroup.add(screw);

        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.014, 0.012), shadow);
        slot.position.set(x, y, 0.07);
        slot.rotation.z = 0.35;
        rootGroup.add(slot);
      });

      const keyholeTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.018, 32),
        shadow,
      );
      keyholeTop.geometry.rotateX(Math.PI / 2);
      keyholeTop.position.set(-0.84, -1.38, 0.08);
      rootGroup.add(keyholeTop);

      const keyholeStem = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.018), shadow);
      keyholeStem.position.set(-0.84, -1.55, 0.08);
      rootGroup.add(keyholeStem);

      const fixedSocket = new THREE.Group();
      fixedSocket.position.set(-1.05, -0.68, 0.1);
      rootGroup.add(fixedSocket);

      const socketBack = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 56), brass);
      socketBack.geometry.rotateX(Math.PI / 2);
      socketBack.position.set(0, 0, 0.05);
      fixedSocket.add(socketBack);

      const socketRing = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.045, 14, 64), darkBrass);
      socketRing.position.set(0, 0, 0.18);
      fixedSocket.add(socketRing);

      const rotatingHandle = new THREE.Group();
      rotatingHandle.position.copy(fixedSocket.position);
      rotatingHandle.position.z += 0.19;
      rootGroup.add(rotatingHandle);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.34, 48), brass);
      hub.geometry.rotateX(Math.PI / 2);
      hub.position.set(0, 0, 0.06);
      rotatingHandle.add(hub);

      const leverGroup = new THREE.Group();
      leverGroup.position.set(0.18, -0.02, 0.02);
      rotatingHandle.add(leverGroup);

      const leverLength = 3.08;
      const leverRadius = 0.17;
      const leverGeometry = new THREE.CapsuleGeometry(leverRadius, leverLength, 8, 36);
      leverGeometry.rotateZ(Math.PI / 2);
      const lever = new THREE.Mesh(leverGeometry, brass);
      lever.position.set(leverLength / 2, 0, 0);
      lever.scale.set(1, 0.72, 0.56);
      leverGroup.add(lever);

      const leverRidge = new THREE.Mesh(
        new THREE.BoxGeometry(2.12, 0.035, 0.018),
        highlight,
      );
      leverRidge.position.set(1.68, 0.12, 0.16);
      leverRidge.rotation.z = -0.015;
      leverGroup.add(leverRidge);

      const endCap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 16), brass);
      endCap.scale.set(1.35, 0.78, 0.55);
      endCap.position.set(leverLength + 0.15, 0.02, 0.02);
      leverGroup.add(endCap);

      const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.035), highlight);
      glint.position.set(1.76, 0.2, 0.32);
      glint.rotation.z = -0.08;
      leverGroup.add(glint);

      const ambient = new THREE.HemisphereLight(0xffecd0, 0x2e1c10, 1.9);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffd68b, 3.2);
      key.position.set(-2.4, 3.2, 4.6);
      scene.add(key);

      const rim = new THREE.PointLight(0xfff1bf, 9, 8);
      rim.position.set(1.9, 1.8, 2.8);
      scene.add(rim);

      let targetProgress = state.qteProgress;
      let visualProgress = targetProgress;
      let width = 0;
      let height = 0;

      function resize() {
        const rect = shell.getBoundingClientRect();
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      function render() {
        visualProgress += (targetProgress - visualProgress) * 0.22;
        const eased = 1 - Math.pow(1 - visualProgress, 2.4);
        rotatingHandle.rotation.z = -0.72 * eased;
        rotatingHandle.rotation.x = 0.08 * eased;
        leverGroup.position.y = -0.03 - 0.1 * eased;
        glint.material.opacity = 0.24 + 0.2 * (1 - eased);
        rootGroup.position.y = -0.12 - 0.12 * eased;
        rootGroup.position.x = 0.15 + 0.04 * eased;
        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
      }

      resize();
      window.addEventListener("resize", resize);
      window.requestAnimationFrame(render);

      doorHandleController = {
        setProgress(value) {
          targetProgress = clamp(value);
        },
      };
      doorHandleController.setProgress(state.qteProgress);
      return doorHandleController;
    })
    .catch((error) => {
      console.warn("Door handle 3D layer failed to load.", error);
      return null;
    });

  return doorHandleInitPromise;
}

function initShader() {
  if (shaderController || reduceMotion) return;
  const canvas = document.querySelector("#shaderCanvas");
  if (!canvas) return;

  const gl =
    canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) ||
    canvas.getContext("experimental-webgl", { alpha: true, antialias: false, depth: false });

  if (!gl) {
    document.body.classList.add("no-webgl");
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    uniform float u_scroll;
    uniform float u_accent;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float lineField(vec2 p, float scale) {
      vec2 g = abs(fract(p * scale) - 0.5);
      float line = min(g.x, g.y);
      return 1.0 - smoothstep(0.0, 0.018, line);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 pointer = (u_pointer - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

      float t = u_time * 0.075;
      float n = noise(p * 3.0 + vec2(t, -t * 0.7));
      float n2 = noise(p * 8.0 - vec2(t * 1.5, t));
      float grid = lineField(p + vec2(n * 0.05, n2 * 0.04), 8.0 + u_scroll * 12.0);
      float halo = 1.0 - smoothstep(0.05, 0.92, distance(p, pointer));
      float sweep = smoothstep(-0.9, 0.9, sin((p.x + p.y) * 5.0 + t * 7.0 + u_scroll * 4.0));

      vec3 cream = vec3(1.0, 0.965, 0.895);
      vec3 ink = vec3(0.09, 0.075, 0.055);
      vec3 amber = vec3(0.86, 0.56, 0.16);
      vec3 coral = vec3(0.92, 0.39, 0.31);
      vec3 aqua = vec3(0.34, 0.74, 0.78);
      vec3 leaf = vec3(0.52, 0.66, 0.38);

      vec3 accentA = mix(aqua, amber, smoothstep(0.0, 0.5, u_accent));
      vec3 accentB = mix(coral, leaf, smoothstep(0.5, 1.0, u_accent));
      vec3 accent = mix(accentA, accentB, sweep * 0.55 + 0.25);

      vec3 color = cream;
      color = mix(color, accent, 0.13 + n * 0.06);
      color = mix(color, ink, grid * 0.075);
      color = mix(color, accent, halo * 0.22);
      color += vec3(n2 * 0.032);

      float alpha = 0.82;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const uniforms = {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    pointer: gl.getUniformLocation(program, "u_pointer"),
    time: gl.getUniformLocation(program, "u_time"),
    scroll: gl.getUniformLocation(program, "u_scroll"),
    accent: gl.getUniformLocation(program, "u_accent"),
  };

  let pointerX = 0.5;
  let pointerY = 0.5;
  let scroll = 0;
  let accent = state.accent;
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(window.innerWidth * dpr));
    height = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, width, height);
  }

  function render(now) {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform2f(uniforms.pointer, pointerX, 1 - pointerY);
    gl.uniform1f(uniforms.time, now * 0.001);
    gl.uniform1f(uniforms.scroll, scroll);
    gl.uniform1f(uniforms.accent, accent);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize);
  window.requestAnimationFrame(render);

  shaderController = {
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    setScroll(value) {
      scroll = value;
    },
    setAccent(value) {
      accent = value;
    },
  };
}

if (new URLSearchParams(window.location.search).get("skipIntro") === "1") {
  setState("home");
} else {
  startIntro();
}
