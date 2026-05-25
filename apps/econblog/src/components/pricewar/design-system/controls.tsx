import { CD } from "./tokens";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string | number;
  suffix?: string;
  color?: string;
  onChange: (v: number) => void;
  label?: string;
  hint?: string | null;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => v,
  suffix = "",
  color,
  onChange,
  label,
  hint,
}: SliderProps) {
  const c = color ?? CD.primary;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: CD.ink3,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
          <span className="num serif" style={{ fontSize: 26, color: CD.ink, lineHeight: 1 }}>
            {format(value)}
            <span style={{ color: CD.ink3, fontSize: 18 }}>{suffix}</span>
          </span>
        </div>
      )}
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 999,
            background: CD.paperDeep,
            border: `1px solid ${CD.rule}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            height: 6,
            borderRadius: 999,
            width: `${pct}%`,
            background: c,
            opacity: 0.85,
          }}
        />
        {[20, 40, 60, 80].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: `${t}%`,
              top: "50%",
              width: 1,
              height: 8,
              transform: "translate(-50%, -50%)",
              background: CD.ink4,
              opacity: 0.6,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            transform: "translateX(-50%)",
            width: 18,
            height: 18,
            borderRadius: 999,
            background: CD.paper,
            border: `2px solid ${c}`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            margin: 0,
          }}
        />
      </div>
      {hint && <div style={{ fontSize: 11.5, color: CD.ink3, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label?: string;
  suffix?: string;
}

export function Stepper({
  value,
  min = 0,
  max = 99,
  onChange,
  label,
  suffix = "",
}: StepperProps) {
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 11,
            color: CD.ink3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0,
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          borderRadius: 10,
        }}
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="Decrease"
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: CD.ink,
            fontSize: 18,
          }}
        >
          −
        </button>
        <div
          className="num serif"
          style={{ minWidth: 56, textAlign: "center", fontSize: 22, color: CD.ink }}
        >
          {value}
          <span style={{ color: CD.ink3, fontSize: 14 }}>{suffix}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="Increase"
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: CD.ink,
            fontSize: 18,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export interface SegmentedProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label?: string;
  color?: string;
}

export function Segmented({ value, options, onChange, label, color }: SegmentedProps) {
  const c = color ?? CD.primary;
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 11,
            color: CD.ink3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          gap: 2,
          padding: 3,
          background: CD.paperDeep,
          border: `1px solid ${CD.rule}`,
          borderRadius: 10,
        }}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: active ? CD.paper : "transparent",
                color: active ? CD.ink : CD.ink2,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: active ? `inset 0 0 0 1px ${c}55` : "none",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface PillBtnProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  color?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function PillBtn({
  children,
  variant = "solid",
  color,
  onClick,
  size = "md",
  full,
  disabled,
  type = "button",
}: PillBtnProps) {
  const c = color ?? CD.ink;
  const sizes = {
    sm: { pad: "6px 12px", fs: 12 },
    md: { pad: "10px 18px", fs: 13.5 },
    lg: { pad: "14px 22px", fs: 15 },
  };
  const sz = sizes[size];
  const styles =
    variant === "solid"
      ? { background: c, color: CD.paper, border: `1px solid ${c}` }
      : variant === "outline"
        ? { background: "transparent", color: c, border: `1px solid ${CD.rule}` }
        : { background: "transparent", color: c, border: "1px solid transparent" };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: sz.pad,
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: sz.fs,
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        ...styles,
      }}
    >
      {children}
    </button>
  );
}
