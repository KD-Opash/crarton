"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";
import { Header } from "@/components/layout/Header";
import { CratonWorld } from "@/components/canvas/CratonWorld";
import {
  RAcceleratorModel,
  ReviewsIntelModel,
} from "@/components/canvas/ProductModels";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  animate,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { MagicCursor } from "@/components/ui/MagicCursor";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Server,
  Fingerprint,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";

gsap.registerPlugin(ScrollTrigger);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

// ─── SVG Particle Coordinates (precomputed to avoid SSR hydration mismatch) ─────
const SPHERE_PTS: { x: number; y: number; far: boolean }[] = Array.from(
  { length: 55 },
  (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 55);
    const theta = Math.sqrt(55 * Math.PI) * phi;
    const far = i > 42;
    const r = far ? 30 + Math.sin(i * 1.4) * 10 : 24;
    return {
      x: +(50 + r * Math.sin(phi) * Math.cos(theta)).toFixed(4),
      y: +(50 + r * Math.sin(phi) * Math.sin(theta) * 0.62).toFixed(4),
      far,
    };
  },
);

// ─── Card 03 Dotted Sphere Projection (Outer Shell + Inner Core matching Image 3) ─────
const CARD3_SPHERE_PTS: { x: number; y: number; isCore: boolean; r: number }[] =
  (() => {
    const pts: { x: number; y: number; isCore: boolean; r: number }[] = [];
    // 1. Outer Sphere Shell (130 points)
    const outerN = 130;
    for (let i = 0; i < outerN; i++) {
      const phi = Math.acos(-1 + (2 * i) / outerN);
      const theta = Math.sqrt(outerN * Math.PI) * phi;
      const rad = 33 + Math.sin(i * 1.7) * 2;
      const x = 50 + rad * Math.sin(phi) * Math.cos(theta);
      const y = 50 + rad * Math.sin(phi) * Math.sin(theta) * 0.92;
      pts.push({
        x: +x.toFixed(4),
        y: +y.toFixed(4),
        isCore: false,
        r: i % 4 === 0 ? 1.4 : 1.0,
      });
    }
    // 2. Inner Core Sphere (45 points)
    const innerN = 45;
    for (let i = 0; i < innerN; i++) {
      const phi = Math.acos(-1 + (2 * i) / innerN);
      const theta = Math.sqrt(innerN * Math.PI) * phi;
      const rad = 13 + Math.sin(i * 2.1) * 1.5;
      const x = 50 + rad * Math.sin(phi) * Math.cos(theta);
      const y = 50 + rad * Math.sin(phi) * Math.sin(theta) * 0.92;
      pts.push({
        x: +x.toFixed(4),
        y: +y.toFixed(4),
        isCore: true,
        r: i % 3 === 0 ? 1.5 : 1.1,
      });
    }
    return pts;
  })();

// ─── Hero Section Phase 03 Lightbulb Projection (Matching CratonWorld.tsx) ─────
const HERO_BULB_PTS: { x: number; y: number }[] = Array.from(
  { length: 140 },
  (_, i) => {
    const bulbT = i / 140;
    const yVal = -3.6 + bulbT * 7.2;
    let radius = 0;
    if (yVal > 0.4) {
      const val = 10.24 - Math.pow(yVal - 0.4, 2);
      radius = val > 0 ? Math.sqrt(val) : 0.5;
    } else if (yVal > -2.2) {
      radius = 1.3 + (yVal + 2.2) * (1.9 / 2.6);
    } else {
      radius = 1.3;
    }

    const angle = i * 2.39996;
    const spread = radius * (0.85 + (i % 7) * 0.04);
    const px = 50 + spread * Math.cos(angle) * 7.2;
    const py = 50 - yVal * 7.2;
    return { x: +px.toFixed(4), y: +py.toFixed(4) };
  },
);
// ──────────────────────────────────────────────────────────────────────────────

const INF_PTS: { x: number; y: number }[] = Array.from(
  { length: 60 },
  (_, i) => {
    const t = i / 60;
    const d = 1 + Math.pow(Math.sin(t * Math.PI * 2), 2);
    return {
      x: +(50 + (38 * Math.cos(t * Math.PI * 2)) / d).toFixed(4),
      y: +(
        25 +
        (38 * Math.sin(t * Math.PI * 2) * Math.cos(t * Math.PI * 2)) / d
      ).toFixed(4),
    };
  },
);
// ──────────────────────────────────────────────────────────────────────────────
// ─── Mindset Galaxy Particle Canvas (Floating Micro-Pixel Starfield) ─────────
function MindsetGalaxyCanvas({ isLight }: { isLight: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width =
      canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 800);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Well-distributed floating micro-pixels (380 particles across empty space)
    const numParticles = 380;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.1 + 0.45,
      opacity: Math.random() * 0.6 + 0.25,
      pulseSpeed: Math.random() * 0.035 + 0.012,
      pulseFactor: Math.random() * Math.PI * 2,
      isSquare: i % 3 === 0, // 33% square micro-pixels as shown in screenshot
      colorType: i % 4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient background radial glow
      const centerX = width / 2;
      const centerY = height / 2;
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        Math.max(width, height) * 0.75,
      );

      if (isLight) {
        grad.addColorStop(0, "rgba(59, 90, 122, 0.04)");
        grad.addColorStop(0.5, "rgba(37, 99, 235, 0.018)");
        grad.addColorStop(1, "rgba(250, 250, 250, 0)");
      } else {
        grad.addColorStop(0, "rgba(56, 189, 248, 0.06)");
        grad.addColorStop(0.6, "rgba(0, 240, 255, 0.02)");
        grad.addColorStop(1, "rgba(11, 17, 32, 0)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseFactor += p.pulseSpeed;

        // Wrap around canvas edges for continuous floating particle animation
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity =
          (Math.sin(p.pulseFactor) * 0.5 + 0.5) * p.opacity;

        let fillStyle = "";
        if (isLight) {
          switch (p.colorType) {
            case 0:
              fillStyle = `rgba(59, 90, 122, ${currentOpacity * 0.82})`; // Slate Blue (#3B5A7A)
              break;
            case 1:
              fillStyle = `rgba(37, 99, 235, ${currentOpacity * 0.72})`; // Tech Blue (#2563EB)
              break;
            case 2:
              fillStyle = `rgba(14, 165, 233, ${currentOpacity * 0.68})`; // Cyan Azure (#0EA5E9)
              break;
            default:
              fillStyle = `rgba(71, 85, 105, ${currentOpacity * 0.65})`; // Muted Slate (#475569)
              break;
          }
        } else {
          switch (p.colorType) {
            case 0:
              fillStyle = `rgba(226, 232, 240, ${currentOpacity * 0.85})`;
              break;
            case 1:
              fillStyle = `rgba(56, 189, 248, ${currentOpacity * 0.9})`;
              break;
            case 2:
              fillStyle = `rgba(125, 211, 252, ${currentOpacity * 0.95})`;
              break;
            default:
              fillStyle = `rgba(192, 132, 252, ${currentOpacity * 0.75})`;
              break;
          }
        }

        ctx.fillStyle = fillStyle;
        const drawSize = p.size;

        if (p.isSquare) {
          // Sharp micro square pixels floating in empty space
          ctx.fillRect(
            p.x - drawSize / 2,
            p.y - drawSize / 2,
            drawSize * 1.15,
            drawSize * 1.15,
          );
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-90"
    />
  );
}

{
  /* AI NEURAL CONSTELLATION CANVAS FOR SECTION 02 */
}
function IntelligenceAiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && theme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width =
      canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 800);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodesCount = 38;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
    }> = [];

    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update node positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Draw connections
      const maxDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = isLight
              ? `rgba(37, 99, 235, ${alpha * 0.65})`
              : `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const pSize = n.radius + Math.sin(n.pulse) * 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.8, pSize), 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? "rgba(37, 99, 235, 0.45)"
          : "rgba(56, 189, 248, 0.65)";
        ctx.fill();

        if (pSize > 2.2) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, pSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = isLight
            ? "rgba(37, 99, 235, 0.08)"
            : "rgba(56, 189, 248, 0.12)";
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70 dark:opacity-80"
    />
  );
}

// ─── 03 / HOW WE MOVE FORWARD STACKED CARDS SECTION (Pinned Screen Scroll-Driven Deck) ──────
function SingleStackedCardPinned({
  card,
  idx,
  total,
  scrollYProgress,
  isDark,
}: {
  card: any;
  idx: number;
  total: number;
  scrollYProgress: any;
  isDark: boolean;
}) {
  // Step ranges for 4 cards (idx = 0, 1, 2, 3) over 0 to 1 scrollYProgress
  // Card 0: visible initially at y = 0
  // Card 1: enters between 0.15 -> 0.35 (target stack offset = 14px)
  // Card 2: enters between 0.40 -> 0.60 (target stack offset = 28px)
  // Card 3: enters between 0.65 -> 0.85 (target stack offset = 42px)

  const enterStart = idx === 0 ? 0 : 0.15 + (idx - 1) * 0.25;
  const enterEnd = idx === 0 ? 0 : enterStart + 0.18;

  // Next card entering window (when this card gets covered by the card above)
  const coverStart = 0.15 + idx * 0.25;
  const coverEnd = coverStart + 0.18;

  const translateX = useTransform(
    scrollYProgress,
    idx === 1 || idx === 2
      ? [enterStart - 0.05, enterStart, enterEnd, 1]
      : [0, 1],
    idx === 1 ? [-750, -750, 0, 0] : idx === 2 ? [750, 750, 0, 0] : [0, 0],
  );

  const translateY = useTransform(
    scrollYProgress,
    idx === 0 || idx === 1 || idx === 2
      ? [0, 1]
      : [enterStart - 0.05, enterStart, enterEnd, 1],
    idx === 0
      ? [0, 0]
      : idx === 1
        ? [14, 14]
        : idx === 2
          ? [28, 28]
          : [550, 550, 42, 42],
  );

  const opacity = useTransform(
    scrollYProgress,
    idx === 0 ? [0, 1] : [enterStart - 0.03, enterStart, enterStart + 0.05, 1],
    idx === 0 ? [1, 1] : [0, 0, 1, 1],
  );

  const scale = useTransform(
    scrollYProgress,
    idx === total - 1 ? [0, 1] : [coverStart, coverEnd, 1],
    idx === total - 1
      ? [1, 1]
      : [1, 0.95 - (total - 1 - idx) * 0.015, 0.95 - (total - 1 - idx) * 0.015],
  );

  return (
    <motion.div
      style={{
        x: translateX,
        y: translateY,
        scale: scale,
        opacity: opacity,
        zIndex: idx + 10,
      }}
      className={`absolute inset-0 w-full h-full rounded-[32px] p-6 md:p-10 border shadow-2xl backdrop-blur-xl transition-colors duration-300 overflow-hidden flex flex-col justify-between ${
        isDark
          ? "bg-[#0D1527] border-white/15 shadow-black/90 text-white"
          : "bg-white border-slate-200/90 shadow-slate-300/80 text-slate-900"
      }`}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-blue-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Top Bar: Number & Tag */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-3 md:mb-5">
        <span className="font-mono text-2xl font-light text-slate-400 dark:text-slate-500">
          {card.id}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
          {card.tag}
        </span>
      </div>

      {/* Grid: Graphic Icon & Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
        {/* Dotted Particle Graphic Box */}
        <div className="md:col-span-4 flex items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative overflow-hidden h-[130px] md:h-[150px]">
          {/* Floating ambient dust particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            {Array.from({ length: 8 }).map((_, ptIdx) => {
              const posX = (ptIdx * 29) % 100;
              const posY = (ptIdx * 37) % 100;
              return (
                <motion.div
                  key={`amb-card-${idx}-${ptIdx}`}
                  className="absolute rounded-xs bg-blue-500/50 dark:bg-cyan-400/60"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    width: 2,
                    height: 2,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5 + (ptIdx % 3),
                    ease: "easeInOut",
                    delay: ptIdx * 0.2,
                  }}
                />
              );
            })}
          </div>

          {card.type === "cloud" && (
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 md:w-32 md:h-32 overflow-visible relative z-10"
            >
              {SPHERE_PTS.map((p, i) => (
                <motion.circle
                  key={`c1-pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={i % 3 === 0 ? "1.3" : "0.9"}
                  fill={isDark ? "#38bdf8" : "#3b5a7a"}
                  opacity="0.75"
                  animate={{
                    x: [
                      0,
                      Math.sin(i * 1.5) * 2.2,
                      -Math.sin(i * 1.5) * 2.2,
                      0,
                    ],
                    y: [
                      0,
                      Math.cos(i * 1.5) * 2.2,
                      -Math.cos(i * 1.5) * 2.2,
                      0,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5 + (i % 4) * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          )}

          {card.type === "target" && (
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 md:w-32 md:h-32 overflow-visible relative z-10"
            >
              {CARD3_SPHERE_PTS.map((p, i) => (
                <motion.circle
                  key={`c2-pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill={
                    p.isCore
                      ? isDark
                        ? "#7dd3fc"
                        : "#475569"
                      : isDark
                        ? "#38bdf8"
                        : "#3b5a7a"
                  }
                  opacity={p.isCore ? 0.9 : 0.7}
                  animate={{
                    x: [
                      0,
                      Math.sin(i * 1.7) * 2.4,
                      -Math.sin(i * 1.7) * 2.4,
                      0,
                    ],
                    y: [
                      0,
                      Math.cos(i * 1.4) * 2.4,
                      -Math.cos(i * 1.4) * 2.4,
                      0,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2 + (i % 5) * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          )}

          {card.type === "bulb" && (
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 md:w-32 md:h-32 overflow-visible relative z-10"
            >
              {HERO_BULB_PTS.map((p, i) => (
                <motion.circle
                  key={`c3-pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={i % 5 === 0 ? "1.25" : "0.85"}
                  fill={isDark ? "#38bdf8" : "#3b5a7a"}
                  opacity="0.75"
                  animate={{
                    x: [
                      0,
                      Math.sin(i * 1.4) * 2.5,
                      -Math.sin(i * 1.4) * 2.5,
                      0,
                    ],
                    y: [
                      0,
                      Math.cos(i * 1.8) * 2.5,
                      -Math.cos(i * 1.8) * 2.5,
                      0,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.3 + (i % 4) * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <g
                stroke={isDark ? "#7dd3fc" : "#3b5a7a"}
                strokeWidth="1.1"
                fill="none"
                opacity="0.85"
              >
                <line x1="41" y1="65" x2="59" y2="65" strokeLinecap="round" />
                <line
                  x1="42.5"
                  y1="69"
                  x2="57.5"
                  y2="69"
                  strokeLinecap="round"
                />
                <line x1="44" y1="73" x2="56" y2="73" strokeLinecap="round" />
              </g>
            </svg>
          )}

          {card.type === "infinity" && (
            <svg
              viewBox="0 0 100 60"
              className="w-28 h-16 md:w-36 md:h-20 overflow-visible relative z-10"
            >
              {INF_PTS.map((p, i) => (
                <motion.circle
                  key={`c4-pt-${i}`}
                  cx={p.x}
                  cy={p.y + 5}
                  r="1.4"
                  fill={isDark ? "#38bdf8" : "#3b5a7a"}
                  opacity="0.75"
                  animate={{
                    x: [
                      0,
                      Math.sin(i * 1.3) * 2.2,
                      -Math.sin(i * 1.3) * 2.2,
                      0,
                    ],
                    y: [
                      0,
                      Math.cos(i * 1.7) * 2.2,
                      -Math.cos(i * 1.7) * 2.2,
                      0,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4 + (i % 4) * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Copy Column */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {card.title}
          </h3>
          <p className="text-xs md:text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {card.text}
          </p>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between font-mono text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          — {card.footer}
        </span>
        <span className="text-slate-400 dark:text-slate-500 font-bold">
          0{idx + 1} / 04
        </span>
      </div>
    </motion.div>
  );
}

function ForwardStackedCardsSection({ isDark }: { isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const CARDS = [
    {
      id: "01",
      tag: "IDEAS",
      title: "Question deeply.",
      text: "Start with a real problem. Understand the domain, the people, and the decisions that matter before defining a solution.",
      footer: "DISCOVERY & RESEARCH",
      type: "cloud",
    },
    {
      id: "02",
      tag: "FOCUS",
      title: "Protect the idea.",
      text: "Novel approaches are filed before they are built, so the company and its partners can invest with confidence.",
      footer: "INVENTION & IP",
      type: "target",
    },
    {
      id: "03",
      tag: "INNOVATION",
      title: "Bring in the domain’s best.",
      text: "Product leaders with decades in the field own what they build, with product-level equity — credibility an enterprise can check.",
      footer: "DOMAIN LEADERSHIP",
      type: "bulb",
    },
    {
      id: "04",
      tag: "FORWARD",
      title: "Ship. Refine. Repeat.",
      text: "Develop, evaluate, and refine with human judgment in the loop. Then apply the same method to the next domain.",
      footer: "DEVELOPMENT & REFINEMENT",
      type: "infinity",
    },
  ];

  return (
    <div
      ref={containerRef}
      id="method"
      className="w-full relative h-[180vh] bg-[#FAFAFA] dark:bg-[#0B1120] transition-colors duration-500"
    >
      {/* Sticky Pinned Viewport (Screen stays 100% fixed in place during scrolling) */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center py-6 md:py-10 px-6 md:px-12 lg:px-20 overflow-hidden z-20 relative">
        {/* Dynamic Cosmic Galaxy Particle Canvas Background (Fits 100vh Viewport) */}
        <MindsetGalaxyCanvas isLight={!isDark} />

        {/* Header Area */}
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center shrink-0 mb-6 md:mb-8 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2"
          >
            03 / How we move forward
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
          >
            Curious by nature.
            <br />
            <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
              Rigorous by design.
            </span>
          </motion.h2>
        </div>

        {/* Pinned Card Stage Area (All cards stack inside this fixed stage) */}
        <div className="max-w-4xl w-full relative h-[360px] md:h-[340px] flex items-center justify-center relative z-10">
          {CARDS.map((card, idx) => (
            <SingleStackedCardPinned
              key={card.id}
              card={card}
              idx={idx}
              total={CARDS.length}
              scrollYProgress={scrollYProgress}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── Section 05 Interactive Security & Trust Bento Cards ─────────────────────

function InteractiveAuditableCard({ isDark }: { isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isUnlocked = isHovered || isClicked;

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsClicked((prev) => !prev)}
      className="md:col-span-2 row-span-2 bg-[#F1F5F9]/90 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[30px] p-8 md:p-10 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 flex flex-col justify-between min-h-[400px] cursor-pointer select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Bar Header & Status */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <motion.div
          animate={isUnlocked ? { scale: 1.05 } : { scale: 1 }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
            isUnlocked
              ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.25)]"
              : "bg-slate-200/60 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-400 dark:text-slate-500 opacity-60"
          }`}
        >
          <ShieldCheck className="w-6 h-6" />
        </motion.div>

        {/* Scan Status Badge */}
        <div className="font-mono text-xs uppercase tracking-wider flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-white/5">
          <span
            className={`w-2 h-2 rounded-full ${
              isUnlocked
                ? "bg-emerald-500 animate-ping"
                : "bg-blue-500/60 animate-pulse"
            }`}
          />
          <span className="text-slate-600 dark:text-slate-400 font-semibold">
            {isUnlocked ? "AUDIT UNLOCKED" : "CLICK / HOVER FINGERPRINT"}
          </span>
        </div>
      </div>

      {/* Central Biometric Fingerprint Scanner */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] flex items-center justify-center">
          {/* Concentric Scanner Orbit 1 */}
          <div
            className={`absolute w-full h-full border rounded-full transition-all duration-700 ${
              isUnlocked
                ? "border-blue-500/40 dark:border-blue-400/40 scale-105"
                : "border-slate-300/40 dark:border-white/5"
            }`}
            style={{ borderStyle: "dashed" }}
          />
          {/* Concentric Scanner Orbit 2 */}
          <div
            className={`absolute w-[80%] h-[80%] border rounded-full transition-all duration-700 ${
              isUnlocked
                ? "border-cyan-500/50 dark:border-cyan-400/50 scale-110 rotate-45"
                : "border-slate-300/30 dark:border-white/5"
            }`}
            style={{ borderStyle: "dotted" }}
          />

          {/* Scanner Core Circle with Fingerprint Icon */}
          <motion.div
            animate={isUnlocked ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`relative w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              isUnlocked
                ? "bg-blue-500/10 dark:bg-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.35)] border border-blue-500/50"
                : "bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10"
            }`}
          >
            {/* Laser Scan Line Animation */}
            {isUnlocked && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: [-45, 45, -45], opacity: [0.2, 1, 0.2] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.0,
                  ease: "easeInOut",
                }}
                className="absolute w-[80%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38bdf8] z-20"
              />
            )}

            <Fingerprint
              className={`w-16 h-16 md:w-20 md:h-20 transition-all duration-500 ${
                isUnlocked
                  ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-[0_0_18px_rgba(59,130,246,0.6)]"
                  : "text-slate-400 dark:text-slate-500"
              }`}
              strokeWidth={1.2}
            />
          </motion.div>
        </div>
      </div>

      {/* Details Container - Animates in from Right-Bottom on Hover/Click */}
      <motion.div
        initial={false}
        animate={
          isUnlocked
            ? { opacity: 1, x: 0, y: 0, scale: 1 }
            : { opacity: 0, x: 50, y: 50, scale: 0.9, pointerEvents: "none" }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-sm mt-auto self-start pointer-events-none"
      >
        <h4 className="text-3xl md:text-4xl font-display text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
          100% Auditable
        </h4>
        <p className="text-slate-600 dark:text-slate-300 font-sans text-sm leading-relaxed">
          Every decision the agent makes is fully documented, traced back to the
          original rule or evidence, and cryptographically verified.
        </p>
      </motion.div>
    </motion.div>
  );
}

function InteractiveSoc2Card({ isDark }: { isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#F1F5F9]/90 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[30px] p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 flex flex-col justify-between h-[190px] cursor-pointer select-none"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors duration-500 pointer-events-none" />

      {/* Lock Icon - Big & Centered initially, slides to Top-Left on Hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div
          animate={
            isHovered
              ? { x: -65, y: -48, scale: 0.75 }
              : { x: 0, y: 0, scale: 1.15 }
          }
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {isHovered ? (
            <Unlock className="w-9 h-9 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
          ) : (
            <Lock className="w-9 h-9 text-slate-600 dark:text-slate-400" />
          )}
        </motion.div>
      </div>

      {/* Details - Animates in at Bottom-Left on Hover */}
      <motion.div
        initial={false}
        animate={
          isHovered
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 18, scale: 0.95 }
        }
        transition={{
          duration: 0.4,
          delay: isHovered ? 0.08 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mt-auto pointer-events-none z-20"
      >
        <h4 className="text-xl font-display text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
          SOC 2 Type II
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-widest">
          Compliant Architecture
        </p>
      </motion.div>
    </motion.div>
  );
}

function InteractiveAesCard({ isDark }: { isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#F1F5F9]/90 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[30px] p-6 md:p-8 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-500 flex flex-col justify-between h-[190px] cursor-pointer select-none"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors duration-500 pointer-events-none" />

      {/* Server Icon - Big & Centered initially, slides to Top-Left on Hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div
          animate={
            isHovered
              ? { x: -65, y: -48, scale: 0.75 }
              : { x: 0, y: 0, scale: 1.15 }
          }
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Server
            className={`w-9 h-9 transition-colors ${
              isHovered
                ? "text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                : "text-slate-600 dark:text-slate-400"
            }`}
          />
        </motion.div>

        {isHovered && (
          <div className="absolute top-6 right-6 flex gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Details - Animates in at Bottom-Left on Hover */}
      <motion.div
        initial={false}
        animate={
          isHovered
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 18, scale: 0.95 }
        }
        transition={{
          duration: 0.4,
          delay: isHovered ? 0.08 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mt-auto pointer-events-none z-20"
      >
        <h4 className="text-xl font-display text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
          AES-256
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-widest">
          End-to-End Encryption
        </p>
      </motion.div>
    </motion.div>
  );
}

function InteractiveDeploymentCard({ isDark }: { isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="md:col-span-3 bg-[#F1F5F9]/90 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[30px] p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 flex items-center justify-between cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-[100%] group-hover:animate-[sweep_2s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 pointer-events-none" />
      <div className="flex items-center gap-6 relative z-10 pointer-events-none">
        <motion.div
          animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
            isHovered
              ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.25)]"
              : "bg-slate-200/60 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Server className="w-5 h-5" />
        </motion.div>
        <div>
          <h4 className="text-xl font-display text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
            Flexible Deployments
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-[0.1em]">
            On-Premise & Private Cloud Options Available
          </p>
        </div>
      </div>
      <div className="hidden md:flex gap-2 relative z-10 pointer-events-none">
        <div className="w-16 h-2 rounded-full bg-slate-300 dark:bg-white/10 overflow-hidden">
          <div
            className={`w-full h-full rounded-full transition-all duration-500 ${
              isHovered
                ? "bg-blue-500 animate-pulse"
                : "bg-slate-400 dark:bg-white/40"
            }`}
          />
        </div>
        <div className="w-8 h-2 rounded-full bg-slate-300 dark:bg-white/10" />
        <div className="w-8 h-2 rounded-full bg-slate-300 dark:bg-white/10" />
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── Testimonials Accordion Card Deck ────────────────────────────────────────

function ExpandingTestimonialsAccordion({ isDark }: { isDark: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const TESTIMONIALS = [
    {
      id: "01",
      initials: "S",
      role: "VP Regulatory Affairs",
      company: "GLOBAL MEDTECH ENTERPRISE",
      quote:
        "RAccelerator didn't just digitize our workflows; it brought absolute traceability to our gap assessments. The ability to directly tie evidence to every decision is a game-changer for audits.",
    },
    {
      id: "02",
      initials: "E",
      role: "Head of Digital Commerce",
      company: "FORTUNE 500 RETAILER",
      quote:
        "The autonomous agent landscape is chaotic. ReviewsIntel brought the exact missing layer of trust we needed—making sure agents purchase based on documented, verifiable evidence.",
    },
    {
      id: "03",
      initials: "M",
      role: "Chief Information Officer",
      company: "HEALTHCARE NETWORK",
      quote:
        "What stood out wasn't just the AI, but the engineering rigor. Craton approaches enterprise problems like a true partner—filing IP, building secure data layers, and keeping experts in the loop.",
    },
    {
      id: "04",
      initials: "A",
      role: "Chief Security Officer",
      company: "GLOBAL FINANCIAL SERVICES",
      quote:
        "In banking, security and audit trails are non-negotiable. Craton's deterministic execution framework gives us complete visibility into every automated decision before it hits production.",
    },
    {
      id: "05",
      initials: "D",
      role: "Director of Enterprise AI",
      company: "GLOBAL PHARMA CORP",
      quote:
        "Deploying AI in clinical trials required zero room for hallucinations. Craton provided the strict policy validation layers and evidence chains our compliance team demanded.",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[420px] w-full">
      {TESTIMONIALS.map((item, idx) => {
        const isActive = activeIndex === idx;

        return (
          <motion.div
            key={item.id}
            onMouseEnter={() => setActiveIndex(idx)}
            onClick={() => setActiveIndex(idx)}
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-[28px] p-6 md:p-8 backdrop-blur-xl border transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${
              isActive
                ? "flex-[3.5] bg-[#F1F5F9]/95 dark:bg-[#111827]/90 border-blue-500/40 dark:border-blue-400/30 shadow-2xl shadow-blue-500/10"
                : "flex-[1] md:flex-[0.8] bg-[#F1F5F9]/50 dark:bg-[#111827]/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
            }`}
          >
            {/* Ambient subtle glow when active */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-bl-full pointer-events-none -z-10 blur-2xl"
              />
            )}

            {/* Active state content */}
            {isActive ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between h-full w-full"
              >
                <div>
                  <div className="text-cyan-500 dark:text-cyan-400 mb-3 text-4xl font-serif leading-none">
                    "
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-sans font-light leading-relaxed text-base md:text-lg max-w-xl">
                    {item.quote}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
                    <span className="font-display text-lg">
                      {item.initials}
                    </span>
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <h4 className="font-sans text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.role}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest truncate">
                      {item.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Collapsed state content - narrow width, role title vertically shown */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-between h-full w-full py-2"
              >
                <div className="text-cyan-500/60 dark:text-cyan-400/60 text-2xl font-serif">
                  "
                </div>

                <div className="my-auto py-4">
                  <span className="[writing-mode:vertical-lr] rotate-180 font-sans text-sm tracking-wide uppercase text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {item.role}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                  <span className="font-display text-sm">{item.initials}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── Section 06 Interactive Contact & Intake Component ───────────────────────

function InteractiveContactSection({ isDark }: { isDark: boolean }) {
  const [selectedIntent, setSelectedIntent] = useState<string>("Start a pilot");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    workNote: "",
  });

  const INTENTS = [
    {
      title: "Start a pilot",
      desc: "Evaluate RAccelerator on your own technical file, with your regulatory team in the loop.",
    },
    {
      title: "Partner with Craton",
      desc: "Co-develop or distribute a product with a team that files first and ships.",
    },
    {
      title: "Lead a product",
      desc: "Bring decades of domain expertise and own the product you build.",
    },
    {
      title: "Join Craton",
      desc: "Serious problems, a modern AI-native stack, and a founder who has shipped.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Craton Inquiry: ${selectedIntent}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nConversation Type: ${selectedIntent}\nDetails: ${formData.workNote}`,
    );
    window.location.href = `mailto:hello@craton.ai?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="w-full py-12 md:py-16 flex flex-col items-center justify-center px-6 md:px-12 z-10 bg-transparent relative overflow-hidden"
    >
      {/* Header Area (Curious by nature style) */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center shrink-0 mb-12 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2"
        >
          A QUESTION WORTH EXPLORING?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
        >
          The future doesn’t build itself.
          <br />
          <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
            Let’s move it forward.
          </span>
        </motion.h2>
        <p className="text-slate-600 dark:text-slate-400 font-sans text-sm md:text-base mt-4 max-w-xl text-center leading-relaxed">
          Tell us who you are and we’ll route you to the right conversation.
        </p>
      </div>

      {/* Main Container Card (2-Column Grid Layout) */}
      <div className="w-full max-w-6xl bg-slate-100/80 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[36px] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: Intent Option Cards (Vertical Stack) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold mb-1 px-1">
              Select Conversation Goal
            </span>
            {INTENTS.map((intent) => {
              const isSelected = selectedIntent === intent.title;
              return (
                <motion.div
                  key={intent.title}
                  onClick={() => setSelectedIntent(intent.title)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/60 shadow-md shadow-blue-500/10"
                      : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4
                      className={`font-display text-sm md:text-base font-bold transition-colors ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {intent.title}
                    </h4>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-sans text-xs leading-relaxed">
                    {intent.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT SIDE: Contact Intake Form */}
          <div className="lg:col-span-7 bg-white/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Name"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Work email"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Company"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest mb-1.5">
                  Conversation
                </label>
                <select
                  value={selectedIntent}
                  onChange={(e) => setSelectedIntent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {INTENTS.map((intent) => (
                    <option
                      key={intent.title}
                      value={intent.title}
                      className="bg-slate-900 text-white"
                    >
                      {intent.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest mb-1.5">
                  One line on what you’re working on
                </label>
                <input
                  type="text"
                  value={formData.workNote}
                  onChange={(e) =>
                    setFormData({ ...formData, workNote: e.target.value })
                  }
                  placeholder="e.g. Class IIb device, MDR technical file due Q2"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-sans text-sm font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 transform active:scale-95"
                >
                  Start a conversation
                </button>
                <p className="text-slate-500 dark:text-slate-400 font-sans text-xs mt-3 text-center">
                  Opens your email client addressed to Craton. We reply within
                  two business days.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── Floating Back to Top Button Component ───────────────────────────────────

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-blue-600/90 dark:bg-blue-500/90 text-white backdrop-blur-md shadow-xl shadow-blue-500/30 border border-white/20 flex items-center justify-center cursor-pointer transition-colors hover:bg-blue-500 dark:hover:bg-blue-400 group"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── Section 04/05 Unique Company & Leadership Bento Grid ────────────────────

function UniqueCompanyBentoSection({ isDark }: { isDark: boolean }) {
  const ROSTER_ITEMS = [
    {
      title: "Chief Regulatory Affairs Officer",
      tag: "Co-founder · EU MDR / IVDR",
      badge: "Regulatory Lead",
    },
    {
      title: "Chief Product Officer",
      tag: "Co-founder · product & user acceptance",
      badge: "Product Lead",
    },
    {
      title: "Head of Regulatory Affairs, IVD",
      tag: "In vitro diagnostics",
      badge: "Diagnostics Spec",
    },
    {
      title: "Chief Commercial Officer",
      tag: "Go-to-market",
      badge: "GTM Lead",
    },
    {
      title: "Regulatory Consultants",
      tag: "Independent MD and IVD specialists",
      badge: "External Panel",
    },
    {
      title: "AI Engineering Team",
      tag: "Palo Alto",
      badge: "Core Engineering",
    },
  ];

  return (
    <section
      id="company"
      className="w-full py-12 md:py-16 relative overflow-hidden z-10"
    >
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl px-6 md:px-12 mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Box 1: The Core Philosophy */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-8 bg-slate-100/90 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[36px] p-8 md:p-12 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />

            {/* Rotating Bedrock Crystal Matrix Graphic */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-64 h-64 opacity-20 dark:opacity-30 pointer-events-none hidden md:block">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full animate-[spin_50s_linear_infinite]"
              >
                <polygon
                  points="100,20 170,60 170,140 100,180 30,140 30,60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-blue-500"
                />
                <polygon
                  points="100,45 145,72 145,128 100,155 55,128 55,72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-cyan-400"
                />
                <line
                  x1="100"
                  y1="20"
                  x2="100"
                  y2="180"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-400"
                />
                <line
                  x1="30"
                  y1="60"
                  x2="170"
                  y2="140"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-400"
                />
                <line
                  x1="30"
                  y1="140"
                  x2="170"
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-400"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="10"
                  fill="currentColor"
                  className="text-blue-500 animate-pulse"
                />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-blue-600 dark:text-blue-400">
                    04 // CRATON TECHNOLOGIES
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    PATENT-FIRST METHOD
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5 max-w-xl">
                  Bold thinking.
                  <br />
                  <span className="font-serif italic font-normal text-blue-600 dark:text-cyan-400">
                    Grounded execution.
                  </span>
                </h2>

                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-sans font-normal leading-relaxed max-w-2xl mb-4">
                  Craton Technologies is an innovation-driven product company based in Frisco, Texas. We identify hard, high-trust problems in regulated or evidence-heavy industries, invent a novel approach, protect it, assemble the domain leadership to make it credible, and ship it as a product — then repeat the method in the next domain.
                </p>

                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-sans font-light leading-relaxed max-w-2xl mb-6">
                  A craton is the ancient, stable core of a continent — the bedrock everything else is built on. That is the idea: one method, one engineering discipline, one patent-first habit, from which restless, domain-specific products rise.
                </p>
              </div>

              {/* Pill Tags */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
                {[
                  "Artificial intelligence",
                  "Domain expertise",
                  "Evidence-led thinking",
                  "Patent-first",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Box 2: Founder & CEO Profile */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-4 bg-slate-100/90 dark:bg-white/[0.02] backdrop-blur-2xl border border-blue-500/20 dark:border-white/10 rounded-[36px] p-8 md:p-10 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl flex flex-col justify-between"
          >
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/25 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold font-display text-lg">
                    SA
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display text-slate-900 dark:text-white font-bold tracking-tight mb-1">
                  Sheik Ahamed Ali
                </h3>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-semibold mb-4">
                  Founder & CEO
                </p>

                <p className="text-slate-600 dark:text-slate-300 font-sans font-light leading-relaxed text-xs md:text-sm mb-6">
                  Twenty-two years building enterprise systems where failure was
                  expensive — retail integration at national scale, then
                  platform and architecture leadership — with the habit of
                  inventing from inside operating roles.
                </p>
              </div>

              {/* 4 Stats Badges matching user's exact specification */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-tight">
                    3 granted
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    US patents
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-tight">
                    9 pending
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    US Provisional
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-white leading-tight">
                    Judge
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    R&D 100 Awards
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-tight">
                    TOGAF 9.1
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Certified
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Box 3: Domain Leadership */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-8 bg-slate-100/90 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[36px] p-8 md:p-12 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2">
              <div>
                <h3 className="text-2xl md:text-3xl font-display text-slate-900 dark:text-white font-bold tracking-tight uppercase">
                  Domain Leadership
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                  Multi-disciplinary enterprise leadership panel
                </p>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                Roles shown; names appear with each person’s consent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {ROSTER_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 group/tile"
                >
                  <div className="flex items-center justify-between mb-2">
                    <b className="text-slate-900 dark:text-white font-sans text-sm font-semibold group-hover/tile:text-blue-600 dark:group-hover/tile:text-cyan-400 transition-colors">
                      {item.title}
                    </b>
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-widest block">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Box 4 & 5: Impact Cards */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-4 grid grid-rows-2 gap-6"
          >
            {/* DiscoverSTEM */}
            <div className="bg-slate-100/90 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[32px] p-7 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <p className="text-[11px] uppercase tracking-widest font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    Next generation
                  </p>
                </div>
                <h4 className="text-xl font-display text-slate-900 dark:text-white font-bold mb-2 tracking-wide uppercase">
                  DiscoverSTEM Foundation
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-sans leading-relaxed">
                  A 501(c)(3) our founder helped establish, supporting
                  underprivileged children in STEM, entrepreneurship, and
                  innovation.
                </p>
              </div>
            </div>

            {/* R&D 100 */}
            <div className="bg-slate-100/90 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[32px] p-7 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 shadow-xl flex flex-col justify-center">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-[11px] uppercase tracking-widest font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    Recognition
                  </p>
                </div>
                <h4 className="text-xl font-display text-slate-900 dark:text-white font-bold mb-2 tracking-wide uppercase">
                  R&D 100 Awards
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-sans leading-relaxed">
                  Our founder serves on the judging panel for one of the
                  longest-running recognitions of applied research and
                  innovation.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const { setProgress } = useStore();
  const { scrollYProgress } = useScroll();
  const rotateMockup = useTransform(scrollYProgress, [0.3, 0.6], [10, 0]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const mindsetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mindsetScroll } = useScroll({ target: mindsetRef });
  const mindsetX = useTransform(mindsetScroll, [0, 1], ["0%", "-70%"]);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  // Mouse tracking for magic shine effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 600);
          return 100;
        }
        return prev + Math.floor(Math.random() * 4) + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setProgress(activeStep / 4);
    }
  }, [activeStep, setProgress, isLoading]);

  return (
    <main
      className={`bg-ink text-cream selection:bg-copper selection:text-ink relative overflow-x-clip ${isLoading ? "h-screen" : ""}`}
    >
      {/* GLOBAL MAGIC MOUSE TRAIL */}
      <MagicCursor />

      {/* PRELOADER SCREEN */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 ${
              mounted && theme === "light" ? "bg-[#F8FAFC]" : "bg-[#030712]"
            }`}
          >
            {/* Full Background Minor Dot Pattern */}
            <div
              className={`absolute inset-0 bg-[size:20px_20px] pointer-events-none opacity-60 ${
                mounted && theme === "light"
                  ? "bg-[radial-gradient(#94a3b8_1px,transparent_1px)]"
                  : "bg-[radial-gradient(#334155_1px,transparent_1px)]"
              }`}
            />

            {/* Soft Ambient Background Glow */}
            <div
              className={`absolute inset-0 blur-2xl pointer-events-none ${
                mounted && theme === "light"
                  ? "bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08)_0%,rgba(248,250,252,0.95)_70%)]"
                  : "bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15)_0%,rgba(3,7,18,0.95)_70%)]"
              }`}
            />

            {/* Pulsing Central Blur Aura */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute w-80 h-80 rounded-full blur-[90px] pointer-events-none ${
                mounted && theme === "light" ? "bg-blue-400/20" : "bg-cyan-500/20"
              }`}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Central Logo */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-10 group"
              >
                {/* Logo Backlight Glow */}
                <div
                  className={`absolute -inset-6 rounded-full blur-2xl animate-pulse opacity-70 ${
                    mounted && theme === "light"
                      ? "bg-gradient-to-r from-blue-400/30 to-indigo-500/30"
                      : "bg-gradient-to-r from-sky-500/30 to-blue-600/30"
                  }`}
                />

                <motion.img
                  src="/bg-r-logo.png"
                  alt="Logo"
                  className={`w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 ${
                    mounted && theme === "light"
                      ? "drop-shadow-[0_0_25px_rgba(37,99,235,0.3)]"
                      : "drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]"
                  }`}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Progress Bar Container */}
              <div
                className={`w-72 md:w-96 h-[4px] relative overflow-hidden mb-5 rounded-full backdrop-blur-md ${
                  mounted && theme === "light"
                    ? "bg-slate-200 border border-slate-300 shadow-sm"
                    : "bg-slate-900/90 border border-sky-500/25 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                }`}
              >
                <motion.div
                  className={`absolute top-0 left-0 h-full ${
                    mounted && theme === "light"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                      : "bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 shadow-[0_0_16px_#38bdf8]"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
                {/* Moving Light Shimmer Beam */}
                <motion.div
                  animate={{ x: ["-100%", "250%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                />
              </div>

              {/* Progress Info Labels */}
              <div
                className={`w-72 md:w-96 flex justify-between items-center text-[12px] font-mono uppercase tracking-[0.25em] ${
                  mounted && theme === "light" ? "text-slate-700" : "text-slate-300"
                }`}
              >
                <span
                  className={`flex items-center gap-2 font-semibold ${
                    mounted && theme === "light" ? "text-blue-600" : "text-sky-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${
                      mounted && theme === "light" ? "bg-blue-600" : "bg-cyan-400"
                    }`}
                  />
                  Initializing Platform
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded font-bold ${
                    mounted && theme === "light"
                      ? "bg-white border border-slate-300 text-blue-600 shadow-sm"
                      : "bg-sky-950/90 border border-sky-500/40 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                  }`}
                >
                  {loadingProgress}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* FIXED 3D PARTICLE MORPHING ENGINE */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 20], fov: 35 }} dpr={[1, 2]}>
          <CratonWorld
            activeStep={activeStep}
            theme={mounted && theme === "light" ? "light" : "dark"}
          />
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-ink)_100%)] z-10 pointer-events-none opacity-90" />
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: INTERACTIVE NARRATIVE (KUMO-STYLE)                  */}
      {/* ============================================================== */}
      <section
        id="discover"
        className="h-screen w-full relative z-10 overflow-hidden bg-transparent flex flex-col justify-end pb-20"
      >
        {/* Giant Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center pb-40 md:pb-52 pointer-events-none overflow-hidden z-0">
          <AnimatePresence mode="popLayout">
            <motion.h1
              key={activeStep}
              initial={{ opacity: 0, scale: 0.95, y: 30, filter: "blur(10px)" }}
              animate={{
                opacity: mounted && theme === "light" ? 0.16 : 0.1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{ opacity: 0, scale: 1.05, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-[20vw] lowercase tracking-tight text-slate-400 dark:text-cream/50 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-kumo)",
                fontStyle: "italic",
                fontWeight: 700,
              }}
            >
              {["Scattered", "Ideas", "Focus", "Forward", "Craton"][activeStep]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* LEFT SIDE TITLE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-4 md:left-8 h-full flex items-center z-20 pointer-events-none"
        >
          <svg
            width="60"
            height="100%"
            viewBox="0 0 60 800"
            className="overflow-visible"
          >
            <path
              id="straightLeft"
              d="M 30 0 L 30 800"
              fill="transparent"
              stroke="transparent"
            />
            <text
              fill={mounted && theme === "light" ? "#1d4ed8" : "#38bdf8"}
              fillOpacity="0.6"
              fontSize="18"
              fontWeight="600"
              fontFamily="var(--font-display)"
              letterSpacing="0.15em"
              textAnchor="start"
              style={{ textTransform: "uppercase" }}
            >
              <textPath href="#straightLeft" startOffset="0%">
                {"BOLD IDEAS. \u00A0\u00A0\u00A0\u00A0\u00A0 ".repeat(12)}
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* RIGHT SIDE TITLE */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="absolute top-0 right-4 md:right-8 h-full flex items-center z-20 pointer-events-none"
        >
          <svg
            width="60"
            height="100%"
            viewBox="0 0 60 800"
            className="overflow-visible"
          >
            <path
              id="straightRight"
              d="M 30 0 L 30 800"
              fill="transparent"
              stroke="transparent"
            />
            <text
              fill={mounted && theme === "light" ? "#1d4ed8" : "#38bdf8"}
              fillOpacity="0.6"
              fontSize="18"
              fontWeight="600"
              fontFamily="var(--font-display)"
              letterSpacing="0.15em"
              textAnchor="start"
              style={{ textTransform: "uppercase" }}
            >
              <textPath href="#straightRight" startOffset="0%">
                {"ENGINEERED FORWARD. \u00A0\u00A0\u00A0\u00A0\u00A0 ".repeat(12)}
              </textPath>
            </text>
          </svg>
        </motion.div>

        {/* Front Content UI (Kumo Style) */}
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-12 md:px-32">
          <motion.div
            animate={{
              boxShadow:
                mounted && theme === "light"
                  ? [
                      "0 25px 60px -12px rgba(14,165,233,0.15)",
                      "0 25px 60px -12px rgba(14,165,233,0.35)",
                      "0 25px 60px -12px rgba(14,165,233,0.15)",
                    ]
                  : [
                      "0 25px 50px -12px rgba(0,0,0,0.25)",
                      "0 25px 50px -12px rgba(56,189,248,0.15)",
                      "0 25px 50px -12px rgba(0,0,0,0.25)",
                    ],
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            onMouseMove={handleMouseMove}
            className="group flex flex-col md:flex-row justify-between items-end gap-12 backdrop-blur-3xl border border-white/80 dark:border-cream/10 rounded-[40px] p-10 relative overflow-hidden bg-[#F1F5F9]/90 dark:bg-ink-2/30"
          >
            {/* Magical Mouse Follow Shine */}
            <motion.div
              className="pointer-events-none absolute z-0 opacity-100 rounded-full blur-[60px]"
              style={{
                width: 500,
                height: 500,
                left: -250,
                top: -250,
                x: mouseX,
                y: mouseY,
                backgroundColor:
                  mounted && theme === "light"
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(56,189,248,0.15)",
              }}
            />

            {/* Infinite Shimmering Glow (Left to Right pass) */}
            <motion.div
              animate={{ left: ["-20%", "120%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className={`absolute top-0 w-[150px] md:w-[250px] h-full bg-gradient-to-r from-transparent ${mounted && theme === "light" ? "via-slate-400/30" : "via-white/20"} to-transparent -skew-x-12 z-0 pointer-events-none opacity-100`}
            />

            {/* Auto-advancing Loading Line */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-transparent">
              <motion.div
                key={activeStep}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                onAnimationComplete={() =>
                  setActiveStep((prev) => (prev + 1) % 5)
                }
                className={`h-full ${mounted && theme === "light" ? "bg-gradient-to-r from-gray-900 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-gradient-to-r from-copper to-sage shadow-[0_0_10px_rgba(56,189,248,0.8)]"}`}
              />
            </div>

            {/* Left text description */}
            <div className="max-w-md relative z-10">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <p className="font-sans font-bold text-[#3b4e69] dark:text-copper mb-4 text-xl tracking-widest">
                    0{activeStep + 1} / 05
                  </p>
                  <h2 className="text-4xl md:text-5xl font-serif italic mb-4 text-[#3b4e69] dark:text-cream tracking-tight">
                    {
                      [
                        "Scattered possibility.",
                        "Ideas gather.",
                        "Focus & Innovation.",
                        "Moving Forward.",
                        "Foundation built.",
                      ][activeStep]
                    }
                  </h2>
                  <p className="text-[#3b4e69]/80 dark:text-cream/70 font-sans font-light text-sm leading-relaxed">
                    {
                      [
                        "A field of scattered points, representing raw, unorganized data in regulated work.",
                        "The points gather into a sphere. The data begins to take shape.",
                        "Taking the shape of a light bulb. True innovation requires rigorous design.",
                        "Opening into an infinity loop. AI-enabled products for evidence-heavy work.",
                        "From possibility to purpose. Keep scrolling to explore the platform.",
                      ][activeStep]
                    }
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Interactive Controls */}
            <div className="flex flex-col items-end gap-6 relative z-10">
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#3b4e69]/70 dark:text-cream/50">
                Select Phase
              </p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`w-9 h-9 rounded-full font-mono text-xs transition-all flex items-center justify-center cursor-pointer ${
                      activeStep === step
                        ? "bg-[#3b4e69] text-white dark:bg-copper dark:text-ink-1 font-bold shadow-lg scale-105"
                        : "bg-[#3b4e69]/10 dark:bg-cream/5 text-[#3b4e69] dark:text-cream/60 hover:bg-[#3b4e69]/20 dark:hover:bg-cream/15"
                    }`}
                  >
                    0{step + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 1.5: THE 5 BENTO STATS CARDS                           */}
      {/* ============================================================== */}
      <section className="w-full pt-4 pb-12 px-6 md:px-12 relative bg-transparent z-30 overflow-hidden">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto w-full"
        >
          {/* Card 1: Experience */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-[24px] p-6 bg-slate-100/90 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-center min-h-[120px] overflow-hidden cursor-pointer"
          >
            {/* Hover Laser Sweep Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                22+ years
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed">
                shipping enterprise systems
              </p>
            </div>

            {/* Bottom Glow Beam accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </motion.div>

          {/* Card 2: IP Patents */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-[24px] p-6 bg-slate-100/90 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-center min-h-[120px] overflow-hidden cursor-pointer"
          >
            {/* Hover Laser Sweep Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                3 granted · 9 pending
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed">
                US patents, as of Aug 2026
              </p>
            </div>

            {/* Bottom Glow Beam accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </motion.div>

          {/* Card 3: ReviewsIntel */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-[24px] p-6 bg-slate-100/90 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-center min-h-[120px] overflow-hidden cursor-pointer"
          >
            {/* Hover Laser Sweep Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                Patent pending
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed">
                ReviewsIntel · US provisional, June 2026
              </p>
            </div>

            {/* Bottom Glow Beam accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </motion.div>

          {/* Card 4: RAccelerator */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-[24px] p-6 bg-slate-100/90 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-center min-h-[120px] overflow-hidden cursor-pointer"
          >
            {/* Hover Laser Sweep Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                First enterprise evaluation
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed">
                RAccelerator · global device manufacturer · Sept 2026
              </p>
            </div>

            {/* Bottom Glow Beam accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </motion.div>

          {/* Card 5: Headquarters */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-[24px] p-6 bg-slate-100/90 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-center min-h-[120px] overflow-hidden cursor-pointer"
          >
            {/* Hover Laser Sweep Line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl lg:text-2xl font-display font-bold text-slate-900 dark:text-white mb-1 tracking-tight leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                Frisco, Texas
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed">
                Craton Technologies LLC · founder-funded
              </p>
            </div>

            {/* Bottom Glow Beam accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 1.6: THE CRATON MINDSET                                 */}
      {/* ============================================================== */}
      <section
        id="mindset"
        ref={mindsetRef}
        style={{
          backgroundColor: mounted && theme === "dark" ? "#0B1120" : "#FFFFFF",
        }}
        className="w-full pt-16 pb-16 px-6 md:px-12 relative z-30 transition-colors duration-500 overflow-hidden flex flex-col justify-center"
      >
        {/* Particle Galaxy Canvas Background (Cosmic Nebula Spin) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <MindsetGalaxyCanvas isLight={mounted && theme === "light"} />
        </motion.div>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,90,122,0.06)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none z-0" />

        {/* Main Section Content Wrapper with Re-triggerable Staggered Entry Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 35 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.2,
                delayChildren: 0.1,
              },
            },
          }}
          className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center"
        >
          {/* STEP 1 OF ANIMATION: MAIN TITLE */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.9, filter: "blur(12px)" },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="text-center flex flex-col items-center mb-6 max-w-[950px]"
          >
            <p
              className={`text-xs tracking-[0.2em] uppercase font-mono font-semibold mb-6 ${mounted && theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              01 / The Craton Mindset
            </p>
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight leading-[1.1] font-bold max-w-4xl mx-auto ${mounted && theme === "dark" ? "text-white" : "text-slate-900"}`}
            >
              The next breakthrough starts
              <br className="hidden sm:block" /> with a{" "}
              <span className="font-serif italic text-blue-600 dark:text-blue-400">
                better question.
              </span>
            </h2>
          </motion.div>

          {/* STEP 2 OF ANIMATION: SUB CONTENT */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 35, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="text-center flex flex-col items-center mb-20 md:mb-24 max-w-[800px]"
          >
            <p
              className={`text-lg md:text-xl leading-relaxed font-normal max-w-2xl ${mounted && theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
            >
              What if complex information could become clearer decisions? We
              bring bold thinking, deep research, and thoughtful architecture
              together to build products for work where trust is the hard part.
            </p>
          </motion.div>

          {/* STEP 3 OF ANIMATION: CARDS 01, 02, 03 IN 1 HORIZONTAL ROW */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.25, delayChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-6xl mx-auto"
          >
            {/* CARD 01: TRUST */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.92 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Image Icon Box on Top */}
              <div
                className={`w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0 rounded-[32px] backdrop-blur-md shadow-xl flex items-center justify-center border overflow-hidden relative mb-5 ${mounted && theme === "dark" ? "bg-slate-800/80 border-white/10" : "bg-slate-50 border-slate-200/80"}`}
              >
                {/* Floating ambient dust particles (Matching screenshot 2) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                  {Array.from({ length: 14 }).map((_, ptIdx) => {
                    const posX = (ptIdx * 23) % 100;
                    const posY = (ptIdx * 37) % 100;
                    const size = ptIdx % 3 === 0 ? 2.5 : 1.5;
                    return (
                      <motion.div
                        key={`amb1-${ptIdx}`}
                        className="absolute rounded-xs bg-blue-500/50 dark:bg-cyan-400/60"
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          width: size,
                          height: size,
                        }}
                        animate={{
                          y: [0, -28, 0],
                          x: [0, ptIdx % 2 === 0 ? 10 : -10, 0],
                          opacity: [0.15, 0.75, 0.15],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3 + (ptIdx % 4) * 0.6,
                          ease: "easeInOut",
                          delay: (ptIdx % 5) * 0.25,
                        }}
                      />
                    );
                  })}
                </div>

                <svg
                  viewBox="0 0 100 60"
                  className="w-36 h-20 md:w-44 md:h-24 overflow-visible relative z-10"
                >
                  {/* Dotted Dots Assemble into Infinity Loop & Float Infinitely */}
                  {INF_PTS.map((p, i) => {
                    const initX = 50 + (((i * 43) % 70) - 35);
                    const initY = 30 + (((i * 59) % 50) - 25);
                    const xWiggle = Math.sin(i * 1.3) * 2.2;
                    const yWiggle = Math.cos(i * 1.7) * 2.2;
                    return (
                      <motion.circle
                        key={`inf-pt-${i}`}
                        initial={{
                          cx: initX,
                          cy: initY,
                          opacity: 0.2,
                          scale: 0.4,
                        }}
                        whileInView={{
                          cx: p.x,
                          cy: p.y + 5,
                          opacity: 0.75,
                          scale: 1,
                        }}
                        animate={{
                          x: [0, xWiggle, -xWiggle, 0],
                          y: [0, yWiggle, -yWiggle, 0],
                        }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          cx: {
                            duration: 1.2,
                            delay: (i % 15) * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          cy: {
                            duration: 1.2,
                            delay: (i % 15) * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: { duration: 0.8, delay: (i % 15) * 0.03 },
                          scale: { duration: 0.8, delay: (i % 15) * 0.03 },
                          x: {
                            repeat: Infinity,
                            duration: 2.4 + (i % 4) * 0.5,
                            ease: "easeInOut",
                          },
                          y: {
                            repeat: Infinity,
                            duration: 2.8 + (i % 3) * 0.5,
                            ease: "easeInOut",
                          },
                        }}
                        r="1.4"
                        fill={
                          mounted && theme === "dark" ? "#38bdf8" : "#3b5a7a"
                        }
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Content on Bottom */}
              <div className="flex flex-col items-center">
                <div
                  className={`text-4xl md:text-5xl font-light mb-2 font-mono ${mounted && theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  01
                </div>
                <h3
                  className={`text-xl md:text-2xl font-bold mb-2 ${mounted && theme === "dark" ? "text-white" : "text-slate-900"}`}
                >
                  Trust is the product.
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed font-normal max-w-xs ${mounted && theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
                >
                  In regulated work, a recommendation is worth exactly as much
                  as the evidence behind it.
                </p>
              </div>
            </motion.div>

            {/* CARD 02: INNOVATION / BULB */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.92 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Image Icon Box on Top */}
              <div
                className={`w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0 rounded-[32px] backdrop-blur-md shadow-xl flex items-center justify-center border overflow-hidden relative mb-5 ${mounted && theme === "dark" ? "bg-slate-800/80 border-white/10" : "bg-slate-50 border-slate-200/80"}`}
              >
                {/* Floating ambient dust particles (Matching screenshot 2) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                  {Array.from({ length: 14 }).map((_, ptIdx) => {
                    const posX = (ptIdx * 29) % 100;
                    const posY = (ptIdx * 41) % 100;
                    const size = ptIdx % 3 === 0 ? 2.5 : 1.5;
                    return (
                      <motion.div
                        key={`amb2-${ptIdx}`}
                        className="absolute rounded-xs bg-blue-500/50 dark:bg-cyan-400/60"
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          width: size,
                          height: size,
                        }}
                        animate={{
                          y: [0, -32, 0],
                          x: [0, ptIdx % 2 === 0 ? -12 : 12, 0],
                          opacity: [0.15, 0.8, 0.15],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3.2 + (ptIdx % 4) * 0.5,
                          ease: "easeInOut",
                          delay: (ptIdx % 5) * 0.2,
                        }}
                      />
                    );
                  })}
                </div>

                <svg
                  viewBox="0 0 100 100"
                  className="w-32 h-32 md:w-40 md:h-40 overflow-visible relative z-10"
                >
                  {/* Dotted Dots Assemble into Light Bulb & Float Infinitely */}
                  {HERO_BULB_PTS.map((p, i) => {
                    const initX = 50 + (((i * 47) % 80) - 40);
                    const initY = 50 + (((i * 61) % 80) - 40);
                    const xWiggle = Math.sin(i * 1.5) * 2.5;
                    const yWiggle = Math.cos(i * 1.9) * 2.5;
                    return (
                      <motion.circle
                        key={`hero-bulb-${i}`}
                        initial={{
                          cx: initX,
                          cy: initY,
                          opacity: 0.15,
                          scale: 0.3,
                        }}
                        whileInView={{
                          cx: p.x,
                          cy: p.y,
                          opacity: 0.7,
                          scale: 1,
                        }}
                        animate={{
                          x: [0, xWiggle, -xWiggle, 0],
                          y: [0, yWiggle, -yWiggle, 0],
                        }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          cx: {
                            duration: 1.2,
                            delay: (i % 20) * 0.025,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          cy: {
                            duration: 1.2,
                            delay: (i % 20) * 0.025,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: { duration: 0.8, delay: (i % 20) * 0.025 },
                          scale: { duration: 0.8, delay: (i % 20) * 0.025 },
                          x: {
                            repeat: Infinity,
                            duration: 2.2 + (i % 5) * 0.4,
                            ease: "easeInOut",
                          },
                          y: {
                            repeat: Infinity,
                            duration: 2.6 + (i % 4) * 0.5,
                            ease: "easeInOut",
                          },
                        }}
                        r={i % 5 === 0 ? "1.25" : "0.85"}
                        fill={
                          mounted && theme === "dark" ? "#38bdf8" : "#3b5a7a"
                        }
                      />
                    );
                  })}

                  {/* Completed Screw Base Threads at Bottom of Bulb */}
                  <g
                    stroke={mounted && theme === "dark" ? "#7dd3fc" : "#3b5a7a"}
                    strokeWidth="1.1"
                    fill="none"
                    opacity="0.85"
                  >
                    <line
                      x1="41"
                      y1="65"
                      x2="59"
                      y2="65"
                      strokeLinecap="round"
                    />
                    <line
                      x1="42.5"
                      y1="69"
                      x2="57.5"
                      y2="69"
                      strokeLinecap="round"
                    />
                    <line
                      x1="44"
                      y1="73"
                      x2="56"
                      y2="73"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 45 73 Q 50 78 55 73"
                      fill={mounted && theme === "dark" ? "#38bdf8" : "#3b5a7a"}
                      opacity="0.6"
                    />
                  </g>
                </svg>
              </div>

              {/* Content on Bottom */}
              <div className="flex flex-col items-center">
                <div
                  className={`text-4xl md:text-5xl font-light mb-2 font-mono ${mounted && theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  02
                </div>
                <h3
                  className={`text-xl md:text-2xl font-bold mb-2 ${mounted && theme === "dark" ? "text-white" : "text-slate-900"}`}
                >
                  Protect before you build.
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed font-normal max-w-xs ${mounted && theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
                >
                  Novel ideas are filed first, then engineered. That discipline
                  is what lets an enterprise trust a young company.
                </p>
              </div>
            </motion.div>

            {/* CARD 03: FORWARD (PROPER DOTTED ROUND SPHERE) */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.92 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Image Icon Box on Top */}
              <div
                className={`w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0 rounded-[32px] backdrop-blur-md shadow-xl flex items-center justify-center border overflow-hidden relative mb-5 ${mounted && theme === "dark" ? "bg-slate-800/80 border-white/10" : "bg-slate-50 border-slate-200/80"}`}
              >
                {/* Floating ambient dust particles (Matching screenshot 2) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                  {Array.from({ length: 14 }).map((_, ptIdx) => {
                    const posX = (ptIdx * 31) % 100;
                    const posY = (ptIdx * 43) % 100;
                    const size = ptIdx % 3 === 0 ? 2.5 : 1.5;
                    return (
                      <motion.div
                        key={`amb3-${ptIdx}`}
                        className="absolute rounded-xs bg-blue-500/50 dark:bg-cyan-400/60"
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          width: size,
                          height: size,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          x: [0, ptIdx % 2 === 0 ? 11 : -11, 0],
                          opacity: [0.15, 0.8, 0.15],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3 + (ptIdx % 4) * 0.5,
                          ease: "easeInOut",
                          delay: (ptIdx % 5) * 0.2,
                        }}
                      />
                    );
                  })}
                </div>

                <svg
                  viewBox="0 0 100 100"
                  className="w-36 h-36 md:w-44 md:h-44 overflow-visible relative z-10"
                >
                  {/* Dotted Dots Assemble into 3D Sphere & Float Infinitely */}
                  {CARD3_SPHERE_PTS.map((p, i) => {
                    const initX = 50 + (((i * 53) % 80) - 40);
                    const initY = 50 + (((i * 67) % 80) - 40);
                    const outerColor =
                      mounted && theme === "dark" ? "#38bdf8" : "#3b5a7a";
                    const innerColor =
                      mounted && theme === "dark" ? "#7dd3fc" : "#475569";
                    const xWiggle = Math.sin(i * 1.7) * (p.isCore ? 1.5 : 2.8);
                    const yWiggle = Math.cos(i * 1.4) * (p.isCore ? 1.5 : 2.8);
                    return (
                      <motion.circle
                        key={`card3-pts-${i}`}
                        initial={{
                          cx: initX,
                          cy: initY,
                          opacity: 0.15,
                          scale: 0.3,
                        }}
                        whileInView={{
                          cx: p.x,
                          cy: p.y,
                          opacity: p.isCore ? 0.9 : 0.7,
                          scale: 1,
                        }}
                        animate={{
                          x: [0, xWiggle, -xWiggle, 0],
                          y: [0, yWiggle, -yWiggle, 0],
                        }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          cx: {
                            duration: 1.2,
                            delay: (i % 25) * 0.02,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          cy: {
                            duration: 1.2,
                            delay: (i % 25) * 0.02,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: { duration: 0.8, delay: (i % 25) * 0.02 },
                          scale: { duration: 0.8, delay: (i % 25) * 0.02 },
                          x: {
                            repeat: Infinity,
                            duration: 2.0 + (i % 6) * 0.4,
                            ease: "easeInOut",
                          },
                          y: {
                            repeat: Infinity,
                            duration: 2.4 + (i % 5) * 0.4,
                            ease: "easeInOut",
                          },
                        }}
                        r={p.r}
                        fill={p.isCore ? innerColor : outerColor}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Content on Bottom */}
              <div className="flex flex-col items-center">
                <div
                  className={`text-4xl md:text-5xl font-light mb-2 font-mono ${mounted && theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                >
                  03
                </div>
                <h3
                  className={`text-xl md:text-2xl font-bold mb-2 ${mounted && theme === "dark" ? "text-white" : "text-slate-900"}`}
                >
                  Experts own what they build.
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed font-normal max-w-xs ${mounted && theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
                >
                  Every product is led by people who have done the work for
                  decades, with full product-level ownership.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: THE DEEP CONTENT (ANIMATED VERTICAL SCROLL)         */}
      {/* ============================================================== */}
      <div className="w-full relative z-10 flex flex-col bg-ink border-none">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-copper/10 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-line)_1.5px,transparent_1.5px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)] pointer-events-none z-0" />

        {/* ============================================================== */}
        {/* PANEL 3: 02 / INTELLIGENCE, APPLIED (AI NEURAL SHOWCASE)       */}
        {/* ============================================================== */}
        <motion.section
          id="products"
          initial={{ opacity: 0, x: -120 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full pt-10 pb-16 md:pt-14 md:pb-20 px-6 md:px-12 lg:px-20 relative bg-[#FAFAFA] dark:bg-[#0B1120] transition-colors duration-500 overflow-hidden"
        >
          {/* Futuristic HTML5 Neural Constellation Canvas */}
          <IntelligenceAiCanvas />

          {/* Ambient Radial Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,90,122,0.04)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none z-0" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 bg-blue-500/10 dark:bg-blue-500/15" />
          <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 bg-cyan-500/10 dark:bg-cyan-500/15" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* HEADER AREA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8 md:mb-10"
            >
              <div className="lg:col-span-8 flex flex-col items-start">
                <p className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  02 / Deep Intelligence
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Complexity meets{" "}
                  <br className="hidden sm:block" />
                  <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
                    clarity.
                  </span>
                </h2>
              </div>

              <div className="lg:col-span-4">
                <motion.p
                  variants={fadeInUp}
                  className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed"
                >
                  Two products, two domains, one conviction: deep problems
                  deserve purpose-built intelligence with the reasoning shown.
                </motion.p>
              </div>
            </motion.div>

            {/* DUAL PRODUCT TAB SWITCHER HEADER BAR (COMPACT & SPACE EFFICIENT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8">
              {/* TAB 01: RAccelerator */}
              <button
                onClick={() => setActiveProductTab(0)}
                className={`group text-left p-4 md:p-5 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-row items-center justify-between gap-4 ${
                  activeProductTab === 0
                    ? "bg-white dark:bg-slate-800/90 border-blue-500/50 dark:border-blue-400/50 shadow-lg shadow-blue-500/10"
                    : "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      01
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                      RAccelerator
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    MedTech regulatory affairs
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                      activeProductTab === 0
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    {activeProductTab === 0 ? "LIVE ANALYSIS" : "VIEW DEMO"}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      activeProductTab === 0
                        ? "bg-blue-600 text-white rotate-45"
                        : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-white/20"
                    }`}
                  >
                    ↘
                  </div>
                </div>
                {activeProductTab === 0 && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"
                  />
                )}
              </button>

              {/* TAB 02: ReviewsIntel */}
              <button
                onClick={() => setActiveProductTab(1)}
                className={`group text-left p-4 md:p-5 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-row items-center justify-between gap-4 ${
                  activeProductTab === 1
                    ? "bg-white dark:bg-slate-800/90 border-blue-500/50 dark:border-blue-400/50 shadow-lg shadow-blue-500/10"
                    : "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      02
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                      ReviewsIntel
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Evidence for agentic commerce
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                      activeProductTab === 1
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    {activeProductTab === 1 ? "LIVE FLOW" : "VIEW DEMO"}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      activeProductTab === 1
                        ? "bg-blue-600 text-white rotate-45"
                        : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-white/20"
                    }`}
                  >
                    ↘
                  </div>
                </div>
                {activeProductTab === 1 && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"
                  />
                )}
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <AnimatePresence mode="wait">
              {/* PRODUCT 01: RACCELERATOR (WITH AI SCANNING LASER BEAM) */}
              {activeProductTab === 0 && (
                <motion.div
                  key="product-raccelerator"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
                >
                  {/* LEFT COLUMN: SPECS & COPY */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      {/* Main Product Headline */}
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
                        Regulatory complexity.
                        <br />
                        <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
                          Connected clarity.
                        </span>
                      </h3>

                      {/* Main Paragraph */}
                      <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8">
                        RAccelerator streamlines EU MDR and IVDR work for
                        medical-device and IVD manufacturers — device
                        classification and GSPR gap assessment today, with the
                        reasoning traceable to the rule and the evidence.
                      </p>

                      {/* Problem / What Changes / Proof Table (NO HR LINES) */}
                      <div className="space-y-6 mb-10">
                        {/* PROBLEM */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            PROBLEM
                          </span>
                          <p className="sm:col-span-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            A GSPR gap assessment means reading thousands of
                            pages of evidence against Annex I requirements, by
                            hand, under deadline.
                          </p>
                        </div>

                        {/* WHAT CHANGES */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            WHAT CHANGES
                          </span>
                          <p className="sm:col-span-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            Evidence is mapped to each requirement with the
                            reasoning shown, so the team reviews an argument
                            instead of building one.
                          </p>
                        </div>

                        {/* PROOF */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            PROOF
                          </span>
                          <p className="sm:col-span-8 text-sm font-mono font-medium text-slate-900 dark:text-white leading-relaxed">
                            First enterprise evaluation · global device
                            manufacturer · Sept 2026
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: DASHBOARD CARD */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-7 w-full"
                  >
                    <div className="rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-2xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300 group">
                      {/* Top Bar inside Card */}
                      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/10 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                            GSPR GAP ASSESSMENT
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                            ✦ AI SCAN ACTIVE
                          </span>
                        </div>
                      </div>

                      {/* Stat Tiles (3 Grid Boxes) */}
                      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                        {/* GSPR Gaps */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex flex-col relative overflow-hidden">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                            GSPR GAPS
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                              7
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              of 23
                            </span>
                          </div>
                        </div>

                        {/* Critical Gaps */}
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col relative overflow-hidden">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                            CRITICAL GAPS
                          </span>
                          <span className="text-2xl md:text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
                            2
                          </span>
                        </div>

                        {/* Evidence Docs */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex flex-col relative overflow-hidden">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                            EVIDENCE DOCS
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                              41
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              mapped
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Data Table */}
                      <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              <th className="pb-3 font-medium">REQUIREMENT</th>
                              <th className="pb-3 font-medium">STATUS</th>
                              <th className="pb-3 font-medium">EVIDENCE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs md:text-sm font-sans">
                            {/* Chapter 1 Header */}
                            <tr>
                              <td
                                colSpan={3}
                                className="pt-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/10 px-2 rounded"
                              >
                                CHAPTER I · GENERAL REQUIREMENTS
                              </td>
                            </tr>
                            <tr className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">
                                GSPR 1 · Performance and safety
                              </td>
                              <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />{" "}
                                Covered
                              </td>
                              <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">
                                CER-04 · RMF-02
                              </td>
                            </tr>
                            <tr className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">
                                GSPR 3 · Risk management system
                              </td>
                              <td className="py-3 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />{" "}
                                Gap
                              </td>
                              <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">
                                RMF-02 · partial
                              </td>
                            </tr>

                            {/* Chapter 2 Header */}
                            <tr>
                              <td
                                colSpan={3}
                                className="pt-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/10 px-2 rounded"
                              >
                                CHAPTER II · DESIGN AND MANUFACTURE
                              </td>
                            </tr>
                            <tr className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">
                                GSPR 10.4 · Substances (CMR / ED)
                              </td>
                              <td className="py-3 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse" />{" "}
                                Critical gap
                              </td>
                              <td className="py-3 font-mono text-slate-400 dark:text-slate-500 italic text-xs">
                                No evidence linked
                              </td>
                            </tr>
                            <tr className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">
                                GSPR 14 · Interaction with environment
                              </td>
                              <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />{" "}
                                Covered
                              </td>
                              <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">
                                TST-11 · TST-12
                              </td>
                            </tr>

                            {/* Chapter 3 Header */}
                            <tr>
                              <td
                                colSpan={3}
                                className="pt-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/10 px-2 rounded"
                              >
                                CHAPTER III · INFORMATION SUPPLIED
                              </td>
                            </tr>
                            <tr className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">
                                GSPR 23.4 · Instructions for use
                              </td>
                              <td className="py-3 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />{" "}
                                Gap
                              </td>
                              <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-xs">
                                IFU-01 · rev. pending
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Bar inside Card */}
                      <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                          Expert review remains central
                        </span>
                        <span>Rule + evidence traceability on every row</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* PRODUCT 02: REVIEWSINTEL (WITH LIVE TERMINAL AGENT TYPING SIMULATOR) */}
              {activeProductTab === 1 && (
                <motion.div
                  key="product-reviewsintel"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
                >
                  {/* LEFT COLUMN: SPECS & COPY */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      {/* Main Product Headline */}
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
                        Every decision
                        <br />
                        <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
                          deserves evidence.
                        </span>
                      </h3>

                      {/* Main Paragraph */}
                      <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8">
                        ReviewsIntel binds an autonomous agent’s purchase
                        decision to independent product-review evidence, so
                        agents buy on proof — with the rationale visible to the
                        person they act for.
                      </p>

                      {/* Problem / What Changes / Proof Table (NO HR LINES) */}
                      <div className="space-y-6 mb-10">
                        {/* PROBLEM */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            PROBLEM
                          </span>
                          <p className="sm:col-span-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            Shopping agents act on prompts and listings. The
                            evidence that a product actually performs sits in
                            reviews nobody has verified or connected.
                          </p>
                        </div>

                        {/* WHAT CHANGES */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            WHAT CHANGES
                          </span>
                          <p className="sm:col-span-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            A recommendation arrives with its evidence and
                            context attached, so a purchase can be authorized on
                            what the evidence supports.
                          </p>
                        </div>

                        {/* PROOF */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
                          <span className="sm:col-span-4 font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            PROOF
                          </span>
                          <p className="sm:col-span-8 text-sm font-mono font-medium text-slate-900 dark:text-white leading-relaxed">
                            US provisional filed June 2026 · built with an
                            AI-native SDLC
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: AI TERMINAL & DECISION MATRIX DASHBOARD CARD */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-7 w-full"
                  >
                    <div className="rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-2xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
                      {/* Top Bar inside Card */}
                      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/10 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                            THE DECISION LAYER
                          </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                          ✦ AGENT STREAM ACTIVE
                        </span>
                      </div>

                      {/* AI Agent Request Box (Terminal Style) */}
                      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            AGENT REQUEST TERMINAL
                          </span>
                          <span className="text-[10px] font-mono text-blue-500">
                            TOKENS: 412/s
                          </span>
                        </div>
                        <p className="font-mono text-sm text-slate-900 dark:text-slate-100 font-medium flex items-center">
                          <span>
                            Cordless drill for a home workshop · budget ≤ $180 ·
                            needed by Friday
                          </span>
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2 h-4 bg-blue-500 ml-1.5 rounded-xs"
                          />
                        </p>
                      </div>

                      {/* Review Evidence Box & Chips */}
                      <div className="mb-6">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3 font-semibold">
                          REVIEW EVIDENCE NODES
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 transition-all hover:scale-[1.02] shadow-sm">
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1">
                              <span>Battery life under load</span>
                            </h4>
                            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              412 reviews · 3 sources
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 transition-all hover:scale-[1.02] shadow-sm">
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1">
                              <span>Chuck durability</span>
                            </h4>
                            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              168 reviews · 2 sources
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 transition-all hover:scale-[1.02] shadow-sm">
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1">
                              <span>Warranty response</span>
                            </h4>
                            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              77 reviews · 1 source
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Decision Context Box */}
                      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2 font-semibold">
                          DECISION CONTEXT
                        </span>
                        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                          Weekend use, occasional masonry, price ceiling
                          honored. Two candidates meet the evidence bar; one
                          exceeds budget.
                        </p>
                      </div>

                      {/* Authorization Active Box */}
                      <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 relative overflow-hidden backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                          <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">
                            Authorized on evidence
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                          Rationale attached · reviewable by the buyer before
                          checkout
                        </p>
                      </div>

                      {/* Footer Bar inside Card */}
                      <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Connected rationale
                        </span>
                        <span>Not just another recommendation</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* PANEL 4.2: 03 / HOW WE MOVE FORWARD (STACKED SCROLL CARDS UI) */}
        <ForwardStackedCardsSection isDark={mounted && theme === "dark"} />

        {/* PANEL 4.3: SECURITY & TRUST (Bento Box Redesign) */}
        <section
          id="security"
          className="w-full py-12 md:py-16 px-6 md:px-12 relative bg-transparent overflow-hidden"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_60%)] pointer-events-none z-0" />

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 text-center flex flex-col items-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                05 / Security & Trust
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-3">
                Built for the strictest
                <br />
                <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
                  environments.
                </span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-sans font-light leading-relaxed text-sm max-w-2xl text-center">
                In fields like MedTech and Commerce, trust isn't a feature—it's
                the entire product. Craton's infrastructure respects data
                residency and strict access controls.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Main Feature: Auditable Reasoning with Biometric Fingerprint Interaction */}
              <InteractiveAuditableCard isDark={mounted && theme === "dark"} />

              {/* Sub Feature 1: SOC 2 Type II with Lock/Unlock Hover Interaction */}
              <InteractiveSoc2Card isDark={mounted && theme === "dark"} />

              {/* Sub Feature 2: Encryption with Server LED Hover Interaction */}
              <InteractiveAesCard isDark={mounted && theme === "dark"} />
            </motion.div>
          </div>
        </section>

        {/* PANEL 4.8: TESTIMONIALS / SOCIAL PROOF */}
        <section
          id="proof"
          className="w-full py-12 md:py-16 px-6 md:px-12 relative bg-transparent overflow-hidden"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,var(--color-copper)_0%,transparent_60%)] opacity-5 pointer-events-none z-0" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-end mb-10">
              <div className="max-w-2xl">
                <motion.p
                  variants={fadeInUp}
                  className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2"
                >
                  06 / Enterprise Proof
                </motion.p>
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
                >
                  Proof in
                  <br />
                  <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
                    production.
                  </span>
                </motion.h2>
              </div>
              <motion.p
                variants={fadeInUp}
                className="hidden md:block text-slate-600 dark:text-slate-400 font-sans text-sm max-w-sm text-right leading-relaxed"
              >
                Evaluating highly regulated, complex workflows with the world's
                most critical enterprises.
              </motion.p>
            </div>

            {/* Expandable Testimonials Accordion */}
            <ExpandingTestimonialsAccordion
              isDark={mounted && theme === "dark"}
            />
          </motion.div>
        </section>

        {/* PANEL 5: COMPANY BENTO GRID */}
        <UniqueCompanyBentoSection isDark={mounted && theme === "dark"} />

        {/* PANEL 6: CONTACT */}
        <InteractiveContactSection isDark={mounted && theme === "dark"} />

        {/* FOOTER */}
        <footer className="w-full py-16 px-6 md:px-16 border-t border-slate-200 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#070B14] text-slate-700 dark:text-slate-300 relative z-10 font-sans text-xs">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            {/* Top Row: Logo + Paragraph on Left, Navigation Links on Right */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {/* Left: Logo & Company Description */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 max-w-3xl">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                    craton
                  </span>
                  <span className="text-[9px] font-mono leading-tight uppercase tracking-widest text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-white/20 pl-2.5 py-0.5">
                    TECHNO-
                    <br />
                    LOGIES
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-sans text-xs leading-relaxed">
                  Craton Technologies is an innovation-driven product company
                  based in Frisco, Texas. It invents, protects, and ships
                  AI-enabled products for regulated and evidence-heavy
                  industries — beginning with RAccelerator, a regulatory-affairs
                  platform for medical device and IVD manufacturers navigating
                  EU MDR and IVDR — and applies the same method across agentic
                  commerce and new domains.
                </p>
              </div>

              {/* Right: Section Quick Links */}
              <div className="flex flex-wrap items-center gap-6 md:gap-8 font-sans font-medium text-slate-700 dark:text-slate-300 text-sm">
                <a
                  href="#about"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Company
                </a>
                <a
                  href="#raccelerator"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  RAccelerator
                </a>
                <a
                  href="#reviewsintel"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  ReviewsIntel
                </a>
                <a
                  href="#contact"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Bottom Line: Copyright, Legal Links, and Back to top Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {/* Left: Copyright */}
              <p>© 2026 Craton Technologies LLC. All rights reserved.</p>

              {/* Center: Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                <a
                  href="https://onedrive.live.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="https://onedrive.live.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Terms
                </a>
                <a
                  href="https://onedrive.live.com/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Accessibility
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.documentElement;
                    el.style.scrollBehavior = "smooth";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Reduce motion
                </button>
              </div>
            </div>
          </div>
        </footer>
        <ScrollToTopButton />
      </div>
    </main>
  );
}
