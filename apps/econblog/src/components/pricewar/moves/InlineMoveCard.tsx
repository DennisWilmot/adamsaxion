"use client";

import { memo, useCallback, useState } from "react";
import type { MoveDefinition } from "@adamsaxion/pricewar-types";
import { DomainStripe, DomainGlyph, DomainTag } from "@/components/pricewar/design-system/Domain";
import { PillBtn, Segmented, Slider, Stepper } from "@/components/pricewar/design-system/controls";
import { CD } from "@/components/pricewar/design-system/tokens";
import { MoveCatalogTooltip } from "./MoveCatalogTooltip";
import {
  estimateMoveCost,
  getSliderConfig,
  moveEffectHint,
  moveInputHint,
  readNumericInput,
  writeNumericInput,
} from "./move-input";

export interface InlineMoveCardProps {
  move: MoveDefinition;
  input: unknown;
  onChange: (input: unknown) => void;
  drafted?: boolean;
  onToggleDraft?: () => void;
  draftDisabled?: boolean;
  unavailableReason?: string;
  opponentPrice?: number;
  currentPrice?: number;
  cash?: number;
}

export const InlineMoveCard = memo(function InlineMoveCard({
  move,
  input,
  onChange,
  drafted,
  onToggleDraft,
  draftDisabled,
  unavailableReason,
  opponentPrice,
  currentPrice,
  cash,
}: InlineMoveCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const g = CD.d[move.domain];
  const previewCost = estimateMoveCost(move.id, input);
  const blocked = Boolean(unavailableReason);
  const effectContext: { opponentPrice?: number; currentPrice?: number } = {};
  if (opponentPrice != null) effectContext.opponentPrice = opponentPrice;
  if (currentPrice != null) effectContext.currentPrice = currentPrice;
  const hintContext: { opponentPrice?: number; cash?: number } = {};
  if (opponentPrice != null) hintContext.opponentPrice = opponentPrice;
  if (cash != null) hintContext.cash = cash;
  const effect = moveEffectHint(
    move,
    input,
    Object.keys(effectContext).length ? effectContext : undefined
  );
  const hint = moveInputHint(
    move,
    input,
    Object.keys(hintContext).length ? hintContext : undefined
  );
  const isPrivate = move.visibility === "private";
  const slider = getSliderConfig(move);

  const setUnits = useCallback(
    (units: number) => onChange(writeNumericInput(input, "units", units)),
    [input, onChange]
  );

  const setAmount = useCallback(
    (amount: number) => onChange(writeNumericInput(input, "amount", amount)),
    [input, onChange]
  );

  const setNewPrice = useCallback(
    (newPrice: number) => onChange(writeNumericInput(input, "newPrice", newPrice)),
    [input, onChange]
  );

  const setEnabled = useCallback(
    (enabled: boolean) => onChange({ ...(input as object), enabled }),
    [input, onChange]
  );

  return (
    <div
      className="cd-move"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: "relative",
        background: drafted ? CD.cardstockHi : CD.cardstock,
        border: `1px solid ${drafted ? g.c : CD.rule}`,
        borderRadius: 14,
        padding: "16px 18px 16px 22px",
        boxShadow: drafted ? `0 0 0 3px ${g.soft}` : `0 1px 0 ${CD.rule}`,
        opacity: blocked && !drafted ? 0.55 : 1,
      }}
    >
      <DomainStripe domain={move.domain} />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: CD.ink3,
          background: CD.paperDeep,
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        {isPrivate ? "Hidden" : "Public"}
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 20,
          left: 0,
          right: 0,
          top: "calc(100% + 8px)",
          opacity: showTooltip ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 0.15s ease",
        }}
      >
        <MoveCatalogTooltip moveId={move.id} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <DomainGlyph domain={move.domain} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="serif" style={{ fontSize: 22, lineHeight: 1.1, color: CD.ink }}>
            {move.name}
          </h3>
          <div style={{ fontSize: 13, color: CD.ink2, marginTop: 2, lineHeight: 1.4 }}>
            {move.description}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {slider && (
          <Slider
            value={readNumericInput(input, "newPrice")}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            color={g.c}
            label={slider.label}
            format={slider.format}
            suffix={slider.suffix}
            onChange={setNewPrice}
            hint={hint}
          />
        )}

        {move.input.kind === "amount" && (
          <Slider
            value={readNumericInput(input, "amount")}
            min={move.input.min}
            max={Math.min(move.input.max, cash ?? move.input.max)}
            step={25}
            color={g.c}
            label={`Spend (${move.input.currency ?? "$"})`}
            format={(v) => v.toLocaleString()}
            suffix=""
            onChange={setAmount}
            hint={hint}
          />
        )}

        {move.input.kind === "stepper" && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Stepper
              value={readNumericInput(input, "units")}
              min={move.input.min}
              max={move.input.max}
              suffix=""
              label="Units"
              onChange={setUnits}
            />
            {hint && (
              <div
                style={{
                  fontSize: 11.5,
                  color: CD.ink3,
                  textAlign: "right",
                  flex: 1,
                  paddingBottom: 6,
                }}
              >
                {hint}
              </div>
            )}
          </div>
        )}

        {move.input.kind === "toggle" && (
          <Segmented
            value={((input as { enabled?: boolean }).enabled ?? false) ? "on" : "off"}
            options={[
              { value: "off", label: "Skip" },
              { value: "on", label: "Enable" },
            ]}
            label="This round"
            color={g.c}
            onChange={(v) => setEnabled(v === "on")}
          />
        )}

        {move.input.kind === "singleChoice" && (
          <Segmented
            value={String((input as { choiceId?: string }).choiceId ?? move.input.options[0]?.id)}
            options={move.input.options.map((o) => ({ value: o.id, label: o.label }))}
            label="Choice"
            color={g.c}
            onChange={(choiceId) => onChange({ ...(input as object), choiceId })}
          />
        )}

        {move.input.kind === "mode" && (
          <Segmented
            value={String((input as { modeId?: string }).modeId ?? move.input.modes[0]?.id)}
            options={move.input.modes.map((m) => ({ value: m.id, label: m.label }))}
            label="Mode"
            color={g.c}
            onChange={(modeId) => onChange({ ...(input as object), modeId })}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px dashed ${CD.rule}`,
          flexWrap: "wrap",
        }}
      >
        <DomainTag domain={move.domain} />
        {effect && (
          <span style={{ fontSize: 12.5, color: CD.ink2 }}>
            <span style={{ color: CD.ink3 }}>effect</span> · {effect}
          </span>
        )}
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12.5, color: CD.ink2 }}>
            <span style={{ color: CD.ink3 }}>cost </span>
            <span className="num" style={{ color: CD.ink }}>
              ${previewCost.toLocaleString()}
            </span>
          </span>
          {drafted ? (
            <PillBtn
              variant="outline"
              size="sm"
              color={g.c}
              onClick={() => onToggleDraft?.()}
            >
              ✓ Drafted
            </PillBtn>
          ) : (
            <PillBtn
              variant="solid"
              size="sm"
              color={CD.ink}
              onClick={() => onToggleDraft?.()}
              disabled={draftDisabled === true || blocked}
            >
              Draft move
            </PillBtn>
          )}
        </span>
      </div>

      {blocked && !drafted && unavailableReason && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11.5,
            color: CD.red,
            lineHeight: 1.35,
          }}
        >
          {unavailableReason}
        </div>
      )}
    </div>
  );
});
