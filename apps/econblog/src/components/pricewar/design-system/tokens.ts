import type { Domain } from "@adamsaxion/pricewar-types";
import type { DomainSpec } from "./types";

export const CD = {
  paper: "#f5f6f8",
  paperDeep: "#eceef3",
  cardstock: "#ffffff",
  cardstockHi: "#fafbfd",
  ink: "#0a0a0a",
  ink2: "#4b5563",
  ink3: "#6b7280",
  ink4: "#d1d5db",
  rule: "#e5e7eb",
  primary: "#0a52c4",
  primarySoft: "#e6efff",
  /** @deprecated use CD.primary — kept for reference parity */
  terracotta: "#0a52c4",
  /** @deprecated use CD.primarySoft */
  terraSoft: "#e6efff",
  cream: "#fef3c7",
  yellow: "#eab308",
  green: "#16a34a",
  greenSoft: "#dcfce7",
  red: "#dc2626",
  redSoft: "#fee2e2",
  d: {
    sales: { c: "#dc2626", soft: "#fee2e2", glyph: "⌖" },
    procurement: { c: "#15803d", soft: "#dcfce7", glyph: "⏃" },
    operations: { c: "#0a52c4", soft: "#e6efff", glyph: "◐" },
    hr: { c: "#b45309", soft: "#fef3c7", glyph: "☼" },
    marketing: { c: "#a21caf", soft: "#fae8ff", glyph: "✺" },
    finance: { c: "#1f2937", soft: "#e5e7eb", glyph: "$" },
  } satisfies Record<Domain, DomainSpec>,
} as const;
