"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Command, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { num: "01", label: "DISCOVER", href: "#discover" },
  { num: "02", label: "MINDSET", href: "#mindset" },
  { num: "03", label: "PRODUCTS", href: "#products" },
  { num: "04", label: "METHOD", href: "#method" },
  { num: "05", label: "SECURITY", href: "#security" },
  { num: "06", label: "PROOF", href: "#proof" },
  { num: "07", label: "COMPANY", href: "#company" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-auto max-w-[95vw]">
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-[#0B1120]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-full px-3 md:px-4 py-2 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 transition-colors">
          {/* Brand Logo */}
          <Link
            href="#discover"
            className="flex items-center gap-2 group mr-1 md:mr-2 outline-none"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/bg-r-logo.png"
                alt="Craton Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white tracking-wider text-xs md:text-sm hidden sm:block">
              CRATON
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-0.5 border-l border-slate-200 dark:border-white/10 pl-3 md:pl-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              >
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 font-medium transition-colors">
                  {link.num}
                </span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-semibold tracking-wider transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Controls & Contact CTA */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-2.5 md:pl-4">
            <ThemeToggle />
            <Link
              href="#contact"
              className="hidden sm:flex px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold tracking-widest rounded-full shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              CONTACT
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Command className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Cinematic Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-slate-950/95 dark:bg-[#070B14]/98 backdrop-blur-3xl flex flex-col justify-center px-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent)] pointer-events-none" />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <nav className="flex flex-col gap-6 max-w-xl mx-auto w-full">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-4"
                  >
                    <span className="font-mono text-sm text-cyan-400 font-semibold">
                      {link.num}
                    </span>
                    <span className="font-display text-3xl sm:text-5xl font-bold text-slate-300 group-hover:text-white transition-colors tracking-tight">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.08, duration: 0.4 }}
                className="pt-6 border-t border-white/10 mt-6"
              >
                <Link
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-sm font-semibold text-blue-400 hover:text-white transition-colors tracking-widest flex items-center gap-2"
                >
                  <span>START A CONVERSATION</span>
                  <span>&rarr;</span>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
