"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ProductDialog } from "@/components/ui/ProductDialog";

const PRODUCTS = [
  {
    id: "ra",
    name: "RAccelerator",
    domain: "MedTech regulatory affairs",
    status: "In development",
    headline: "Regulatory complexity. Connected clarity.",
    description: "RAccelerator streamlines EU MDR and IVDR work for medical-device and IVD manufacturers — device classification and GSPR gap assessment today, with the reasoning traceable to the rule and the evidence.",
    problem: "A GSPR gap assessment means reading thousands of pages of evidence against Annex I requirements, by hand, under deadline.",
    solution: "Evidence is mapped to each requirement with the reasoning shown, so the team reviews an argument instead of building one.",
    proof: "First enterprise evaluation · global device manufacturer · Sept 2026",
    cta: "Start a Pilot",
    visual: <RAcceleratorVisual />
  },
  {
    id: "ri",
    name: "ReviewsIntel",
    domain: "Evidence for agentic commerce",
    status: "Patent pending",
    headline: "Every decision deserves evidence.",
    description: "ReviewsIntel binds an autonomous agent’s purchase decision to independent product-review evidence, so agents buy on proof — with the rationale visible to the person they act for.",
    problem: "Shopping agents act on prompts and listings. The evidence that a product actually performs sits in reviews nobody has verified or connected.",
    solution: "A recommendation arrives with its evidence and context attached, so a purchase can be authorized on what the evidence supports.",
    proof: "US provisional filed June 2026 · built with an AI-native SDLC",
    cta: "Discuss ReviewsIntel",
    visual: <ReviewsIntelVisual />
  }
];

const RA_STEPS = [
  "Evidence",
  "Requirement",
  "Mapping",
  "Gap Assessment",
  "Critical Gap",
  "Expert Review"
];

function RAcceleratorVisual() {
  const [step, setStep] = useState(0);

  // Auto-advance workflow sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % RA_STEPS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-[#0B101A] to-[#05080F] rounded-[10px] border border-[var(--line)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] overflow-hidden relative">
      
      {/* Header & Disclaimers */}
      <div className="flex justify-between items-start text-[#8e9187] font-mono text-[9.5px] tracking-[0.14em] uppercase mb-4">
        <div className="flex flex-col gap-1">
          <b className="font-medium text-[#d5d7cc] flex items-center gap-2">
            <span className="w-[5px] h-[5px] rounded-full bg-copper" /> GSPR gap assessment
          </b>
          <span className="text-[8px] text-sage">Illustrative & Conceptual View</span>
        </div>
        <div className="text-right max-w-[150px] leading-tight text-[8px] opacity-70">
          Not a production screenshot.<br/>Does not guarantee compliance or regulatory approval.
        </div>
      </div>

      {/* Interactive Workflow Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--line)]">
        {RA_STEPS.map((s, i) => (
          <button 
            key={s} 
            onClick={() => setStep(i)}
            className={cn(
              "font-mono text-[9px] tracking-[0.1em] uppercase px-3 py-[6px] rounded-full whitespace-nowrap transition-colors",
              step === i ? "bg-copper/20 text-copper border border-copper/30" : "bg-white/5 text-[#8e9187] border border-transparent hover:text-[#d5d7cc]"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      
      {/* Summary Tiles */}
      <div className="grid grid-cols-3 gap-[10px] mb-4">
        <div className={cn("bg-white/5 border rounded-md p-3 transition-colors duration-500", (step === 3) ? "border-cream shadow-glow-sage" : "border-[var(--line)]")}>
          <span className={cn("block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 transition-colors", step === 3 ? "text-cream" : "text-[#8e9187]")}>GSPR gaps</span>
          <div className="font-mono font-medium text-[22px] tracking-[-0.02em] text-cream">7 <span className="text-[11px] text-[#8e9187] ml-1 font-sans">of 23</span></div>
        </div>
        <div className={cn("bg-white/5 border rounded-md p-3 transition-colors duration-500", (step === 4) ? "border-copper shadow-glow-copper" : "border-[var(--line)]")}>
          <span className={cn("block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 transition-colors", step === 4 ? "text-copper" : "text-[#8e9187]")}>Critical gaps</span>
          <div className="font-mono font-medium text-[22px] tracking-[-0.02em] text-copper">2</div>
        </div>
        <div className={cn("bg-white/5 border rounded-md p-3 transition-colors duration-500", (step === 0 || step === 2) ? "border-sage shadow-glow-sage" : "border-[var(--line)]")}>
          <span className={cn("block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 transition-colors", (step === 0 || step === 2) ? "text-sage" : "text-[#8e9187]")}>Evidence docs</span>
          <div className="font-mono font-medium text-[22px] tracking-[-0.02em] text-cream">41 <span className="text-[11px] text-[#8e9187] ml-1 font-sans">mapped</span></div>
        </div>
      </div>

      {/* Table Interface */}
      <div className="flex-1 flex flex-col gap-[2px]">
        <div className="bg-sage/5 px-2 py-3 font-mono text-[9.5px] tracking-[0.1em] uppercase text-sage border-b border-[var(--line)] flex justify-between">
          <span>Chapter I · General requirements</span>
        </div>
        
        {/* Row 1: Covered */}
        <div className={cn("flex items-start justify-between px-2 py-3 border-b transition-colors duration-500", (step === 1 || step === 2) ? "bg-white/5 border-white/20" : "border-white/5")}>
          <span className={cn("flex-1 text-[12px] transition-colors", step === 1 ? "text-cream" : "text-[#d5d7cc]")}>
            <strong className={cn("font-medium", (step === 1 || step === 2) ? "text-sage" : "text-cream")}>GSPR 1</strong> · Performance and safety
          </span>
          <span className={cn("w-24 flex items-center gap-2 text-[10px] font-mono", step === 2 ? "text-sage" : "text-muted")}>
            <CheckCircle2 className={cn("w-3 h-3", step === 2 ? "text-sage" : "text-muted")} /> 
            {step === 0 ? "CER-04 · RMF-02" : "Covered"}
          </span>
        </div>
        
        {/* Row 2: Critical Gap */}
        <div className={cn("flex items-start justify-between px-2 py-3 border-b transition-colors duration-500", (step === 4) ? "bg-copper/10 border-copper/30" : "border-white/5")}>
          <span className={cn("flex-1 text-[12px]", (step === 4) ? "text-cream" : "text-[#d5d7cc]")}>
            <strong className={cn("font-medium", step === 4 ? "text-copper" : "text-cream")}>GSPR 10.4</strong> · Substances (CMR / ED)
          </span>
          <span className={cn("w-24 flex items-center gap-2 text-[10px] font-mono", step === 4 ? "text-copper font-medium" : "text-copper")}>
            <AlertCircle className="w-3 h-3" /> 
            {step === 0 ? "No evidence" : "Critical gap"}
          </span>
        </div>
        
        {/* Row 3: Standard Gap */}
        <div className={cn("flex items-start justify-between px-2 py-3 border-b transition-colors duration-500", (step === 3) ? "bg-white/5 border-white/20" : "border-white/5")}>
          <span className="flex-1 text-[12px] text-[#d5d7cc]">
            <strong className="text-cream font-medium">GSPR 23.4</strong> · Instructions for use
          </span>
          <span className="w-24 flex items-center gap-2 text-[10px] font-mono text-[#a9ac9f]">
            <span className="w-[6px] h-[6px] rounded-full bg-sage" /> 
            Gap
          </span>
        </div>
      </div>

      {/* Expert Review Footer Overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--line)] bg-ink-3/90 backdrop-blur-md transition-all duration-500 flex items-center justify-between",
        step === 5 ? "translate-y-0 opacity-100" : "translate-y-[100%] opacity-0"
      )}>
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-cream uppercase">
          Human in the loop
        </span>
        <span className="text-[12.5px] text-[#a9ac9f]">
          Expert review remains central. Rule + evidence traceability on every row.
        </span>
      </div>
    </div>
  );
}

const RI_STEPS = [
  {
    id: "request",
    label: "Agent Request",
    desc: "The agent parses the buyer's constraints: Budget, timeline, and physical requirements."
  },
  {
    id: "evidence",
    label: "Review Evidence",
    desc: "Unverified reviews are aggregated into structured, verifiable product performance evidence."
  },
  {
    id: "context",
    label: "Decision Context",
    desc: "Evidence is strictly weighed against the original constraints to filter candidates."
  },
  {
    id: "authorization",
    label: "Authorization",
    desc: "The final recommendation is presented with an attached, reviewable rationale."
  }
];

function ReviewsIntelVisual() {
  const [step, setStep] = useState(0);

  // Auto-advance workflow sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % RI_STEPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-[#0B101A] to-[#05080F] rounded-[10px] border border-[var(--line)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] relative overflow-hidden">
      
      {/* Header & Disclaimers */}
      <div className="flex justify-between items-start text-[#8e9187] font-mono text-[9.5px] tracking-[0.14em] uppercase mb-4">
        <div className="flex flex-col gap-1">
          <b className="font-medium text-[#d5d7cc] flex items-center gap-2">
            <span className="w-[5px] h-[5px] rounded-full bg-copper" /> The decision layer
          </b>
          <span className="text-[8px] text-copper">Conceptual / Development-stage</span>
        </div>
        <div className="text-right max-w-[150px] leading-tight text-[8px] opacity-70">
          Not deployed capabilities.<br/>US provisional patent application filed.
        </div>
      </div>

      {/* Interactive Workflow Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--line)]">
        {RI_STEPS.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => setStep(i)}
            className={cn(
              "font-mono text-[9px] tracking-[0.1em] uppercase px-3 py-[6px] rounded-full whitespace-nowrap transition-colors",
              step === i ? "bg-copper/20 text-copper border border-copper/30" : "bg-white/5 text-[#8e9187] border border-transparent hover:text-[#d5d7cc]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Agent Request */}
        <div className={cn("py-3 border-t transition-colors duration-500 flex gap-4 rounded-md px-2", step === 0 ? "bg-white/5 border-white/20" : "border-[var(--line)] border-transparent")}>
          <span className={cn("w-[100px] font-mono text-[9.5px] tracking-[0.12em] uppercase pt-1 shrink-0 transition-colors", step === 0 ? "text-cream" : "text-[#8e9187]")}>Agent request</span>
          <span className={cn("text-[15px] tracking-[-0.01em] transition-colors", step === 0 ? "text-cream" : "text-[#a9ac9f]")}>Cordless drill for a home workshop · budget ≤ $180 · needed by Friday</span>
        </div>
        
        {/* Review Evidence */}
        <div className={cn("py-3 border-t transition-colors duration-500 flex gap-4 rounded-md px-2", step === 1 ? "bg-white/5 border-white/20" : "border-[var(--line)] border-transparent")}>
          <span className={cn("w-[100px] font-mono text-[9.5px] tracking-[0.12em] uppercase pt-1 shrink-0 transition-colors", step === 1 ? "text-cream" : "text-[#8e9187]")}>Review evidence</span>
          <div className="flex flex-wrap gap-2">
            <div className={cn("flex flex-col gap-1 p-2 border rounded-md min-w-[140px] transition-colors duration-500", step === 1 ? "border-sage shadow-glow-sage bg-sage/5" : "border-[var(--line)] bg-white/5")}>
              <b className={cn("font-medium text-[12px] transition-colors", step === 1 ? "text-sage" : "text-cream")}>Battery life under load</b>
              <small className="font-mono text-[9.5px] text-[#8e9187] tracking-[0.04em]">412 reviews · 3 sources</small>
            </div>
            <div className={cn("flex flex-col gap-1 p-2 border rounded-md min-w-[140px] transition-colors duration-500", step === 1 ? "border-sage shadow-glow-sage bg-sage/5" : "border-[var(--line)] bg-white/5")}>
              <b className={cn("font-medium text-[12px] transition-colors", step === 1 ? "text-sage" : "text-cream")}>Chuck durability</b>
              <small className="font-mono text-[9.5px] text-[#8e9187] tracking-[0.04em]">168 reviews · 2 sources</small>
            </div>
          </div>
        </div>

        {/* Decision Context */}
        <div className={cn("py-3 border-t transition-colors duration-500 flex gap-4 rounded-md px-2", step === 2 ? "bg-white/5 border-white/20" : "border-[var(--line)] border-transparent")}>
          <span className={cn("w-[100px] font-mono text-[9.5px] tracking-[0.12em] uppercase pt-1 shrink-0 transition-colors", step === 2 ? "text-cream" : "text-[#8e9187]")}>Decision context</span>
          <span className={cn("text-[13px] leading-[1.6] transition-colors", step === 2 ? "text-cream" : "text-[#a9ac9f]")}>Weekend use, occasional masonry, price ceiling honored. Two candidates meet the evidence bar; one exceeds budget.</span>
        </div>

        {/* Authorization */}
        <div className={cn("py-3 border-t mt-auto transition-colors duration-500 rounded-md px-2", step === 3 ? "border-copper/40" : "border-[var(--line)] border-transparent")}>
          <div className={cn("flex items-center gap-3 p-3 border rounded-md transition-colors duration-500", step === 3 ? "border-copper/40 bg-copper/10 shadow-glow-copper" : "border-transparent bg-transparent")}>
            <div className={cn("w-2 h-2 rounded-full shrink-0 transition-colors", step === 3 ? "bg-copper shadow-[0_0_8px_rgba(2,132,199,0.8)]" : "bg-[#8e9187]")} />
            <div className="flex flex-col">
              <b className={cn("font-medium text-[13px] transition-colors", step === 3 ? "text-cream" : "text-[#8e9187]")}>Authorized on evidence</b>
              <span className="text-[#a9ac9f] text-[12px]">Rationale attached · reviewable by the buyer before checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Explanation Footer Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--line)] bg-ink-3/90 backdrop-blur-md transition-all duration-500 flex flex-col gap-1 z-20">
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-copper uppercase">
          {RI_STEPS[step].label}
        </span>
        <span className="text-[12.5px] text-[#d5d7cc]">
          {RI_STEPS[step].desc}
        </span>
      </div>
    </div>
  );
}

export function ProductExperience() {
  const [activeId, setActiveId] = useState(PRODUCTS[0].id);
  const [dialogProductId, setDialogProductId] = useState<string | null>(null);
  const activeProduct = PRODUCTS.find((p) => p.id === activeId) || PRODUCTS[0];

  const getVisual = (id: string) => {
    if (id === "ra") return <RAcceleratorVisual />;
    return <ReviewsIntelVisual />;
  };

  return (
    <section id="how-it-works" className="bg-ink py-[120px] px-[var(--pad)] border-t border-[var(--line)]">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-[60px]">
          <div>
            <p className="eyebrow text-[#9da197] mb-3">
              <span className="opacity-70 mr-3">03 /</span> Intelligence, applied
            </p>
            <h2 className="text-[clamp(40px,5vw,76px)] font-display font-medium leading-[1.0] tracking-[-0.01em] text-white">
              Complexity meets <span className="italic text-sage font-normal">clarity.</span>
            </h2>
          </div>
          <p className="text-[14.5px] text-[#bfc2b6] max-w-[36ch] leading-[1.7]">
            Two products, two domains, one conviction: deep problems deserve purpose-built intelligence with the reasoning shown.
          </p>
        </div>
      </Reveal>

      {/* Main Explorer Layout */}
      <div className="flex flex-col lg:flex-row gap-[60px] items-start">
        
        {/* Left Column: Navigation & Content */}
        <div className="w-full lg:w-5/12 flex flex-col">
          
          {/* Navigation Selector */}
          <Reveal delay={0.1}>
            <div className="flex w-full mb-[40px] border-b border-[var(--line)] relative">
              {PRODUCTS.map((product) => {
                const isActive = activeId === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setActiveId(product.id)}
                    className={cn(
                      "flex-1 pb-4 text-left transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-copper rounded-sm",
                      isActive ? "text-cream" : "text-[#a7aa9e] hover:text-[#d5d7cc]"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-[19px] font-normal mb-1">{product.name}</span>
                      <span className="text-[12px] text-[#8e9187] hidden sm:block">{product.domain}</span>
                    </div>
                    {/* Active Indicator Underline */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeProductUnderline"
                        className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-copper"
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Mobile Visual Injection (appears here only on mobile) */}
          <div className="lg:hidden w-full h-[400px] mb-[40px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-visual-${activeId}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                {getVisual(activeProduct.id)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content Area with Crossfade */}
          <div className="w-full relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${activeId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-[26px]">
                  <span className="text-[#9da197] font-mono text-[10.5px] uppercase tracking-[0.16em]">{activeProduct.domain}</span>
                  <span className="inline-flex items-center gap-2 px-3 py-[6px] border border-[var(--line)] rounded-full font-mono text-[9.5px] tracking-[0.12em] uppercase text-[#c5c8bc]">
                    <span className="w-[5px] h-[5px] rounded-full bg-copper" />
                    {activeProduct.status}
                  </span>
                </div>

                <h3 className="text-[clamp(32px,4vw,56px)] font-display font-medium leading-[1.05] tracking-[-0.01em] mb-[22px] text-white">
                  {activeProduct.headline.split('.')[0]}. <span className="italic text-sage font-normal">{activeProduct.headline.split('.')[1]}.</span>
                </h3>

                <p className="text-[14.5px] text-[#bfc2b6] leading-[1.7] mb-8">
                  {activeProduct.description}
                </p>

                <dl className="grid gap-[14px] border-t border-[var(--line)] pt-[26px] mb-[34px]">
                  <div className="grid grid-cols-[110px_1fr] gap-4">
                    <dt className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted pt-1">Problem</dt>
                    <dd className="text-[13.5px] text-[#c9ccc0] leading-[1.6]">{activeProduct.problem}</dd>
                  </div>
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-t border-white/5 pt-[14px]">
                    <dt className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted pt-1">What changes</dt>
                    <dd className="text-[13.5px] text-[#c9ccc0] leading-[1.6]">{activeProduct.solution}</dd>
                  </div>
                  <div className="grid grid-cols-[110px_1fr] gap-4 border-t border-white/5 pt-[14px]">
                    <dt className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted pt-1">Proof</dt>
                    <dd className="font-mono text-[11px] text-cream leading-[1.6]">{activeProduct.proof}</dd>
                  </div>
                </dl>

                <Button 
                  variant="outline" 
                  className="self-start group"
                  onClick={() => setDialogProductId(activeProduct.id)}
                >
                  Inside {activeProduct.name}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Visual Component (Desktop only) */}
        <div className="hidden lg:block lg:w-7/12 h-[600px] sticky top-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`visual-${activeId}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {getVisual(activeProduct.id)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Product Drawer */}
      <ProductDialog 
        productId={dialogProductId} 
        onClose={() => setDialogProductId(null)} 
      />
    </section>
  );
}
