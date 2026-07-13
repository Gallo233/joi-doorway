"use client";

import Script from "next/script";
import { JoiMapNativeDemo, JoiNativeDemo, WorldField } from "../components/NativeProjectDemos";

export default function Page() {
  return (
    <>
      <div className="intro-root" id="introRoot" aria-live="off">
        <button className="skip-intro" id="skipIntro" type="button" aria-label="跳过开场">
          SKIP
        </button>

        <section className="phone-sequence-stage" aria-label="Open Joi Map">
          <div className="phone-light" aria-hidden="true" />
          <div className="phone-device native-phone-device" id="phoneDevice">
            <div className="native-phone-shell">
              <div className="native-phone-status" aria-hidden="true">
                <span>09:40</span><span>5G · 100%</span>
              </div>
              <div className="native-phone-home">
                <div className="phone-home-copy">
                  <span>SUNDAY · JUL 13</span>
                  <strong>22°</strong>
                  <p>GUANGZHOU · CLEAR</p>
                </div>
                <button className="joi-map-app-hit" id="joiMapApp" type="button" aria-label="打开 Joi Map">
                  <img src="/assets/joi-map-app-icon.png" alt="" />
                  <span>Joi Map</span>
                </button>
                <p className="phone-opening-cue">TAP TO OPEN</p>
              </div>
              <div className="native-phone-map" aria-hidden="true">
                <WorldField variant="intro" />
                <div className="phone-map-search"><span>Joi Map</span><b>LISTENING</b></div>
                <div className="phone-map-route">
                  <span>Joi is outside</span>
                  <strong>3 min · front door</strong>
                </div>
                <div className="phone-map-dock"><span>NEARBY</span><span>VISION</span><span>ROUTE</span></div>
              </div>
              <span className="tap-ripple" aria-hidden="true" />
            </div>
          </div>
          <div className="knock-field" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="door-approach-stage" aria-label="Approach the peephole">
          <img className="door-approach-bg" src="/assets/doorway-bg.png" alt="" aria-hidden="true" />
          <div className="turn-vignette" aria-hidden="true" />
          <div className="peephole-lock" aria-hidden="true" />
          <div className="peephole-interaction" id="peepholeInteraction">
            <button className="peephole-hit" id="peepholeHit" type="button" aria-label="向上滑开猫眼" />
            <div className="peephole-lens" aria-hidden="true">
              <div className="peephole-view">
                <video src="/assets/peephole-joi.mp4" muted autoPlay loop playsInline preload="auto" />
              </div>
              <div className="peephole-shutter" />
              <div className="peephole-sheen" />
              <div className="peephole-pull"><span /></div>
            </div>
          </div>
          <div className="peephole-tunnel" aria-hidden="true" />
        </section>

        <section className="qte-stage" aria-label="Press the handle to enter">
          <img className="qte-door-plate" src="/assets/doorway-bg.png" alt="" aria-hidden="true" />
          <div className="qte-vignette" aria-hidden="true" />
          <div className="threshold-light" aria-hidden="true" />
          <p className="handle-cue" aria-hidden="true">PRESS · HOLD · PULL DOWN</p>
          <button className="handle-hotspot" id="handleHotspot" type="button" aria-label="按住门把手并向下拖动进入 Gallo 的个人站" />
        </section>
      </div>

      <main className="site-home gallo-experience" id="siteHome" tabIndex={-1} aria-hidden="true">
        <canvas className="shader-canvas" id="shaderCanvas" aria-hidden="true" />
        <header className="gallo-hud" aria-label="Main navigation">
          <a className="gallo-wordmark magnetic" href="#top">GALLO</a>
          <nav>
            <a className="magnetic" href="#work">WORK</a>
            <a className="magnetic" href="#thoughts">THOUGHTS</a>
            <a className="magnetic" href="#about">ABOUT</a>
          </nav>
          <button className="replay-button magnetic" id="replayIntro" type="button">DOOR ↺</button>
        </header>

        <section className="gallo-hero" id="top" data-joi-narration="门打开了。欢迎来到 Gallo 的世界。">
          <div className="gallo-hero-sticky">
            <p className="hero-index">AI PRODUCT · PRODUCT DESIGN / 2026</p>
            <h1 aria-label="I design how AI enters human life">
              <span>I DESIGN</span>
              <span>HOW AI ENTERS</span>
              <span>HUMAN LIFE.</span>
            </h1>
            <div className="hero-question">
              <span>TECHNOLOGY × PEOPLE</span>
              <p>Shall we see how far a personality can travel?</p>
            </div>
            <a className="hero-enter magnetic" href="#work">ENTER THE WORK <span>↓</span></a>
          </div>
        </section>

        <section className="manifesto" id="thoughts" data-joi-narration="一个人格不只是皮肤。它需要连续性、边界和被打断的能力。">
          <p className="section-tag">01 / THOUGHT</p>
          <div className="manifesto-copy" data-reveal>
            <span>AI becomes interesting</span>
            <span>when it stops being</span>
            <span>only a feature.</span>
          </div>
          <div className="manifesto-note">
            <p>有思想深度，有好奇心，愿意拥抱新事物。</p>
            <p>My long-term subject is the changing boundary between technology and people.</p>
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
          <button className="footer-door magnetic" id="footerReplayIntro" type="button">RETURN TO THE DOOR ↺</button>
          <span>GALLO · GUANGZHOU · GMT+8</span>
        </footer>
      </main>

      <Script src="/script.js" strategy="afterInteractive" />
      <Script src="/live2d/joi-live2d.js" strategy="afterInteractive" />
    </>
  );
}
