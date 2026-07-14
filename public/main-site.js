(() => {
  if (window.__galloMainSiteBooted) return;
  window.__galloMainSiteBooted = true;

  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("#shaderCanvas");
  const cards = Array.from(document.querySelectorAll("[data-joi-card]"));
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const narrationItems = Array.from(document.querySelectorAll("[data-joi-narration]"));
  const characterReveals = Array.from(document.querySelectorAll("[data-character-reveal]"));
  const filmstrip = document.querySelector("[data-filmstrip]");
  const filmstripRows = Array.from(document.querySelectorAll("[data-filmstrip-row]"));
  const stackCards = Array.from(document.querySelectorAll("[data-stack-card]"));
  let shaderController = null;
  let pointerFrame = 0;
  let scrollFrame = 0;
  let accent = 0.18;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  body.dataset.state = "home";
  root.style.setProperty("--pointer-x", "0.5");
  root.style.setProperty("--pointer-y", "0.5");
  root.style.setProperty("--scroll-progress", "0");

  function activateCard(card) {
    accent = Number(card.dataset.accent || accent);
    root.style.setProperty("--accent-mix", accent.toFixed(2));
    cards.forEach((item) => item.classList.toggle("is-active", item === card));
    shaderController?.setAccent(accent);
  }

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => activateCard(card));
    card.addEventListener("focusin", () => activateCard(card));
  });

  function revealVisible() {
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add("is-visible");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const narrationObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const message = visible.target.dataset.joiNarration;
        const assistant = document.querySelector("joi-live2d-assistant");
        if (message && assistant && typeof assistant.say === "function") {
          assistant.say(message, 3600);
          assistant.talk?.(900);
        }
      },
      { threshold: [0.34, 0.58] },
    );
    narrationItems.forEach((item) => narrationObserver.observe(item));
  }

  function updateScrollEffects() {
    scrollFrame = 0;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = clamp(window.scrollY / maxScroll);
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    shaderController?.setScroll(progress);
    updateCharacterReveals();
    updateFilmstrip();
    updateProjectStack();
    revealVisible();
  }

  function updateCharacterReveals() {
    characterReveals.forEach((element) => {
      const characters = Array.from(element.querySelectorAll("[data-character]"));
      if (!characters.length) return;
      if (reduceMotion) {
        characters.forEach((character) => {
          character.style.opacity = "1";
          character.style.transform = "none";
        });
        return;
      }
      const rect = element.getBoundingClientRect();
      const travel = window.innerHeight * 0.65 + rect.height * 0.35;
      const revealProgress = clamp((window.innerHeight * 0.82 - rect.top) / Math.max(travel, 1));
      characters.forEach((character, index) => {
        const start = (index / Math.max(characters.length - 1, 1)) * 0.72;
        const localProgress = clamp((revealProgress - start) / 0.22);
        character.style.opacity = String(0.18 + localProgress * 0.82);
        character.style.transform = `translate3d(0, ${(1 - localProgress) * 12}px, 0)`;
      });
    });
  }

  function updateFilmstrip() {
    if (!filmstrip || !filmstripRows.length) return;
    const rect = filmstrip.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / Math.max(rect.height + window.innerHeight, 1));
    const travel = progress * window.innerWidth * 0.46;
    filmstripRows.forEach((row, index) => {
      const movesRight = row.dataset.direction === "right";
      const base = movesRight ? -window.innerWidth * 0.42 : -window.innerWidth * 0.08;
      const x = base + (movesRight ? travel : -travel);
      row.style.transform = `translate3d(${x}px, 0, 0)`;
    });
  }

  function updateProjectStack() {
    stackCards.forEach((card, index) => {
      const sticky = card.querySelector(".native-project-sticky");
      const nextCard = stackCards[index + 1];
      if (!sticky || !nextCard || reduceMotion) {
        sticky?.style.setProperty("--stack-scale", "1");
        sticky?.style.setProperty("--stack-y", "0px");
        return;
      }
      const nextTop = nextCard.getBoundingClientRect().top;
      const approach = clamp((window.innerHeight - nextTop) / Math.max(window.innerHeight * 0.76, 1));
      sticky.style.setProperty("--stack-scale", (1 - approach * 0.045).toFixed(4));
      sticky.style.setProperty("--stack-y", `${(-approach * 12).toFixed(2)}px`);
    });
  }

  function requestScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = clamp(event.clientX / Math.max(window.innerWidth, 1));
      const y = clamp(event.clientY / Math.max(window.innerHeight, 1));
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", x.toFixed(4));
        root.style.setProperty("--pointer-y", y.toFixed(4));
        shaderController?.setPointer(x, y);
        pointerFrame = 0;
      });
    },
    { passive: true },
  );
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);

  function initShader() {
    if (!canvas || reduceMotion) return;
    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: false, depth: false });
    if (!gl) return;

    const vertexSource = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
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
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x),
          u.y
        );
      }
      float lineField(vec2 p, float scale) {
        vec2 g = abs(fract(p * scale) - 0.5);
        return 1.0 - smoothstep(0.0, 0.018, min(g.x, g.y));
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 ratio = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 p = (uv - 0.5) * ratio;
        vec2 pointer = (u_pointer - 0.5) * ratio;
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
        vec3 accentColor = mix(accentA, accentB, sweep * 0.55 + 0.25);
        vec3 color = mix(cream, accentColor, 0.13 + n * 0.06);
        color = mix(color, ink, grid * 0.075);
        color = mix(color, accentColor, halo * 0.22);
        color += vec3(n2 * 0.032);
        gl_FragColor = vec4(color, 0.82);
      }
    `;

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
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
    let shaderAccent = accent;
    let width = 1;
    let height = 1;

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
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.pointer, pointerX, 1 - pointerY);
      gl.uniform1f(uniforms.time, now * 0.001);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.uniform1f(uniforms.accent, shaderAccent);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      window.requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    window.requestAnimationFrame(render);
    shaderController = {
      setPointer(x, y) { pointerX = x; pointerY = y; },
      setScroll(value) { scroll = value; },
      setAccent(value) { shaderAccent = value; },
    };
  }

  initShader();
  revealVisible();
  requestScrollUpdate();
})();
