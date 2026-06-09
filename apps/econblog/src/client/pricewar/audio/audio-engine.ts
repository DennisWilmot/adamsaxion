"use client";

import { SOUND_MANIFEST, type SoundCue } from "./cues";

const MUTE_STORAGE_KEY = "margin:audio:muted";

/**
 * Tiny, asset-decoupled sound engine. SSR-safe (all DOM access is guarded), and
 * every cue with an empty manifest `src` is a silent no-op — so the whole game
 * choreography can call `play()` freely today and gain sound the moment files
 * are added to the manifest.
 *
 * Browser autoplay policy: audio is blocked until the first user gesture. We
 * arm a one-time unlock on the first pointer/key/touch event; before that, cues
 * are dropped silently (never queued, to avoid a delayed burst).
 */
class AudioEngine {
  private muted = false;
  private unlocked = false;
  private elements = new Map<SoundCue, HTMLAudioElement>();
  private loops = new Map<SoundCue, HTMLAudioElement>();
  private lastPlayedAt = new Map<SoundCue, number>();
  private unlockBound = false;

  init() {
    if (typeof window === "undefined") return;
    try {
      this.muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
    } catch {
      // ignore storage errors
    }
    this.bindUnlock();
  }

  private bindUnlock() {
    if (this.unlockBound || typeof window === "undefined") return;
    this.unlockBound = true;
    const unlock = () => {
      this.unlocked = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
  }

  isMuted() {
    return this.muted;
  }

  setMuted(value: boolean) {
    this.muted = value;
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
    if (value) this.stopAllLoops();
  }

  private resolve(cue: SoundCue): HTMLAudioElement | null {
    const def = SOUND_MANIFEST[cue];
    if (!def || !def.src) return null;
    if (typeof Audio === "undefined") return null;
    let el = this.elements.get(cue);
    if (!el) {
      el = new Audio(def.src);
      el.preload = "auto";
      this.elements.set(cue, el);
    }
    return el;
  }

  play(cue: SoundCue) {
    if (this.muted || !this.unlocked) return;
    const def = SOUND_MANIFEST[cue];
    if (!def || !def.src) return;

    if (def.throttleMs) {
      const last = this.lastPlayedAt.get(cue) ?? 0;
      const now = Date.now();
      if (now - last < def.throttleMs) return;
      this.lastPlayedAt.set(cue, now);
    }

    if (def.loop) {
      this.startLoop(cue);
      return;
    }

    const base = this.resolve(cue);
    if (!base) return;
    // Clone so rapid retriggers overlap instead of cutting each other off.
    const node = base.cloneNode(true) as HTMLAudioElement;
    node.volume = def.volume ?? 1;
    void node.play().catch(() => {
      // autoplay/permission hiccup — stay silent
    });
  }

  startLoop(cue: SoundCue) {
    if (this.muted || !this.unlocked) return;
    const def = SOUND_MANIFEST[cue];
    if (!def || !def.src) return;
    if (this.loops.has(cue)) return;
    const el = this.resolve(cue);
    if (!el) return;
    el.loop = true;
    el.volume = def.volume ?? 1;
    this.loops.set(cue, el);
    void el.play().catch(() => {});
  }

  stopLoop(cue: SoundCue) {
    const el = this.loops.get(cue);
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
    this.loops.delete(cue);
  }

  stopAllLoops() {
    for (const cue of Array.from(this.loops.keys())) this.stopLoop(cue);
  }
}

export const audioEngine = new AudioEngine();
