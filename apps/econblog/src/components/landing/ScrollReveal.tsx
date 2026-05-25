"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMostlyVisible(node: HTMLElement, minRatio = 0.08) {
  const rect = node.getBoundingClientRect();
  if (rect.height <= 0) return false;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight =
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

  return visibleHeight > 0 && visibleHeight / rect.height >= minRatio;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    if (isReducedMotion()) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (isMostlyVisible(node)) {
      setVisible(true);
      return;
    }

    setVisible(false);
  }, []);

  useEffect(() => {
    if (isReducedMotion() || visible) {
      return;
    }

    const node = ref.current;
    if (!node) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -32px 0px" }
    );

    const onScroll = () => {
      if (isMostlyVisible(node)) {
        reveal();
      }
    };

    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? {
              opacity: 1,
              transform: "translateY(0)",
              transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
            }
          : {
              opacity: 0,
              transform: "translateY(20px)",
              transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
            }
      }
    >
      {children}
    </div>
  );
}
