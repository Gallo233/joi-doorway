"use client";

import { useEffect, useRef, useState } from "react";

type AudioEngine = {
  context: AudioContext;
  playHandoff: () => void;
  playMorph: (form: number) => void;
  playSwipe: (direction: number) => void;
  setEnabled: (enabled: boolean) => void;
  stop: () => void;
};

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const AUDIO_PREFERENCE_KEY = "gallo-site-sound";

function createAudioEngine(): AudioEngine | null {
  const AudioContextConstructor =
    window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  const context = new AudioContextConstructor();
  const master = context.createGain();
  const ambience = context.createGain();
  const effects = context.createGain();
  const reverb = context.createConvolver();
  const reverbReturn = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.value = 0.0001;
  ambience.gain.value = 0.26;
  effects.gain.value = 0.72;
  reverbReturn.gain.value = 0.13;
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.025;
  compressor.release.value = 0.42;

  const impulseLength = Math.floor(context.sampleRate * 2.6);
  const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      const decay = Math.pow(1 - index / data.length, 3.2);
      data[index] = (Math.random() * 2 - 1) * decay;
    }
  }
  reverb.buffer = impulse;

  ambience.connect(master);
  effects.connect(master);
  reverb.connect(reverbReturn);
  reverbReturn.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  const progression = [
    [130.81, 196, 246.94, 329.63],
    [110, 164.81, 196, 261.63],
    [87.31, 130.81, 196, 220],
    [98, 146.83, 220, 246.94],
  ];
  let chordIndex = 0;
  let chordTimer: number | null = null;
  let enabled = false;

  function connectWithSpace(node: AudioNode, destination: AudioNode) {
    node.connect(destination);
    node.connect(reverb);
  }

  function schedulePad() {
    if (!enabled || context.state === "closed") return;
    const startedAt = context.currentTime + 0.04;
    const frequencies = progression[chordIndex % progression.length];
    chordIndex += 1;

    frequencies.forEach((frequency, noteIndex) => {
      [-4.5, 4.5].forEach((detune, voiceIndex) => {
        const oscillator = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        const panner = context.createStereoPanner();
        const peak = voiceIndex === 0 ? 0.0105 : 0.006;

        oscillator.type = voiceIndex === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune;
        filter.type = "lowpass";
        filter.frequency.value = 720 + noteIndex * 95;
        filter.Q.value = 0.55;
        panner.pan.value = (noteIndex - 1.5) * 0.18 + (voiceIndex ? 0.05 : -0.05);

        gain.gain.setValueAtTime(0.0001, startedAt);
        gain.gain.exponentialRampToValueAtTime(peak, startedAt + 2.4);
        gain.gain.exponentialRampToValueAtTime(peak * 0.62, startedAt + 6.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 9.6);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        connectWithSpace(panner, ambience);
        oscillator.start(startedAt);
        oscillator.stop(startedAt + 9.75);
      });
    });
  }

  function startPads() {
    if (chordTimer !== null) return;
    schedulePad();
    chordTimer = window.setInterval(schedulePad, 7200);
  }

  function stopPads() {
    if (chordTimer === null) return;
    window.clearInterval(chordTimer);
    chordTimer = null;
  }

  function playTone(
    frequency: number,
    duration: number,
    volume: number,
    detune = 0,
    delay = 0,
  ) {
    if (!enabled || context.state !== "running") return;
    const startedAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startedAt);
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, startedAt);
    gain.gain.exponentialRampToValueAtTime(volume, startedAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    connectWithSpace(gain, effects);
    oscillator.start(startedAt);
    oscillator.stop(startedAt + duration + 0.04);
  }

  function playNoiseSweep(direction = 1, volume = 0.023, duration = 0.42) {
    if (!enabled || context.state !== "running") return;
    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      const edgeFade = Math.sin((index / sampleCount) * Math.PI);
      data[index] = (Math.random() * 2 - 1) * edgeFade;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const startedAt = context.currentTime;
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.Q.value = 0.75;
    filter.frequency.setValueAtTime(direction > 0 ? 420 : 1480, startedAt);
    filter.frequency.exponentialRampToValueAtTime(
      direction > 0 ? 1480 : 420,
      startedAt + duration,
    );
    gain.gain.setValueAtTime(0.0001, startedAt);
    gain.gain.exponentialRampToValueAtTime(volume, startedAt + duration * 0.28);
    gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);
    source.connect(filter);
    filter.connect(gain);
    connectWithSpace(gain, effects);
    source.start(startedAt);
    source.stop(startedAt + duration + 0.02);
  }

  return {
    context,
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(nextEnabled ? 0.78 : 0.0001, now + (nextEnabled ? 0.12 : 0.45));
      if (nextEnabled) startPads();
      else stopPads();
    },
    playMorph(form) {
      const notes = [329.63, 392, 493.88, 659.25];
      const root = notes[Math.max(0, Math.min(notes.length - 1, form))];
      playNoiseSweep(1, 0.012, 0.26);
      playTone(root, 0.58, 0.035, -3);
      playTone(root * 1.5, 0.82, 0.018, 3, 0.075);
    },
    playSwipe(direction) {
      playNoiseSweep(direction, 0.018, 0.36);
    },
    playHandoff() {
      playNoiseSweep(1, 0.025, 0.8);
      playTone(293.66, 1.15, 0.028, -4, 0.04);
      playTone(440, 1.3, 0.02, 2, 0.2);
      playTone(659.25, 1.5, 0.014, 4, 0.38);
    },
    stop() {
      stopPads();
      void context.close();
    },
  };
}

export function SiteAudio() {
  const [enabled, setEnabled] = useState(true);
  const engineRef = useRef<AudioEngine | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(AUDIO_PREFERENCE_KEY);
    const initialEnabled = savedPreference !== "off";
    enabledRef.current = initialEnabled;
    setEnabled(initialEnabled);

    const ensureEngine = async () => {
      if (!enabledRef.current) return null;
      if (!engineRef.current) engineRef.current = createAudioEngine();
      const engine = engineRef.current;
      if (!engine) return null;
      if (engine.context.state === "suspended") {
        try {
          await engine.context.resume();
        } catch {
          return null;
        }
      }
      engine.setEnabled(true);
      return engine;
    };

    const beginOnIntent = (event: Event) => {
      if ((event.target as Element | null)?.closest?.("[data-audio-control]")) return;
      void ensureEngine();
    };

    const handleMorph = (event: Event) => {
      const form = Number((event as CustomEvent<{ form?: number }>).detail?.form || 0);
      void ensureEngine().then((engine) => engine?.playMorph(form));
    };

    const handleHandoff = () => {
      void ensureEngine().then((engine) => engine?.playHandoff());
    };

    let lastSwipeAt = 0;
    const playSwipe = (direction: number) => {
      const prologue = document.querySelector<HTMLElement>("[data-particle-prologue]");
      if (!prologue || prologue.classList.contains("is-exiting")) return;
      const rect = prologue.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const now = performance.now();
      if (now - lastSwipeAt < 430) return;
      lastSwipeAt = now;
      void ensureEngine().then((engine) => engine?.playSwipe(direction));
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 4) return;
      playSwipe(event.deltaY >= 0 ? 1 : -1);
    };

    let touchY: number | null = null;
    const rememberTouch = (event: PointerEvent) => {
      if (event.pointerType === "touch") touchY = event.clientY;
    };
    const handleTouchMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || touchY === null) return;
      const travel = touchY - event.clientY;
      if (Math.abs(travel) < 22) return;
      playSwipe(travel >= 0 ? 1 : -1);
      touchY = event.clientY;
    };

    window.addEventListener("pointerdown", beginOnIntent, { capture: true, passive: true });
    window.addEventListener("keydown", beginOnIntent, { capture: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("pointerdown", rememberTouch, { passive: true });
    window.addEventListener("pointermove", handleTouchMove, { passive: true });
    window.addEventListener("joi-particle-form-change", handleMorph);
    window.addEventListener("joi-particle-prologue-exit", handleHandoff);

    return () => {
      window.removeEventListener("pointerdown", beginOnIntent, true);
      window.removeEventListener("keydown", beginOnIntent, true);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerdown", rememberTouch);
      window.removeEventListener("pointermove", handleTouchMove);
      window.removeEventListener("joi-particle-form-change", handleMorph);
      window.removeEventListener("joi-particle-prologue-exit", handleHandoff);
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  const toggleAudio = async () => {
    const nextEnabled = !enabledRef.current;
    enabledRef.current = nextEnabled;
    setEnabled(nextEnabled);
    window.localStorage.setItem(AUDIO_PREFERENCE_KEY, nextEnabled ? "on" : "off");

    if (!nextEnabled) {
      engineRef.current?.setEnabled(false);
      return;
    }

    if (!engineRef.current) engineRef.current = createAudioEngine();
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.context.state === "suspended") await engine.context.resume();
    engine.setEnabled(true);
    engine.playMorph(0);
  };

  return (
    <>
      <button
        className="site-audio-toggle"
        data-audio-control
        data-label={enabled ? "SOUND ON" : "SOUND OFF"}
        type="button"
        aria-label={enabled ? "Turn ambient sound off" : "Turn ambient sound on"}
        aria-pressed={enabled}
        onClick={() => void toggleAudio()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className="site-audio-speaker" d="M5 10h3l4-3.5v11L8 14H5z" />
          <path className="site-audio-wave site-audio-wave-one" d="M15 9.2c.75.8 1.1 1.72 1.1 2.8s-.35 2-1.1 2.8" />
          <path className="site-audio-wave site-audio-wave-two" d="M17.6 6.9c1.35 1.38 2 3.08 2 5.1s-.65 3.72-2 5.1" />
          <path className="site-audio-slash" d="M5.2 5.2l13.6 13.6" />
        </svg>
        <span className="site-audio-status" aria-hidden="true" />
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {enabled ? "Ambient sound is on" : "Ambient sound is off"}
      </span>
    </>
  );
}
