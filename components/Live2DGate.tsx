"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type GatePhase = "loading" | "error" | "exiting" | "ready";

type Live2DProgressDetail = {
  label?: string;
  progress?: number;
};

type RetryableLive2D = HTMLElement & {
  retryLive2D?: () => Promise<void> | void;
};

const MINIMUM_OPENING_MS = 900;
const LOAD_TIMEOUT_MS = 30000;

export function Live2DGate() {
  const [phase, setPhase] = useState<GatePhase>("loading");
  const [label, setLabel] = useState("Waking the Live2D runtime");
  const [progress, setProgress] = useState(0.06);
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(true);
  const openedAt = useRef(0);
  const exitTimer = useRef<number | null>(null);
  const removeTimer = useRef<number | null>(null);
  const readyHandled = useRef(false);
  const live2dReady = useRef(false);
  const prologueReady = useRef(false);

  useEffect(() => {
    openedAt.current = performance.now();

    const clearExitTimers = () => {
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
      if (removeTimer.current) window.clearTimeout(removeTimer.current);
    };

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<Live2DProgressDetail>).detail;
      if (detail?.label) setLabel(detail.label);
      if (typeof detail?.progress === "number") {
        setProgress(Math.max(0.06, Math.min(0.96, detail.progress)));
      }
    };

    const finishOpening = () => {
      if (readyHandled.current) return;
      readyHandled.current = true;
      clearExitTimers();
      setLabel("Joi is present");
      setProgress(1);

      const elapsed = performance.now() - openedAt.current;
      exitTimer.current = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("joi-live2d-gate-exit"));
        setPhase("exiting");
        removeTimer.current = window.setTimeout(() => {
          setVisible(false);
          setPhase("ready");
        }, 720);
      }, Math.max(0, MINIMUM_OPENING_MS - elapsed));
    };

    const finishWhenReady = () => {
      if (live2dReady.current && prologueReady.current) finishOpening();
    };

    const handleReady = () => {
      live2dReady.current = true;
      if (!prologueReady.current) {
        setLabel("Preparing the particle field");
        setProgress(0.98);
      }
      finishWhenReady();
    };

    const handlePrologueReady = () => {
      prologueReady.current = true;
      finishWhenReady();
    };

    const handleError = (event: Event) => {
      clearExitTimers();
      readyHandled.current = false;
      const detail = (event as CustomEvent<Live2DProgressDetail>).detail;
      setLabel(detail?.label || "The Live2D model did not finish loading");
      setProgress(0);
      setPhase("error");
    };

    window.addEventListener("joi-live2d-progress", handleProgress);
    window.addEventListener("joi-live2d-ready", handleReady);
    window.addEventListener("joi-live2d-error", handleError);
    window.addEventListener("joi-particle-prologue-ready", handlePrologueReady);

    const assistant = document.querySelector<RetryableLive2D>("joi-live2d-assistant");
    const prologue = document.querySelector<HTMLElement>("[data-particle-prologue]");
    prologueReady.current = !prologue || prologue.classList.contains("is-ready");
    if (assistant?.dataset.live2dState === "ready") handleReady();
    if (assistant?.dataset.live2dState === "error") handleError(new Event("error"));

    return () => {
      clearExitTimers();
      window.removeEventListener("joi-live2d-progress", handleProgress);
      window.removeEventListener("joi-live2d-ready", handleReady);
      window.removeEventListener("joi-live2d-error", handleError);
      window.removeEventListener("joi-particle-prologue-ready", handlePrologueReady);
    };
  }, []);

  useEffect(() => {
    document.body.dataset.live2dGate = phase;
    return () => {
      if (document.body.dataset.live2dGate === phase) {
        delete document.body.dataset.live2dGate;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const timeout = window.setTimeout(() => {
      readyHandled.current = false;
      setLabel("The Live2D model timed out before its first frame");
      setProgress(0);
      setPhase("error");
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [phase, attempt]);

  const retry = () => {
    const assistant = document.querySelector<RetryableLive2D>("joi-live2d-assistant");
    if (!assistant?.retryLive2D) {
      window.location.reload();
      return;
    }

    readyHandled.current = false;
    live2dReady.current = false;
    openedAt.current = performance.now();
    setLabel("Restarting the Live2D runtime");
    setProgress(0.06);
    setPhase("loading");
    setAttempt((current) => current + 1);
    void assistant.retryLive2D();
  };

  if (!visible) return null;

  const style = { "--live2d-progress": progress } as CSSProperties;

  return (
    <div
      className={`live2d-gate is-${phase}`}
      style={style}
      role={phase === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-busy={phase === "loading"}
    >
      <div className="live2d-gate-grain" aria-hidden="true" />
      <header className="live2d-gate-header">
        <strong>GALLO / JOI</strong>
        <span>LIVE PRESENCE SYSTEM</span>
      </header>

      <div className="live2d-gate-center" aria-hidden="true">
        <div className="live2d-gate-orbit">
          <span className="live2d-gate-scan" />
          <strong>J</strong>
        </div>
        <p>MODEL · TEXTURES · FIRST FRAME</p>
      </div>

      <div className="live2d-gate-copy">
        <p className="live2d-gate-kicker">A PRESENCE IS ARRIVING</p>
        <h1>WAIT UNTIL<br />SHE CAN MOVE.</h1>
      </div>

      <div className="live2d-gate-status">
        <div>
          <span>{phase === "error" ? "LOAD FAILED" : "LIVE2D STARTUP"}</span>
          <strong>{label}</strong>
        </div>
        {phase === "error" ? (
          <button type="button" onClick={retry}>RETRY MODEL ↗</button>
        ) : (
          <output>{String(Math.round(progress * 100)).padStart(2, "0")}%</output>
        )}
        <span className="live2d-gate-track" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}
