const body = document.body;
const root = document.documentElement;

const stateText = {
  phoneIntro: "Joi Map 已接通",
  doorApproach: "门口传来敲门声",
  peepholeLocked: "猫眼还没有打开",
  peepholeOpen: "Joi 在门外",
  doorOpen: "正在推门",
  home: "All Joi 工作室",
};

const dialogueText = {
  app: "“桌面这边交给我。代码、屏幕、任务和记忆，我会在旁边接住。”",
  map: "“出门的时候我换这套。侧边麻花辫是我的 Map 标记，很好认吧？”",
  autopilot: "“把想法交给工坊，我们让它一轮一轮长成真正能跑的东西。”",
  universe: "“角色、宠物、故事、世界观，都可以慢慢变成能被体验的入口。”",
};

const introStatus = document.querySelector("#introStatus");
const skipIntro = document.querySelector("#skipIntro");
const replayIntro = document.querySelector("#replayIntro");
const openDoor = document.querySelector("#openDoor");
const peepholeRing = document.querySelector("#peepholeRing");
const siteHome = document.querySelector("#siteHome");
const dialogue = document.querySelector("#joiDialogue");
const cards = Array.from(document.querySelectorAll("[data-joi-card]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentState = "phoneIntro";
let timers = [];
let peepholeProgress = 0;
let dragging = false;
let dragStartY = 0;
let dragStartProgress = 0;
let pointerFrame = 0;
let mouseX = 0;
let mouseY = 0;

function clearTimers() {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers = [];
}

function queue(callback, delay) {
  const timer = window.setTimeout(callback, reduceMotion ? Math.min(delay, 150) : delay);
  timers.push(timer);
}

function setPeepholeProgress(value) {
  peepholeProgress = Math.max(0, Math.min(1, value));
  root.style.setProperty("--peephole-progress", peepholeProgress.toFixed(3));
  root.style.setProperty("--peephole-opacity", (0.15 + peepholeProgress * 0.85).toFixed(3));
  root.style.setProperty("--peephole-scale", (0.86 + peepholeProgress * 0.14).toFixed(3));
  root.style.setProperty("--peephole-blur", `${((1 - peepholeProgress) * 3).toFixed(2)}px`);
  root.style.setProperty("--peephole-shutter", `${(-103 * peepholeProgress).toFixed(2)}%`);

  if (currentState === "peepholeLocked" && peepholeProgress >= 0.96) {
    setState("peepholeOpen");
  }
}

function playVideoForState(state) {
  const key = state === "phoneIntro" ? "phone" : state === "peepholeOpen" ? "peephole" : null;
  document.querySelectorAll(".optional-video").forEach((video) => {
    if (video.dataset.videoKey === key && video.dataset.ready === "true") {
      video.play().catch(() => {});
      return;
    }
    video.pause();
  });
}

function setState(nextState) {
  clearTimers();
  currentState = nextState;
  body.dataset.state = nextState;
  introStatus.textContent = stateText[nextState] || stateText.home;
  playVideoForState(nextState);

  if (nextState === "phoneIntro") {
    window.scrollTo({ top: 0, behavior: "auto" });
    siteHome.setAttribute("aria-hidden", "true");
    setPeepholeProgress(0);
    queue(() => setState("doorApproach"), 3400);
  }

  if (nextState === "doorApproach") {
    queue(() => setState("peepholeLocked"), 3000);
  }

  if (nextState === "peepholeLocked") {
    setPeepholeProgress(Math.max(peepholeProgress, 0.02));
  }

  if (nextState === "peepholeOpen") {
    setPeepholeProgress(1);
  }

  if (nextState === "doorOpen") {
    queue(() => setState("home"), 1300);
  }

  if (nextState === "home") {
    siteHome.removeAttribute("aria-hidden");
    queue(() => {
      siteHome.focus({ preventScroll: true });
      revealVisible();
    }, 40);
  }
}

function markVideoReady(video) {
  video.dataset.ready = "true";
  const wrap = video.closest(".video-wrap");
  if (wrap) wrap.classList.add("has-video");
}

function markVideoMissing(video) {
  video.dataset.ready = "false";
  const wrap = video.closest(".video-wrap");
  if (wrap) wrap.classList.remove("has-video");
}

const shouldAutoloadVideo = new URLSearchParams(window.location.search).get("video") === "1";

document.querySelectorAll(".optional-video").forEach((video) => {
  video.addEventListener("canplay", () => markVideoReady(video));
  video.addEventListener("error", () => markVideoMissing(video));

  if (shouldAutoloadVideo || video.dataset.videoAutoload === "true") {
    video.src = video.dataset.videoSrc;
    video.load();
  }
});

window.addEventListener(
  "wheel",
  (event) => {
    if (currentState !== "peepholeLocked") return;
    event.preventDefault();
    setPeepholeProgress(peepholeProgress + -event.deltaY * 0.0017);
  },
  { passive: false },
);

if (peepholeRing) {
  peepholeRing.addEventListener("pointerdown", (event) => {
    if (currentState !== "peepholeLocked") return;
    dragging = true;
    dragStartY = event.clientY;
    dragStartProgress = peepholeProgress;
    peepholeRing.setPointerCapture(event.pointerId);
  });

  peepholeRing.addEventListener("pointermove", (event) => {
    if (!dragging || currentState !== "peepholeLocked") return;
    const delta = dragStartY - event.clientY;
    setPeepholeProgress(dragStartProgress + delta / Math.max(window.innerHeight * 0.42, 260));
  });

  peepholeRing.addEventListener("pointerup", (event) => {
    dragging = false;
    if (peepholeRing.hasPointerCapture(event.pointerId)) {
      peepholeRing.releasePointerCapture(event.pointerId);
    }
    if (currentState === "peepholeLocked" && peepholeProgress > 0.72) {
      setState("peepholeOpen");
    }
  });

  peepholeRing.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

skipIntro.addEventListener("click", () => setState("home"));
openDoor.addEventListener("click", () => setState("doorOpen"));

replayIntro.addEventListener("click", () => {
  setState("phoneIntro");
});

function activateCard(card) {
  const key = card.dataset.joiCard;
  cards.forEach((item) => {
    const active = item === card;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-expanded", String(active));
  });

  if (dialogue && dialogueText[key]) {
    dialogue.textContent = dialogueText[key];
  }
}

cards.forEach((card) => {
  card.addEventListener("click", () => activateCard(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard(card);
    }
  });
});

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
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
        { threshold: 0.18 },
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

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX / window.innerWidth - 0.5;
  mouseY = event.clientY / window.innerHeight - 0.5;

  if (pointerFrame) return;
  pointerFrame = window.requestAnimationFrame(() => {
    root.style.setProperty("--phone-x", `${(mouseX * 12).toFixed(2)}px`);
    root.style.setProperty("--phone-y", `${(mouseY * 9).toFixed(2)}px`);
    root.style.setProperty("--ring-x", `${(mouseX * 8).toFixed(2)}px`);
    root.style.setProperty("--ring-y", `${(mouseY * 6).toFixed(2)}px`);
    root.style.setProperty("--figure-x", `${(mouseX * -14).toFixed(2)}px`);
    root.style.setProperty("--figure-y", `${(mouseY * -10).toFixed(2)}px`);
    pointerFrame = 0;
  });
});

window.addEventListener("scroll", revealVisible, { passive: true });

if (new URLSearchParams(window.location.search).get("skipIntro") === "1") {
  setState("home");
} else {
  setState("phoneIntro");
}
