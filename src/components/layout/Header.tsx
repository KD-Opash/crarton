"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Command, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { num: "01", label: "DISCOVER", href: "#discover" },
  { num: "02", label: "PRODUCTS", href: "#products" },
  { num: "03", label: "EVIDENCE", href: "#evidence" },
  { num: "04", label: "METHOD", href: "#method" },
  { num: "05", label: "COMPANY", href: "#company" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-ink-2/80 backdrop-blur-xl border border-cream/10 rounded-full px-4 py-2 shadow-2xl">
          
          {/* Brand */}
          <Link href="#hero" className="flex items-center gap-2 group mr-2 outline-none">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="/bg-r-logo.png" alt="Craton Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-medium text-cream tracking-wider text-sm hidden md:block">CRATON</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1 border-l border-cream/10 pl-4">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-cream/5 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-sage"
              >
                <span className="font-mono text-[11px] text-muted-dark group-hover:text-sage transition-colors">{link.num}</span>
                <span className="font-mono text-xs text-muted group-hover:text-cream transition-colors tracking-widest">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Contact / Menu */}
          <div className="flex items-center gap-2 border-l border-ink/10 dark:border-cream/10 pl-4">
            <ThemeToggle />
            <Link 
              href="#contact" 
              className="hidden md:flex px-4 py-1.5 bg-cream text-ink font-mono text-xs tracking-widest rounded-full hover:opacity-80 transition-opacity"
            >
              CONTACT
            </Link>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-8 h-8 rounded-full bg-cream/5 flex items-center justify-center text-cream hover:bg-cream/10 transition-colors"
            >
              <Command className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Cinematic Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink flex flex-col justify-center px-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent)] pointer-events-none" />
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full border border-cream/10 flex items-center justify-center text-cream"
            >
              <X className="w-5 h-5" />
            </button>

            <nav className="flex flex-col gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div 
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-4"
                  >
                    <span className="font-mono text-sm text-sage">{link.num}</span>
                    <span className="font-display text-4xl sm:text-6xl text-muted-dark group-hover:text-cream transition-colors tracking-tight">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.1, duration: 0.5 }}
                className="pt-8 border-t border-cream/10 mt-8"
              >
                <Link 
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-sm text-copper hover:text-cream transition-colors tracking-widest"
                >
                  START A CONVERSATION &rarr;
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
