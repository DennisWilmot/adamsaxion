import type { PipelineScratch } from "../../engine/pipeline/context";

let currentScratch: PipelineScratch | null = null;

export function bindScratch(s: PipelineScratch): void {
  currentScratch = s;
}

export function scratch(): PipelineScratch {
  if (!currentScratch) throw new Error("no scratch");
  return currentScratch;
}
