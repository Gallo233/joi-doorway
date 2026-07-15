"use client";

import { useEffect, useRef, useState } from "react";

type AudioEngine = {
  context: AudioContext;
  playHandoff: () => void;
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
  ambience.gain.value = 0.32;
  effects.gain.value = 0.72;
  reverbReturn.gain.value = 0.075;
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.025;
  compressor.release.value = 0.42;

  const impulseLength = Math.floor(context.sampleRate * 1.25);
  const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      const decay = Math.pow(1 - index / data.length, 4.6);
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

  const beatDuration = 60 / 82;
  const barDuration = beatDuration * 4;
  const progression = [
    {
      bass: 65.41,
      chord: [130.81, 164.81, 196, 246.94],
      melody: [329.63, 392, 329.63, 261.63],
    },
    {
      bass: 55,
      chord: [110, 130.81, 164.81, 196],
      melody: [261.63, 329.63, 392, 329.63],
    },
    {
      bass: 43.65,
      chord: [87.31, 130.81, 164.81, 220],
      melody: [261.63, 349.23, 329.63, 261.63],
    },
    {
      bass: 49,
      chord: [98, 123.47, 146.83, 164.81],
      melody: [293.66, 329.63, 392, 329.63],
    },
  ];
  let chordIndex = 0;
  let chordTimer: number | null = null;
  const pulseTimers = new Set<number>();
  let enabled = false;

  function connectWithSpace(node: AudioNode, destination: AudioNode) {
    node.connect(destination);
    node.connect(reverb);
  }

  function scheduleMusicPulse(pulseAt: number, strength: number) {
    const delay = Math.max(0, (pulseAt - context.currentTime) * 1000);
    let timer = 0;
    timer = window.setTimeout(() => {
      pulseTimers.delete(timer);
      if (!enabled || context.state !== "running") return;
      window.dispatchEvent(new CustomEvent("joi-music-pulse", {
        detail: { strength },
      }));
    }, delay);
    pulseTimers.add(timer);
  }

  function schedulePad() {
    if (!enabled || context.state === "closed") return;
    const startedAt = context.currentTime + 0.06;
    const phrase = progression[chordIndex % progression.length];
    chordIndex += 1;

    phrase.chord.forEach((frequency, noteIndex) => {
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = context.createStereoPanner();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = noteIndex % 2 === 0 ? -2.5 : 2.5;
      filter.type = "lowpass";
      filter.frequency.value = 600 + noteIndex * 85;
      filter.Q.value = 0.45;
      panner.pan.value = (noteIndex - 1.5) * 0.16;
      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(0.0085, startedAt + 0.42);
      gain.gain.exponentialRampToValueAtTime(0.006, startedAt + barDuration * 0.72);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + barDuration + 0.38);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      connectWithSpace(panner, ambience);
      oscillator.start(startedAt);
      oscillator.stop(startedAt + barDuration + 0.44);
    });

    [0, 2].forEach((beat) => {
      const noteAt = startedAt + beat * beatDuration;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(phrase.bass * 1.08, noteAt);
      oscillator.frequency.exponentialRampToValueAtTime(phrase.bass, noteAt + 0.18);
      filter.type = "lowpass";
      filter.frequency.value = 230;
      filter.Q.value = 0.5;
      gain.gain.setValueAtTime(0.0001, noteAt);
      gain.gain.exponentialRampToValueAtTime(0.024, noteAt + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteAt + 0.42);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(ambience);
      oscillator.start(noteAt);
      oscillator.stop(noteAt + 0.46);
    });

    [0, 1, 2, 3].forEach((beat) => {
      scheduleMusicPulse(
        startedAt + beat * beatDuration,
        beat % 2 === 0 ? 0.44 : 0.26,
      );
    });

    phrase.melody.forEach((frequency, beat) => {
      const noteAt = startedAt + beat * beatDuration + beatDuration * 0.12;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = context.createStereoPanner();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteAt);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.995, noteAt + 0.42);
      filter.type = "lowpass";
      filter.frequency.value = 1050;
      filter.Q.value = 0.55;
      panner.pan.value = beat % 2 === 0 ? -0.12 : 0.12;
      gain.gain.setValueAtTime(0.0001, noteAt);
      gain.gain.exponentialRampToValueAtTime(0.0115, noteAt + 0.024);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteAt + 0.48);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      connectWithSpace(panner, ambience);
      oscillator.start(noteAt);
      oscillator.stop(noteAt + 0.52);
    });
  }

  function startPads() {
    if (chordTimer !== null) return;
    schedulePad();
    chordTimer = window.setInterval(schedulePad, Math.round(barDuration * 1000));
  }

  function stopPads() {
    if (chordTimer === null) return;
    window.clearInterval(chordTimer);
    chordTimer = null;
    pulseTimers.forEach((timer) => window.clearTimeout(timer));
    pulseTimers.clear();
  }

  function playTone(
    frequency: number,
    duration: number,
    volume: number,
    detune = 0,
    delay = 0,
    cutoff = 1100,
    oscillatorType: OscillatorType = "sine",
  ) {
    if (!enabled || context.state !== "running") return;
    const startedAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startedAt);
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
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
    filter.frequency.setValueAtTime(direction > 0 ? 320 : 1050, startedAt);
    filter.frequency.exponentialRampToValueAtTime(
      direction > 0 ? 1050 : 320,
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
    playSwipe(direction) {
      playNoiseSweep(direction, 0.018, 0.36);
    },
    playHandoff() {
      playNoiseSweep(1, 0.018, 0.68);
      playTone(164.81, 0.9, 0.024, -3, 0.04, 620);
      playTone(220, 1.05, 0.016, 2, 0.18, 760);
      playTone(293.66, 1.2, 0.011, 3, 0.34, 900);
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
    window.addEventListener("joi-particle-prologue-exit", handleHandoff);

    return () => {
      window.removeEventListener("pointerdown", beginOnIntent, true);
      window.removeEventListener("keydown", beginOnIntent, true);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerdown", rememberTouch);
      window.removeEventListener("pointermove", handleTouchMove);
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
