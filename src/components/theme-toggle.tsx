"use client";

import { useEffect, useState } from "react";
import { Icon3D } from "@/components/icons/icon-3d";
import { Button } from "@/components/ui/button";
import { useThemeTransition } from "@/hooks/use-theme-transition";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={cn("relative h-11 w-11 overflow-hidden rounded-full", className)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={(event) => toggleTheme(event)}
    >
      <Icon3D
        name="sun"
        size={20}
        className={cn(
          "transition-all duration-300",
          mounted && isDark
            ? "absolute -rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
        alt=""
      />
      <Icon3D
        name="moon"
        size={20}
        className={cn(
          "absolute transition-all duration-300",
          mounted && isDark
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
        alt=""
      />
    </Button>
  );
}