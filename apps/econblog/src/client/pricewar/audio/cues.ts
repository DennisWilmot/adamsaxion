/**
 * Semantic audio cues emitted by the Margin choreography. The choreography only
 * ever references these names — never file paths — so audio is fully decoupled
 * from assets. A cue with an empty `src` is a silent no-op, which is how we ship
 * the full motion design before the sound files have been sourced.
 *
 * To enable a sound later: drop the file under `public/sounds/pricewar/` and set
 * its `src` below. No choreography code changes.
 */
export type SoundCue =
  // round heartbeat
  | "lock.commit"
  | "opponent.thinking"
  | "reveal.flip"
  | "bar.fill"
  | "number.tick"
  | "round.win"
  | "round.lose"
  | "round.neutral"
  | "round.start"
  // terminal transitions
  | "clock.tick.escalate"
  | "clock.expire"
  | "cash.drain"
  | "bankrupt.stamp"
  | "opponent.leave"
  | "forfeit.confirm"
  | "match.win"
  | "match.lose"
  | "draw";

export type SoundDef = {
  /** Public URL of the audio file. Empty string = silent no-op (not yet sourced). */
  src: string;
  /** 0..1 playback volume. */
  volume?: number;
  /** If true, the cue loops until explicitly stopped. */
  loop?: boolean;
  /** Minimum ms between retriggers, to avoid machine-gunning rapid cues. */
  throttleMs?: number;
};

/**
 * Cue manifest. Intentionally all-silent for now (empty `src`). The commented
 * paths are the convention to follow when the assets land.
 */
export const SOUND_MANIFEST: Record<SoundCue, SoundDef> = {
  "lock.commit": { src: "" /* /sounds/pricewar/lock-commit.mp3 */, volume: 0.7 },
  "opponent.thinking": {
    src: "" /* /sounds/pricewar/opponent-thinking.mp3 */,
    volume: 0.3,
    loop: true,
  },
  "reveal.flip": { src: "" /* /sounds/pricewar/reveal-flip.mp3 */, volume: 0.6 },
  "bar.fill": { src: "" /* /sounds/pricewar/bar-fill.mp3 */, volume: 0.4 },
  "number.tick": {
    src: "" /* /sounds/pricewar/number-tick.mp3 */,
    volume: 0.25,
    throttleMs: 40,
  },
  "round.win": { src: "" /* /sounds/pricewar/round-win.mp3 */, volume: 0.7 },
  "round.lose": { src: "" /* /sounds/pricewar/round-lose.mp3 */, volume: 0.7 },
  "round.neutral": { src: "" /* /sounds/pricewar/round-neutral.mp3 */, volume: 0.6 },
  "round.start": { src: "" /* /sounds/pricewar/round-start.mp3 */, volume: 0.5 },

  "clock.tick.escalate": {
    src: "" /* /sounds/pricewar/clock-escalate.mp3 */,
    volume: 0.5,
    throttleMs: 120,
  },
  "clock.expire": { src: "" /* /sounds/pricewar/clock-expire.mp3 */, volume: 0.8 },
  "cash.drain": { src: "" /* /sounds/pricewar/cash-drain.mp3 */, volume: 0.6 },
  "bankrupt.stamp": { src: "" /* /sounds/pricewar/bankrupt-stamp.mp3 */, volume: 0.8 },
  "opponent.leave": { src: "" /* /sounds/pricewar/opponent-leave.mp3 */, volume: 0.6 },
  "forfeit.confirm": { src: "" /* /sounds/pricewar/forfeit-confirm.mp3 */, volume: 0.5 },
  "match.win": { src: "" /* /sounds/pricewar/match-win.mp3 */, volume: 0.85 },
  "match.lose": { src: "" /* /sounds/pricewar/match-lose.mp3 */, volume: 0.85 },
  draw: { src: "" /* /sounds/pricewar/draw.mp3 */, volume: 0.7 },
};
