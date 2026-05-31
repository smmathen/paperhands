"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  if (theme === undefined) {
    return (
      <Button variant="neutral" size="icon" disabled aria-label="Toggle theme">
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="neutral"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
