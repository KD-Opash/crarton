"use client";

import { useScroll } from "@react-three/drei";
import { useState } from "react";

export function HtmlContent() {
  const [problem, setProblem] = useState<string | null>(null);

  // HtmlContent spans the entire scroll container (10 pages)
  // Each page is 100vh.
  return (
    <div className="w-full text-cream pointer-events-none">
      
      {/* 1. HERO (Page 0 - 1) */}
      <section id="discover" className="h-[100vh] flex flex-col justify-center items-center text-center px-6 pointer-events-auto">
        <h1 className="text-[clamp(3rem,8vw,7rem)] font-display leading-[0.9] tracking-tighter mix-blend-difference mb-6">
          FROM COMPLEXITY<br />
          <span className="italic text-sage">TO CONFIDENCE.</span>
        </h1>
        <p className="text-xl text-muted-dark max-w-2xl font-light mb-12 mix-blend-difference">
          Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work.
        </p>
        <div className="flex gap-6">
          <a href="#enter" className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors tracking-widest text-xs font-mono uppercase">
            Explore Craton
          </a>
        </div>
      </section>

      {/* 2. ENTER CRATON (Page 1 - 2) */}
      <section id="enter" className="h-[100vh] flex flex-col justify-center items-start px-12 md:px-32 pointer-events-auto">
        <p className="font-mono text-sage text-sm tracking-widest mb-6">01 / DISCOVER</p>
        <h2 className="text-4xl md:text-6xl font-display mb-12 max-w-2xl leading-tight">
          WHAT ARE YOU TRYING TO SOLVE?
        </h2>
        <div className="flex flex-col gap-4">
          {['REGULATORY COMPLEXITY', 'EVIDENCE COMPLEXITY', 'PRODUCT COMPLEXITY'].map((opt) => (
            <button 
              key={opt}
              onClick={() => setProblem(opt)}
              className="text-left text-2xl md:text-4xl font-light text-muted-dark hover:text-copper transition-colors tracking-tight w-max group outline-none"
            >
              <span className="inline-block w-8 opacity-0 group-hover:opacity-100 transition-opacity text-copper">&rarr;</span>
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PRODUCTS - RAccelerator (Page 2 - 3) */}
      <section id="products" className="h-[100vh] flex flex-col justify-center items-end px-12 md:px-32 text-right pointer-events-none">
        <div className="max-w-xl">
          <p className="font-mono text-copper text-sm tracking-widest mb-6 uppercase">02 / Products &mdash; RAccelerator</p>
          <h2 className="text-5xl font-display mb-6">Trace every requirement.</h2>
          <p className="text-xl text-muted-dark mb-12">
            A 3D regulatory map connecting complex requirements directly to verifiable evidence. 
            When the relationship is incomplete, the gap is exposed.
          </p>
          <div className="text-xs font-mono text-sage/80 uppercase tracking-widest border border-sage/20 px-4 py-2 rounded inline-block">
            Target Sept 2026 &middot; Conceptual
          </div>
        </div>
      </section>

      {/* 4. PRODUCTS - ReviewsIntel (Page 3 - 4) */}
      <section className="h-[100vh] flex flex-col justify-center items-start px-12 md:px-32 pointer-events-none">
        <div className="max-w-xl">
          <p className="font-mono text-copper text-sm tracking-widest mb-6 uppercase">02 / Products &mdash; ReviewsIntel</p>
          <h2 className="text-5xl font-display mb-6">Watch the decision form.</h2>
          <p className="text-xl text-muted-dark mb-12">
            An interactive decision environment. Evidence nodes connect to candidate products. 
            The system evaluates context, forming a conclusion authorized on evidence.
          </p>
          <div className="text-xs font-mono text-copper/80 uppercase tracking-widest border border-copper/20 px-4 py-2 rounded inline-block">
            Patent Pending &middot; Conceptual
          </div>
        </div>
      </section>

      {/* 5. FOLLOW THE SIGNAL (Page 4 - 5) */}
      <section id="evidence" className="h-[100vh] flex flex-col justify-center items-center text-center px-6 pointer-events-none">
        <p className="font-mono text-white text-xs tracking-[0.3em] uppercase opacity-50 mix-blend-difference">
          Source &rarr; Evidence &rarr; Relationship &rarr; Reasoning &rarr; Decision
        </p>
      </section>

      {/* 6. CRATON CORE (Page 5 - 6) */}
      <section className="h-[100vh] flex flex-col justify-start items-center pt-32 px-6 pointer-events-none">
        <p className="font-mono text-sage text-sm tracking-widest mb-6 uppercase">03 / The Core</p>
        <h2 className="text-4xl font-display">A Stable Foundation</h2>
        <p className="text-muted text-center max-w-md mt-4">
          Like the stable ancient core of a continent. Products emerge from the core, but the core remains stable.
        </p>
      </section>

      {/* 7. METHOD (Page 6 - 7) */}
      <section id="method" className="h-[100vh] flex flex-col justify-center items-start px-12 md:px-32 pointer-events-auto">
        <p className="font-mono text-copper text-sm tracking-widest mb-6 uppercase">04 / Method</p>
        <h2 className="text-5xl font-display mb-16">ONE METHOD.<br/><span className="text-muted-dark italic">MANY DOMAINS.</span></h2>
        
        <div className="space-y-12 max-w-xl relative">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
          
          <div className="relative pl-12">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-ink border-2 border-sage flex items-center justify-center"><div className="w-2 h-2 bg-sage rounded-full"/></div>
            <h3 className="text-2xl font-medium mb-2">Question deeply.</h3>
            <p className="text-muted-dark">Understand the domain, the people, and the critical decisions before defining any solution.</p>
          </div>
          <div className="relative pl-12">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-ink border-2 border-white/20" />
            <h3 className="text-2xl font-medium mb-2">Protect the idea.</h3>
            <p className="text-muted-dark">Novel approaches are filed first, securing IP early.</p>
          </div>
          <div className="relative pl-12">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-ink border-2 border-white/20" />
            <h3 className="text-2xl font-medium mb-2">Bring in the domain&apos;s best.</h3>
            <p className="text-muted-dark">Product leaders with decades in the field lead the charge.</p>
          </div>
          <div className="relative pl-12">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-ink border-2 border-copper" />
            <h3 className="text-2xl font-medium mb-2">Ship. Refine. Repeat.</h3>
            <p className="text-muted-dark">Deploy, evaluate, and abstract the architecture for the next domain.</p>
          </div>
        </div>
      </section>

      {/* 8. PROOF & COMPANY (Page 7 - 8) */}
      <section id="company" className="h-[100vh] flex flex-col justify-center px-12 md:px-32 pointer-events-auto">
        <p className="font-mono text-sage text-sm tracking-widest mb-6 uppercase">05 / Company & Proof</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div><h4 className="text-5xl font-display mb-2">22+</h4><p className="text-xs font-mono text-muted uppercase">Years Shipping</p></div>
          <div><h4 className="text-5xl font-display mb-2 text-sage">3</h4><p className="text-xs font-mono text-muted uppercase">Granted Patents</p></div>
          <div><h4 className="text-5xl font-display mb-2 text-copper">9</h4><p className="text-xs font-mono text-muted uppercase">Pending Patents</p></div>
          <div><h4 className="text-3xl font-display mb-2">TEXAS</h4><p className="text-xs font-mono text-muted uppercase">HQ</p></div>
        </div>

        <div className="max-w-2xl">
          <h3 className="text-3xl font-display mb-4 italic">&quot;The model is not the product. The truth, backed by a visible chain of evidence, is the product.&quot;</h3>
          <p className="text-sm font-mono tracking-widest text-copper mb-1">SHEIK AHAMED ALI</p>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">Founder & CEO</p>
        </div>
      </section>

      {/* 9. CONTACT (Page 8 - 9) */}
      <section id="contact" className="h-[100vh] flex flex-col justify-center items-center text-center px-6 pointer-events-auto">
        <h2 className="text-4xl md:text-6xl font-display mb-12">CHOOSE YOUR ENTRY POINT.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
          {[
            { label: "START A PILOT", link: "mailto:contact@craton.com?subject=Pilot" },
            { label: "PARTNER WITH CRATON", link: "mailto:contact@craton.com?subject=Partner" },
            { label: "LEAD A PRODUCT", link: "mailto:contact@craton.com?subject=Lead" },
            { label: "JOIN CRATON", link: "mailto:contact@craton.com?subject=Join" }
          ].map((item) => (
            <a 
              key={item.label}
              href={item.link}
              className="py-6 border border-white/10 bg-ink-2 hover:bg-white/5 hover:border-white/20 transition-all font-mono text-sm tracking-widest rounded-xl"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA (Page 9 - 10) */}
      <section className="h-[100vh] flex flex-col justify-center items-center text-center px-6 pointer-events-auto">
        <div className="font-mono text-xs tracking-[0.2em] text-muted-dark space-y-4 mb-16">
          <p>QUESTION</p>
          <p className="text-sage">*</p>
          <p>EVIDENCE</p>
          <p className="text-sage">*</p>
          <p>INTELLIGENCE</p>
          <p className="text-copper">=</p>
          <p className="text-white">CONFIDENCE</p>
        </div>
        <h2 className="text-4xl md:text-6xl font-display mb-8">WHAT SHOULD WE SOLVE TOGETHER?</h2>
        <a href="#contact" className="px-12 py-4 bg-cream text-ink font-mono text-sm tracking-widest rounded-full hover:bg-white transition-colors">
          START A CONVERSATION
        </a>
      </section>
      
    </div>
  );
}
