"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { buildShapes, buildWordmark, createParticleSprite, mulberry, ease, WM } from "@/lib/sculpture";

interface HeroCanvasProps {
  phase: number;
  isPaused: boolean;
  mousePos: { x: number; y: number };
}

export function HeroCanvas({ phase, isPaused, mousePos }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const prefersReducedMotion = useReducedMotion();
  const shouldPause = isPaused || prefersReducedMotion;
  
  const [isVisible, setIsVisible] = useState(true);

  // 1. Visibility handling
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.02 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Main rendering logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Mobile reduction
    const mobile = window.innerWidth <= 900;
    const N = mobile ? 1500 : 3400; // Particle count
    
    // Data setup
    const { shapes, jit, C } = buildShapes(N, 3);
    shapes.push(new Float32Array(N * 3)); // 5th shape (Wordmark)
    
    let wm = buildWordmark(N, C, 9, shapes[4]);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        wm = buildWordmark(N, C, 9, shapes[4]);
      }).catch(() => {});
    }

    const stag = new Float32Array(N);
    const R = mulberry(5);
    for (let i = 0; i < N; i++) stag[i] = R();

    const pos = new Float32Array(N * 3);
    const depth = new Float32Array(N);
    const order = new Int32Array(N);
    for (let i = 0; i < N; i++) order[i] = i;

    // Sprites
    const spPlat = createParticleSprite("214,216,204");
    const spPlatDim = createParticleSprite("120,124,110");
    const spCop = createParticleSprite("232,168,110");
    const spCopDim = createParticleSprite("150,98,60");
    const spGlow = createParticleSprite("255,226,180");

    let animationFrameId: number;
    let time = 0;
    let lastTime = performance.now();
    
    let W = 0, H = 0;
    const fil = [0, 0, 1, 1]; // Glow position & scale

    const P = 5, HOLD = 3.4, TRANS = 1.8, SEG = HOLD + TRANS, CYCLE = SEG * P;

    // Resize handling (optimized)
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const renderLoop = (now: number) => {
      if (!isVisible) {
        lastTime = now; // Prevent large time jump when returning
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      
      // If reduced motion is requested, snap to a stable completed frame
      if (shouldPause || prefersReducedMotion) {
        // We override time to match the exact end of the target phase
        time = ((phase + P - 1) % P) * SEG + HOLD + TRANS;
      } else {
        // If not paused, advance time or interpolate to target phase
        time += dt;
      }

      // Compute Phase Interpolation
      const cyc = ((time % CYCLE) + CYCLE) % CYCLE;
      const seg = Math.floor(cyc / SEG);
      const local = cyc - seg * SEG;
      const from = seg, to = (seg + 1) % P;
      const p = local < HOLD ? 0 : (local - HOLD) / TRANS;

      const A = shapes[from], B = shapes[to];
      const wOf = (n: number) => (from === n ? 1 - ease(p) : 0) + (to === n ? ease(p) : 0);
      
      const swarmW = wOf(0), bulbW = wOf(2), textW = wOf(4);
      let solid = Math.max(0, Math.min(1, (textW - 0.55) / 0.45));
      solid = solid * solid * (3 - 2 * solid);
      const textK = textW;
      
      let shine = Math.max(0, Math.min(1, (bulbW - 0.72) / 0.28));
      shine = shine * shine * (3 - 2 * shine) * (0.8 + 0.2 * Math.sin(time * 3.1) + 0.06 * Math.sin(time * 17));

      const baseRotY = -0.3 + 0.55 * Math.sin(time * 0.21);
      const ry = baseRotY * (1 - textW);
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const tilt = -0.16 * (1 - textW);
      const cx = Math.cos(tilt), sx = Math.sin(tilt);
      
      const D = 7.2, f = Math.min(W / 7.4, H / 4.1) * D;

      // Project Particles
      for (let i = 0; i < N; i++) {
        const k = i * 3;
        const e = ease((p - stag[i] * 0.45) / 0.55);
        const arc = Math.sin(e * Math.PI) * 0.5;
        
        let x = A[k] + (B[k] - A[k]) * e + Math.cos(jit[k]) * arc * 0.5;
        let y = A[k + 1] + (B[k + 1] - A[k + 1]) * e + Math.sin(jit[k + 1]) * arc * 0.35;
        let z = A[k + 2] + (B[k + 2] - A[k + 2]) * e + Math.sin(jit[k] + jit[k + 1]) * arc * 0.5;
        
        if (swarmW > 0) {
          const a = jit[k + 2] * swarmW * 0.28;
          x += Math.sin(time * jit[k + 2] * 1.7 + jit[k]) * a;
          y += Math.cos(time * jit[k + 2] * 1.3 + jit[k + 1]) * a;
          z += Math.sin(time * jit[k + 2] * 1.1 + jit[k] * 2) * a;
        }

        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const s = f / (D - z2);
        
        pos[k] = W * 0.5 + x1 * s;
        pos[k + 1] = H * 0.5 - y2 * s + H * 0.02;
        pos[k + 2] = s;
        depth[i] = z2;
      }

      order.sort((a, b) => depth[a] - depth[b]);

      const fY = 0.26 * 1.15;
      const fy2 = fY * cx, fz2 = fY * sx;
      const fs = f / (D - fz2);
      fil[0] = W * 0.5;
      fil[1] = H * 0.5 - fy2 * fs + H * 0.02;
      fil[2] = fs;
      fil[3] = f / D;

      // Render Phase
      ctx.clearRect(0, 0, W, H);
      const baseSz = mobile ? 0.021 : 0.017;

      if (shine > 0.01) {
        const r = fil[2] * 1.3;
        const grad = ctx.createRadialGradient(fil[0], fil[1], 0, fil[0], fil[1], r);
        grad.addColorStop(0, `rgba(255,214,160,${0.5 * shine})`);
        grad.addColorStop(0.3, `rgba(226,160,104,${0.2 * shine})`);
        grad.addColorStop(1, 'rgba(2,132,199,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(fil[0] - r, fil[1] - r, r * 2, r * 2);
      }

      for (let n = 0; n < N; n++) {
        const i = order[n], k = i * 3;
        const d = (depth[i] + 2.2) / 4.4;
        const cop = i < C;
        let sz = Math.max(1.1, baseSz * pos[k + 2] * (0.7 + d * 0.6)) * (1 - 0.4 * textK);
        
        if (cop && shine > 0.01 && spGlow) {
          sz *= 1 + 0.8 * shine;
          ctx.globalAlpha = Math.min(1, 0.55 + d * 0.45 + shine * 0.5);
          ctx.drawImage(spGlow, pos[k] - sz * 1.8, pos[k + 1] - sz * 1.8, sz * 3.6, sz * 3.6);
          ctx.drawImage(spGlow, pos[k] - sz, pos[k + 1] - sz, sz * 2, sz * 2);
          continue;
        }

        ctx.globalAlpha = Math.min(1, 0.35 + d * 0.65 + (shine > 0.01 ? shine * 0.18 : textK * 0.45));
        const sprite = cop ? (d > 0.45 ? spCop : spCopDim) : (d > 0.45 ? spPlat : spPlatDim);
        if (sprite) {
          ctx.drawImage(sprite, pos[k] - sz, pos[k + 1] - sz, sz * 2, sz * 2);
        }
      }

      if (solid > 0.01 && wm.main && wm.sub) {
        const s = fil[3], kx = s * 5.4 / WM.w;
        const dw = WM.w * kx, dh = WM.h * kx;
        const dx = W * 0.5 - dw * 0.5, dy = H * 0.5 + H * 0.02 - 0.1 * s - (WM.h / 2) * kx;
        ctx.globalAlpha = solid * 0.96;
        ctx.drawImage(wm.main, dx, dy, dw, dh);
        ctx.drawImage(wm.sub, dx, dy, dw, dh);
      }
      ctx.globalAlpha = 1;

      // Always request frame to check for interactions, even if paused, because we still might need to react to mouse
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [shouldPause, isVisible, phase, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
