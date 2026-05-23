"use client";

import { useEffect, useState } from "react";

export function LandingXpToast() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 3000);
    const hideTimer = window.setTimeout(() => setDismissed(true), 8000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-xl right-xl z-50 flex items-center gap-md px-lg py-md bg-surface-raised border border-border rounded-lg shadow-md transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="w-7 h-7 rounded-full bg-success-subtle flex items-center justify-center font-body text-xs font-bold text-success">
        ✦
      </div>
      <p className="font-body text-sm text-foreground-secondary">
        <strong className="text-success font-semibold">+15 XP</strong>
        {" · "}
        Demand elasticity mastered
      </p>
    </div>
  );
}
