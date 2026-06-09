"use client";

import { useCallback, useEffect, useState } from "react";
import { audioEngine } from "./audio-engine";
import type { SoundCue } from "./cues";

/**
 * React access to the Margin sound engine. Returns stable `play` / `startLoop` /
 * `stopLoop` callbacks plus a reactive `muted` toggle. Safe to call from any
 * client component; no-ops until sounds exist + the user has interacted.
 */
export function useGameAudio() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    audioEngine.init();
    setMutedState(audioEngine.isMuted());
  }, []);

  const play = useCallback((cue: SoundCue) => audioEngine.play(cue), []);
  const startLoop = useCallback((cue: SoundCue) => audioEngine.startLoop(cue), []);
  const stopLoop = useCallback((cue: SoundCue) => audioEngine.stopLoop(cue), []);
  const setMuted = useCallback((value: boolean) => {
    audioEngine.setMuted(value);
    setMutedState(value);
  }, []);
  const toggleMuted = useCallback(() => {
    const next = !audioEngine.isMuted();
    audioEngine.setMuted(next);
    setMutedState(next);
  }, []);

  return { play, startLoop, stopLoop, muted, setMuted, toggleMuted };
}
