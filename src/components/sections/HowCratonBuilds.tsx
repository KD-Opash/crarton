"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Search, Shield, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  {
    id: "01",
    title: "Question deeply.",
    desc: "We don't start with models; we start with problems. We seek to understand the domain, the people, and the critical decisions before writing a single line of code or defining any architecture.",
    icon: Search
  },
  {
    id: "02",
    title: "Protect the idea.",
    desc: "Novel approaches to intractable problems are filed first. We believe in securing IP early, giving large enterprises the confidence to trust a young company with their most critical workflows.",
    icon: Shield
  },
  {
    id: "03",
    title: "Bring in the domain’s best.",
    desc: "Technology cannot replace genuine domain expertise. Product leaders with decades in the field lead the charge, ensuring we build for the reality of the work, not a stylized abstraction of it.",
    icon: Users
  },
  {
    id: "04",
    title: "Ship. Refine. Repeat.",
    desc: "We deploy, evaluate, and refine relentlessly, keeping human judgment in the loop at every stage. Once a method proves itself in production, we abstract the architecture and apply it to the next domain.",
    icon: RefreshCw
  }
];

export function HowCratonBuilds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track scroll progress through the massive 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress (0 to 1) into 4 distinct active states
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let index = 0;
    if (latest >= 0.75) index = 3;
    else if (latest >= 0.5) index = 2;
    else if (latest >= 0.25) index = 1;
    
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  });

  const ActiveIcon = PRINCIPLES[activeIndex].icon;

  return (
    <section id="how-we-build" className="bg-paper text-ink relative" ref={containerRef}>
      
      {/* 
        DESKTOP: Scroll-Driven Sticky Layout 
        The container is 400vh tall, giving 100vh of scrolling per principle.
      */}
      <div className="hidden md:block h-[400vh] relative">
        <div className="sticky top-0 h-screen flex flex-col justify-center px-[var(--pad)] py-[80px]">
          
          <div className="mb-12">
            <p className="eyebrow text-sage-deep mb-3">
              <span className="opacity-70 mr-3">06 /</span> Our Approach
            </p>
            <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.04em]">
              How Craton <span className="font-serif italic text-sage-deep">builds.</span>
            </h2>
          </div>

          <div className="flex gap-[60px] h-[400px]">
            
            {/* Left Column: Progress Sidebar */}
            <div className="w-1/3 flex flex-col justify-between py-4 border-l border-[var(--line-dark)] relative">
              
              {/* Animated Progress Line */}
              <motion.div 
                className="absolute top-0 bottom-0 left-[-1px] w-[2px] bg-copper transform-origin-top"
                style={{ scaleY: scrollYProgress }}
              />

              {PRINCIPLES.map((principle, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                return (
                  <div 
                    key={principle.id}
                    className={cn(
                      "pl-8 transition-all duration-500",
                      isActive ? "opacity-100 translate-x-2" : isPast ? "opacity-40 translate-x-0" : "opacity-20 translate-x-0"
                    )}
                  >
                    <span className="font-mono text-[11px] tracking-[0.14em] uppercase block mb-1">
                      {principle.id}
                    </span>
                    <span className={cn(
                      "text-[18px] tracking-[-0.01em]",
                      isActive ? "text-sage-deep font-medium" : "text-ink"
                    )}>
                      {principle.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Stage Content (Crossfading) */}
            <div className="w-2/3 relative h-full bg-paper border border-[var(--line-dark)] rounded-2xl p-12 overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col h-full justify-between relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-[var(--line-dark)] flex items-center justify-center shadow-sm">
                    <ActiveIcon className="w-6 h-6 text-sage-deep" strokeWidth={1.5} />
                  </div>
                  
                  <div>
                    <span className="font-mono text-[14px] text-copper tracking-[0.1em] mb-4 block">
                      PRINCIPLE {PRINCIPLES[activeIndex].id}
                    </span>
                    <h3 className="text-[clamp(32px,3vw,48px)] leading-[1.05] tracking-[-0.03em] text-ink mb-6 max-w-[15ch]">
                      {PRINCIPLES[activeIndex].title}
                    </h3>
                    <p className="text-[16px] text-[#4a4f45] leading-[1.7] max-w-[500px]">
                      {PRINCIPLES[activeIndex].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative Abstract Background Shape */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`bg-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 0.05, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
                  transition={{ duration: 1 }}
                  className="absolute right-[-10%] bottom-[-20%] w-[400px] h-[400px] pointer-events-none z-0 text-sage-deep"
                >
                  <ActiveIcon className="w-full h-full" strokeWidth={0.5} />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* 
        MOBILE: Vertical Timeline
        Normal document flow, stacking items vertically.
      */}
      <div className="md:hidden px-[var(--pad)] py-[100px] flex flex-col gap-[80px]">
        <Reveal>
          <p className="eyebrow text-sage-deep mb-3">
            <span className="opacity-70 mr-3">06 /</span> Our Approach
          </p>
          <h2 className="text-[38px] font-normal leading-[1.05] tracking-[-0.04em]">
            How Craton <span className="font-serif italic text-sage-deep">builds.</span>
          </h2>
        </Reveal>

        <div className="relative flex flex-col gap-[60px]">
          {/* Vertical Connecting Line */}
          <div className="absolute top-8 bottom-0 left-[24px] w-[1px] bg-[var(--line-dark)] z-0" />
          
          {PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Reveal key={principle.id} delay={index * 0.1}>
                <div className="relative flex flex-col gap-6 z-10 pl-[80px]">
                  
                  {/* Node Icon */}
                  <div className="absolute left-[0px] top-0 w-[48px] h-[48px] bg-white border border-[var(--line-dark)] rounded-full flex items-center justify-center shadow-sm z-10">
                    <Icon className="w-5 h-5 text-sage-deep" strokeWidth={1.5} />
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-copper uppercase">
                      Principle {principle.id}
                    </span>
                    <h3 className="text-[26px] font-medium tracking-[-0.03em] leading-[1.1]">
                      {principle.title}
                    </h3>
                    <p className="text-[15px] text-[#4a4f45] leading-[1.6]">
                      {principle.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

    </section>
  );
}
