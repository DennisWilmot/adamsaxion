export interface Rng {
  next: () => number;
  pick: <T>(arr: readonly T[]) => T;
}

export function createRng(seed: string): Rng {
  let a = stringToSeed(seed);
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T>(arr: readonly T[]) => {
    if (arr.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    return arr[Math.floor(next() * arr.length)]!;
  };
  return { next, pick };
}

function stringToSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

export function roundRngSeed(matchId: string, round: number): string {
  return `${matchId}:${round}`;
}
