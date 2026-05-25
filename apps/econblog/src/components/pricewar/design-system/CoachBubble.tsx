import { AvatarCoach } from "./avatars";
import { CD } from "./tokens";

export interface CoachBubbleProps {
  children: React.ReactNode;
  label?: string;
  tone?: "tip" | "warn";
}

export function CoachBubble({
  children,
  label = "Prof. Aldo · Coach",
  tone = "tip",
}: CoachBubbleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px 12px 12px",
        background: tone === "warn" ? CD.primarySoft : CD.cream,
        border: `1px solid ${tone === "warn" ? CD.primary : "#fde68a"}`,
        borderRadius: 14,
        position: "relative",
      }}
    >
      <AvatarCoach size={44} />
      <div style={{ flex: 1, paddingTop: 2 }}>
        <div
          style={{
            fontSize: 11,
            color: CD.ink3,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          className="serif"
          style={{
            fontSize: 19,
            lineHeight: 1.3,
            color: CD.ink,
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          &ldquo;{children}&rdquo;
        </div>
      </div>
    </div>
  );
}
