import { cn } from "@/lib/utils";
import { MARGIN_BETA_LABEL } from "@/lib/games/margin-branding";

type MarginBetaBadgeProps = {
  className?: string;
  size?: "sm" | "md";
};

/** Compact Beta pill for catalog cards, nav-adjacent UI, and landing sections. */
export function MarginBetaBadge({ className, size = "sm" }: MarginBetaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-gold/30 bg-gold-subtle font-body font-semibold uppercase tracking-widest text-gold",
        size === "sm" ? "px-sm py-0.5 text-[10px]" : "px-md py-0.5 text-xs",
        className,
      )}
    >
      {MARGIN_BETA_LABEL}
    </span>
  );
}
