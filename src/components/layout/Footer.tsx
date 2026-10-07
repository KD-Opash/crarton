"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check system preference initially
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
        setReducedMotion(isReduced);
      }, 0);
    }
  }, []);

  const toggleReducedMotion = () => {
    const newState = !reducedMotion;
    setReducedMotion(newState);
    // In a full implementation, this would save to localStorage and apply a class to <html>
    // document.documentElement.classList.toggle("reduce-motion", newState);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="bg-ink text-[#a9ac9f] py-[60px] px-[var(--pad)] border-t border-white/10 text-[14px]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
        
        {/* Top Section: Links */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Brand & Mission */}
          <div className="max-w-[300px]">
            <Link href="/" className="font-serif italic text-white text-[24px] tracking-tight mb-4 block hover:text-copper transition-colors">
              Craton.
            </Link>
            <p className="leading-[1.6]">
              Applying intelligence to high-stakes problems with rigorous, evidence-based engineering.
            </p>
          </div>

          {/* Navigation Grids */}
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
            
            {/* Primary Nav */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-2">Navigation</span>
              <Link href="#products" className="hover:text-white transition-colors">Products</Link>
              <Link href="#how-we-build" className="hover:text-white transition-colors">Approach</Link>
              <Link href="#company" className="hover:text-white transition-colors">Company</Link>
              <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
            </div>

            {/* Legal Nav */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-2">Legal</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>

          </div>
        </div>

        {/* Bottom Section: Copyright & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5 text-[13px] text-muted">
          
          <div className="flex items-center gap-6">
            <span>&copy; 2026 Craton. All rights reserved.</span>
            
            <button 
              onClick={toggleReducedMotion}
              className="hidden sm:inline-flex items-center gap-2 hover:text-white transition-colors outline-none"
            >
              <span className="w-2 h-2 rounded-full border border-current flex items-center justify-center p-[1px]">
                {reducedMotion && <span className="w-full h-full bg-current rounded-full" />}
              </span>
              Reduce Motion
            </button>
          </div>

          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-white transition-colors outline-none group"
          >
            Back to Top
            <ArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
          </button>

        </div>
      </div>
    </footer>
  );
}
