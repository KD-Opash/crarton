"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";
import { Button } from "./Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductDialogProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductDialog({ productId, onClose }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const product = PRODUCTS_DATA.find((p) => p.id === productId);

  // Focus management, Focus Trap & Escape key
  useEffect(() => {
    if (productId) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden"; // Prevent background scroll
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        
        // Focus Trap
        if (e.key === "Tab") {
          if (!dialogRef.current) return;
          
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      
      // Auto-focus the close button when opened
      const closeButton = document.getElementById("dialog-close-button");
      if (closeButton) closeButton.focus();

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [productId, onClose]);

  // Click outside handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <div 
          className="fixed inset-0 z-50 flex justify-end"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <motion.div
            ref={dialogRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="relative w-full md:max-w-[560px] h-full bg-ink-2 border-l border-[var(--line)] shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Safe Area padding & Header */}
            <div className="flex justify-between items-center px-8 pt-[max(28px,env(safe-area-inset-top))] pb-6 shrink-0">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#9da197]">
                {product.name} · {product.status}
              </span>
              <button
                id="dialog-close-button"
                onClick={onClose}
                className="w-[40px] h-[40px] border border-[var(--line)] rounded-full flex items-center justify-center hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-cream" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-8 pb-10 flex flex-col gap-6 flex-1">
              <h3 id="dialog-title" className="text-[clamp(30px,3.2vw,40px)] font-normal leading-[1.05] tracking-[-0.04em] text-white text-balance">
                {product.dialogTitle.split(',')[0]}, <span className="font-serif italic text-[#e6e5d9]">{product.dialogTitle.split(',')[1]}</span>
              </h3>
              
              <p className="text-[14.5px] text-[#bfc2b6] leading-[1.7]">
                {product.dialogIntro}
              </p>

              <dl className="grid gap-0 border-t border-[var(--line)] mt-4">
                {product.dialogDetails.map((detail, index) => (
                  <div key={index} className="py-4 border-b border-[var(--line)]">
                    <dt className="font-medium text-[14.5px] text-cream mb-2">
                      {detail.term}
                    </dt>
                    <dd className="m-0 text-[13.5px] text-[#a9ac9f] leading-[1.6]">
                      {detail.desc}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Disclaimer */}
              <div className="mt-4 border-l-2 border-copper-deep pl-3">
                <p className="text-[11.5px] text-[#8e9187] leading-[1.6]">
                  {product.dialogDisclaimer}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-auto pt-8 flex items-center flex-wrap gap-5">
                <Button variant="primary" asChild>
                  <Link 
                    href={`#contact?intent=${encodeURIComponent(product.intent)}`}
                    onClick={onClose}
                  >
                    {product.cta}
                  </Link>
                </Button>
                <button 
                  onClick={onClose}
                  className="font-medium text-[12.5px] text-[#a9ac9f] hover:text-cream border-b border-transparent hover:border-[#a9ac9f]/30 transition-all pb-1"
                >
                  Back to the products
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
