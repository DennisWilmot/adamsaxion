import type { Domain } from "@adamsaxion/pricewar-types";

export type { Domain };

export type WeatherKind = "sun" | "cloud" | "rain" | "wind" | "snow";
export type AvatarKind = "player" | "opponent" | "coach";
export type ScenarioKind = "coffee" | "foodtruck" | "bookshop" | "tech";

export interface DomainSpec {
  c: string;
  soft: string;
  glyph: string;
}

export interface Player {
  name: string;
  cash: number;
  trend?: number[];
}

export interface Opponent {
  name: string;
  elo: number | null;
  price: number;
  locked: boolean;
  isBot?: boolean;
}

export interface PickValue {
  domain: Domain;
  title: string;
  value: string;
}

export interface SliderKnobDef {
  kind: "slider";
  key: string;
  min: number;
  max: number;
  step: number;
  defaults: Record<string, number>;
  label: string;
  format?: (v: number) => string | number;
  suffix?: string;
  effect?: (v: number) => string;
  hint?: (v: number) => string;
}

export interface StepperKnobDef {
  kind: "stepper";
  key: string;
  min: number;
  max: number;
  defaults: Record<string, number>;
  label: string;
  suffix?: string;
  effect?: (v: number) => string;
  hint?: (v: number) => string;
}

export interface SegmentedKnobDef {
  kind: "segmented";
  key: string;
  options: { value: string; label: string }[];
  defaults: Record<string, string>;
  label: string;
  effect?: (v: string) => string;
  hint?: (v: string) => string;
}

export type KnobDef = SliderKnobDef | StepperKnobDef | SegmentedKnobDef;

export interface CardDef {
  domain: Domain;
  title: string;
  kicker: string;
  knob: KnobDef;
  cost: (v: unknown) => number;
}
