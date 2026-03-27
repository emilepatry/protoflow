import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { SPRING_QUICK } from "@/lib/motion";

type Theme = "light" | "dark";

const STORAGE_KEY = "protoflow-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return getSystemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const next = mq.matches ? "dark" : "light";
        setTheme(next);
      }
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggle}
      className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.9 }}
      transition={SPRING_QUICK}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </motion.button>
  );
}
