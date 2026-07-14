(function () {
  const LIVE2D_MODEL_URL = "/live2d/joi/joi.model3.json";
  const RUNTIME_SCRIPTS = [
    "/vendor/live2d/live2dcubismcore.min.js",
    "/vendor/live2d/pixi.min.js",
    "/vendor/live2d/cubism.min.js",
  ];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
  const frameNow = () => performance.now();
  const loadedScripts = new Map();

  function loadScript(src) {
    if (loadedScripts.has(src)) return loadedScripts.get(src);
    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-joi-runtime="${src}"]`);
      if (existing && existing.dataset.failed !== "true") {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
        if (existing.dataset.loaded === "true") resolve();
        return;
      }
      existing?.remove();

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.crossOrigin = "anonymous";
      script.dataset.joiRuntime = src;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => {
        script.dataset.failed = "true";
        reject(new Error(`Failed to load ${src}`));
      }, { once: true });
      document.head.append(script);
    });
    loadedScripts.set(src, promise);
    promise.catch(() => loadedScripts.delete(src));
    return promise;
  }

  function supportsWebGL() {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitForCubismCoreReady() {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const core = window.Live2DCubismCore;
      try {
        if (core?.Version && core?.Moc && core?.Model) {
          await delay(300);
          return;
        }
      } catch {
        // The Emscripten runtime exists before it is fully initialized.
      }
      await delay(100);
    }
    throw new Error("Live2D Cubism Core did not become ready");
  }

  class JoiLive2DAssistant extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.state = {
        x: 0,
        y: 0,
        width: 340,
        height: 500,
        positioned: false,
        visible: false,
        dragging: false,
        expanded: false,
        lookX: 0,
        lookY: 0,
        eyeLookX: 0,
        eyeLookY: 0,
        targetLookX: 0,
        targetLookY: 0,
        bodyLookX: 0,
        bodyLookY: 0,
        breath: 0,
        dragOffsetX: 0,
        dragOffsetY: 0,
        targetX: 0,
        targetY: 0,
        springVelocityX: 0,
        springVelocityY: 0,
        lastFrameAt: 0,
        lastX: 0,
        lastY: 0,
        lastAt: 0,
        velocityX: 0,
        velocityY: 0,
        dragVisualX: 0,
        dragVisualY: 0,
        dragTilt: 0,
        dragStretch: 0,
        dragEnergy: 0,
        hairMomentum: 0,
        settling: false,
        talkUntil: 0,
        blinkUntil: 0,
        expression: "neutral",
        expressionUntil: 0,
        expressionBlend: 0,
        nextExpressionAt: frameNow() + 3200,
        lastPointerAt: frameNow(),
        hovering: false,
        dragDistance: 0,
        dragReactionStarted: false,
        dragStartedAt: 0,
        suppressClickUntil: 0,
      };
      this.messages = [];
      this.nextId = 1;
      this.socket = null;
      this.reconnectTimer = 0;
      this.blinkTimer = 0;
      this.live2dApp = null;
      this.live2dModel = null;
      this.live2dFit = null;
      this.live2dBeforeUpdate = null;
      this.lastLive2DUpdateAt = 0;
      this.live2dParamCache = new Map();
      this.live2dParamStats = { attempted: 0, resolved: 0, missed: 0 };
      this.live2dLoading = null;
      this.bodyObserver = null;
      this.boundPointerMove = this.handlePointerMove.bind(this);
      this.boundResize = this.handleResize.bind(this);
    }

    connectedCallback() {
      this.render();
      this.cacheParts();
      this.positionInitial();
      this.bind();
      this.observeSiteState();
      this.connectCore();
      this.scheduleBlink();
      this.initLive2D();
      requestAnimationFrame(() => this.animate());
    }

    disconnectedCallback() {
      window.removeEventListener("pointermove", this.boundPointerMove);
      window.removeEventListener("resize", this.boundResize);
      window.clearTimeout(this.reconnectTimer);
      window.clearTimeout(this.blinkTimer);
      this.bodyObserver?.disconnect();
      this.socket?.close();
      if (this.live2dModel?.internalModel && this.live2dBeforeUpdate) {
        this.live2dModel.internalModel.off?.("beforeModelUpdate", this.live2dBeforeUpdate);
      }
      this.live2dModel?.destroy?.({ children: true, texture: false, textureSource: false });
      this.live2dApp?.destroy?.(true);
    }

    get coreUrl() {
      return this.getAttribute("core-url") || "ws://127.0.0.1:8765";
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>${this.styles()}</style>
        <aside class="joi-live2d is-hidden" aria-label="Joi Live2D assistant">
          <section class="joi-live2d-panel" aria-label="Joi chat panel">
            <header>
              <div><strong>Joi</strong><span data-status>离线</span></div>
              <button data-close type="button" aria-label="收起">×</button>
            </header>
            <div class="joi-live2d-stream" data-stream></div>
            <form data-form>
              <input data-input maxlength="500" autocomplete="off" placeholder="和 Joi 说点什么" />
              <button type="submit">发送</button>
            </form>
          </section>

          <button class="joi-live2d-bubble" data-bubble type="button" aria-label="打开 Joi 对话">
            <span data-bubble-text>我在。</span>
          </button>

          <button class="joi-live2d-model" data-model type="button" aria-label="拖拽 Joi">
            <canvas class="joi-live2d-canvas" data-live2d-canvas aria-hidden="true"></canvas>
            <span class="joi-live2d-shadow"></span>
          </button>
        </aside>
      `;
    }

    styles() {
      return `
        :host {
          --live2d-x: 0px;
          --live2d-y: 0px;
          --look-x: 0;
          --look-y: 0;
          --breath: 0;
          --drag-x: 0;
          --drag-y: 0;
          --drag-tilt: 0;
          --drag-stretch: 0;
          --model-h: min(52vh, 462px);
          --body-w: calc(var(--model-h) * 0.374);
          --head-w: calc(var(--body-w) * 0.697);
          --head-left: calc(var(--body-w) * 0.131);
          --panel-bg: rgba(255, 250, 245, 0.94);
          --ink: #241c1a;
          --muted: rgba(36, 28, 26, 0.58);
          --line: rgba(89, 61, 50, 0.16);
          --coral: #d86f5f;
          --aqua: #557f95;
          position: fixed;
          inset: 0;
          z-index: 900;
          pointer-events: none;
          color: var(--ink);
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        * { box-sizing: border-box; }
        button, input { font: inherit; }

        .joi-live2d {
          position: absolute;
          left: 0;
          top: 0;
          width: 340px;
          height: 548px;
          transform: translate3d(var(--live2d-x), var(--live2d-y), 0) scale(var(--live2d-scale, .76));
          transform-origin: 100% 100%;
          opacity: 1;
          transition: opacity 320ms ease, filter 320ms ease;
          pointer-events: none;
        }

        .joi-live2d.is-hidden {
          opacity: 0;
          filter: blur(5px);
        }

        .joi-live2d-model {
          position: absolute;
          right: 8px;
          bottom: 0;
          width: 220px;
          height: var(--model-h);
          border: 0;
          padding: 0;
          background: transparent;
          cursor: grab;
          pointer-events: auto;
          touch-action: none;
          outline: none;
        }

        .joi-live2d.is-hidden .joi-live2d-model,
        .joi-live2d.is-hidden .joi-live2d-bubble,
        .joi-live2d.is-hidden .joi-live2d-panel {
          pointer-events: none;
        }

        .joi-live2d.is-dragging .joi-live2d-model { cursor: grabbing; }

        .joi-live2d-canvas {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: var(--model-h);
          opacity: 0;
          z-index: 2;
          pointer-events: none;
          filter: drop-shadow(0 20px 20px rgba(42, 29, 25, 0.18));
          transform-origin: 50% 84%;
          transform: translateZ(0);
          transition: opacity 220ms ease;
          will-change: opacity;
        }

        .joi-live2d.has-real-live2d .joi-live2d-canvas {
          opacity: 1;
        }

        .joi-live2d.is-dragging .joi-live2d-canvas {
          transform-origin: 50% 84%;
          transform:
            translate(calc(var(--drag-x) * 1px), calc(var(--drag-y) * 1px))
            rotate(calc(var(--drag-tilt) * 1deg))
            scaleX(calc(1 + (var(--drag-stretch) * 0.012)))
            scaleY(calc(1 - (var(--drag-stretch) * 0.008)));
          transition: none;
        }

        .joi-live2d.is-settling .joi-live2d-canvas {
          transition: transform 340ms cubic-bezier(0.18, 0.9, 0.2, 1.04);
        }

        .joi-live2d-stage {
          position: absolute;
          right: 14px;
          bottom: 0;
          width: var(--body-w);
          height: var(--model-h);
          transform:
            translateY(calc(var(--breath) * -2px))
            rotate(calc(var(--look-x) * 1.2deg));
          transform-origin: 50% 84%;
          filter: drop-shadow(0 20px 20px rgba(42, 29, 25, 0.18));
          pointer-events: none;
          will-change: transform;
        }

        .joi-live2d.is-dragging .joi-live2d-stage {
          transform:
            translate(calc(var(--drag-x) * 1px), calc(var(--drag-y) * 1px))
            rotate(calc(var(--drag-tilt) * 1deg))
            scaleX(calc(1 + (var(--drag-stretch) * 0.012)))
            scaleY(calc(1 - (var(--drag-stretch) * 0.008)));
          transition: none;
        }

        .joi-live2d.is-settling .joi-live2d-stage {
          transition: transform 340ms cubic-bezier(0.18, 0.9, 0.2, 1.04);
        }

        .joi-live2d-body,
        .joi-live2d-head,
        .joi-live2d-face-card {
          position: absolute;
          display: block;
          left: 0;
          top: 0;
          pointer-events: none;
        }

        .joi-live2d-body {
          width: var(--body-w);
          height: var(--model-h);
          transform:
            scaleY(calc(1 + (var(--breath) * 0.006)))
            skewX(calc(var(--look-x) * -0.9deg));
          transform-origin: 50% 86%;
          will-change: transform;
        }

        .joi-live2d-body img {
          width: var(--body-w);
          height: auto;
          -webkit-user-drag: none;
        }

        .joi-live2d-head {
          left: var(--head-left);
          top: 0;
          width: var(--head-w);
          height: calc(var(--head-w) * 1.214);
          transform:
            translate(calc(var(--look-x) * 9px), calc(var(--look-y) * 6px))
            perspective(620px)
            rotateY(calc(var(--look-x) * 16deg))
            rotateX(calc(var(--look-y) * -10deg))
            rotateZ(calc(var(--look-x) * 5deg));
          transform-origin: 50% 78%;
          transition: transform 90ms ease-out;
          will-change: transform;
        }

        .joi-live2d.is-dragging .joi-live2d-head {
          transform:
            translate(calc(var(--drag-x) * -0.025px), calc(var(--drag-y) * -0.014px))
            perspective(620px)
            rotateY(calc(var(--drag-x) * -0.052deg))
            rotateZ(calc(var(--drag-x) * -0.034deg));
          transition: none;
        }

        .joi-live2d-head img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: auto;
          -webkit-user-drag: none;
        }

        .head-base { z-index: 1; }

        .mouth-open {
          z-index: 2;
          opacity: 0;
          transform: scaleY(0.16);
          transform-origin: 52% 64%;
          transition: opacity 80ms linear, transform 80ms linear;
        }

        .joi-live2d.is-talking .mouth-open {
          animation: live2d-mouth 360ms ease-in-out infinite;
          opacity: 1;
        }

        .blink-mask {
          z-index: 3;
          opacity: 0;
          transition: opacity 40ms linear;
        }

        .joi-live2d.is-blinking .blink-mask {
          animation: live2d-blink 180ms ease-in-out 1;
        }

        .hair-front {
          z-index: 4;
          opacity: 0.98;
          transform:
            translate(calc(var(--look-x) * -3px), calc(var(--look-y) * 1px))
            rotate(calc(var(--look-x) * -2deg));
          transform-origin: 50% 20%;
          transition: transform 160ms ease-out;
        }

        .ribbon {
          z-index: 5;
          transform:
            translate(calc(var(--look-x) * -5px), calc(var(--look-y) * 2px))
            rotate(calc((var(--look-x) * -5deg) + (var(--breath) * 1.6deg)));
          transform-origin: 78% 56%;
          transition: transform 190ms ease-out;
        }

        .joi-live2d-face-card {
          left: calc(var(--head-left) + 4px);
          top: 4px;
          width: calc(var(--head-w) * 1.02);
          opacity: 0;
          transform: translateY(8px) scale(0.9) rotate(-3deg);
          transition: opacity 160ms ease, transform 160ms ease;
          z-index: 6;
        }

        .joi-live2d-face-card img {
          width: 100%;
          height: auto;
          -webkit-user-drag: none;
        }

        .joi-live2d.is-dragging .joi-live2d-face-card,
        .joi-live2d.is-happy .joi-live2d-face-card {
          opacity: 1;
          transform: translateY(0) scale(1) rotate(calc(var(--look-x) * 3deg));
        }

        .joi-live2d-shadow {
          position: absolute;
          right: 42px;
          bottom: -4px;
          width: 112px;
          height: 18px;
          border-radius: 999px;
          background: rgba(46, 31, 28, 0.2);
          filter: blur(7px);
          pointer-events: none;
        }

        .joi-live2d-bubble {
          position: absolute;
          right: 180px;
          bottom: 330px;
          max-width: 180px;
          min-width: 112px;
          padding: 10px 12px;
          border: 1px solid rgba(216, 111, 95, 0.22);
          border-radius: 14px 14px 4px 14px;
          background: rgba(255, 250, 245, 0.92);
          box-shadow: 0 16px 38px rgba(42, 29, 25, 0.16);
          color: var(--ink);
          text-align: left;
          line-height: 1.35;
          font-size: 13px;
          pointer-events: auto;
          cursor: pointer;
          backdrop-filter: blur(16px);
        }

        .joi-live2d-bubble span {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .joi-live2d-panel {
          position: absolute;
          right: 196px;
          bottom: 20px;
          width: min(330px, calc(100vw - 28px));
          height: 392px;
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--panel-bg);
          box-shadow: 0 26px 70px rgba(42, 29, 25, 0.18);
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
          backdrop-filter: blur(18px);
        }

        .joi-live2d.is-open .joi-live2d-panel {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .joi-live2d-panel header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 54px;
          padding: 12px 12px 10px 14px;
          border-bottom: 1px solid var(--line);
        }

        .joi-live2d-panel strong {
          display: block;
          font-size: 15px;
          letter-spacing: 0;
        }

        .joi-live2d-panel header span {
          display: block;
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
        }

        .joi-live2d-panel header button {
          width: 30px;
          height: 30px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.64);
          color: rgba(36, 28, 26, 0.72);
          cursor: pointer;
        }

        .joi-live2d-stream {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 12px;
          overflow: auto;
        }

        .joi-live2d-message {
          max-width: 88%;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
        }

        .joi-live2d-message.user {
          align-self: flex-end;
          color: white;
          background: var(--coral);
        }

        .joi-live2d-message.joi {
          align-self: flex-start;
          border: 1px solid rgba(85, 127, 149, 0.18);
          background: rgba(255, 255, 255, 0.74);
        }

        .joi-live2d-panel form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid var(--line);
        }

        .joi-live2d-panel input {
          min-width: 0;
          height: 38px;
          padding: 0 11px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.84);
          outline: none;
        }

        .joi-live2d-panel input:focus {
          border-color: rgba(85, 127, 149, 0.58);
          box-shadow: 0 0 0 3px rgba(85, 127, 149, 0.14);
        }

        .joi-live2d-panel form button {
          height: 38px;
          padding: 0 13px;
          border: 0;
          border-radius: 8px;
          background: var(--aqua);
          color: white;
          cursor: pointer;
        }

        @keyframes live2d-mouth {
          0%, 100% { transform: scaleY(0.18); opacity: 0.45; }
          48% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes live2d-blink {
          0%, 100% { opacity: 0; }
          42%, 64% { opacity: 1; }
        }

        @keyframes live2d-body-pull {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -4px; }
        }

        @media (max-width: 720px) {
          :host {
            --model-h: min(44vh, 352px);
            --body-w: calc(var(--model-h) * 0.374);
          }

          .joi-live2d {
            width: 260px;
            height: 418px;
          }

          .joi-live2d-model {
            width: 164px;
          }

          .joi-live2d-bubble {
            right: 134px;
            bottom: 248px;
            max-width: 142px;
            min-width: 98px;
            font-size: 12px;
          }

          .joi-live2d-panel {
            right: 0;
            bottom: calc(var(--model-h) + 14px);
            height: min(376px, calc(100vh - var(--model-h) - 46px));
          }
        }
      `;
    }

    cacheParts() {
      this.root = this.shadowRoot.querySelector(".joi-live2d");
      this.model = this.shadowRoot.querySelector("[data-model]");
      this.live2dCanvas = this.shadowRoot.querySelector("[data-live2d-canvas]");
      this.bubble = this.shadowRoot.querySelector("[data-bubble]");
      this.bubbleText = this.shadowRoot.querySelector("[data-bubble-text]");
      this.statusText = this.shadowRoot.querySelector("[data-status]");
      this.stream = this.shadowRoot.querySelector("[data-stream]");
      this.form = this.shadowRoot.querySelector("[data-form]");
      this.input = this.shadowRoot.querySelector("[data-input]");
      this.close = this.shadowRoot.querySelector("[data-close]");
    }

    bind() {
      window.addEventListener("pointermove", this.boundPointerMove, { passive: true });
      window.addEventListener("resize", this.boundResize);
      this.model.addEventListener("pointerdown", (event) => this.startDrag(event));
      this.model.addEventListener("pointerenter", () => {
        this.state.hovering = true;
        if (!this.state.dragging) this.playExpression("curious", 720);
      });
      this.model.addEventListener("pointerleave", () => {
        this.state.hovering = false;
      });
      this.model.addEventListener("click", () => {
        if (frameNow() < this.state.suppressClickUntil) return;
        this.playExpression("bright", 980);
        this.say("嗯？我在听。", 1200);
      });
      this.bubble.addEventListener("click", () => this.togglePanel(true));
      this.close.addEventListener("click", () => this.togglePanel(false));
      this.form.addEventListener("submit", (event) => this.submit(event));
      this.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.isComposing) this.submit(event);
      });
    }

    syncVisibility() {
      const visible = document.body.dataset.state === "home" && this.dataset.live2dState === "ready";
      this.state.visible = visible;
      this.root.classList.toggle("is-hidden", !visible);
      if (visible && !this.state.positioned) {
        this.positionInitial();
        this.updatePosition();
      }
    }

    observeSiteState() {
      const sync = () => {
        this.syncVisibility();
      };
      this.bodyObserver = new MutationObserver(sync);
      this.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-state"] });
      sync();
    }

    positionInitial() {
      this.state.width = window.matchMedia("(max-width: 720px)").matches ? 260 : 340;
      this.state.height = window.matchMedia("(max-width: 720px)").matches ? 418 : 548;
      this.state.x = Math.max(10, window.innerWidth - this.state.width - 18);
      this.state.y = Math.max(10, window.innerHeight - this.state.height - 16);
      this.state.targetX = this.state.x;
      this.state.targetY = this.state.y;
      this.state.springVelocityX = 0;
      this.state.springVelocityY = 0;
      this.state.positioned = true;
      this.updatePosition();
    }

    handleResize() {
      this.state.width = window.matchMedia("(max-width: 720px)").matches ? 260 : 340;
      this.state.height = window.matchMedia("(max-width: 720px)").matches ? 418 : 548;
      this.state.x = clamp(this.state.x, 8, window.innerWidth - this.state.width - 8);
      this.state.y = clamp(this.state.y, 8, window.innerHeight - this.state.height - 8);
      this.state.targetX = clamp(this.state.targetX, 8, window.innerWidth - this.state.width - 8);
      this.state.targetY = clamp(this.state.targetY, 8, window.innerHeight - this.state.height - 8);
      this.updatePosition();
      this.fitLive2DModel();
    }

    handlePointerMove(event) {
      if (!this.state.visible || this.state.dragging) return;
      const centerX = this.state.x + this.state.width - 88;
      const centerY = this.state.y + 110;
      this.state.targetLookX = clamp((event.clientX - centerX) / 340, -1, 1);
      this.state.targetLookY = clamp((event.clientY - centerY) / 280, -1, 1);
      this.state.lastPointerAt = frameNow();
    }

    startDrag(event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      this.model.setPointerCapture?.(event.pointerId);
      this.state.dragging = true;
      this.state.settling = false;
      this.root.classList.add("is-dragging");
      this.root.classList.remove("is-settling");
      this.state.dragOffsetX = event.clientX - this.state.x;
      this.state.dragOffsetY = event.clientY - this.state.y;
      this.state.targetX = this.state.x;
      this.state.targetY = this.state.y;
      this.state.lastX = event.clientX;
      this.state.lastY = event.clientY;
      this.state.lastAt = frameNow();
      this.state.dragStartedAt = this.state.lastAt;
      this.state.dragDistance = 0;
      this.state.dragReactionStarted = false;

      let done = false;
      const move = (moveEvent) => {
        moveEvent.preventDefault?.();
        this.drag(moveEvent);
      };
      const up = () => {
        if (done) return;
        done = true;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        try {
          this.model.releasePointerCapture?.(event.pointerId);
        } catch {
          // Pointer capture may already be released by the browser.
        }
        this.state.dragging = false;
        const wasDragged = this.state.dragDistance > 7;
        this.state.settling = wasDragged;
        this.state.suppressClickUntil = wasDragged ? frameNow() + 420 : 0;
        this.root.classList.remove("is-dragging");
        if (!wasDragged) {
          this.root.classList.remove("is-settling");
          this.state.targetX = this.state.x;
          this.state.targetY = this.state.y;
          return;
        }
        this.state.springVelocityX += clamp(this.state.velocityX, -1400, 1400) * 0.12;
        this.state.springVelocityY += clamp(this.state.velocityY, -1400, 1400) * 0.1;
        this.root.classList.add("is-settling");
        this.playExpression("relieved", 1380);
        this.say("好，站稳了。", 1400);
        window.setTimeout(() => {
          this.state.settling = false;
          this.root.classList.remove("is-settling");
        }, 760);
      };

      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      window.addEventListener("mousemove", move, { passive: false });
      window.addEventListener("mouseup", up);
    }

    drag(event) {
      const elapsed = Math.max(16, frameNow() - this.state.lastAt);
      const deltaX = event.clientX - this.state.lastX;
      const deltaY = event.clientY - this.state.lastY;
      this.state.velocityX = (deltaX / elapsed) * 1000;
      this.state.velocityY = (deltaY / elapsed) * 1000;
      this.state.dragDistance += Math.hypot(deltaX, deltaY);
      if (this.state.dragDistance > 7 && !this.state.dragReactionStarted) {
        this.state.dragReactionStarted = true;
        this.playExpression("surprised", 560);
        this.say("呀，慢一点。", 1000);
      }
      this.state.lastX = event.clientX;
      this.state.lastY = event.clientY;
      this.state.lastAt = frameNow();
      this.state.targetX = clamp(event.clientX - this.state.dragOffsetX, 8, window.innerWidth - this.state.width - 8);
      this.state.targetY = clamp(event.clientY - this.state.dragOffsetY, 8, window.innerHeight - this.state.height - 8);
    }

    updatePosition() {
      this.root.style.setProperty("--live2d-x", `${Math.round(this.state.x)}px`);
      this.root.style.setProperty("--live2d-y", `${Math.round(this.state.y)}px`);
    }

    updateSpring(now) {
      if (!this.state.lastFrameAt) this.state.lastFrameAt = now;
      const dt = clamp((now - this.state.lastFrameAt) / 1000, 0.001, 0.035);
      this.state.lastFrameAt = now;

      if (!this.state.dragging && !this.state.settling) {
        this.state.targetX = this.state.x;
        this.state.targetY = this.state.y;
      }

      const stiffness = this.state.dragging ? 118 : (this.state.settling ? 34 : 46);
      const damping = this.state.dragging ? 22 : (this.state.settling ? 8.8 : 13);
      const dx = this.state.targetX - this.state.x;
      const dy = this.state.targetY - this.state.y;

      this.state.springVelocityX += dx * stiffness * dt;
      this.state.springVelocityY += dy * stiffness * dt;
      const drag = Math.exp(-damping * dt);
      this.state.springVelocityX *= drag;
      this.state.springVelocityY *= drag;
      this.state.x = clamp(this.state.x + this.state.springVelocityX * dt, 8, window.innerWidth - this.state.width - 8);
      this.state.y = clamp(this.state.y + this.state.springVelocityY * dt, 8, window.innerHeight - this.state.height - 8);

      const visualXTarget = clamp(this.state.springVelocityX * 0.018 + this.state.velocityX * 0.006, -18, 18);
      const visualYTarget = clamp(this.state.springVelocityY * 0.012 + this.state.velocityY * 0.004, -12, 12);
      const tiltTarget = clamp(this.state.springVelocityX * 0.012 + this.state.velocityX * 0.004, -9, 9);
      const stretchTarget = clamp((Math.abs(this.state.springVelocityX) + Math.abs(this.state.springVelocityY)) / 1200, 0, 1);
      const active = this.state.dragging || this.state.settling;

      if (!this.state.dragging) {
        const velocityDecay = Math.exp(-8.5 * dt);
        this.state.velocityX *= velocityDecay;
        this.state.velocityY *= velocityDecay;
      }

      this.state.dragVisualX = damp(this.state.dragVisualX, active ? visualXTarget : 0, active ? 12 : 8, dt);
      this.state.dragVisualY = damp(this.state.dragVisualY, active ? visualYTarget : 0, active ? 12 : 8, dt);
      this.state.dragTilt = damp(this.state.dragTilt, active ? tiltTarget : 0, active ? 10 : 7, dt);
      this.state.dragStretch = damp(this.state.dragStretch, active ? stretchTarget : 0, active ? 9 : 6, dt);
      this.state.dragEnergy = damp(this.state.dragEnergy, active ? stretchTarget : 0, active ? 10 : 5, dt);
      this.state.hairMomentum = damp(
        this.state.hairMomentum,
        active ? clamp(this.state.springVelocityX * 0.001 + this.state.velocityX * 0.00055, -1, 1) : 0,
        active ? 7.5 : 2.8,
        dt,
      );

      this.root.style.setProperty("--drag-x", this.state.dragVisualX.toFixed(2));
      this.root.style.setProperty("--drag-y", this.state.dragVisualY.toFixed(2));
      this.root.style.setProperty("--drag-tilt", this.state.dragTilt.toFixed(2));
      this.root.style.setProperty("--drag-stretch", this.state.dragStretch.toFixed(3));
      this.updatePosition();
      return dt;
    }

    emitLive2DProgress(phase, label, progress) {
      this.dataset.live2dState = "loading";
      const detail = { phase, label, progress, modelUrl: LIVE2D_MODEL_URL };
      window.dispatchEvent(new CustomEvent("joi-live2d-progress", { detail }));
    }

    emitLive2DResult(type, detail = {}) {
      this.dataset.live2dState = type;
      window.dispatchEvent(new CustomEvent(`joi-live2d-${type}`, {
        detail: { modelUrl: LIVE2D_MODEL_URL, ...detail },
      }));
      this.syncVisibility();
    }

    destroyLive2D() {
      if (this.live2dModel?.internalModel && this.live2dBeforeUpdate) {
        this.live2dModel.internalModel.off?.("beforeModelUpdate", this.live2dBeforeUpdate);
      }
      this.live2dModel?.destroy?.({ children: true, texture: false, textureSource: false });
      this.live2dApp?.destroy?.(false);
      this.live2dApp = null;
      this.live2dModel = null;
      this.live2dFit = null;
      this.live2dBeforeUpdate = null;
      this.root?.classList.remove("has-real-live2d");
    }

    retryLive2D() {
      if (this.live2dLoading) return this.live2dLoading;
      this.destroyLive2D();
      return this.initLive2D();
    }

    async initLive2D() {
      if (this.live2dLoading) return this.live2dLoading;

      this.live2dLoading = (async () => {
        try {
          if (!this.live2dCanvas) throw new Error("Live2D canvas is unavailable");
          if (!supportsWebGL()) throw new Error("WebGL is unavailable in this browser");

          this.emitLive2DProgress("runtime", "Loading Cubism Core", 0.12);
          await loadScript(RUNTIME_SCRIPTS[0]);
          await waitForCubismCoreReady();
          this.emitLive2DProgress("runtime", "Preparing motion runtime", 0.38);
          for (const script of RUNTIME_SCRIPTS.slice(1)) {
            await loadScript(script);
          }
          if (!this.isConnected) return;

          const PIXI = window.PIXI;
          const live2d = PIXI?.live2d;
          if (!PIXI?.Application || !live2d?.Live2DModel) {
            throw new Error("Live2D runtime was not registered");
          }

          if (live2d.configureCubismSDK && !JoiLive2DAssistant.cubismConfigured) {
            live2d.configureCubismSDK({ memorySizeMB: 32 });
            JoiLive2DAssistant.cubismConfigured = true;
          }
          if (PIXI.extensions && live2d.Live2DPlugin && !JoiLive2DAssistant.live2DPluginAdded) {
            PIXI.extensions.add(live2d.Live2DPlugin);
            JoiLive2DAssistant.live2DPluginAdded = true;
          }

          this.emitLive2DProgress("renderer", "Opening the Live2D stage", 0.56);
          const app = new PIXI.Application();
          await app.init({
            canvas: this.live2dCanvas,
            autoStart: false,
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            preference: "webgl",
            width: 220,
            height: Math.round(this.state.height),
          });
          this.live2dApp = app;

          this.emitLive2DProgress("model", "Loading Joi model and textures", 0.7);
          const model = await live2d.Live2DModel.from(LIVE2D_MODEL_URL, {
            autoUpdate: false,
            autoFocus: false,
            autoHitTest: false,
            motionPreload: live2d.MotionPreloadStrategy?.NONE,
            textureOptions: { lod: "single-auto" },
          });

          this.live2dModel = model;
          this.live2dBeforeUpdate = null;
          model.anchor?.set?.(0.5, 0.5);
          app.stage.addChild(model);
          this.fitLive2DModel();
          app.stop?.();
          app.ticker?.stop?.();
          this.lastLive2DUpdateAt = frameNow();

          const renderFrame = () => {
            model.update?.(16);
            if (typeof app.render !== "function") {
              throw new Error("Live2D renderer cannot produce a frame");
            }
            app.render();
          };

          renderFrame();
          this.emitLive2DProgress("frame", "Rendering Joi's first frame", 0.9);
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          renderFrame();

          const bounds = model.getLocalBounds?.();
          const hasModel = !!model.internalModel?.coreModel;
          const hasGeometry = Math.abs(bounds?.width || model.width || 0) > 0
            && Math.abs(bounds?.height || model.height || 0) > 0;
          const hasFrame = this.live2dCanvas.width > 0 && this.live2dCanvas.height > 0;
          const webgl = app.renderer?.gl || app.renderer?.context?.gl;
          const hasWebGLContext = !webgl?.isContextLost?.();
          if (!hasModel || !hasGeometry || !hasFrame || !hasWebGLContext) {
            throw new Error("Live2D model did not produce a valid first frame");
          }

          this.root.classList.add("has-real-live2d");
          this.emitLive2DResult("ready", { phase: "ready", label: "Joi is ready", progress: 1 });
          this.say("Live2D 模型上线。", 1400);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown Live2D loading error";
          console.error("[Joi Live2D] Model loading failed:", error);
          this.destroyLive2D();
          this.emitLive2DResult("error", { phase: "error", label: message, progress: 0 });
        }
      })().finally(() => {
        this.live2dLoading = null;
      });

      return this.live2dLoading;
    }

    fitLive2DModel() {
      if (!this.live2dApp || !this.live2dModel || !this.model) return;
      const rect = this.model.getBoundingClientRect();
      const width = Math.max(160, Math.round(rect.width || 220));
      const height = Math.max(260, Math.round(rect.height || this.state.height));

      this.live2dApp.renderer.resize(width, height);
      this.live2dCanvas.style.width = `${width}px`;
      this.live2dCanvas.style.height = `${height}px`;

      const model = this.live2dModel;
      model.scale?.set?.(1);
      let modelWidth = Math.abs(model.width || 0);
      let modelHeight = Math.abs(model.height || 0);
      if ((!modelWidth || !modelHeight) && model.getLocalBounds) {
        const bounds = model.getLocalBounds();
        modelWidth = Math.abs(bounds.width || modelWidth || 1);
        modelHeight = Math.abs(bounds.height || modelHeight || 1);
      }

      const scale = Math.min((width * 0.98) / Math.max(1, modelWidth), (height * 1.04) / Math.max(1, modelHeight));
      model.scale?.set?.(scale);
      const baseX = width * 0.52;
      const baseY = height * 0.5;
      model.position?.set?.(baseX, baseY);
      this.live2dFit = {
        width,
        height,
        scale,
        baseX,
        baseY,
      };
    }

    live2DIdToString(handle) {
      const value = handle?.getString?.();
      if (typeof value === "string") return value;
      if (typeof value?.s === "string") return value.s;
      if (typeof handle === "string") return handle;
      return "";
    }

    resolveLive2DParamIndex(coreModel, id) {
      const cached = this.live2dParamCache.get(id);
      if (Number.isInteger(cached)) return cached;

      try {
        const count = coreModel.getParameterCount?.() ?? 0;
        for (let index = 0; index < count; index += 1) {
          if (this.live2DIdToString(coreModel.getParameterId?.(index)) === id) {
            this.live2dParamCache.set(id, index);
            this.live2dParamStats.resolved += 1;
            return index;
          }
        }
      } catch {
        // Fall through to the Cubism ID manager path below.
      }

      try {
        const idHandle = this.live2dModel?.internalModel?.getIdSafe?.(id)
          || window.PIXI?.live2d?.CubismFramework?.getIdManager?.()?.getId?.(id);
        const index = coreModel.getParameterIndex?.(idHandle);
        if (Number.isInteger(index) && index >= 0 && index < (coreModel.getParameterCount?.() ?? 0)) {
          this.live2dParamCache.set(id, index);
          this.live2dParamStats.resolved += 1;
          return index;
        }
      } catch {
        // Missing optional runtime helpers are not fatal.
      }

      this.live2dParamCache.set(id, -1);
      this.live2dParamStats.missed += 1;
      return -1;
    }

    setLive2DParam(coreModel, id, value) {
      if (!coreModel || !Number.isFinite(value)) return;
      this.live2dParamStats.attempted += 1;
      const index = this.resolveLive2DParamIndex(coreModel, id);
      if (index < 0) return;
      coreModel.setParameterValueByIndex?.(index, value, 1);
    }

    playExpression(name, duration = 900) {
      const now = frameNow();
      const isExtending = this.state.expression === name;
      this.state.expression = name;
      this.state.expressionUntil = isExtending
        ? Math.max(this.state.expressionUntil, now + duration)
        : now + duration;
      this.state.nextExpressionAt = now + duration + 3200 + Math.random() * 3600;
    }

    updatePersonality(now, dt) {
      const expressionActive = now < this.state.expressionUntil;
      this.state.expressionBlend = damp(
        this.state.expressionBlend,
        expressionActive ? 1 : 0,
        expressionActive ? 12 : 5.5,
        dt,
      );

      if (!expressionActive && this.state.expressionBlend < 0.01) {
        this.state.expression = "neutral";
      }

      const canIdleAct = !this.state.dragging
        && !this.state.settling
        && now >= this.state.talkUntil
        && now >= this.state.nextExpressionAt;
      if (!canIdleAct) return;

      const pointerIsActive = now - this.state.lastPointerAt < 1800;
      const choices = this.state.hovering || pointerIsActive
        ? ["curious", "softSmile", "curious", "bright"]
        : ["softSmile", "curious", "softSmile", "neutral"];
      const choice = choices[Math.floor(Math.random() * choices.length)];
      if (choice === "neutral") {
        this.state.nextExpressionAt = now + 2400 + Math.random() * 3400;
      } else {
        this.playExpression(choice, 720 + Math.random() * 620);
      }
    }

    getExpressionPose() {
      const strength = this.state.expressionBlend;
      const pose = {
        eyeL: 1,
        eyeR: 1,
        eyeSmileL: 0,
        eyeSmileR: 0,
        browLY: 0,
        browRY: 0,
        browLAngle: 0,
        browRAngle: 0,
        mouthForm: 0,
        mouthOpen: 0,
        cheek: 0,
        headTilt: 0,
      };

      const blend = (key, target) => {
        pose[key] += (target - pose[key]) * strength;
      };

      switch (this.state.expression) {
        case "curious":
          blend("eyeL", 1.05);
          blend("eyeR", 1.05);
          blend("browLY", 0.22);
          blend("browRY", 0.08);
          blend("browLAngle", -0.16);
          blend("browRAngle", 0.08);
          blend("mouthForm", 0.1);
          blend("headTilt", 4.2);
          break;
        case "bright":
          blend("eyeL", 0.9);
          blend("eyeR", 0.9);
          blend("eyeSmileL", 0.46);
          blend("eyeSmileR", 0.46);
          blend("browLY", 0.12);
          blend("browRY", 0.12);
          blend("mouthForm", 0.54);
          blend("cheek", 0.24);
          blend("headTilt", -2.2);
          break;
        case "softSmile":
          blend("eyeL", 0.86);
          blend("eyeR", 0.86);
          blend("eyeSmileL", 0.3);
          blend("eyeSmileR", 0.3);
          blend("mouthForm", 0.36);
          blend("cheek", 0.14);
          blend("headTilt", -1.2);
          break;
        case "relieved":
          blend("eyeL", 0.78);
          blend("eyeR", 0.82);
          blend("eyeSmileL", 0.38);
          blend("eyeSmileR", 0.34);
          blend("browLY", 0.08);
          blend("browRY", 0.08);
          blend("mouthForm", 0.44);
          blend("cheek", 0.18);
          blend("headTilt", -2.6);
          break;
        case "surprised":
          blend("eyeL", 1.12);
          blend("eyeR", 1.12);
          blend("browLY", 0.42);
          blend("browRY", 0.42);
          blend("mouthOpen", 0.22);
          blend("mouthForm", 0.04);
          blend("cheek", 0.1);
          blend("headTilt", 1.4);
          break;
        default:
          break;
      }

      return pose;
    }

    getLive2DPose(now) {
      const isPulled = this.state.dragging || this.state.settling;
      const dragLean = isPulled
        ? clamp((this.state.springVelocityX + this.state.velocityX * 0.24) / 980, -1, 1)
        : 0;
      const dragLift = isPulled
        ? clamp((this.state.springVelocityY + this.state.velocityY * 0.18) / 980, -1, 1)
        : 0;
      const lookX = isPulled ? clamp(this.state.lookX * 0.34 - dragLean * 0.58, -1, 1) : this.state.lookX;
      const lookY = isPulled ? clamp(this.state.lookY * 0.28 - dragLift * 0.38, -1, 1) : this.state.lookY;
      const eyeMicroX = Math.sin(now / 430) * 0.018 + Math.sin(now / 1170) * 0.012;
      const eyeMicroY = Math.sin(now / 710) * 0.012;
      const eyeX = isPulled
        ? clamp(this.state.eyeLookX * 0.3 - dragLean * 0.7, -1, 1)
        : clamp(this.state.eyeLookX + eyeMicroX, -1, 1);
      const eyeY = isPulled
        ? clamp(this.state.eyeLookY * 0.26 - dragLift * 0.42, -1, 1)
        : clamp(this.state.eyeLookY + eyeMicroY, -1, 1);
      const bodyX = clamp(this.state.bodyLookX * 0.62 + dragLean * 0.42, -1, 1);
      const bodyY = clamp(this.state.bodyLookY * 0.52 + dragLift * 0.28, -1, 1);
      const expression = this.getExpressionPose();
      const talkingMouth = now < this.state.talkUntil ? 0.22 + Math.abs(Math.sin(now / 82)) * 0.62 : 0;
      const blink = now < this.state.blinkUntil ? 0 : 1;
      const speedEnergy = clamp((Math.abs(this.state.velocityX) + Math.abs(this.state.velocityY)) / 1800, 0, 1);
      const dragWobble = this.state.dragging ? Math.sin(now / 68) * this.state.dragEnergy : 0;
      const eyeL = this.state.dragging
        ? clamp(1.04 - speedEnergy * 0.28 + dragWobble * 0.05, 0.64, 1.08)
        : expression.eyeL;
      const eyeR = this.state.dragging
        ? clamp(1.04 - speedEnergy * 0.24 - dragWobble * 0.05, 0.66, 1.08)
        : expression.eyeR;
      const mouth = Math.max(talkingMouth, expression.mouthOpen, this.state.dragging ? 0.06 + speedEnergy * 0.18 : 0);
      const idleHair = Math.sin(now / 780) * 0.026 + Math.sin(now / 1730) * 0.018;
      const hairSwing = clamp(this.state.lookX * -0.35 + this.state.hairMomentum + idleHair, -1, 1);
      const bodyZ = clamp(this.state.bodyLookX * -0.5 + dragLean * 0.72, -1, 1);
      const idleHeadTilt = Math.sin(now / 2100) * 0.85 + Math.sin(now / 3900) * 0.45;
      const idleBodySway = Math.sin(now / 2650) * 0.7;

      return {
        isPulled,
        dragLean,
        dragLift,
        lookX,
        lookY,
        eyeX,
        eyeY,
        bodyX,
        bodyY,
        bodyZ,
        mouth,
        eyeL: eyeL * blink,
        eyeR: eyeR * blink,
        eyeSmileL: this.state.dragging ? 0 : expression.eyeSmileL,
        eyeSmileR: this.state.dragging ? 0 : expression.eyeSmileR,
        browLY: this.state.dragging ? 0.26 - speedEnergy * 0.22 : expression.browLY,
        browRY: this.state.dragging ? 0.26 - speedEnergy * 0.22 : expression.browRY,
        browLAngle: this.state.dragging ? -dragWobble * 0.12 : expression.browLAngle,
        browRAngle: this.state.dragging ? dragWobble * 0.12 : expression.browRAngle,
        mouthForm: this.state.dragging ? -0.08 - speedEnergy * 0.12 : expression.mouthForm,
        cheek: this.state.dragging ? 0.12 : expression.cheek,
        hairSwing,
        angleX: lookX * 30 + dragLean * -3 + dragWobble * 2.2,
        angleY: lookY * 24 + dragLift * -2,
        angleZ: lookX * -7 + dragLean * 11 + expression.headTilt + idleHeadTilt + dragWobble * 2.4,
        bodyAngleX: bodyX * 12,
        bodyAngleY: bodyY * 8,
        bodyAngleZ: bodyZ * 12 + idleBodySway,
      };
    }

    applyLive2DParameters(now) {
      const coreModel = this.live2dModel?.internalModel?.coreModel;
      if (!coreModel) return;

      const {
        eyeX,
        eyeY,
        mouth,
        eyeL,
        eyeR,
        eyeSmileL,
        eyeSmileR,
        browLY,
        browRY,
        browLAngle,
        browRAngle,
        mouthForm,
        cheek,
        hairSwing,
        angleX,
        angleY,
        angleZ,
        bodyAngleX,
        bodyAngleY,
        bodyAngleZ,
      } = this.getLive2DPose(now);

      this.setLive2DParam(coreModel, "ParamAngleX", angleX);
      this.setLive2DParam(coreModel, "ParamAngleY", angleY);
      this.setLive2DParam(coreModel, "ParamAngleZ", angleZ);
      this.setLive2DParam(coreModel, "ParamEyeBallX", eyeX);
      this.setLive2DParam(coreModel, "ParamEyeBallY", -eyeY);
      this.setLive2DParam(coreModel, "ParamEyeLOpen", eyeL);
      this.setLive2DParam(coreModel, "ParamEyeROpen", eyeR);
      this.setLive2DParam(coreModel, "ParamEyeLSmile", eyeSmileL);
      this.setLive2DParam(coreModel, "ParamEyeRSmile", eyeSmileR);
      this.setLive2DParam(coreModel, "ParamBrowLY", browLY);
      this.setLive2DParam(coreModel, "ParamBrowRY", browRY);
      this.setLive2DParam(coreModel, "ParamBrowLAngle", browLAngle);
      this.setLive2DParam(coreModel, "ParamBrowRAngle", browRAngle);
      this.setLive2DParam(coreModel, "ParamBodyAngleX", bodyAngleX);
      this.setLive2DParam(coreModel, "ParamBodyAngleY", bodyAngleY);
      this.setLive2DParam(coreModel, "ParamBodyAngleZ", bodyAngleZ);
      this.setLive2DParam(coreModel, "ParamBreath", (this.state.breath + 1) * 0.5);
      this.setLive2DParam(coreModel, "ParamHairFront", clamp(hairSwing * 0.86, -1, 1));
      this.setLive2DParam(coreModel, "ParamHairSide", clamp(this.state.bodyLookX * -0.22 + hairSwing * 0.72, -1, 1));
      this.setLive2DParam(coreModel, "ParamHairBack", clamp(hairSwing * 0.55, -1, 1));
      this.setLive2DParam(coreModel, "ParamMouthOpenY", mouth);
      this.setLive2DParam(coreModel, "ParamMouthForm", now < this.state.talkUntil ? Math.max(0.28, mouthForm) : mouthForm);
      this.setLive2DParam(coreModel, "ParamCheek", cheek);
    }

    applyLive2DDisplayMotion(now) {
      if (!this.live2dModel || !this.live2dFit) return;
      const model = this.live2dModel;
      const pose = this.getLive2DPose(now);
      const dragX = this.state.dragVisualX;
      const dragY = this.state.dragVisualY;
      const dragTilt = this.state.dragTilt * (Math.PI / 180);
      const stretch = this.state.dragStretch;
      const breathY = this.state.breath * -2.2;
      const idleFloatX = Math.sin(now / 2350) * 0.8;
      const idleFloatY = Math.sin(now / 1250) * 0.55;
      const x = this.live2dFit.baseX + pose.lookX * 5.5 + dragX * 0.28 + pose.bodyX * 3.2 + idleFloatX;
      const y = this.live2dFit.baseY - pose.lookY * 4.8 + dragY * 0.22 + pose.bodyY * 3 + breathY + idleFloatY;
      const rotation = clamp(pose.lookX * 0.044 + pose.bodyZ * 0.064 + dragTilt * 0.26, -0.15, 0.15);
      const skewX = clamp(-pose.lookY * 0.018 + pose.bodyY * 0.018, -0.042, 0.042);
      const skewY = clamp(pose.lookX * 0.012 + pose.bodyX * 0.014, -0.034, 0.034);
      const scaleX = this.live2dFit.scale * (1 + stretch * 0.012 + this.state.breath * 0.0012);
      const scaleY = this.live2dFit.scale * (1 - stretch * 0.008 + this.state.breath * 0.0024);

      model.position?.set?.(x, y);
      if (model.scale?.set) model.scale.set(scaleX, scaleY);
      model.rotation = rotation;
      if (model.skew?.set) model.skew.set(skewX, skewY);
      else if (model.skew) {
        model.skew.x = skewX;
        model.skew.y = skewY;
      }
    }

    connectCore() {
      window.clearTimeout(this.reconnectTimer);
      try {
        this.socket?.close();
        this.socket = new WebSocket(this.coreUrl);
        this.setStatus("连接中");
        this.socket.onopen = () => {
          this.setStatus("在线");
          this.say("连上 Joi Core 了。", 1400);
        };
        this.socket.onclose = () => {
          this.setStatus("离线");
          this.reconnectTimer = window.setTimeout(() => this.connectCore(), 2200);
        };
        this.socket.onerror = () => this.setStatus("离线");
        this.socket.onmessage = (event) => this.handleCoreMessage(event.data);
      } catch {
        this.setStatus("离线");
      }
    }

    handleCoreMessage(raw) {
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return;
      }
      if (payload.method !== "agent.event" || !payload.params) return;
      const event = payload.params;
      if (event.type === "user_message") return;
      const text = event.display_card?.summary || event.voice_line?.text || event.display_card?.title || "";
      if (!text) return;
      this.addMessage("joi", text);
      this.say(text);
      this.talk(1200);
      if (event.type === "task_completed" || event.type === "runtime_final") {
        this.playExpression("bright", 1500);
        this.root.classList.add("is-happy");
        window.setTimeout(() => this.root.classList.remove("is-happy"), 1500);
      } else {
        this.playExpression("softSmile", 1050);
      }
    }

    submit(event) {
      event.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;
      this.input.value = "";
      this.addMessage("user", text);
      this.say("收到。");
      this.talk(520);
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          jsonrpc: "2.0",
          id: `live2d-${this.nextId++}`,
          method: "user.message",
          params: { text },
        }));
      } else {
        window.setTimeout(() => {
          this.addMessage("joi", "Joi Core 还没连上，我先保持待机。");
          this.say("Core 还没连上。");
        }, 240);
      }
    }

    addMessage(role, text) {
      this.messages.push({ role, text });
      if (this.messages.length > 36) this.messages.shift();
      this.stream.innerHTML = "";
      for (const message of this.messages) {
        const node = document.createElement("div");
        node.className = `joi-live2d-message ${message.role}`;
        node.textContent = message.text;
        this.stream.append(node);
      }
      this.stream.scrollTop = this.stream.scrollHeight;
    }

    say(text, timeout = 0) {
      this.bubbleText.textContent = text.length > 66 ? `${text.slice(0, 66)}...` : text;
      if (timeout) {
        window.clearTimeout(this.sayTimer);
        this.sayTimer = window.setTimeout(() => {
          this.bubbleText.textContent = "我在。";
        }, timeout);
      }
    }

    talk(duration = 900) {
      this.root.classList.add("is-talking");
      this.state.talkUntil = Math.max(this.state.talkUntil, frameNow() + duration);
      window.clearTimeout(this.talkTimer);
      this.talkTimer = window.setTimeout(() => this.root.classList.remove("is-talking"), duration);
    }

    setStatus(text) {
      this.statusText.textContent = text;
    }

    togglePanel(open) {
      this.state.expanded = open;
      this.root.classList.toggle("is-open", open);
      if (open) window.setTimeout(() => this.input.focus(), 40);
    }

    scheduleBlink() {
      const delay = 2200 + Math.random() * 3600;
      this.blinkTimer = window.setTimeout(() => {
        this.triggerBlink();
        if (Math.random() < 0.22) {
          this.blinkTimer = window.setTimeout(() => {
            this.triggerBlink(135);
            this.scheduleBlink();
          }, 220);
        } else {
          this.scheduleBlink();
        }
      }, delay);
    }

    triggerBlink(duration = 160) {
      this.state.blinkUntil = frameNow() + duration;
      this.root.classList.remove("is-blinking");
      void this.root.offsetWidth;
      this.root.classList.add("is-blinking");
      window.setTimeout(() => this.root.classList.remove("is-blinking"), duration + 50);
    }

    animate() {
      if (!this.isConnected) return;
      const now = frameNow();
      const dt = this.updateSpring(now);
      this.updatePersonality(now, dt);
      const lookLambda = this.state.dragging ? 9 : 4.8;
      const eyeLambda = this.state.dragging ? 13 : 12;
      this.state.lookX = damp(this.state.lookX, this.state.targetLookX, lookLambda, dt);
      this.state.lookY = damp(this.state.lookY, this.state.targetLookY, lookLambda, dt);
      this.state.eyeLookX = damp(this.state.eyeLookX, this.state.targetLookX, eyeLambda, dt);
      this.state.eyeLookY = damp(this.state.eyeLookY, this.state.targetLookY, eyeLambda, dt);
      this.state.bodyLookX = damp(this.state.bodyLookX, this.state.lookX, 2.55, dt);
      this.state.bodyLookY = damp(this.state.bodyLookY, this.state.lookY, 2.2, dt);
      this.state.breath = Math.sin(now / 820) * 0.72 + Math.sin(now / 1970) * 0.28;
      this.root.style.setProperty("--look-x", this.state.lookX.toFixed(3));
      this.root.style.setProperty("--look-y", this.state.lookY.toFixed(3));
      this.root.style.setProperty("--breath", this.state.breath.toFixed(3));
      if (this.live2dModel && this.live2dApp) {
        const lastUpdate = this.lastLive2DUpdateAt || now;
        const delta = clamp(now - lastUpdate, 8, 42);
        this.lastLive2DUpdateAt = now;
        this.live2dModel.update?.(delta);
        this.applyLive2DParameters(now);
        this.applyLive2DDisplayMotion(now);
        this.live2dModel.internalModel?.coreModel?.update?.();
        this.live2dApp.render?.();
      }
      requestAnimationFrame(() => this.animate());
    }
  }

  if (!customElements.get("joi-live2d-assistant")) {
    customElements.define("joi-live2d-assistant", JoiLive2DAssistant);
  }

  function mount() {
    if (document.querySelector("joi-live2d-assistant")) return;
    const assistant = document.createElement("joi-live2d-assistant");
    assistant.setAttribute("core-url", "ws://127.0.0.1:8765");
    document.body.append(assistant);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
