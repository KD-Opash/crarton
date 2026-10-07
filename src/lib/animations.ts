import { Variants } from "framer-motion";

/**
 * Craton Centralized Animation System
 * 
 * Rules:
 * - Hero: high impact
 * - Product transitions: high
 * - Evidence: high
 * - Scroll reveals: medium
 * - Cards: subtle
 * - Footer: minimal
 * 
 * Framer Motion automatically respects `prefers-reduced-motion` for transforms,
 * but these variants are designed to degrade gracefully (opacity over heavy translation).
 */

// Custom easing for premium, cinematic feel
export const EASE = [0.22, 1, 0.36, 1] as const; // easeOutQuart

// Base transitions
const transitionMedium = { duration: 0.6, ease: EASE };
const transitionSlow = { duration: 0.9, ease: EASE };
const transitionFast = { duration: 0.4, ease: EASE };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitionMedium
  }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitionMedium
  }
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitionSlow
  }
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitionMedium
  }
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitionMedium
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitionMedium
  }
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    transition: transitionSlow
  }
};

export const lineGrow: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 1.2, ease: "easeInOut" }
  }
};

// Orchestration Variants (Parent containers)
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    }
  }
};
