const body = document.body;
const root = document.documentElement;

const dialogueText = {
  app: "“桌面这边交给我。代码、屏幕、任务和记忆，我会在旁边接住。”",
  map: "“出门的时候我换这套。侧边麻花辫是我的 Map 标记，很好认吧？”",
  autopilot: "“把想法交给工坊，我们让它一轮一轮长成真正能跑的东西。”",
  universe: "“角色、宠物、故事、世界观，都可以慢慢变成能被体验的入口。”",
};

const state = {
  current: "phoneHome",
  qteProgress: 0,
  peepholeProgress: 0,
  dragging: false,
  peepholeDragging: false,
  dragStartY: 0,
  dragStartProgress: 0,
  peepholeStartY: 0,
  peepholeStartProgress: 0,
  completed: false,
  pointerFrame: 0,
  accent: 0.18,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const doorwayVideo = document.querySelector("#doorwayVideo");
const handlePixelShell = document.querySelector("#handlePixelShell");
const handleHotspot = document.querySelector("#handleHotspot");
const joiMapApp = document.querySelector("#joiMapApp");
const peepholeHit = document.querySelector("#peepholeHit");
const siteHome = document.querySelector("#siteHome");
const skipIntro = document.querySelector("#skipIntro");
const replayIntro = document.querySelector("#replayIntro");
const dialogue = document.querySelector("#joiDialogue");
const pointerHud = document.querySelector("#pointerHud");
const timeHud = document.querySelector("#timeHud");
const cards = Array.from(document.querySelectorAll("[data-joi-card]"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

let homeTimer = 0;
let introTimers = [];
let peepholeWheelTimer = 0;
let shaderController = null;
let knockAudioContext = null;

const HANDLE_FRAME = {
  width: 1256,
  height: 720,
  pivotX: 566,
  pivotY: 510,
};

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function clearIntroTimers() {
  introTimers.forEach((timer) => window.clearTimeout(timer));
  introTimers = [];
}

function queueIntro(callback, delay) {
  const timer = window.setTimeout(callback, reduceMotion ? Math.min(delay, 140) : delay);
  introTimers.push(timer);
}

function setQteProgress(value) {
  state.qteProgress = clamp(value);
  root.style.setProperty("--qte-progress", state.qteProgress.toFixed(3));

  if (!state.completed && state.qteProgress >= 0.52) {
    completeDoorOpen();
  }
}

function setPeepholeProgress(value) {
  state.peepholeProgress = clamp(value);
  const progress = state.peepholeProgress;
  root.style.setProperty("--peephole-progress", progress.toFixed(3));
  root.style.setProperty("--peephole-scale", (0.92 + progress * 0.08).toFixed(3));
  root.style.setProperty("--peephole-view-opacity", (0.18 + progress * 0.72).toFixed(3));
  root.style.setProperty("--peephole-view-scale", (0.82 + progress * 0.18).toFixed(3));
  root.style.setProperty("--peephole-view-blur", `${((1 - progress) * 7).toFixed(2)}px`);
  root.style.setProperty("--peephole-shutter-y", `${(progress * -82).toFixed(2)}%`);
  root.style.setProperty("--peephole-pull-opacity", Math.max(0.12, 0.9 - progress * 0.7).toFixed(3));
  root.style.setProperty("--peephole-tunnel-opacity", (1 - progress * 0.68).toFixed(3));

  if (
    !state.completed &&
    (state.current === "peepholeLocked" || state.current === "peepholeDragging") &&
    state.peepholeProgress >= 0.72
  ) {
    openPeephole();
  }
}

function setState(nextState) {
  window.clearTimeout(homeTimer);
  const previousState = state.current;
  state.current = nextState;
  body.dataset.state = nextState;

  if (nextState === "peepholeLocked") {
    state.peepholeDragging = false;
    if (previousState !== "peepholeDragging") {
      setPeepholeProgress(0);
    }
    peepholeHit?.focus({ preventScroll: true });
  }

  if (nextState === "videoIntro") {
    setPeepholeProgress(1);
    playDoorwayVideo();
  }

  if (nextState === "home") {
    clearIntroTimers();
    window.clearTimeout(peepholeWheelTimer);
    if (doorwayVideo) doorwayVideo.pause();
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
  clearIntroTimers();
  window.clearTimeout(peepholeWheelTimer);
  state.completed = false;
  state.dragging = false;
  state.peepholeDragging = false;
  setQteProgress(0);
  setPeepholeProgress(0);
  setState("phoneHome");
  window.scrollTo({ top: 0, behavior: "auto" });

  if (doorwayVideo) {
    doorwayVideo.pause();
    doorwayVideo.currentTime = 0;
  }
  updateHandleLayerMetrics();
}

function playDoorwayVideo() {
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

function ensureKnockAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!knockAudioContext) {
    knockAudioContext = new AudioContext();
  }
  if (knockAudioContext.state === "suspended") {
    knockAudioContext.resume().catch(() => {});
  }
  return knockAudioContext;
}

function scheduleKnock(ctx, time, strength = 1) {
  const osc = ctx.createOscillator();
  const thump = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180, time);
  filter.frequency.exponentialRampToValueAtTime(58, time + 0.16);
  osc.type = "sine";
  osc.frequency.setValueAtTime(118, time);
  osc.frequency.exponentialRampToValueAtTime(46, time + 0.16);
  thump.gain.setValueAtTime(0.0001, time);
  thump.gain.exponentialRampToValueAtTime(0.26 * strength, time + 0.012);
  thump.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
  osc.connect(filter);
  filter.connect(thump);
  thump.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.22);
}

function playKnockPattern() {
  const ctx = ensureKnockAudio();
  if (!ctx) return;
  const now = ctx.currentTime + 0.035;
  scheduleKnock(ctx, now, 0.9);
  scheduleKnock(ctx, now + 0.36, 0.96);
  scheduleKnock(ctx, now + 0.75, 1.05);
}

function openJoiMapFromPhone() {
  if (state.current !== "phoneHome") return;
  ensureKnockAudio();
  setState("mapOpening");
  queueIntro(() => setState("mapHome"), 540);
  queueIntro(() => {
    setState("knocking");
    playKnockPattern();
  }, 1180);
  queueIntro(() => setState("doorTurn"), 2600);
  queueIntro(() => setState("peepholeApproach"), 3580);
  queueIntro(() => setState("peepholeLocked"), 5480);
}

function openPeephole() {
  if (
    state.current !== "peepholeLocked" &&
    state.current !== "peepholeDragging" &&
    state.current !== "peepholeOpening"
  ) {
    return;
  }

  state.peepholeDragging = false;
  window.clearTimeout(peepholeWheelTimer);
  setState("peepholeOpening");
  setPeepholeProgress(1);
  queueIntro(() => setState("videoIntro"), reduceMotion ? 80 : 520);
}

function resetPeepholeAfterRelease() {
  const start = state.peepholeProgress;
  const startedAt = performance.now();
  const duration = reduceMotion ? 40 : 260;

  function tick(now) {
    const t = clamp((now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    setPeepholeProgress(start * (1 - eased));
    if (t < 1 && state.current === "peepholeLocked") {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

function armQte() {
  if (state.current === "home" || state.completed) return;
  updateHandleLayerMetrics();
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

if (joiMapApp) {
  joiMapApp.addEventListener("click", openJoiMapFromPhone);
}

if (peepholeHit) {
  peepholeHit.addEventListener("pointerdown", (event) => {
    if (state.current !== "peepholeLocked" && state.current !== "peepholeDragging") return;
    event.preventDefault();
    window.clearTimeout(peepholeWheelTimer);
    state.peepholeDragging = true;
    state.peepholeStartY = event.clientY;
    state.peepholeStartProgress = state.peepholeProgress;
    setState("peepholeDragging");
    peepholeHit.setPointerCapture(event.pointerId);
  });

  peepholeHit.addEventListener("pointermove", (event) => {
    if (!state.peepholeDragging || state.current === "peepholeOpening") return;
    const dragDistance = clamp(window.innerHeight * 0.2, 112, 190);
    const delta = state.peepholeStartY - event.clientY;
    setPeepholeProgress(state.peepholeStartProgress + delta / dragDistance);
  });

  peepholeHit.addEventListener("pointerup", (event) => {
    if (peepholeHit.hasPointerCapture(event.pointerId)) {
      peepholeHit.releasePointerCapture(event.pointerId);
    }

    if (!state.peepholeDragging || state.current === "peepholeOpening") return;
    state.peepholeDragging = false;

    if (state.peepholeProgress >= 0.68) {
      openPeephole();
      return;
    }

    setState("peepholeLocked");
    resetPeepholeAfterRelease();
  });

  peepholeHit.addEventListener("pointercancel", () => {
    state.peepholeDragging = false;
    if (state.current !== "peepholeOpening") {
      setState("peepholeLocked");
      resetPeepholeAfterRelease();
    }
  });

  peepholeHit.addEventListener(
    "wheel",
    (event) => {
      if (state.current !== "peepholeLocked" && state.current !== "peepholeDragging") return;
      event.preventDefault();
      window.clearTimeout(peepholeWheelTimer);
      if (state.current === "peepholeLocked") {
        setState("peepholeDragging");
      }
      setPeepholeProgress(state.peepholeProgress - event.deltaY / 420);
      if (state.current !== "peepholeOpening") {
        peepholeWheelTimer = window.setTimeout(() => {
          if (state.current === "peepholeDragging") {
            setState("peepholeLocked");
            resetPeepholeAfterRelease();
          }
        }, 220);
      }
    },
    { passive: false },
  );

  peepholeHit.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPeephole();
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

window.addEventListener("resize", updateHandleLayerMetrics);

function updateHandleLayerMetrics() {
  if (!handlePixelShell) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = Math.max(
    viewportWidth / HANDLE_FRAME.width,
    viewportHeight / HANDLE_FRAME.height,
  );
  const renderedWidth = HANDLE_FRAME.width * scale;
  const renderedHeight = HANDLE_FRAME.height * scale;
  const left = (viewportWidth - renderedWidth) / 2;
  const top = (viewportHeight - renderedHeight) / 2;

  handlePixelShell.style.left = `${left}px`;
  handlePixelShell.style.top = `${top}px`;
  handlePixelShell.style.width = `${renderedWidth}px`;
  handlePixelShell.style.height = `${renderedHeight}px`;
  handlePixelShell.style.setProperty("--handle-origin-x", `${HANDLE_FRAME.pivotX * scale}px`);
  handlePixelShell.style.setProperty("--handle-origin-y", `${HANDLE_FRAME.pivotY * scale}px`);
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
