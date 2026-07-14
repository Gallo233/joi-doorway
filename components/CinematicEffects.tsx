"use client";

import { useEffect, useRef } from "react";

type FadingVideoProps = {
  src: string;
  className?: string;
  poster?: string;
};

export function FadingVideo({ src, className = "", poster }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeMs = 500;
    const fadeOutLead = 0.55;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let restartTimer = 0;

    const fadeTo = (target: number, duration = fadeMs) => {
      window.cancelAnimationFrame(frameRef.current);
      const from = Number.parseFloat(video.style.opacity || "0");
      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        video.style.opacity = String(from + (target - from) * eased);
        if (progress < 1) frameRef.current = window.requestAnimationFrame(tick);
      };

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const reveal = () => {
      video.style.opacity = "0";
      void video.play().catch(() => undefined);
      if (reducedMotion) video.style.opacity = "1";
      else fadeTo(1);
    };

    const prepareLoop = () => {
      const remaining = video.duration - video.currentTime;
      if (!reducedMotion && !fadingOutRef.current && remaining <= fadeOutLead && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const restart = () => {
      video.style.opacity = "0";
      restartTimer = window.setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        void video.play().catch(() => undefined);
        if (reducedMotion) video.style.opacity = "1";
        else fadeTo(1);
      }, 100);
    };

    video.addEventListener("loadeddata", reveal);
    video.addEventListener("timeupdate", prepareLoop);
    video.addEventListener("ended", restart);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) reveal();

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(restartTimer);
      video.removeEventListener("loadeddata", reveal);
      video.removeEventListener("timeupdate", prepareLoop);
      video.removeEventListener("ended", restart);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}

type BlurLineProps = {
  text: string;
  className?: string;
  delay?: number;
};

export function BlurLine({ text, className = "", delay = 0 }: BlurLineProps) {
  return (
    <span className={`hero-line ${className}`} aria-hidden="true">
      {text.split(" ").map((word, index) => (
        <span
          className="blur-word"
          style={{ animationDelay: `${delay + index * 0.1}s` }}
          key={`${word}-${index}`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
