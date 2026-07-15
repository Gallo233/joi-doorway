"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const ENTER_DURATION_MS = 2000;
const SCRAMBLE_WINDOW = 0.12;
const HOVER_RADIUS = 2;

type ScrambleTextProps = {
  lines: string[];
  className?: string;
};

function scrambledCharacter(character: string, order: number, frame: number) {
  if (!/[a-z]/i.test(character)) return character;
  const pool = character === character.toLowerCase() ? LOWERCASE : UPPERCASE;
  const index = Math.abs(order * 17 + frame * 13 + character.charCodeAt(0) * 7) % pool.length;
  return pool[index];
}

export function ScrambleText({ lines, className = "" }: ScrambleTextProps) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const playedRef = useRef(false);
  const hoverTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<{ line: number; order: number } | null>(null);
  const [hoverFrame, setHoverFrame] = useState(0);

  const characterCount = useMemo(
    () => lines.reduce((total, line) => total + line.replace(/\s/g, "").length, 0),
    [lines],
  );
  const accessibleText = lines.join(" ");

  useEffect(() => {
    setMounted(true);
    const element = rootRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setProgress(1);
      setComplete(true);
      return;
    }

    const start = () => {
      if (playedRef.current) return;
      playedRef.current = true;
      setHovered(null);
      setComplete(false);
      setProgress(0);
      setActive(true);
    };

    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          return;
        }
        playedRef.current = false;
        setActive(false);
        setComplete(false);
        setProgress(0);
        setHovered(null);
      },
      { threshold: 0.24 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [lines]);

  useEffect(() => {
    if (!active) return;
    let animationFrame = 0;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const nextProgress = Math.min(1, (now - startedAt) / ENTER_DURATION_MS);
      setProgress(nextProgress);
      if (nextProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      setComplete(true);
      setActive(false);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [active]);

  useEffect(() => () => {
    if (hoverTimerRef.current) window.clearInterval(hoverTimerRef.current);
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLParagraphElement>) => {
    if (!complete) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-scramble-order]");
    if (!target) return;
    const line = Number(target.dataset.scrambleLine);
    const order = Number(target.dataset.scrambleLineOrder);
    if (!Number.isFinite(line) || !Number.isFinite(order)) return;
    setHovered({ line, order });
    if (hoverTimerRef.current) return;
    hoverTimerRef.current = window.setInterval(() => {
      setHoverFrame((frame) => frame + 1);
    }, 72);
  };

  const clearHover = () => {
    setHovered(null);
    if (hoverTimerRef.current) {
      window.clearInterval(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  let globalOrder = 0;
  const animationFrame = Math.floor(progress * ENTER_DURATION_MS / 42);

  return (
    <p
      ref={rootRef}
      className={`scramble-text ${className} ${mounted ? "is-mounted" : ""} ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`.trim()}
      aria-label={accessibleText}
      onPointerMove={handlePointerMove}
      onPointerLeave={clearHover}
    >
      <span className="scramble-text-visual" aria-hidden="true">
        {lines.map((line, lineIndex) => {
          let lineOrder = 0;
          return (
            <span className="scramble-line" key={`${lineIndex}-${line}`}>
              {line.split(" ").map((word, wordIndex, words) => (
                <Fragment key={`${lineIndex}-${wordIndex}-${word}`}>
                  <span className="scramble-word">
                    {word.split("").map((character, characterIndex) => {
                      const order = globalOrder;
                      const currentLineOrder = lineOrder;
                      globalOrder += 1;
                      lineOrder += 1;
                      const start = (order / Math.max(1, characterCount)) * (1 - SCRAMBLE_WINDOW);
                      const lock = start + SCRAMBLE_WINDOW;
                      const isLocked = progress >= lock || complete;
                      const isScrambling = active && progress >= start && !isLocked;
                      const isHovered = Boolean(
                        complete
                        && hovered
                        && hovered.line === lineIndex
                        && Math.abs(hovered.order - currentLineOrder) <= HOVER_RADIUS,
                      );
                      const displayCharacter = isScrambling || isHovered
                        ? scrambledCharacter(character, order, animationFrame + hoverFrame)
                        : character;
                      const state = isHovered || isScrambling
                        ? "is-scrambling"
                        : isLocked
                          ? "is-locked"
                          : "is-pending";

                      return (
                        <span
                          className={`scramble-character ${state}`}
                          data-scramble-order={order}
                          data-scramble-line={lineIndex}
                          data-scramble-line-order={currentLineOrder}
                          key={`${lineIndex}-${wordIndex}-${characterIndex}`}
                        >
                          <span className="scramble-character-size">{character}</span>
                          <span className="scramble-character-display">{displayCharacter}</span>
                        </span>
                      );
                    })}
                  </span>
                  {wordIndex < words.length - 1 ? <span className="scramble-space"> </span> : null}
                </Fragment>
              ))}
            </span>
          );
        })}
      </span>
    </p>
  );
}
