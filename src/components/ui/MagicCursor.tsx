"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";

export function MagicCursor() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Exact mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring coordinates for the outer ring
  const ringSpringConfig = { damping: 28, stiffness: 350, mass: 0.4 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  useEffect(() => {
    setMounted(true);

    const updateMousePos = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest("a, button, input, select, textarea, [role='button'], [data-cursor-hover]")
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePos);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePos);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!mounted || !isVisible) return null;

  const dotColor = theme === "dark" ? "#38bdf8" : "#2563eb";
  const borderColor = theme === "dark" ? "rgba(56, 189, 248, 0.75)" : "rgba(37, 99, 235, 0.75)";

  return (
    <>
      {/* OUTER RING (Matching attached screenshot) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-blue-500/80"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: borderColor,
        }}
        animate={{
          width: isHovered ? 46 : isMouseDown ? 26 : 36,
          height: isHovered ? 46 : isMouseDown ? 26 : 36,
          backgroundColor: isHovered 
            ? (theme === "dark" ? "rgba(56, 189, 248, 0.12)" : "rgba(37, 99, 235, 0.1)") 
            : "transparent",
          boxShadow: isHovered
            ? `0 0 16px ${theme === "dark" ? "rgba(56, 189, 248, 0.35)" : "rgba(37, 99, 235, 0.25)"}`
            : "none",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />

      {/* INNER SOLID CENTER DOT (Matching attached screenshot) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: dotColor,
        }}
        animate={{
          width: isMouseDown ? 4 : isHovered ? 8 : 6,
          height: isMouseDown ? 4 : isHovered ? 8 : 6,
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </>
  );
}
