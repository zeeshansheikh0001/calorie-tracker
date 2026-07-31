"use client";

import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

type ToggleEvent = {
  clientX?: number;
  clientY?: number;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function runColorFade(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  apply();
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 450);
}

function runViewTransition(
  event: ToggleEvent | undefined,
  apply: () => void
) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  if (!doc.startViewTransition || prefersReducedMotion()) {
    runColorFade(apply);
    return;
  }

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = doc.startViewTransition(() => {
    flushSync(apply);
  });

  void transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      // View transition aborted — theme already applied.
    });
}

export function useThemeTransition() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const locking = useRef(false);

  const isDark = (resolvedTheme ?? theme) === "dark";

  const toggleTheme = useCallback(
    (event?: ToggleEvent) => {
      if (locking.current) return;
      locking.current = true;

      const next = isDark ? "light" : "dark";
      runViewTransition(event, () => setTheme(next));

      window.setTimeout(() => {
        locking.current = false;
      }, 560);
    },
    [isDark, setTheme]
  );

  return { theme, resolvedTheme, isDark, setTheme, toggleTheme };
}
