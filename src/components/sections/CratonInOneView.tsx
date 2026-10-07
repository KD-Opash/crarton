"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    id: "01",
    phase: "HARD PROBLEM",
    title: "Trust is the product.",
    description: "We start where trust is the hard part—regulated, evidence-heavy work that demands absolute precision.",
  },
  {
    id: "02",
    phase: "RESEARCH",
    title: "Question deeply.",
    description: "Understand the domain, the people, and the critical decisions before defining any solution.",
  },
  {
    id: "03",
    phase: "INVENTION",
    title: "A novel approach.",
    description: "Design an intelligent architecture that connects complex requirements directly to verifiable evidence.",
  },
  {
    id: "04",
    phase: "IP PROTECTION",
    title: "Protect before you build.",
    description: "Novel ideas are filed first, giving enterprises the confidence to trust a young company with critical work.",
  },
  {
    id: "05",
    phase: "DOMAIN EXPERTISE",
    title: "Experts own what they build.",
    description: "Product leaders with decades in the field lead the charge with genuine product-level ownership.",
  },
  {
    id: "06",
    phase: "AI ENGINEERING",
    title: "Intelligence applied.",
    description: "We engineer purpose-built AI that shows its reasoning, avoiding technology for its own sake.",
  },
  {
    id: "07",
    phase: "PRODUCT",
    title: "Ship. Refine. Repeat.",
    description: "Develop, evaluate, and refine with human judgment in the loop, then apply the method to the next domain.",
  }
];

export function CratonInOneView() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map scroll progress to horizontal translation.
  // The distance needed depends on the number of cards. 
  // -85% ensures we scroll through all cards while keeping the last one visible.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

  return (
    <section id="craton-in-one-view" className="bg-paper text-ink relative" ref={targetRef}>
      
      {/* 
        DESKTOP: Immersive Horizontal Scroll
        We make the section very tall (400vh) to give the user enough scroll distance.
        The sticky container holds the horizontal track.
      */}
      <div className="hidden md:block h-[400vh] relative">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden px-[var(--pad)] py-[100px]">
          
          <div className="mb-12 flex items-center justify-between max-w-[400px]">
            <div>
              <p className="eyebrow text-sage-deep mb-3">
                <span className="opacity-70 mr-3">01 /</span> The Craton Model
              </p>
              <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.04em]">
                From possibility to <span className="font-serif italic text-sage-deep">purpose.</span>
              </h2>
            </div>
          </div>

          <motion.div style={{ x }} className="flex gap-[80px] w-max">
            {STEPS.map((step, index) => (
              <div key={step.id} className="relative w-[340px] flex flex-col gap-6 shrink-0 group">
                
                {/* Connecting Line */}
                {index !== STEPS.length - 1 && (
                  <div className="absolute top-[16px] left-[40px] right-[-80px] h-[1px] bg-[var(--line-dark)] z-0" />
                )}
                
                {/* Node */}
                <div className="w-[32px] h-[32px] rounded-full bg-paper border border-[var(--line-dark)] z-10 flex items-center justify-center text-[10px] font-mono text-sage-deep group-hover:bg-sage-deep group-hover:text-paper transition-colors duration-300">
                  {step.id}
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-sage-deep uppercase flex items-center gap-3">
                    <span className="w-4 h-[1px] bg-current" />
                    {step.phase}
                  </span>
                  <h3 className="text-[22px] font-medium tracking-[-0.025em] leading-[1.15]">
                    {step.title}
                  </h3>
                  <p className="text-[14.5px] text-[#4a4f45] leading-[1.7]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 
        MOBILE: Vertical Timeline
        Normal document flow, stacking items vertically.
      */}
      <div className="md:hidden px-[var(--pad)] py-[100px] flex flex-col gap-[60px]">
        <Reveal>
          <p className="eyebrow text-sage-deep mb-3">
            <span className="opacity-70 mr-3">01 /</span> The Craton Model
          </p>
          <h2 className="text-[38px] font-normal leading-[1.05] tracking-[-0.04em]">
            From possibility to <br/><span className="font-serif italic text-sage-deep">purpose.</span>
          </h2>
        </Reveal>

        <div className="relative flex flex-col gap-[40px]">
          {/* Vertical Connecting Line */}
          <div className="absolute top-0 bottom-0 left-[15px] w-[1px] bg-[var(--line-dark)] z-0" />
          
          {STEPS.map((step, index) => (
            <Reveal key={step.id} delay={index * 0.1}>
              <div className="relative flex gap-6 z-10">
                <div className="w-[32px] h-[32px] shrink-0 rounded-full bg-paper border border-[var(--line-dark)] flex items-center justify-center text-[10px] font-mono text-sage-deep">
                  {step.id}
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-sage-deep uppercase">
                    {step.phase}
                  </span>
                  <h3 className="text-[21px] font-medium tracking-[-0.025em] leading-[1.15]">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[#4a4f45] leading-[1.7]">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

    </section>
  );
}
