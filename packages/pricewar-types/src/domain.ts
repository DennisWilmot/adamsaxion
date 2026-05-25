export type Domain =
  | "sales"
  | "procurement"
  | "operations"
  | "hr"
  | "marketing"
  | "finance";

export const DOMAINS: readonly Domain[] = [
  "sales",
  "procurement",
  "operations",
  "hr",
  "marketing",
  "finance",
] as const;
