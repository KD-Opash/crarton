"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function CountUp({ end, suffix = "", prefix = "", duration = 2 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        setCount(Math.floor(easeProgress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [end, duration, isInView]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export function Proof() {
  return (
    <section id="proof" className="bg-ink text-paper py-[120px] px-[var(--pad)] border-t border-[var(--line)]">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-[80px]">
          <div>
            <p className="eyebrow text-sage-deep mb-3">
              <span className="opacity-70 mr-3">07 /</span> The Evidence
            </p>
            <h2 className="text-[clamp(38px,4.6vw,76px)] font-normal leading-[1.02] tracking-[-0.045em] text-white">
              The <span className="font-serif italic text-[#e6e5d9]">record.</span>
            </h2>
          </div>
          <p className="text-[14.5px] text-[#bfc2b6] max-w-[40ch] leading-[1.7]">
            Trust requires proof. We are an independent, founder-funded technology company building from a foundation of deep domain expertise and protected intellectual property.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/5 border border-white/5">
        
        {/* Metric 1 */}
        <Reveal delay={0.1} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Engineering</span>
          <div>
            <div className="text-[64px] font-normal tracking-[-0.04em] leading-none text-white mb-4">
              <CountUp end={22} suffix="+" duration={2.5} />
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Years shipping enterprise systems</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">Decades of experience architecting highly reliable software before applying AI.</p>
          </div>
        </Reveal>

        {/* Metric 2 */}
        <Reveal delay={0.2} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Protection</span>
          <div>
            <div className="text-[64px] font-normal tracking-[-0.04em] leading-none text-copper mb-4">
              <CountUp end={3} duration={2} />
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Granted US Patents</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">Demonstrated history of novel invention and intellectual property protection.</p>
          </div>
        </Reveal>

        {/* Metric 3 */}
        <Reveal delay={0.3} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Pipeline</span>
          <div>
            <div className="text-[64px] font-normal tracking-[-0.04em] leading-none text-white mb-4">
              <CountUp end={9} duration={2.2} />
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Pending US Patents</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">A deep pipeline of novel, proprietary architectures currently under review.</p>
          </div>
        </Reveal>

        {/* Metric 4 */}
        <Reveal delay={0.4} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">RAccelerator</span>
          <div>
            <div className="text-[48px] font-normal tracking-[-0.04em] leading-none text-white mb-4">
              1<span className="text-[32px]">st</span>
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Enterprise Evaluation</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">Pilot engagement with a global medical device manufacturer, targeting Sept 2026.</p>
          </div>
        </Reveal>

        {/* Metric 5 */}
        <Reveal delay={0.5} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">ReviewsIntel</span>
          <div>
            <div className="text-[48px] font-normal tracking-[-0.04em] leading-none text-white mb-4">
              Prov.
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Patent Pending</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">US provisional patent filed June 2026 covering evidence-based authorization.</p>
          </div>
        </Reveal>

        {/* Metric 6 */}
        <Reveal delay={0.6} className="bg-ink p-8 md:p-12 flex flex-col justify-between h-[280px]">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Independence</span>
          <div>
            <div className="text-[48px] font-normal tracking-[-0.04em] leading-none text-sage mb-4">
              HQ
            </div>
            <h3 className="text-[15px] font-medium text-cream mb-2">Frisco, Texas</h3>
            <p className="text-[13px] text-[#8e9187] leading-[1.6]">Independently founder-funded. Built to solve problems, not to chase valuations.</p>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
