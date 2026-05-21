"use client";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        background: "none",
        border: "0.5px solid var(--cvx-border)",
        borderRadius: 8,
        cursor: "pointer",
        padding: "5px 8px",
        fontSize: 15,
        lineHeight: 1,
        color: "var(--cvx-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s",
        WebkitTapHighlightColor: "transparent",
        opacity: mounted ? 1 : 0,
      }}
    >
      {isDark ? "☀" : "🌙"}
    </button>
  );
}
