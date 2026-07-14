(() => {
  if (window.__joiParticlePrologueBooted) return;
  const section = document.querySelector("[data-particle-prologue]");
  if (!section) return;
  window.__joiParticlePrologueBooted = true;

  const stage = section.querySelector("[data-particle-stage]");
  const canvas = section.querySelector("[data-particle-canvas]");
  const trigger = section.querySelector("[data-particle-trigger]");
  const formLabel = section.querySelector("[data-particle-form]");
  const announcement = section.querySelector("[data-particle-announcement]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  const FORM_LABELS = [
    "FORM 00 / NEBULA",
    "FORM 01 / JOI",
    "FORM 02 / GALLO",
    "FORM 03 / JOI.PXL",
  ];
  const FORM_ANNOUNCEMENTS = [
    "Joi has returned to a planetary particle cloud.",
    "The particles have reformed into the Joi wordmark.",
    "The particles have reformed into the Gallo wordmark.",
    "The particles have reformed into Joi's smiling pixel portrait. Her eyes follow the pointer.",
  ];
  const JOI_PALETTE = [
    [0.96, 0.89, 0.83],
    [0.88, 0.45, 0.35],
    [0.35, 0.23, 0.2],
    [0.47, 0.58, 0.64],
    [0.84, 0.56, 0.28],
    [0.72, 0.5, 0.42],
  ];

  let disposed = false;

  function seededRandom(seed = 1) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createTextCanvas(text) {
    const surface = document.createElement("canvas");
    surface.width = 1400;
    surface.height = 520;
    const context = surface.getContext("2d");
    context.clearRect(0, 0, surface.width, surface.height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const size = text === "Joi" ? 380 : 315;
    context.font = `800 ${size}px Arial, Helvetica, sans-serif`;
    context.fillText(text, surface.width / 2, surface.height * 0.51);
    return surface;
  }

  function createJoiFaceCanvas() {
    const surface = document.createElement("canvas");
    surface.width = 640;
    surface.height = 640;
    const context = surface.getContext("2d");
    const ellipse = (x, y, rx, ry, color) => {
      context.beginPath();
      context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    };

    context.clearRect(0, 0, 640, 640);

    context.fillStyle = "#f4e7db";
    context.beginPath();
    context.moveTo(180, 640);
    context.quadraticCurveTo(195, 495, 266, 466);
    context.lineTo(374, 466);
    context.quadraticCurveTo(455, 500, 476, 640);
    context.closePath();
    context.fill();

    context.fillStyle = "#5d4037";
    context.beginPath();
    context.moveTo(119, 301);
    context.quadraticCurveTo(112, 85, 320, 63);
    context.quadraticCurveTo(529, 80, 519, 307);
    context.quadraticCurveTo(502, 475, 414, 489);
    context.lineTo(221, 486);
    context.quadraticCurveTo(132, 454, 119, 301);
    context.closePath();
    context.fill();

    ellipse(154, 306, 31, 48, "#efc4ac");
    ellipse(486, 306, 31, 48, "#efc4ac");
    ellipse(320, 294, 151, 178, "#f5cdb6");

    context.fillStyle = "#67483d";
    context.beginPath();
    context.moveTo(174, 218);
    context.quadraticCurveTo(193, 81, 322, 86);
    context.quadraticCurveTo(442, 86, 477, 208);
    context.quadraticCurveTo(423, 158, 389, 154);
    context.quadraticCurveTo(368, 205, 344, 217);
    context.quadraticCurveTo(325, 162, 296, 151);
    context.quadraticCurveTo(269, 207, 238, 218);
    context.quadraticCurveTo(220, 177, 174, 218);
    context.closePath();
    context.fill();

    context.strokeStyle = "#563a32";
    context.lineWidth = 11;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(227, 251);
    context.quadraticCurveTo(267, 228, 296, 252);
    context.moveTo(350, 252);
    context.quadraticCurveTo(386, 228, 416, 252);
    context.stroke();

    ellipse(263, 303, 39, 48, "#fff9f3");
    ellipse(381, 303, 39, 48, "#fff9f3");
    ellipse(266, 310, 24, 33, "#bd772d");
    ellipse(378, 310, 24, 33, "#bd772d");
    ellipse(267, 315, 14, 23, "#3b2924");
    ellipse(377, 315, 14, 23, "#3b2924");
    ellipse(258, 297, 7, 10, "#ffffff");
    ellipse(368, 297, 7, 10, "#ffffff");

    ellipse(222, 364, 28, 11, "rgba(220,111,91,.42)");
    ellipse(422, 364, 28, 11, "rgba(220,111,91,.42)");

    context.fillStyle = "#a45143";
    context.beginPath();
    context.moveTo(274, 379);
    context.quadraticCurveTo(322, 421, 370, 379);
    context.quadraticCurveTo(351, 448, 322, 449);
    context.quadraticCurveTo(291, 447, 274, 379);
    context.closePath();
    context.fill();
    ellipse(322, 422, 29, 13, "#e58b83");

    context.fillStyle = "#df765d";
    context.beginPath();
    context.moveTo(482, 293);
    context.lineTo(554, 260);
    context.lineTo(534, 324);
    context.lineTo(565, 371);
    context.lineTo(491, 352);
    context.closePath();
    context.fill();
    ellipse(493, 322, 19, 26, "#ba5746");

    context.fillStyle = "#6f8795";
    context.save();
    context.translate(412, 139);
    context.rotate(-0.24);
    context.fillRect(-6, -20, 12, 43);
    context.fillRect(-22, -5, 44, 11);
    context.restore();

    context.fillStyle = "#ffffff";
    context.beginPath();
    context.moveTo(252, 474);
    context.lineTo(320, 540);
    context.lineTo(388, 474);
    context.lineTo(368, 640);
    context.lineTo(274, 640);
    context.closePath();
    context.fill();
    context.fillStyle = "#6f8795";
    context.beginPath();
    context.moveTo(320, 511);
    context.lineTo(354, 548);
    context.lineTo(328, 573);
    context.lineTo(320, 640);
    context.lineTo(312, 573);
    context.lineTo(286, 548);
    context.closePath();
    context.fill();

    return surface;
  }

  async function init() {
    const THREE = await import("/assets/three.module.js");
    if (disposed || !section.isConnected) return;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const particleCount = reduceMotion ? 1500 : (isMobile ? 3600 : 7200);
    const viewHeight = 10;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x030304, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.8));
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 40);
    camera.position.z = 12;

    const geometry = new THREE.BufferGeometry();
    const fromPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const fromColors = new Float32Array(particleCount * 3);
    const targetColors = new Float32Array(particleCount * 3);
    const pointSizes = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);
    const eyeFlags = new Float32Array(particleCount);
    const random = seededRandom(233);

    for (let index = 0; index < particleCount; index += 1) {
      pointSizes[index] = 0.74 + random() * 1.45;
      seeds[index] = random() * 1000;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(fromPositions, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(fromColors, 3));
    geometry.setAttribute("aTargetColor", new THREE.BufferAttribute(targetColors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(pointSizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aEye", new THREE.BufferAttribute(eyeFlags, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 1 },
      uOpacity: { value: 1 },
      uPointScale: { value: renderer.getPixelRatio() },
      uShapeMode: { value: 0 },
      uLook: { value: new THREE.Vector2(0, 0) },
      uBurstTime: { value: -20 },
      uRipple0: { value: new THREE.Vector3(0, 0, -20) },
      uRipple1: { value: new THREE.Vector3(0, 0, -20) },
      uRipple2: { value: new THREE.Vector3(0, 0, -20) },
      uRipple3: { value: new THREE.Vector3(0, 0, -20) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexColors: true,
      vertexShader: `
        attribute vec3 aTarget;
        attribute vec3 aTargetColor;
        attribute float aSize;
        attribute float aSeed;
        attribute float aEye;
        uniform float uTime;
        uniform float uMorph;
        uniform float uOpacity;
        uniform float uPointScale;
        uniform float uShapeMode;
        uniform float uBurstTime;
        uniform vec2 uLook;
        uniform vec3 uRipple0;
        uniform vec3 uRipple1;
        uniform vec3 uRipple2;
        uniform vec3 uRipple3;
        varying vec3 vColor;
        varying float vOpacity;
        varying float vPixelMode;

        vec3 applyRipple(vec3 point, vec3 ripple) {
          float age = uTime - ripple.z;
          if (age <= 0.0 || age > 3.1) return point;
          vec2 delta = point.xy - ripple.xy;
          float distanceToPointer = max(length(delta), 0.001);
          float radius = age * 2.35;
          float ring = exp(-abs(distanceToPointer - radius) * 5.4) * exp(-age * 0.62);
          float oscillation = sin((distanceToPointer - radius) * 9.0) * 0.35 + 0.65;
          vec2 direction = delta / distanceToPointer;
          point.xy += direction * ring * oscillation * 0.34;
          point.z += ring * oscillation * 0.72;
          return point;
        }

        void main() {
          float morph = uMorph * uMorph * (3.0 - 2.0 * uMorph);
          vec3 transformed = mix(position, aTarget, morph);
          vColor = mix(color, aTargetColor, morph);

          float planetary = 1.0 - step(0.5, uShapeMode);
          transformed += normalize(transformed + vec3(0.001))
            * sin(uTime * 0.72 + aSeed * 5.7) * 0.018 * planetary;

          float burstAge = uTime - uBurstTime;
          if (burstAge > 0.0 && burstAge < 0.92) {
            float burst = sin((burstAge / 0.92) * 3.14159265);
            vec3 burstDirection = normalize(transformed + vec3(
              sin(aSeed * 13.1),
              cos(aSeed * 9.7),
              sin(aSeed * 5.3) * 0.6
            ));
            transformed += burstDirection * burst * (0.36 + fract(aSeed) * 0.72);
          }

          transformed = applyRipple(transformed, uRipple0);
          transformed = applyRipple(transformed, uRipple1);
          transformed = applyRipple(transformed, uRipple2);
          transformed = applyRipple(transformed, uRipple3);

          float faceMode = step(2.5, uShapeMode) * (1.0 - step(3.5, uShapeMode));
          transformed.xy += uLook * vec2(0.12, 0.085) * abs(aEye) * faceMode;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float depthScale = clamp(1.0 + transformed.z * 0.05, 0.72, 1.35);
          gl_PointSize = max(1.0, aSize * uPointScale * depthScale * mix(1.0, 1.35, faceMode));
          vOpacity = uOpacity * mix(0.62, 1.0, fract(aSeed * 7.13));
          vPixelMode = faceMode;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec3 vColor;
        varying float vOpacity;
        varying float vPixelMode;

        void main() {
          vec2 centered = gl_PointCoord - 0.5;
          float circular = 1.0 - smoothstep(0.26, 0.5, length(centered));
          float squareEdge = max(abs(centered.x), abs(centered.y));
          float pixel = 1.0 - smoothstep(0.43, 0.5, squareEdge);
          float alpha = mix(circular, pixel, vPixelMode) * vOpacity;
          if (alpha < 0.01) discard;
          vec3 glow = vColor * (1.0 + circular * (1.0 - vPixelMode) * 0.22);
          gl_FragColor = vec4(glow, alpha);
        }
      `,
    });

    const particleGroup = new THREE.Group();
    const points = new THREE.Points(geometry, material);
    particleGroup.add(points);
    scene.add(particleGroup);

    const ambientGeometry = new THREE.BufferGeometry();
    const ambientCount = isMobile ? 180 : 420;
    const ambientPositions = new Float32Array(ambientCount * 3);
    const ambientColors = new Float32Array(ambientCount * 3);
    const ambientRandom = seededRandom(811);
    for (let index = 0; index < ambientCount; index += 1) {
      const offset = index * 3;
      ambientPositions[offset] = (ambientRandom() - 0.5) * 18;
      ambientPositions[offset + 1] = (ambientRandom() - 0.5) * 10;
      ambientPositions[offset + 2] = -2 - ambientRandom() * 7;
      const color = JOI_PALETTE[ambientRandom() > 0.88 ? 1 : 0];
      ambientColors.set(color.map((channel) => channel * (0.28 + ambientRandom() * 0.28)), offset);
    }
    ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeometry.setAttribute("color", new THREE.BufferAttribute(ambientColors, 3));
    const ambientMaterial = new THREE.PointsMaterial({
      size: 1.15,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const ambientStars = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientStars);

    function resizeRenderer() {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      const aspect = width / height;
      camera.left = -viewHeight * aspect * 0.5;
      camera.right = viewHeight * aspect * 0.5;
      camera.top = viewHeight * 0.5;
      camera.bottom = -viewHeight * 0.5;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.8));
      uniforms.uPointScale.value = renderer.getPixelRatio();
    }

    function colorFor(index, randomValue) {
      const paletteIndex = (index * 3 + Math.floor(randomValue * 13)) % JOI_PALETTE.length;
      return JOI_PALETTE[paletteIndex];
    }

    function createNebulaShape() {
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const eyes = new Float32Array(particleCount);
      const shapeRandom = seededRandom(1907);
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const ratio = index / particleCount;
        let x;
        let y;
        let z;
        if (ratio < 0.74) {
          const u = shapeRandom();
          const v = shapeRandom();
          const theta = Math.acos(1 - 2 * u);
          const phi = Math.PI * 2 * v + theta * 1.7;
          const shell = 1.72 + Math.pow(shapeRandom(), 1.9) * 0.74 + (shapeRandom() - 0.5) * 0.12;
          x = Math.sin(theta) * Math.cos(phi) * shell;
          y = Math.cos(theta) * shell;
          z = Math.sin(theta) * Math.sin(phi) * shell;
          x *= 1.07;
          y *= 0.96;
        } else if (ratio < 0.94) {
          const angle = shapeRandom() * Math.PI * 2;
          const radius = 2.42 + shapeRandom() * 1.12;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius * 0.28 + (shapeRandom() - 0.5) * 0.18;
          z = Math.sin(angle) * 0.72 + (shapeRandom() - 0.5) * 0.25;
          const tilt = 0.34;
          const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
          const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
          y = tiltedY;
          z = tiltedZ;
        } else {
          x = (shapeRandom() - 0.5) * Math.max(9, camera.right - camera.left);
          y = (shapeRandom() - 0.5) * 7.2;
          z = -1.5 - shapeRandom() * 3;
        }
        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = z;
        const color = colorFor(index, shapeRandom());
        const brightness = ratio < 0.94 ? 0.72 + shapeRandom() * 0.34 : 0.2 + shapeRandom() * 0.2;
        colors[offset] = color[0] * brightness;
        colors[offset + 1] = color[1] * brightness;
        colors[offset + 2] = color[2] * brightness;
      }
      return { positions, colors, eyes, mode: 0 };
    }

    function createCanvasShape(surface, options = {}) {
      const context = surface.getContext("2d", { willReadFrequently: true });
      const image = context.getImageData(0, 0, surface.width, surface.height);
      const pixels = [];
      const step = options.step || 5;
      for (let y = Math.floor(step / 2); y < surface.height; y += step) {
        for (let x = Math.floor(step / 2); x < surface.width; x += step) {
          const pixelIndex = (y * surface.width + x) * 4;
          if (image.data[pixelIndex + 3] < 36) continue;
          pixels.push({
            x,
            y,
            r: image.data[pixelIndex] / 255,
            g: image.data[pixelIndex + 1] / 255,
            b: image.data[pixelIndex + 2] / 255,
          });
        }
      }

      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const eyes = new Float32Array(particleCount);
      const shapeRandom = seededRandom(options.seed || 123);
      const width = options.worldWidth || Math.min(8.4, (camera.right - camera.left) * 0.76);
      const height = options.worldHeight || 3.2;
      const eyeCenters = options.eyeCenters || [];

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const pixel = pixels[Math.floor(shapeRandom() * pixels.length)] || { x: 320, y: 320, r: 1, g: 1, b: 1 };
        const jitter = step * 0.72;
        const pixelX = pixel.x + (shapeRandom() - 0.5) * jitter;
        const pixelY = pixel.y + (shapeRandom() - 0.5) * jitter;
        positions[offset] = (pixelX / surface.width - 0.5) * width;
        positions[offset + 1] = (0.5 - pixelY / surface.height) * height + (options.offsetY || 0);
        positions[offset + 2] = (shapeRandom() - 0.5) * (options.depth || 0.2);

        if (options.usePixelColor) {
          colors[offset] = pixel.r;
          colors[offset + 1] = pixel.g;
          colors[offset + 2] = pixel.b;
        } else {
          const color = colorFor(index, shapeRandom());
          const variation = 0.82 + shapeRandom() * 0.22;
          colors[offset] = color[0] * variation;
          colors[offset + 1] = color[1] * variation;
          colors[offset + 2] = color[2] * variation;
        }

        for (const eye of eyeCenters) {
          const normalizedX = (pixel.x - eye.x) / eye.rx;
          const normalizedY = (pixel.y - eye.y) / eye.ry;
          if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
            eyes[index] = eye.side;
            break;
          }
        }
      }
      return { positions, colors, eyes, mode: options.mode || 1 };
    }

    function createFallbackModelShape(faceShape) {
      const positions = new Float32Array(faceShape.positions.length);
      const colors = new Float32Array(faceShape.colors);
      const eyes = new Float32Array(particleCount);
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        positions[offset] = camera.right - 1.0 + faceShape.positions[offset] * 0.28;
        positions[offset + 1] = camera.bottom + 1.7 + faceShape.positions[offset + 1] * 0.42;
        positions[offset + 2] = faceShape.positions[offset + 2] * 0.3;
      }
      return { positions, colors, eyes, mode: 4 };
    }

    let shapes = [];
    let modelShapeReady = false;

    function buildShapes() {
      const faceCanvas = createJoiFaceCanvas();
      const face = createCanvasShape(faceCanvas, {
        seed: 992,
        step: 4,
        worldWidth: Math.min(5.25, (camera.right - camera.left) * 0.62),
        worldHeight: 5.25,
        offsetY: -0.1,
        depth: 0.14,
        usePixelColor: true,
        mode: 3,
        eyeCenters: [
          { x: 263, y: 303, rx: 42, ry: 52, side: -1 },
          { x: 381, y: 303, rx: 42, ry: 52, side: 1 },
        ],
      });
      shapes = [
        createNebulaShape(),
        createCanvasShape(createTextCanvas("Joi"), { seed: 414, step: 5, worldHeight: 3.2, mode: 1 }),
        createCanvasShape(createTextCanvas("Gallo"), { seed: 815, step: 5, worldHeight: 3.15, mode: 2 }),
        face,
        createFallbackModelShape(face),
      ];
      modelShapeReady = false;
    }

    function commitShape(shape) {
      fromPositions.set(shape.positions);
      targetPositions.set(shape.positions);
      fromColors.set(shape.colors);
      targetColors.set(shape.colors);
      eyeFlags.set(shape.eyes);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aTarget.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.aTargetColor.needsUpdate = true;
      geometry.attributes.aEye.needsUpdate = true;
      uniforms.uMorph.value = 1;
      uniforms.uShapeMode.value = shape.mode;
    }

    function captureLive2DShape() {
      const assistant = document.querySelector("joi-live2d-assistant");
      const source = assistant?.shadowRoot?.querySelector("[data-live2d-canvas]");
      if (!source?.width || !source?.height) return false;
      const capture = document.createElement("canvas");
      capture.width = source.width;
      capture.height = source.height;
      const context = capture.getContext("2d", { willReadFrequently: true });
      if (!context) return false;

      let image;
      try {
        context.drawImage(source, 0, 0, capture.width, capture.height);
        image = context.getImageData(0, 0, capture.width, capture.height);
      } catch (error) {
        console.warn("[Joi Prologue] Could not sample Live2D handoff silhouette:", error);
        return false;
      }

      const pixels = [];
      const step = Math.max(4, Math.round(capture.width / 72));
      for (let y = Math.floor(step / 2); y < capture.height; y += step) {
        for (let x = Math.floor(step / 2); x < capture.width; x += step) {
          const pixelIndex = (y * capture.width + x) * 4;
          if (image.data[pixelIndex + 3] < 38) continue;
          pixels.push({
            x,
            y,
            r: image.data[pixelIndex] / 255,
            g: image.data[pixelIndex + 1] / 255,
            b: image.data[pixelIndex + 2] / 255,
          });
        }
      }
      if (pixels.length < 32) return false;

      const rect = source.getBoundingClientRect();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const eyes = new Float32Array(particleCount);
      const shapeRandom = seededRandom(2214);
      const worldWidth = camera.right - camera.left;
      const worldHeight = camera.top - camera.bottom;

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const pixel = pixels[Math.floor(shapeRandom() * pixels.length)];
        const screenX = rect.left + (pixel.x / capture.width) * rect.width;
        const screenY = rect.top + (pixel.y / capture.height) * rect.height;
        positions[offset] = camera.left + (screenX / window.innerWidth) * worldWidth;
        positions[offset + 1] = camera.top - (screenY / window.innerHeight) * worldHeight;
        positions[offset + 2] = (shapeRandom() - 0.5) * 0.12;
        colors[offset] = pixel.r;
        colors[offset + 1] = pixel.g;
        colors[offset + 2] = pixel.b;
      }

      shapes[4] = { positions, colors, eyes, mode: 4 };
      modelShapeReady = true;
      return true;
    }

    resizeRenderer();
    buildShapes();
    commitShape(shapes[0]);

    let currentForm = 0;
    let transitionStartedAt = 0;
    let transitionDuration = 1;
    let transitionActive = false;
    let rippleIndex = 0;
    let lastRippleAt = 0;
    let lastRippleX = 0;
    let lastRippleY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let lookX = 0;
    let lookY = 0;
    let exitStartedAt = 0;
    let exitTriggered = false;
    let hasExited = false;
    let animationFrame = 0;
    let lastFrameAt = performance.now();
    let readyDispatched = false;

    function snapshotCurrentMorph() {
      const amount = ease(uniforms.uMorph.value);
      for (let index = 0; index < fromPositions.length; index += 1) {
        fromPositions[index] += (targetPositions[index] - fromPositions[index]) * amount;
        fromColors[index] += (targetColors[index] - fromColors[index]) * amount;
      }
    }

    function morphTo(shapeIndex, options = {}) {
      const shape = shapes[shapeIndex];
      if (!shape) return;
      snapshotCurrentMorph();
      targetPositions.set(shape.positions);
      targetColors.set(shape.colors);
      eyeFlags.set(shape.eyes);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aTarget.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.aTargetColor.needsUpdate = true;
      geometry.attributes.aEye.needsUpdate = true;
      uniforms.uMorph.value = 0;
      uniforms.uShapeMode.value = shape.mode;
      transitionStartedAt = uniforms.uTime.value;
      transitionDuration = reduceMotion ? 0.01 : (options.duration || 1.36);
      transitionActive = true;
      if (options.burst !== false && !reduceMotion) uniforms.uBurstTime.value = uniforms.uTime.value;
    }

    function updateForm(form) {
      currentForm = form;
      formLabel.textContent = FORM_LABELS[form];
      announcement.textContent = FORM_ANNOUNCEMENTS[form];
      section.dataset.particleFormIndex = String(form);
    }

    function handleClick() {
      if (exitTriggered) return;
      const nextForm = (currentForm + 1) % 4;
      updateForm(nextForm);
      morphTo(nextForm, { burst: true, duration: nextForm === 3 ? 1.48 : 1.32 });
      if (nextForm === 0) section.classList.add("has-completed-cycle");
    }

    function screenToWorld(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = camera.left + ((clientX - rect.left) / Math.max(1, rect.width)) * (camera.right - camera.left);
      const y = camera.top - ((clientY - rect.top) / Math.max(1, rect.height)) * (camera.top - camera.bottom);
      return { x, y };
    }

    function handlePointerMove(event) {
      if (exitTriggered) return;
      const rect = stage.getBoundingClientRect();
      pointerX = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1);
      pointerY = clamp(-(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1), -1, 1);
      if (reduceMotion) return;
      const movement = Math.hypot(event.clientX - lastRippleX, event.clientY - lastRippleY);
      const now = performance.now();
      if (movement < 18 || now - lastRippleAt < 78) return;
      const world = screenToWorld(event.clientX, event.clientY);
      const ripple = uniforms[`uRipple${rippleIndex}`].value;
      ripple.set(world.x, world.y, uniforms.uTime.value);
      rippleIndex = (rippleIndex + 1) % 4;
      lastRippleAt = now;
      lastRippleX = event.clientX;
      lastRippleY = event.clientY;
    }

    function triggerExit() {
      if (exitTriggered) return;
      exitTriggered = true;
      hasExited = true;
      exitStartedAt = uniforms.uTime.value;
      section.classList.add("is-exiting");
      if (!modelShapeReady) captureLive2DShape();
      morphTo(4, { burst: false, duration: 1.42 });
      window.dispatchEvent(new CustomEvent("joi-particle-prologue-exit", {
        detail: { delay: reduceMotion ? 0 : 430, duration: reduceMotion ? 1 : 1420 },
      }));
    }

    function resetPrologue() {
      if (!hasExited || !exitTriggered) return;
      exitTriggered = false;
      exitStartedAt = 0;
      uniforms.uOpacity.value = 1;
      section.classList.remove("is-exiting");
      updateForm(0);
      morphTo(0, { burst: false, duration: 1.1 });
      window.dispatchEvent(new CustomEvent("joi-particle-prologue-return"));
    }

    function handleScroll() {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / travel);
      // Leave a deliberate interaction zone at the top. A tiny trackpad nudge or
      // browser focus-scroll should not skip the four particle forms.
      if (!exitTriggered && progress > 0.62) triggerExit();
      if (exitTriggered && progress < 0.04) resetPrologue();
    }

    function handleLive2DReady() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => captureLive2DShape());
      });
    }

    function handleResize() {
      resizeRenderer();
      const activeForm = currentForm;
      buildShapes();
      captureLive2DShape();
      commitShape(shapes[exitTriggered ? 4 : activeForm]);
    }

    trigger.addEventListener("click", handleClick);
    stage.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("joi-live2d-ready", handleLive2DReady);

    const assistant = document.querySelector("joi-live2d-assistant");
    if (assistant?.dataset.live2dState === "ready") handleLive2DReady();

    function cleanup() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animationFrame);
      trigger.removeEventListener("click", handleClick);
      stage.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("joi-live2d-ready", handleLive2DReady);
      geometry.dispose();
      material.dispose();
      ambientGeometry.dispose();
      ambientMaterial.dispose();
      renderer.dispose();
    }

    function animate(now) {
      if (!section.isConnected) {
        cleanup();
        return;
      }
      const delta = Math.min(0.05, Math.max(0.001, (now - lastFrameAt) / 1000));
      lastFrameAt = now;
      uniforms.uTime.value += delta;

      if (transitionActive) {
        const progress = clamp((uniforms.uTime.value - transitionStartedAt) / transitionDuration);
        uniforms.uMorph.value = progress;
        if (progress >= 1) transitionActive = false;
      }

      lookX += (pointerX - lookX) * (1 - Math.exp(-5.8 * delta));
      lookY += (pointerY - lookY) * (1 - Math.exp(-5.8 * delta));
      uniforms.uLook.value.set(lookX, lookY);

      const planetTarget = currentForm === 0 && !exitTriggered ? 1 : 0;
      const rotationEase = 1 - Math.exp(-2.6 * delta);
      particleGroup.rotation.x += ((planetTarget ? -0.11 : 0) - particleGroup.rotation.x) * rotationEase;
      particleGroup.rotation.z += ((planetTarget ? 0.08 : 0) - particleGroup.rotation.z) * rotationEase;
      if (planetTarget && !reduceMotion) particleGroup.rotation.y += delta * 0.075;
      else particleGroup.rotation.y += (0 - particleGroup.rotation.y) * rotationEase;
      ambientStars.rotation.z += reduceMotion ? 0 : delta * 0.004;

      if (exitTriggered) {
        const exitAge = uniforms.uTime.value - exitStartedAt;
        uniforms.uOpacity.value = 1 - ease(clamp((exitAge - 0.86) / 0.62));
      }
      ambientMaterial.opacity = 0.48 * uniforms.uOpacity.value;

      renderer.render(scene, camera);
      if (!readyDispatched) {
        readyDispatched = true;
        section.classList.add("is-ready");
        window.dispatchEvent(new CustomEvent("joi-particle-prologue-ready"));
      }
      animationFrame = requestAnimationFrame(animate);
    }

    handleScroll();
    animationFrame = requestAnimationFrame(animate);
  }

  init().catch((error) => {
    console.error("[Joi Prologue] Particle scene failed to initialize:", error);
    section.classList.add("is-ready", "is-unavailable");
    window.dispatchEvent(new CustomEvent("joi-particle-prologue-ready", {
      detail: { degraded: true },
    }));
  });
})();
