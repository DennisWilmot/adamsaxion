import { describe, expect, it } from "vitest";
import { listPlayModes, PLAY_MODES } from "../src/play-modes/registry";

describe("play modes", () => {
  it("hides blitz-e2e outside E2E env", () => {
    const prev = process.env.PRICEWAR_E2E_PLAY_MODES;
    delete process.env.PRICEWAR_E2E_PLAY_MODES;
    expect(listPlayModes().some((m) => m.id === "blitz-e2e")).toBe(false);
    process.env.PRICEWAR_E2E_PLAY_MODES = prev;
  });

  it("includes blitz-e2e when E2E play modes enabled", () => {
    const prev = process.env.PRICEWAR_E2E_PLAY_MODES;
    process.env.PRICEWAR_E2E_PLAY_MODES = "1";
    expect(listPlayModes().some((m) => m.id === "blitz-e2e")).toBe(true);
    process.env.PRICEWAR_E2E_PLAY_MODES = prev;
  });

  it("registers blitz-e2e in full PLAY_MODES array", () => {
    expect(PLAY_MODES.some((m) => m.id === "blitz-e2e")).toBe(true);
  });
});
