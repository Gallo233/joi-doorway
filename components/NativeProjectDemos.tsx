"use client";

import { useEffect, useRef, useState } from "react";

type WorldFieldProps = { variant?: "intro" | "project" };

export function WorldField({ variant = "project" }: WorldFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let animation = 0;
    let pointerX = 0.58;
    let pointerY = 0.48;

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      pointerY = (event.clientY - rect.top) / Math.max(rect.height, 1);
    };
    canvas.addEventListener("pointermove", onPointer);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width;
      const h = rect.height;
      frame += 0.008;
      const gradient = context.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, variant === "intro" ? "#dce8e8" : "#e9ebdf");
      gradient.addColorStop(0.55, variant === "intro" ? "#f4efe4" : "#f5f0e5");
      gradient.addColorStop(1, variant === "intro" ? "#cad9ce" : "#d6dfd1");
      context.fillStyle = gradient;
      context.fillRect(0, 0, w, h);

      context.lineWidth = 1;
      for (let row = -2; row < 14; row += 1) {
        context.beginPath();
        for (let x = -40; x <= w + 40; x += 16) {
          const y = h * (0.08 + row * 0.075) + Math.sin(x * 0.012 + row * 0.7 + frame) * (14 + row * 0.6);
          if (x === -40) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = row % 3 === 0 ? "rgba(29,58,48,.18)" : "rgba(29,58,48,.08)";
        context.stroke();
      }

      context.beginPath();
      context.moveTo(w * 0.12, h * 0.76);
      context.bezierCurveTo(w * 0.3, h * 0.58, w * (pointerX + 0.03), h * (pointerY + 0.08), w * 0.86, h * 0.2);
      context.strokeStyle = "#e7663b";
      context.lineWidth = variant === "intro" ? 4 : 5;
      context.setLineDash([10, 12]);
      context.lineDashOffset = -frame * 120;
      context.stroke();
      context.setLineDash([]);

      const stops = [[0.12, 0.76], [0.48, 0.5], [0.86, 0.2]];
      stops.forEach(([x, y], index) => {
        const pulse = 5 + Math.sin(frame * 4 + index) * 1.5;
        context.beginPath();
        context.arc(w * x, h * y, pulse, 0, Math.PI * 2);
        context.fillStyle = index === 1 ? "#e7663b" : "#1c493b";
        context.fill();
        context.beginPath();
        context.arc(w * x, h * y, pulse + 7, 0, Math.PI * 2);
        context.strokeStyle = index === 1 ? "rgba(231,102,59,.28)" : "rgba(28,73,59,.2)";
        context.lineWidth = 1;
        context.stroke();
      });
      animation = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animation);
      canvas.removeEventListener("pointermove", onPointer);
    };
  }, [variant]);

  return <canvas ref={ref} className={`world-field world-field-${variant}`} aria-hidden="true" />;
}

const steps = [
  { id: "observe", label: "OBSERVE", heading: "Context detected", body: "3 unread messages · calendar conflict at 16:30 · focus mode active" },
  { id: "plan", label: "PLAN", heading: "A reversible plan", body: "Summarize the messages, propose a reply, and keep sending permission with you." },
  { id: "approve", label: "APPROVE", heading: "Permission stays visible", body: "Joi can read the selected thread. Sending remains locked until you approve." },
  { id: "report", label: "REPORT", heading: "Action completed", body: "Draft created locally. No message was sent. Trace saved for review." },
] as const;

export function JoiNativeDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % steps.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  const step = steps[active];

  return (
    <div className="joi-native-demo">
      <div className="native-window-bar">
        <span>JOI · LOCAL</span><span>SESSION 07:42</span><b>CONNECTED</b>
      </div>
      <div className="joi-demo-grid">
        <section className="joi-conversation" aria-live="polite">
          <p className="joi-presence-label">Joi is reading the room, not the whole machine.</p>
          <div className="chat-line user">Can you help me clear the urgent messages?</div>
          <div className="chat-line joi">I found three that look time-sensitive. I&apos;ll show my plan before touching anything.</div>
          <div className="joi-status-line"><span className="status-pulse" />{step.heading}</div>
          <p className="joi-step-body" key={step.id}>{step.body}</p>
        </section>
        <aside className="agent-trace">
          <header><span>AGENT TRACE</span><span>LOCAL / AUDITABLE</span></header>
          <div className="trace-steps">
            {steps.map((item, index) => (
              <button className={index === active ? "is-active" : index < active ? "is-complete" : ""} key={item.id} onClick={() => setActive(index)} type="button">
                <span>0{index + 1}</span><b>{item.label}</b><i />
              </button>
            ))}
          </div>
          <div className="permission-panel"><span>BOUNDARY</span><strong>{active < 2 ? "READ ONLY" : active === 2 ? "WAITING FOR YOU" : "NO SEND ACTION"}</strong></div>
        </aside>
      </div>
    </div>
  );
}

const mapModes = [
  { id: "nearby", label: "NEARBY", title: "Notice what is close", body: "Joi groups places by meaning, not only distance." },
  { id: "vision", label: "VISION", title: "Ask what you are seeing", body: "Camera context becomes a conversation about the place." },
  { id: "route", label: "ROUTE", title: "Let the route narrate", body: "Location, pace and memory shape what Joi says next." },
] as const;

export function JoiMapNativeDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % mapModes.length), 3200);
    return () => window.clearInterval(timer);
  }, []);
  const mode = mapModes[active];

  return (
    <div className="map-native-demo">
      <WorldField />
      <div className="map-demo-topbar"><span>JOI MAP</span><b>LIVE WORLD MODEL</b><span>22° / GUANGZHOU</span></div>
      <section className="map-insight" key={mode.id}>
        <span>0{active + 1} / {mode.label}</span>
        <h4>{mode.title}</h4>
        <p>{mode.body}</p>
      </section>
      <div className="map-position-card"><span>YOU</span><strong>Haizhu District</strong><p>Joi is adjusting to your walking pace.</p></div>
      <nav className="map-mode-nav" aria-label="Joi Map demo modes">
        {mapModes.map((item, index) => <button className={index === active ? "is-active" : ""} key={item.id} onClick={() => setActive(index)} type="button"><span>0{index + 1}</span>{item.label}</button>)}
      </nav>
    </div>
  );
}
