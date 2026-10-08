"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = (e: React.MouseEvent) => {
    const nextTheme = isDark ? "light" : "dark";
    
    if (!("startViewTransition" in document)) {
      setTheme(nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath : clipPath.reverse()
        },
        {
          duration: 700,
          easing: "ease-out",
          pseudoElement: isDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)"
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-ink dark:text-cream hover:bg-black/10 dark:hover:bg-white/10 transition-colors overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-sage"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : 90,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="w-4 h-4 text-copper" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
          rotate: isDark ? -90 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="w-4 h-4 text-copper" />
      </motion.div>
    </button>
  );
}
