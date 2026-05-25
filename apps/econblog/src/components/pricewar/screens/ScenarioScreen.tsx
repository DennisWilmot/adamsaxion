"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CafeDuelRoot } from "../design-system/CafeDuelRoot";
import { PillBtn } from "../design-system/controls";
import { CD } from "../design-system/tokens";
import { priceWarPaths } from "@/lib/games/routes";
import { ScenarioArt, type ScenarioKind } from "./shared/ScenarioArt";

interface ScenarioDef {
  id: string;
  kind: ScenarioKind;
  name: string;
  brief: string;
  length: number;
  domains: string;
  locked?: boolean;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: "coffee-shop",
    kind: "coffee",
    name: "Coffee Shop · Downtown",
    brief: "Pricing, weather, beans. Tight margins on a fast clock.",
    length: 8,
    domains: "6 / 6",
  },
  {
    id: "food-truck",
    kind: "foodtruck",
    name: "Food Truck · Lunch rush",
    brief: "Location plays, supply runs, hourly demand. Short, punchy matches.",
    length: 5,
    domains: "5 / 6",
    locked: true,
  },
  {
    id: "bookshop",
    kind: "bookshop",
    name: "Bookshop · Holiday push",
    brief: "Inventory + events. Slower, more strategic. Marketing matters.",
    length: 10,
    domains: "4 / 6",
    locked: true,
  },
  {
    id: "saas",
    kind: "tech",
    name: "SaaS Startup · Quarterly",
    brief: "Pricing tiers, churn, growth loops. Coming after MVP.",
    length: 12,
    domains: "6 / 6",
    locked: true,
  },
];

function ScenarioCard({
  scenario,
  selected,
  onClick,
}: {
  scenario: ScenarioDef;
  selected: boolean;
  onClick: () => void;
}) {
  const locked = scenario.locked;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="cd-move"
      style={{
        position: "relative",
        overflow: "hidden",
        background: selected ? CD.cardstockHi : CD.cardstock,
        border: `1px solid ${selected ? CD.primary : CD.rule}`,
        borderRadius: 18,
        padding: 20,
        cursor: locked ? "not-allowed" : "pointer",
        boxShadow: selected ? `0 0 0 3px ${CD.primarySoft}` : `0 1px 0 ${CD.rule}`,
        opacity: locked ? 0.55 : 1,
        textAlign: "left",
        width: "100%",
      }}
    >
      <div style={{ height: 110, marginBottom: 14, padding: "0 8px" }}>
        <ScenarioArt kind={scenario.kind} opacity={locked ? 0.4 : 1} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <h3 className="serif" style={{ fontSize: 24, color: CD.ink, lineHeight: 1.1 }}>
          {scenario.name}
        </h3>
        {locked && (
          <span
            style={{
              fontSize: 10,
              color: CD.ink3,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 8px",
              background: CD.paperDeep,
              borderRadius: 999,
            }}
          >
            Locked
          </span>
        )}
        {!locked && selected && (
          <span
            style={{
              fontSize: 10,
              color: CD.primary,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 8px",
              background: CD.primarySoft,
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Selected
          </span>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: CD.ink2, marginTop: 6, lineHeight: 1.45 }}>{scenario.brief}</p>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px dashed ${CD.rule}`,
          fontSize: 12,
          color: CD.ink2,
        }}
      >
        <span>
          <span style={{ color: CD.ink3 }}>match </span>
          <span className="num">{scenario.length}</span> rounds
        </span>
        <span style={{ color: CD.ink3 }}>·</span>
        <span>
          <span style={{ color: CD.ink3 }}>domains </span>
          {scenario.domains}
        </span>
      </div>
    </button>
  );
}

export interface ScenarioScreenProps {
  onQueue: (scenarioId: string, playModeId: string) => void;
  onPractice: (scenarioId: string) => void;
  loading?: boolean;
}

export function ScenarioScreen({ onQueue, onPractice, loading }: ScenarioScreenProps) {
  const router = useRouter();
  const [picked, setPicked] = useState("coffee-shop");
  const pickedScenario = SCENARIOS.find((s) => s.id === picked);

  return (
    <CafeDuelRoot style={{ background: CD.paper, minHeight: "100%", padding: "28px 0 36px" }}>
      <PillBtn variant="ghost" color={CD.ink3} size="sm" onClick={() => router.push(priceWarPaths.lobby)}>
        ← Lobby
      </PillBtn>
      <div className="tab" style={{ marginTop: 16 }}>
        Choose your battleground
      </div>
      <h1 className="serif" style={{ fontSize: 42, color: CD.ink, marginTop: 4, lineHeight: 1.05 }}>
        Where are we trading punches today?
      </h1>
      <p style={{ fontSize: 14, color: CD.ink2, marginTop: 8, maxWidth: 560 }}>
        Scenarios change which domains matter, the round count, and what your opponent can throw at
        you.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        {SCENARIOS.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            selected={picked === s.id}
            onClick={() => !s.locked && setPicked(s.id)}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <PillBtn
          variant="solid"
          color={CD.primary}
          size="lg"
          disabled={!!loading || !!pickedScenario?.locked}
          onClick={() => onQueue(picked, "blitz")}
        >
          Queue {pickedScenario?.name.split(" · ")[0] ?? "—"}{" "}
          <span style={{ opacity: 0.6 }}>→</span>
        </PillBtn>
        <PillBtn
          variant="outline"
          color={CD.ink}
          disabled={!!loading || !!pickedScenario?.locked}
          onClick={() => onPractice(picked)}
        >
          Practice solo
        </PillBtn>
      </div>
    </CafeDuelRoot>
  );
}
