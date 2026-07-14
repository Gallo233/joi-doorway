"use client";

import Script from "next/script";
import { BlurLine, FadingVideo } from "../components/CinematicEffects";
import { JoiMapNativeDemo, JoiNativeDemo } from "../components/NativeProjectDemos";

export default function Page() {
  return (
    <>
      <main className="site-home gallo-experience" id="siteHome" tabIndex={-1}>
        <canvas className="shader-canvas" id="shaderCanvas" aria-hidden="true" />
        <header className="gallo-hud" aria-label="Main navigation">
          <a className="gallo-wordmark liquid-glass magnetic" href="#top" aria-label="Gallo, back to top">
            <span>G</span><b>GALLO</b>
          </a>
          <nav className="liquid-glass">
            <a className="magnetic" href="#work">WORK</a>
            <a className="magnetic" href="#thoughts">THOUGHTS</a>
            <a className="magnetic" href="#about">ABOUT</a>
          </nav>
          <a className="replay-button liquid-glass-strong magnetic" href="mailto:liujialuo233@gmail.com">LET&apos;S TALK ↗</a>
        </header>

        <section className="gallo-hero" id="top" data-joi-narration="欢迎来到 Gallo 的世界。我们从这里开始。">
          <div className="gallo-hero-sticky">
            <div className="hero-signal liquid-glass">
              <span><i />NOW BUILDING</span>
              <p>Joi — a personality moving from screen into world</p>
            </div>
            <p className="hero-index">AI PRODUCT · PRODUCT DESIGN / GUANGZHOU · 2026</p>
            <h1 aria-label="I design how AI enters human life">
              <BlurLine text="I DESIGN" delay={0.18} />
              <BlurLine text="HOW AI ENTERS" className="hero-line-outline" delay={0.34} />
              <BlurLine text="HUMAN LIFE." delay={0.58} />
            </h1>
            <div className="hero-question">
              <span>TECHNOLOGY × PEOPLE</span>
              <p>Shall we see how far a personality can travel?</p>
            </div>
            <div className="hero-actions">
              <a className="hero-enter liquid-glass-strong magnetic" href="#work">ENTER THE WORK <span>↓</span></a>
              <a className="hero-secondary magnetic" href="https://github.com/Gallo233" target="_blank" rel="noreferrer">VIEW GITHUB ↗</a>
            </div>
            <div className="hero-proof" aria-label="Portfolio summary">
              <div className="liquid-glass"><span>02</span><p>Living product surfaces</p></div>
              <div className="liquid-glass"><span>LOCAL → WORLD</span><p>One continuous personality</p></div>
            </div>
          </div>
        </section>

        <section className="manifesto cinematic-capabilities" id="thoughts" data-joi-narration="一个人格不只是皮肤。它需要连续性、边界和被打断的能力。">
          <FadingVideo className="capabilities-video" src="/assets/peephole-joi.mp4" poster="/media/joi-live2d-preview.png" />
          <div className="capabilities-atmosphere" aria-hidden="true" />
          <header className="capabilities-heading" data-reveal>
            <p className="section-tag">01 / A LEGIBLE PRESENCE</p>
            <h2>Presence,<br /><em>made legible.</em></h2>
            <p>Joi is not a face placed over a system. The personality makes context, intention and boundaries easier to understand.</p>
          </header>
          <div className="capability-grid">
            <article className="capability-card liquid-glass" data-reveal>
              <div className="capability-card-top"><span className="capability-icon">◉</span><div><i>OBSERVE</i><i>MEMORY</i></div></div>
              <div><span className="capability-number">01</span><h3>Context</h3><p>Notice the moment, remember what matters, and keep the person—not the data—as the center of attention.</p></div>
            </article>
            <article className="capability-card liquid-glass" data-reveal>
              <div className="capability-card-top"><span className="capability-icon">↳</span><div><i>PLAN</i><i>APPROVAL</i></div></div>
              <div><span className="capability-number">02</span><h3>Boundaries</h3><p>Show the next step before taking it. Every meaningful action stays visible, interruptible and reversible.</p></div>
            </article>
            <article className="capability-card liquid-glass" data-reveal>
              <div className="capability-card-top"><span className="capability-icon">∞</span><div><i>CHARACTER</i><i>VOICE</i></div></div>
              <div><span className="capability-number">03</span><h3>Continuity</h3><p>Carry one recognizable personality from a local desktop companion into maps, places and shared experience.</p></div>
            </article>
          </div>
        </section>

        <section className="work-intro" id="work">
          <p className="section-tag">02 / SELECTED WORK</p>
          <h2>Two products.<br />One continuous question.</h2>
          <p>What happens when a virtual personality becomes a presence—and then begins to reach the physical world?</p>
        </section>

        <article className="native-project native-project-dark" data-joi-card="joi" data-accent="0.18" data-joi-narration="这是 Joi。她先让自己的意图和行动变得可见。">
          <div className="native-project-sticky">
            <header className="project-header">
              <span>01</span><h3>JOI / PRESENCE</h3><p>WINDOWS-FIRST MULTIMODAL COMPANION</p>
            </header>
            <div className="project-live-stage">
              <JoiNativeDemo />
            </div>
            <footer className="project-footer">
              <p>A local companion that observes context, asks before acting, and keeps every action legible.</p>
              <div><a className="magnetic" href="https://github.com/Gallo233/Joi" target="_blank" rel="noreferrer">GITHUB ↗</a><a className="magnetic" href="/joi">CASE STUDY →</a></div>
            </footer>
          </div>
        </article>

        <section className="kinetic-bridge" aria-label="Presence becomes reach">
          <div><span>PRESENCE BECOMES REACH · </span><span>PRESENCE BECOMES REACH · </span></div>
        </section>

        <article className="native-project native-project-light" data-joi-card="map" data-accent="0.82" data-joi-narration="这是 Joi Map。人格开始学习地点、视野与真实世界的节奏。">
          <div className="native-project-sticky">
            <header className="project-header">
              <span>02</span><h3>JOI MAP / REACH</h3><p>SWIFTUI · MAPKIT · VISION · VOICE</p>
            </header>
            <div className="project-live-stage">
              <JoiMapNativeDemo />
            </div>
            <footer className="project-footer">
              <p>A world-facing guide connecting place, vision, narration and memory into one continuous presence.</p>
              <div><a className="magnetic" href="https://github.com/Gallo233/joi-map-ios" target="_blank" rel="noreferrer">GITHUB ↗</a><a className="magnetic" href="/joi-map">CASE STUDY →</a></div>
            </footer>
          </div>
        </article>

        <section className="about-section" id="about" data-joi-narration="最后是 Gallo。他在做的，是让陌生的技术变得可以共同生活。">
          <p className="section-tag">03 / GALLO</p>
          <h2>Curious about<br />what technology<br />changes in us.</h2>
          <div className="about-grid">
            <p>I am Gallo, an AI product builder and product designer in Guangzhou. I care about the distance between what a system says, what it intends, and what a person actually feels.</p>
            <div className="about-links">
              <a className="magnetic" href="/resume/gallo-liu-resume-cn.pdf" target="_blank">RESUME ↗</a>
              <a className="magnetic" href="https://github.com/Gallo233" target="_blank" rel="noreferrer">GITHUB ↗</a>
              <a className="magnetic" href="mailto:liujialuo233@gmail.com">EMAIL ↗</a>
            </div>
          </div>
        </section>

        <footer className="gallo-footer">
          <p>LET&apos;S MAKE TECHNOLOGY<br />PEOPLE CAN LIVE WITH.</p>
          <a className="footer-door magnetic" href="#top">BACK TO TOP ↑</a>
          <span>GALLO · GUANGZHOU · GMT+8</span>
        </footer>
      </main>

      <Script src="/main-site.js" strategy="afterInteractive" />
      <Script src="/live2d/joi-live2d.js" strategy="afterInteractive" />
    </>
  );
}
