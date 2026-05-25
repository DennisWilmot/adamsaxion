import type { Domain } from "@adamsaxion/pricewar-types";
import type { Visibility } from "@adamsaxion/pricewar-types";

export type ActionInputKind =
  | "slider"
  | "amount"
  | "stepper"
  | "toggle"
  | "mode"
  | "singleChoice";

export interface ActionCatalogEntry {
  id: string;
  spreadsheetCode: string;
  domain: Domain;
  name: string;
  tagline: string;
  mechanic: string;
  strongWhen: string;
  riskyWhen: string;
  actionType: string;
  visibility: Visibility;
  inputKind: ActionInputKind;
  immediateEffect: string;
  delayedEffect: string;
  duration: string;
  prerequisite: string | null;
}

export interface LockForecastLine {
  kind: "immediate" | "delayed" | "risk";
  text: string;
}
