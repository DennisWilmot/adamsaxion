import type { Domain } from "@adamsaxion/pricewar-types";
import { DomainGlyph } from "./Domain";
import { CD } from "./tokens";
import type { PickValue } from "./types";

export interface PickSlotProps {
  idx: number;
  pick?: PickValue | null;
  onRemove?: () => void;
}

export function PickSlot({ idx, pick, onRemove }: PickSlotProps) {
  return (
    <div
      className={pick ? "cd-slot-in" : ""}
      style={{
        border: `1px ${pick ? "solid" : "dashed"} ${pick ? CD.d[pick.domain as Domain].c : CD.ink4}`,
        background: pick ? CD.cardstock : "transparent",
        borderRadius: 12,
        padding: pick ? "12px 14px" : "14px",
        minHeight: 64,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {pick ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DomainGlyph domain={pick.domain} size={24} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: CD.ink, lineHeight: 1.2 }}>
              {pick.title}
            </div>
            <div style={{ fontSize: 12, color: CD.ink3, marginTop: 2 }}>{pick.value}</div>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${pick.title}`}
              style={{
                border: "none",
                background: "transparent",
                color: CD.ink3,
                cursor: "pointer",
                fontSize: 16,
                padding: 4,
              }}
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: CD.ink3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Slot {idx} · empty
        </div>
      )}
    </div>
  );
}
