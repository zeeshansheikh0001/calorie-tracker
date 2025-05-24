
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    // and ensure consistent size to prevent layout shift.
    return <div className="h-9 w-9 sm:w-auto sm:h-auto p-2 rounded-full" aria-hidden="true"></div>;
  }

  const isDarkMode = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center h-[28px] w-[52px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDarkMode ? "bg-primary" : "bg-muted"
      )}
    >
      <span className="sr-only">Use themed</span>
      <motion.span
        layout
        transition={spring}
        className={cn(
          "pointer-events-none absolute left-0 inline-block h-[24px] w-[24px] transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out flex items-center justify-center",
          isDarkMode ? "translate-x-[24px]" : "translate-x-[0.5px]"
        )}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3 text-primary-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-foreground" />
        )}
      </motion.span>
    </button>
  );
}
