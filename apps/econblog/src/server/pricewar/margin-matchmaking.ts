import { isPriceWarE2eEnabled } from "./feature-flag";

function readSec(envKey: string, prodDefault: number, e2eDefault?: number): number {
  const raw = process.env[envKey];
  if (raw != null && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  if (isPriceWarE2eEnabled() && e2eDefault != null) return e2eDefault;
  return prodDefault;
}

export function getHumanOnlyWindowSec(): number {
  return readSec("MARGIN_HUMAN_ONLY_WINDOW_SEC", 2, 0);
}

export function getSyntheticDelayMinSec(): number {
  return readSec("MARGIN_SYNTHETIC_DELAY_MIN_SEC", 5, 1);
}

export function getSyntheticDelayMaxSec(): number {
  return readSec("MARGIN_SYNTHETIC_DELAY_MAX_SEC", 40, 3);
}

export function getHumanPolishMinSec(): number {
  return readSec("MARGIN_HUMAN_POLISH_MIN_SEC", 2, 0);
}

export function drawSyntheticDelaySec(): number {
  const min = getSyntheticDelayMinSec();
  const max = Math.max(min, getSyntheticDelayMaxSec());
  return min + Math.floor(Math.random() * (max - min + 1));
}
