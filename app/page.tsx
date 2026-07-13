"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Language = "en" | "zh";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const sitePath = (path: string) => `${basePath}${path}`;

const copy = {
  en: {
    nav: ["WORK", "THOUGHTS", "ABOUT"],
    heroKicker: "AI PRODUCT · PRODUCT DESIGN",
    heroTitle: "I DESIGN HOW AI ENTERS HUMAN LIFE.",
    heroQuestion: "Shall we see how far a personality can travel?",
    workEyebrow: "SELECTED WORK / 2026",
    workTitle: "Two products. One continuous question.",
    workLead:
      "What changes when an AI stops being a feature and starts becoming a presence? Joi explores the relationship on the desktop. Joi Map carries it toward the physical world.",
    thoughtsEyebrow: "THOUGHTS / FIELD NOTES",
    thoughtsTitle: "Technology becomes interesting when it starts sharing a life.",
    aboutEyebrow: "ABOUT GALLO",
    aboutTitle: "Product thinking, language sensitivity, and the urge to make the unfamiliar feel human.",
    aboutBody:
      "I am Gallo, an AI product builder and product designer based in Guangzhou. My background in Russian localization trained me to notice tone, context, and the distance between what a system says and what a person feels. I now use that sensitivity to shape AI workflows and companion products.",
    resume: "VIEW RESUME",
    github: "OPEN GITHUB",
    footer: "Let’s build technology people can live with.",
  },
  zh: {
    nav: ["项目", "思考", "关于"],
    heroKicker: "AI 产品 · 产品设计",
    heroTitle: "我设计 AI 如何进入人的生活。",
    heroQuestion: "一个人格，究竟可以走多远？",
    workEyebrow: "精选项目 / 2026",
    workTitle: "两个产品，延续同一个问题。",
    workLead:
      "当 AI 不再只是一个功能，而逐渐成为一种陪伴，我们与技术的关系会发生什么变化？Joi 从桌面开始探索，Joi Map 则把这种关系推向现实世界。",
    thoughtsEyebrow: "思考 / 观察记录",
    thoughtsTitle: "当技术开始参与生活，它才真正变得有趣。",
    aboutEyebrow: "关于 GALLO",
    aboutTitle: "产品思考、语言敏感度，以及让陌生技术变得有人情味的冲动。",
    aboutBody:
      "我是 Gallo，一名位于广州的 AI 产品构建者与产品设计师。俄语本地化经历让我持续关注语气、上下文，以及系统表达和人的感受之间的距离。现在，我把这种敏感度用于设计 AI 工作流与虚拟人格产品。",
    resume: "查看简历",
    github: "访问 GITHUB",
    footer: "一起构建可以与人共同生活的技术。",
  },
} as const;

const projects = [
  {
    index: "01",
    slug: "joi",
    name: "JOI — PRESENCE",
    kind: "WINDOWS-FIRST MULTIMODAL COMPANION",
    image: "/assets/joi-app-v3.png",
    repo: "https://github.com/Gallo233/Joi",
    en: "A local companion that can observe context, plan, ask for approval, act through tools, and remain accountable.",
    zh: "一个能够观察上下文、规划、请求确认、调用工具并保持可审计的本地桌面伴侣。",
  },
  {
    index: "02",
    slug: "joi-map",
    name: "JOI MAP — REACH",
    kind: "SWIFTUI · MAPKIT · VISION · VOICE",
    image: "/assets/joi-map-v3.png",
    repo: "https://github.com/Gallo233/joi-map-ios",
    en: "A world-facing guide that connects location, vision, narration, and itinerary into one continuous presence.",
    zh: "一个走向现实世界的导览产品，把定位、识景、讲解与行程串联成持续的陪伴。",
  },
] as const;

const thoughts = [
  {
    number: "01",
    titleEn: "A personality is not a skin.",
    titleZh: "人格不是一层皮肤。",
    bodyEn: "If an AI has a face but no continuity, memory, boundaries, or way of being interrupted, it is still only interface decoration.",
    bodyZh: "如果 AI 只有形象，却没有连续性、记忆、边界和被打断的能力，它依然只是界面装饰。",
  },
  {
    number: "02",
    titleEn: "Maps are social boundaries.",
    titleZh: "地图也是一种社会边界。",
    bodyEn: "A guide does more than locate. It chooses what to notice, what to explain, and how close technology should stand to a real moment.",
    bodyZh: "导览不只是在定位，它也在决定什么值得被注意、如何解释，以及技术应该站得离真实时刻多近。",
  },
  {
    number: "03",
    titleEn: "Useful AI should be interruptible.",
    titleZh: "有用的 AI 应该随时可以被打断。",
    bodyEn: "Agency feels trustworthy when its observations, intentions, and actions remain legible to the person sharing the task.",
    bodyZh: "当观察、意图和行动始终对共同完成任务的人可见时，智能体才更值得信任。",
  },
] as const;

export default function Page() {
  const [language, setLanguage] = useState<Language>("en");
  const [navVisible, setNavVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const t = copy[language];

  const labels = useMemo(
    () => ({ work: t.nav[0], thoughts: t.nav[1], about: t.nav[2] }),
    [t],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("gallo-language");
    if (saved === "zh" || saved === "en") setLanguage(saved);

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.16 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => reveal.observe(node));

    const updateScroll = () => {
      const progress = Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
      document.documentElement.style.setProperty("--scroll-progress", String(progress));
      setNavVisible(window.scrollY > Math.min(window.innerHeight * 0.72, 720));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      reveal.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem("gallo-language", next);
  };

  const moveHero = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--hero-x", `${x * -8}px`);
    event.currentTarget.style.setProperty("--hero-y", `${y * -6}px`);
  };

  return (
    <main className="gallo-site">
      <div className="scroll-progress" aria-hidden="true" />

      <header className={`floating-nav ${navVisible ? "is-visible" : ""}`} aria-label="Main navigation">
        <a className="wordmark" href="#top">GALLO</a>
        <nav>
          <a href="#work">{labels.work}</a>
          <a href="#thoughts">{labels.thoughts}</a>
          <a href="#about">{labels.about}</a>
        </nav>
        <LanguageToggle language={language} onChange={changeLanguage} />
      </header>

      <section className="brief-hero" id="top" ref={heroRef} onPointerMove={moveHero}>
        <div className="brief-stage">
          <img
            className="brief-image"
            src={sitePath("/media/gallo-home-brief.png")}
            alt="Gallo portfolio hero: I design how AI enters human life, featuring Joi and the Joi Map landscape"
          />
          <a className="brief-hotspot brief-work" href="#work"><span className="sr-only">Work</span></a>
          <a className="brief-hotspot brief-thoughts" href="#thoughts"><span className="sr-only">Thoughts</span></a>
          <a className="brief-hotspot brief-about" href="#about"><span className="sr-only">About</span></a>
          <a className="brief-hotspot brief-joi" href={sitePath("/joi")}><span className="sr-only">Joi case study</span></a>
          <a className="brief-hotspot brief-map" href={sitePath("/joi-map")}><span className="sr-only">Joi Map case study</span></a>
        </div>

        <div className="mobile-hero-nav">
          <a className="wordmark" href="#top">GALLO</a>
          <LanguageToggle language={language} onChange={changeLanguage} />
        </div>
        <div className="mobile-hero-copy">
          <p>{t.heroKicker}</p>
          <h1>{t.heroTitle}</h1>
          <span>{t.heroQuestion}</span>
        </div>
        <div className="mobile-project-links">
          <a href={sitePath("/joi")}><strong>01</strong><span>JOI — PRESENCE</span></a>
          <a href={sitePath("/joi-map")}><strong>02</strong><span>JOI MAP — REACH</span></a>
        </div>
      </section>

      <section className="opening-statement section-shell" aria-label="Portfolio statement">
        <p className="micro-label" data-reveal>TECHNOLOGY / PEOPLE / PRESENCE</p>
        <p className="statement-display" data-reveal>
          Curiosity begins where a product stops explaining itself and starts changing how a moment feels.
        </p>
        <div className="statement-meta" data-reveal>
          <span>Gallo · Guangzhou</span>
          <span>AI Product / Product Design</span>
          <span>Available for new conversations</span>
        </div>
      </section>

      <section className="work-section section-shell" id="work">
        <div className="section-heading" data-reveal>
          <p>{t.workEyebrow}</p>
          <h2>{t.workTitle}</h2>
          <span>{t.workLead}</span>
        </div>

        <div className="project-stack">
          {projects.map((project) => (
            <article className="project-feature" key={project.slug} data-reveal>
              <a className="project-image" href={sitePath(`/${project.slug}`)}>
                <img src={sitePath(project.image)} alt={`${project.name} character and visual system`} />
                <span className="project-index">{project.index}</span>
              </a>
              <div className="project-copy">
                <p>{project.kind}</p>
                <h3><a href={sitePath(`/${project.slug}`)}>{project.name}</a></h3>
                <span>{language === "en" ? project.en : project.zh}</span>
                <div className="project-actions">
                  <a href={sitePath(`/${project.slug}`)}>{language === "en" ? "READ CASE" : "查看项目"}</a>
                  <a href={project.repo} target="_blank" rel="noreferrer">GITHUB</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="thoughts-section" id="thoughts">
        <div className="thoughts-intro section-shell" data-reveal>
          <p>{t.thoughtsEyebrow}</p>
          <h2>{t.thoughtsTitle}</h2>
        </div>

        <div className="observation-grid section-shell">
          <figure className="observation-wide" data-reveal>
            <img src={sitePath("/media/cat-observation.jpg")} alt="A black-and-white photograph of a cat turning toward the camera" />
            <figcaption>Observation 01 — proximity changes behavior.</figcaption>
          </figure>
          <figure className="observation-detail" data-reveal>
            <img src={sitePath("/media/cat-detail.jpg")} alt="A black-and-white close photograph of a cat's eyes" />
            <figcaption>Observation 02 — attention is a product material.</figcaption>
          </figure>
        </div>

        <div className="thought-list section-shell">
          {thoughts.map((thought) => (
            <article key={thought.number} data-reveal>
              <span>{thought.number}</span>
              <h3>{language === "en" ? thought.titleEn : thought.titleZh}</h3>
              <p>{language === "en" ? thought.bodyEn : thought.bodyZh}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section section-shell" id="about">
        <div className="about-visual" data-reveal>
          <img src={sitePath("/media/gallo-mountain.jpg")} alt="Gallo standing in a high-altitude mountain landscape" />
          <span>FIELD NOTE / LOOKING OUTWARD</span>
        </div>
        <div className="about-copy" data-reveal>
          <p>{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
          <span>{t.aboutBody}</span>
          <div className="about-facts">
            <div><strong>2026</strong><span>Russian localization · KURO GAMES</span></div>
            <div><strong>02</strong><span>Independent AI product lines</span></div>
            <div><strong>03</strong><span>Chinese · English · Russian</span></div>
          </div>
        </div>
        <figure className="about-portrait" data-reveal>
          <img src={sitePath("/media/gallo-headshot.jpg")} alt="Portrait of Gallo" />
          <figcaption>Gallo / 刘家骆<br />AI product · product design</figcaption>
        </figure>
      </section>

      <section className="resume-section section-shell" aria-label="Resume and contact">
        <div data-reveal>
          <p>EXPERIENCE / RESUME</p>
          <h2>{language === "en" ? "From language systems to agent systems." : "从语言系统，走向智能体系统。"}</h2>
        </div>
        <div className="resume-timeline" data-reveal>
          <div><span>2026.06 — 07</span><strong>JOI MAP</strong><p>SwiftUI, MapKit, Vision, multilingual field-guide experience.</p></div>
          <div><span>2026.05 — 07</span><strong>JOI</strong><p>Python agent core, Tauri/Vue shell, MCP tools, auditable Computer Use.</p></div>
          <div><span>2026.01 — 06</span><strong>KURO GAMES</strong><p>Russian localization and AI-assisted QA workflow design.</p></div>
          <div><span>2022 — 26</span><strong>GDUFS</strong><p>Russian language, cross-cultural communication, team leadership.</p></div>
        </div>
        <div className="resume-actions" data-reveal>
          <a href={sitePath("/resume/gallo-liu-resume-cn.pdf")} target="_blank" rel="noreferrer">{t.resume}</a>
          <a href="https://github.com/Gallo233" target="_blank" rel="noreferrer">{t.github}</a>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <p>{t.footer}</p>
        <div>
          <a href="#top">GALLO</a>
          <a href="https://github.com/Gallo233" target="_blank" rel="noreferrer">GITHUB</a>
          <a href={sitePath("/resume/gallo-liu-resume-cn.pdf")} target="_blank" rel="noreferrer">RESUME</a>
        </div>
        <span>© 2026 GALLO · GUANGZHOU</span>
      </footer>
    </main>
  );
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="language-toggle" aria-label="Language selector">
      <button className={language === "zh" ? "is-active" : ""} onClick={() => onChange("zh")} type="button">中文</button>
      <span>/</span>
      <button className={language === "en" ? "is-active" : ""} onClick={() => onChange("en")} type="button">EN</button>
    </div>
  );
}
