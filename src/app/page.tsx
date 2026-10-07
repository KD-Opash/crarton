"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";
import { Header } from "@/components/layout/Header";
import { CratonWorld } from "@/components/canvas/CratonWorld";
import { RAcceleratorModel, ReviewsIntelModel } from "@/components/canvas/ProductModels";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Server, Fingerprint } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const { setProgress } = useStore();
  const { scrollYProgress } = useScroll();
  const rotateMockup = useTransform(scrollYProgress, [0.3, 0.6], [10, 0]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 600);
          return 100;
        }
        return prev + Math.floor(Math.random() * 4) + 1; // Smooth random increments
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoading) return; // Wait until loading finishes before attaching GSAP ScrollTriggers
    if (!horizontalRef.current || !scrollTrackRef.current) return;

    const panels = gsap.utils.toArray<HTMLElement>(".h-panel");
    
    // Smooth Horizontal Scroll Section (Intro Narrative)
    const scrollTween = gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: horizontalRef.current,
        pin: true,
        scrub: 1,
        end: () => "+=" + scrollTrackRef.current!.offsetWidth,
        onUpdate: (self) => {
          setProgress(self.progress);
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [setProgress, isLoading]);

  return (
    <main className={`bg-ink text-cream selection:bg-copper selection:text-ink relative overflow-hidden ${isLoading ? 'h-screen' : ''}`}>
      
      {/* PRELOADER SCREEN */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#03050a] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_50%)] blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="overflow-hidden mb-10">
                <motion.h1 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-5xl md:text-7xl font-display text-white tracking-tighter uppercase"
                >
                  Craton
                </motion.h1>
              </div>
              
              {/* Progress Bar */}
              <div className="w-64 md:w-80 h-[2px] bg-white/10 relative overflow-hidden mb-4 rounded-full">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-copper to-sage"
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              <div className="w-64 md:w-80 flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
                <span className="animate-pulse">Initializing Platform</span>
                <span>{loadingProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* FIXED 3D PARTICLE MORPHING ENGINE */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 20], fov: 35 }} dpr={[1, 2]}>
          <CratonWorld />
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050605_100%)] z-10 pointer-events-none opacity-90" />
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: THE NARRATIVE INTRO (HORIZONTAL SCROLL)             */}
      {/* ============================================================== */}
      <div ref={horizontalRef} className="h-screen w-full relative z-10 overflow-hidden bg-transparent">
        <div ref={scrollTrackRef} className="flex h-full w-[600vw]">
          
          {/* NARRATIVE 1: Scattered possibility */}
          <section className="h-panel w-screen h-full flex-shrink-0 flex items-center justify-center px-12 md:px-32 relative">
            <div className="max-w-4xl text-center">
              <p className="font-serif italic text-sage mb-6 text-xl">01 / 05</p>
              <h2 className="text-4xl md:text-5xl font-display mb-8 text-white tracking-tighter">Scattered<br/>possibility.</h2>
              <p className="text-lg text-white/50 font-sans font-light">
                A field of scattered points, representing raw, unorganized data in regulated work.
              </p>
            </div>
          </section>

          {/* NARRATIVE 2: Ideas (Sphere) */}
          <section className="h-panel w-screen h-full flex-shrink-0 flex items-center justify-center px-12 md:px-32 relative">
            <div className="max-w-4xl text-center">
              <p className="font-serif italic text-sage mb-6 text-xl">02 / 05</p>
              <h2 className="text-4xl md:text-5xl font-display mb-8 text-white tracking-tighter">Ideas gather.</h2>
              <p className="text-lg text-white/50 font-sans font-light">
                The points gather into a sphere. The data begins to take shape.
              </p>
            </div>
          </section>

          {/* NARRATIVE 3: Focus (Lightbulb) */}
          <section className="h-panel w-screen h-full flex-shrink-0 flex items-center justify-center px-12 md:px-32 relative">
            <div className="max-w-4xl text-center">
              <p className="font-serif italic text-copper mb-6 text-xl">03 / 05</p>
              <h2 className="text-4xl md:text-5xl font-display mb-8 text-white tracking-tighter">Focus & Innovation.</h2>
              <p className="text-lg text-white/50 font-sans font-light">
                Taking the shape of a light bulb whose filament lights up. True innovation requires rigorous design.
              </p>
            </div>
          </section>

          {/* NARRATIVE 4: Forward (Infinity) */}
          <section className="h-panel w-screen h-full flex-shrink-0 flex items-center justify-center px-12 md:px-32 relative">
            <div className="max-w-4xl text-center">
              <p className="font-serif italic text-copper mb-6 text-xl">04 / 05</p>
              <h2 className="text-4xl md:text-5xl font-display mb-8 text-white tracking-tighter">Moving Forward.</h2>
              <p className="text-lg text-white/50 font-sans font-light">
                Opening into an infinity loop. AI-enabled products for evidence-heavy work.
              </p>
            </div>
          </section>

          {/* NARRATIVE 5: Craton */}
          <section className="h-panel w-screen h-full flex-shrink-0 flex items-center justify-center px-12 md:px-32 relative">
            <div className="max-w-4xl text-center">
              <p className="font-serif italic text-sage mb-6 text-xl">05 / 05</p>
              <h2 className="text-6xl md:text-7xl font-display mb-8 text-white tracking-tighter uppercase">Craton</h2>
              <p className="text-lg text-white/50 font-sans font-light mb-12">
                From possibility to purpose. The foundation is built.
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] animate-pulse">
                Keep scrolling to explore the platform
              </p>
            </div>
          </section>
          
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: THE DEEP CONTENT (ANIMATED VERTICAL SCROLL)         */}
      {/* ============================================================== */}
      <div className="w-full relative z-10 flex flex-col bg-[#03050a] border-t border-white/10">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#0a1530] to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)] pointer-events-none z-0" />
        
        {/* PANEL 2: THE MINDSET */}
        <section id="discover" className="w-full min-h-screen py-32 flex flex-col justify-center px-12 md:px-32 relative bg-transparent overflow-hidden">
          {/* Animated floating spheres */}
          <motion.div animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-96 h-96 bg-copper rounded-full blur-[150px]" />
          <motion.div animate={{ y: [0, 40, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }} className="absolute bottom-20 -left-20 w-96 h-96 bg-sage rounded-full blur-[150px]" />
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="relative z-10">
            <motion.p variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper mb-8">01 // The Craton Mindset</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-display mb-12 max-w-5xl leading-[1.1] tracking-tighter text-white uppercase">
              The next breakthrough starts with a better question.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/60 max-w-3xl mb-16 font-sans font-light tracking-wide">
              What if complex information could become clearer decisions? We bring bold thinking, deep research, and thoughtful architecture together to build products for work where trust is the hard part.
            </motion.p>
            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl">
              <motion.div variants={fadeInUp} className="border-t border-white/20 pt-6">
                <h3 className="text-base font-display uppercase tracking-widest text-white mb-4">Trust is the product.</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">In regulated work, a recommendation is worth exactly as much as the evidence behind it. We build so the evidence is always in view.</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="border-t border-white/20 pt-6">
                <h3 className="text-base font-display uppercase tracking-widest text-white mb-4">Protect before you build.</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">Novel ideas are filed first, then engineered. That discipline is what lets an enterprise trust a young company with critical work.</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="border-t border-white/20 pt-6">
                <h3 className="text-base font-display uppercase tracking-widest text-white mb-4">Experts own what they build.</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">Every product is led by people who have done the work for decades, with product-level ownership — not consultants passing through.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* PANEL 3: PRODUCTS OVERVIEW (Tab Switcher) */}
        <section id="products" className="w-full py-32 px-12 md:px-32 relative bg-transparent overflow-hidden">
          {/* Main Background Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
          <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${activeProductTab === 0 ? 'bg-copper/10' : 'bg-sage/10'}`} />
          <div className={`absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${activeProductTab === 0 ? 'bg-copper/5' : 'bg-sage/5'}`} />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="relative z-10 text-center flex flex-col items-center mb-16">
            <motion.div variants={fadeInUp} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors duration-500 mb-8 ${activeProductTab === 0 ? 'bg-copper/5 border-copper/20' : 'bg-sage/5 border-sage/20'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${activeProductTab === 0 ? 'bg-copper' : 'bg-sage'}`} />
              <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${activeProductTab === 0 ? 'text-copper' : 'text-sage'}`}>02 // Intelligence, Applied</p>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-display tracking-tighter mb-8 max-w-4xl uppercase text-white">Complexity meets clarity.</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/60 font-sans font-light max-w-3xl tracking-wide">Two products, two domains, one conviction: deep problems deserve purpose-built intelligence with the reasoning shown.</motion.p>
          </motion.div>

          {/* TAB SWITCHER UI */}
          <div className="relative z-10 max-w-[400px] mx-auto mb-20 p-1.5 bg-ink-3/50 backdrop-blur-xl border border-white/10 rounded-full flex relative shadow-2xl">
            <button 
              onClick={() => setActiveProductTab(0)}
              className={`flex-1 py-3 px-6 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all duration-300 z-10 ${activeProductTab === 0 ? 'text-white font-bold' : 'text-white/50 hover:text-white'}`}
            >
              RAccelerator
            </button>
            <button 
              onClick={() => setActiveProductTab(1)}
              className={`flex-1 py-3 px-6 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all duration-300 z-10 ${activeProductTab === 1 ? 'text-white font-bold' : 'text-white/50 hover:text-white'}`}
            >
              ReviewsIntel
            </button>
            {/* Active Pill Indicator */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-out ${activeProductTab === 0 ? 'left-1.5 bg-copper/20 shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-copper/50' : 'left-[calc(50%+4.5px)] bg-sage/20 shadow-[0_0_20px_rgba(0,240,255,0.2)] border border-sage/50'}`} 
            />
          </div>
          
          {/* TAB CONTENT */}
          <div className="w-full max-w-6xl relative pb-32 mx-auto z-10 min-h-[550px] md:min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeProductTab === 0 && (
                <motion.div 
                  key="tab0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="p-10 md:p-16 rounded-[40px] bg-white/[0.02] border border-copper/[0.15] shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl flex flex-col md:flex-row gap-16 items-center overflow-hidden group w-full absolute top-0 left-0"
                >
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-copper/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-copper/20 transition-colors duration-700" />
                  
                  <div className="md:w-1/2 relative z-10">
                    <p className="font-mono font-bold tracking-[0.2em] uppercase text-[10px] text-copper mb-6">MedTech Regulatory Affairs</p>
                    <h3 className="text-4xl md:text-5xl font-display mb-6 text-white uppercase tracking-tighter">RAccelerator</h3>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 border border-copper/30 rounded-full inline-flex items-center gap-2 mb-8 text-copper bg-copper/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-copper animate-pulse" /> In Development
                    </div>
                    <p className="text-white/90 mb-6 font-sans font-medium text-lg tracking-wide">Regulatory complexity. Connected clarity.</p>
                    <p className="text-white/50 font-sans font-light leading-relaxed text-sm max-w-lg">Streamlines EU MDR and IVDR work. Device classification and GSPR gap assessment today, with the reasoning traceable to the rule and the evidence.</p>
                  </div>
                  
                  <div className="md:w-1/2 w-full h-[350px] md:h-[450px] relative rounded-[30px] overflow-hidden shadow-2xl border border-white/10 group-hover:border-copper/30 transition-colors duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-ink/80 via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 z-0"><RAcceleratorModel /></div>
                    <div className="absolute bottom-6 left-6 z-20 flex gap-4 pointer-events-none">
                      <div className="bg-ink/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                        <p className="text-[9px] uppercase tracking-widest text-copper">Processing</p>
                        <p className="text-white font-mono text-lg">2.4M Nodes</p>
                      </div>
                      <div className="bg-ink/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                        <p className="text-[9px] uppercase tracking-widest text-white/50">Traceability</p>
                        <p className="text-white font-mono text-lg">100%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeProductTab === 1 && (
                <motion.div 
                  key="tab1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="p-10 md:p-16 rounded-[40px] bg-white/[0.02] border border-sage/[0.15] shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl flex flex-col md:flex-row-reverse gap-16 items-center overflow-hidden group w-full absolute top-0 left-0"
                >
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-sage/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-sage/20 transition-colors duration-700" />
                  
                  <div className="md:w-1/2 relative z-10">
                    <p className="font-mono font-bold tracking-[0.2em] uppercase text-[10px] text-sage mb-6">Agentic Commerce</p>
                    <h3 className="text-4xl md:text-5xl font-display mb-6 text-white uppercase tracking-tighter">ReviewsIntel</h3>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 border border-sage/30 rounded-full inline-flex items-center gap-2 mb-8 text-sage bg-sage/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" /> Patent Pending
                    </div>
                    <p className="text-white/90 mb-6 font-sans font-medium text-lg tracking-wide">Evidence for agentic commerce.</p>
                    <p className="text-white/50 font-sans font-light leading-relaxed text-sm max-w-lg">Translating complex consumer signals into documented, authorized decisions. US provisional, June 2026.</p>
                  </div>
                  
                  <div className="md:w-1/2 w-full h-[350px] md:h-[450px] relative rounded-[30px] overflow-hidden shadow-2xl border border-white/10 group-hover:border-sage/30 transition-colors duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tl from-ink/80 via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 z-0"><ReviewsIntelModel /></div>
                    <div className="absolute bottom-6 right-6 z-20 flex gap-4 pointer-events-none text-right">
                      <div className="bg-ink/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                        <p className="text-[9px] uppercase tracking-widest text-sage">Signals</p>
                        <p className="text-white font-mono text-lg">18.2K/s</p>
                      </div>
                      <div className="bg-ink/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                        <p className="text-[9px] uppercase tracking-widest text-white/50">Latency</p>
                        <p className="text-white font-mono text-lg">12ms</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* PANEL 4: RACCELERATOR UI MOCK (Slider) */}
        <section id="evidence" className="w-full min-h-screen py-32 flex flex-col justify-center px-12 md:px-32 bg-transparent relative overflow-hidden perspective-[2000px]">
          <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-20 items-center relative z-10 mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex-1">
              <motion.h3 variants={fadeInUp} className="text-4xl font-display mb-10 text-white uppercase tracking-tighter">Inside RAccelerator</motion.h3>
              
              <div className="min-h-[250px] relative mb-8">
                <AnimatePresence mode="wait">
                  {activeSlide === 0 && (
                    <motion.div key="slide0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <p className="text-copper font-mono text-[10px] uppercase tracking-[0.2em] mb-3">01 // The Problem</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">A GSPR gap assessment means reading thousands of pages of evidence against Annex I requirements, by hand, under deadline.</p>
                      <p className="text-copper font-mono text-[10px] uppercase tracking-[0.2em] mb-3">02 // What Changes</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">Evidence is mapped to each requirement with the reasoning shown, so the team reviews an argument instead of building one.</p>
                    </motion.div>
                  )}
                  {activeSlide === 1 && (
                    <motion.div key="slide1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <p className="text-sage font-mono text-[10px] uppercase tracking-[0.2em] mb-3">03 // AI Classification</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">Instantly classify devices under MDR/IVDR with AI that references the exact rule and regulation paragraph.</p>
                      <p className="text-sage font-mono text-[10px] uppercase tracking-[0.2em] mb-3">04 // Speed & Accuracy</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">Reduce classification time from weeks to hours, while increasing audit-readiness and compliance confidence.</p>
                    </motion.div>
                  )}
                  {activeSlide === 2 && (
                    <motion.div key="slide2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <p className="text-copper font-mono text-[10px] uppercase tracking-[0.2em] mb-3">05 // Traceability</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">Every data point links back to its source document. No black boxes. Fully transparent audit trails.</p>
                      <p className="text-copper font-mono text-[10px] uppercase tracking-[0.2em] mb-3">06 // Enterprise Ready</p>
                      <p className="text-white/50 font-sans font-light leading-relaxed mb-8 text-sm">Deployed on secure, compliant infrastructure built for the world's largest medical device manufacturers.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setActiveSlide(prev => (prev === 0 ? 2 : prev - 1))}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                >
                  &larr;
                </button>
                <div className="flex gap-2">
                  {[0,1,2].map((i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveSlide(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${activeSlide === i ? 'bg-copper' : 'bg-white/20'}`} 
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setActiveSlide(prev => (prev === 2 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                >
                  &rarr;
                </button>
              </div>
            </motion.div>
            
            {/* Carousel Mockup Window */}
            <motion.div 
              style={{ rotateX: rotateMockup }}
              className="flex-1 bg-ink-3 border border-white/10 rounded-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative w-full transform-gpu overflow-hidden min-h-[400px] flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-copper/10 text-copper px-6 py-2 rounded-tr-2xl rounded-bl-2xl text-[9px] uppercase tracking-[0.2em] font-bold z-20">Illustrative View</div>
              
              <div className="relative flex-1 w-full h-full">
                <AnimatePresence mode="wait">
                  {activeSlide === 0 && (
                    <motion.div key="mock0" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0">
                      <h4 className="text-xs font-sans uppercase tracking-[0.2em] mb-8 text-white">GSPR Gap Assessment</h4>
                      <div className="flex gap-10 mb-8 border-b border-white/10 pb-6">
                        <div><p className="text-2xl font-display text-white">7 <span className="text-xs text-white/30">/ 23</span></p><p className="text-[9px] uppercase tracking-[0.1em] text-white/50 font-sans mt-1">GSPR Gaps</p></div>
                        <div><p className="text-2xl font-display text-copper">2</p><p className="text-[9px] uppercase tracking-[0.1em] text-white/50 font-sans mt-1">Critical Gaps</p></div>
                        <div><p className="text-2xl font-display text-sage">41</p><p className="text-[9px] uppercase tracking-[0.1em] text-white/50 font-sans mt-1">Evidence Mapped</p></div>
                      </div>
                      <table className="w-full text-left text-[10px] font-sans font-light">
                        <thead className="text-white/30 border-b border-white/10 uppercase tracking-widest">
                          <tr><th className="pb-4 font-normal">Requirement</th><th className="pb-4 font-normal">Status</th><th className="pb-4 font-normal">Evidence</th></tr>
                        </thead>
                        <tbody className="text-white/80">
                          <tr><td colSpan={3} className="py-4 text-copper uppercase tracking-widest text-[9px]">Chapter I // General</td></tr>
                          <tr className="border-b border-white/5"><td className="py-4">GSPR 1 · Performance</td><td className="text-sage">Covered</td><td className="text-white/40">CER-04 · RMF-02</td></tr>
                          <tr className="border-b border-white/5"><td className="py-4">GSPR 3 · Risk mgmt</td><td className="text-copper">Gap</td><td className="text-white/40">RMF-02 · partial</td></tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {activeSlide === 1 && (
                    <motion.div key="mock1" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0">
                      <h4 className="text-xs font-sans uppercase tracking-[0.2em] mb-8 text-white">AI Device Classification</h4>
                      <div className="flex gap-10 mb-8 border-b border-white/10 pb-6">
                        <div><p className="text-2xl font-display text-sage">Class IIb</p><p className="text-[9px] uppercase tracking-[0.1em] text-white/50 font-sans mt-1">MDR Classification</p></div>
                        <div><p className="text-2xl font-display text-white">Rule 11</p><p className="text-[9px] uppercase tracking-[0.1em] text-white/50 font-sans mt-1">Active Rule</p></div>
                      </div>
                      <div className="bg-ink-2 p-4 rounded-lg border border-white/5 mb-4">
                        <p className="text-[10px] text-sage uppercase tracking-widest mb-2">AI Reasoning</p>
                        <p className="text-white/70 text-xs font-light leading-relaxed">Software intended to provide information which is used to take decisions with diagnosis or therapeutic purposes is classified as class IIa, except if such decisions have an impact that may cause death or an irreversible deterioration of a person's state of health, in which case it is in class III; or a serious deterioration of a person's state of health, in which case it is in class IIb.</p>
                      </div>
                      <p className="text-[9px] text-copper uppercase tracking-widest mt-4">Source: MDR Annex VIII, Chapter III, Rule 11</p>
                    </motion.div>
                  )}

                  {activeSlide === 2 && (
                    <motion.div key="mock2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-white">Traceability Network</h4>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                          <div className="w-2 h-2 rounded-full bg-copper animate-pulse delay-75" />
                        </div>
                      </div>
                      
                      <div className="flex-1 relative border border-white/10 bg-ink-2/50 rounded-xl p-6 overflow-hidden flex flex-col justify-between">
                        {/* Background subtle grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />
                        
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                          <path d="M 50% 20% L 16% 75%" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                          <path d="M 50% 20% L 50% 75%" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                          <path d="M 50% 20% L 84% 75%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                          
                          {/* Animated particle on a line */}
                          <circle cx="0" cy="0" r="3" fill="#00F0FF">
                            <animateMotion path="M 50% 20% L 16% 75%" dur="3s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="0" cy="0" r="3" fill="#38BDF8">
                            <animateMotion path="M 50% 20% L 84% 75%" dur="4s" repeatCount="indefinite" />
                          </circle>
                        </svg>

                        {/* Root Node */}
                        <div className="relative z-10 self-center bg-white/5 border border-white/20 backdrop-blur-md px-6 py-3 rounded-lg text-white text-xs font-mono shadow-[0_0_20px_rgba(255,255,255,0.05)] text-center mt-2">
                          <p className="text-white/50 text-[9px] mb-1">TARGET REQUIREMENT</p>
                          GSPR 1.4: Risk Mitigation
                        </div>

                        {/* Documents Row */}
                        <div className="relative z-10 flex justify-between gap-4 mt-auto mb-2">
                          {/* Doc 1 */}
                          <div className="flex-1 bg-ink border border-sage/30 rounded-lg p-3 relative group overflow-hidden hover:border-sage transition-colors cursor-pointer shadow-lg">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sage" />
                            <div className="absolute inset-0 bg-sage/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-[9px] text-sage font-mono mb-1 tracking-widest">PDF</p>
                            <p className="text-white text-[11px] truncate mb-3">CER_V4_Final.pdf</p>
                            <div className="w-full bg-white/10 h-[2px] rounded-full overflow-hidden">
                              <div className="bg-sage h-full w-[98%]" />
                            </div>
                            <p className="text-white/40 text-[8px] mt-1 uppercase">98% Match</p>
                          </div>
                          
                          {/* Doc 2 */}
                          <div className="flex-1 bg-ink border border-white/10 rounded-lg p-3 relative group overflow-hidden hover:border-white/30 transition-colors cursor-pointer shadow-lg">
                            <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-[9px] text-white/50 font-mono mb-1 tracking-widest">DOCX</p>
                            <p className="text-white text-[11px] truncate mb-3">Risk_Mgmt.docx</p>
                            <div className="w-full bg-white/10 h-[2px] rounded-full overflow-hidden">
                              <div className="bg-white/40 h-full w-[74%]" />
                            </div>
                            <p className="text-white/40 text-[8px] mt-1 uppercase">74% Match</p>
                          </div>
                          
                          {/* Doc 3 */}
                          <div className="flex-1 bg-ink border border-copper/30 rounded-lg p-3 relative group overflow-hidden hover:border-copper transition-colors cursor-pointer shadow-lg">
                            <div className="absolute top-0 left-0 w-1 h-full bg-copper" />
                            <div className="absolute inset-0 bg-copper/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-[9px] text-copper font-mono mb-1 tracking-widest">XLSX</p>
                            <p className="text-white text-[11px] truncate mb-3">PMS_Data.xlsx</p>
                            <div className="w-full bg-white/10 h-[2px] rounded-full overflow-hidden">
                              <div className="bg-copper h-full w-[91%]" />
                            </div>
                            <p className="text-white/40 text-[8px] mt-1 uppercase">91% Match</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PANEL 4.2: THE METHOD */}
        <section id="method" className="w-full py-32 px-12 md:px-32 relative bg-transparent overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <motion.p variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage mb-6">04 // Our Methodology</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display tracking-tighter text-white uppercase mb-8">How We Build.</motion.h2>
              <motion.p variants={fadeInUp} className="text-white/60 font-sans font-light leading-relaxed text-sm">
                We do not build tools in a vacuum. Every Craton product is the result of a rigorous, iterative process that puts domain expertise first, ensuring our AI serves as an accelerant rather than a black box.
              </motion.p>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              <motion.div variants={fadeInUp} className="relative pl-6 border-l border-white/10">
                <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-sage shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-3">1. Domain Immersion</h3>
                <p className="text-white/50 font-sans font-light text-sm leading-relaxed">
                  We embed with regulatory experts and clinicians to understand the exact friction points in evidence-heavy workflows before writing a single line of code.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="relative pl-6 border-l border-white/10">
                <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-copper shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-3">2. Architecture First</h3>
                <p className="text-white/50 font-sans font-light text-sm leading-relaxed">
                  Designing robust, compliant data architectures that securely ingest, map, and reference unstructured data with enterprise-grade reliability.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="relative pl-6 border-l border-white/10">
                <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-sage shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-3">3. Transparent AI</h3>
                <p className="text-white/50 font-sans font-light text-sm leading-relaxed">
                  Integrating fine-tuned models that highlight the reasoning and source documentation for every assertion, ensuring zero hallucinations in critical reports.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="relative pl-6 border-l border-white/10">
                <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-copper shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-3">4. Expert Validation</h3>
                <p className="text-white/50 font-sans font-light text-sm leading-relaxed">
                  Continuous testing by industry veterans guarantees our solutions meet and exceed the stringent standards of regulatory bodies globally.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* PANEL 4.3: SECURITY & TRUST (Bento Box Redesign) */}
        <section className="w-full py-32 px-12 md:px-32 relative bg-transparent overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_60%)] pointer-events-none z-0" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-20 text-center flex flex-col items-center">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-copper/20 bg-copper/5 mb-8">
                <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper">05 // Security & Trust</p>
              </motion.div>
              <motion.h3 variants={fadeInUp} className="text-4xl md:text-5xl font-display mb-6 text-white uppercase tracking-tighter">Built for the strictest environments.</motion.h3>
              <motion.p variants={fadeInUp} className="text-white/50 font-sans font-light leading-relaxed text-sm max-w-2xl text-center">In fields like MedTech and Commerce, trust isn't a feature—it's the entire product. Craton's infrastructure respects data residency and strict access controls.</motion.p>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Main Feature: Auditable Reasoning */}
              <motion.div variants={fadeInUp} className="md:col-span-2 row-span-2 bg-white/[0.02] border border-white/10 rounded-[30px] p-10 relative overflow-hidden group hover:border-copper/30 transition-colors duration-500 flex flex-col justify-between min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-copper/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Animated Rings Background */}
                <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] border border-white/5 rounded-full flex items-center justify-center pointer-events-none">
                  <div className="w-[400px] h-[400px] border border-copper/10 rounded-full animate-[spin_40s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                  <div className="absolute w-[300px] h-[300px] border border-white/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" style={{ borderStyle: 'dotted' }} />
                  <div className="absolute w-[200px] h-[200px] bg-copper/5 rounded-full flex items-center justify-center">
                    <Fingerprint className="w-20 h-20 text-copper/40" strokeWidth={1} />
                  </div>
                </div>

                <div className="relative z-10 max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-copper/10 flex items-center justify-center mb-8 border border-copper/20 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                    <ShieldCheck className="w-6 h-6 text-copper" />
                  </div>
                  <h4 className="text-4xl font-display text-white mb-4 uppercase tracking-tighter">100% Auditable</h4>
                  <p className="text-white/60 font-sans text-sm leading-relaxed">Every decision the agent makes is fully documented, traced back to the original rule or evidence, and cryptographically verified.</p>
                </div>
              </motion.div>

              {/* Sub Feature 1: SOC 2 */}
              <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-[30px] p-8 relative overflow-hidden group hover:border-white/30 transition-colors duration-500 flex flex-col justify-between h-[190px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-10 group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />
                <Lock className="w-6 h-6 text-white/50 mb-4 group-hover:text-white transition-colors" />
                <div className="pointer-events-none">
                  <h4 className="text-lg font-display text-white mb-2 uppercase">SOC 2 Type II</h4>
                  <p className="text-white/40 text-[11px] font-mono uppercase tracking-widest">Compliant Architecture</p>
                </div>
              </motion.div>

              {/* Sub Feature 2: Encryption */}
              <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-[30px] p-8 relative overflow-hidden group hover:border-sage/30 transition-colors duration-500 flex flex-col justify-between h-[190px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-bl-[100px] -z-10 group-hover:bg-sage/10 transition-colors duration-500 pointer-events-none" />
                <Server className="w-6 h-6 text-sage/50 mb-4 group-hover:text-sage transition-colors" />
                <div className="pointer-events-none">
                  <h4 className="text-lg font-display text-white mb-2 uppercase">AES-256</h4>
                  <p className="text-white/40 text-[11px] font-mono uppercase tracking-widest">End-to-End Encryption</p>
                </div>
              </motion.div>

              {/* Wide Feature: Deployments */}
              <motion.div variants={fadeInUp} className="md:col-span-3 bg-white/[0.02] border border-white/10 rounded-[30px] p-8 relative overflow-hidden group hover:border-white/20 transition-colors duration-500 flex items-center justify-between">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[gradient_3s_linear_infinite] opacity-0 group-hover:opacity-100 pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Server className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-xl font-display text-white mb-1 uppercase tracking-wider">Flexible Deployments</h4>
                    <p className="text-white/50 text-[11px] font-mono uppercase tracking-[0.1em]">On-Premise & Private Cloud Options Available</p>
                  </div>
                </div>
                <div className="hidden md:flex gap-2 relative z-10 pointer-events-none">
                  <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden"><div className="w-full h-full bg-white/40 rounded-full animate-pulse" /></div>
                  <div className="w-8 h-2 rounded-full bg-white/10" />
                  <div className="w-8 h-2 rounded-full bg-white/10" />
                </div>
              </motion.div>
              
            </motion.div>
          </div>
        </section>

        {/* PANEL 4.5: CAPABILITIES (Grid) */}
        <section id="capabilities" className="w-full py-32 px-12 md:px-32 relative bg-transparent">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-20">
              <motion.p variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper mb-6">03 // Capabilities</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display tracking-tighter text-white uppercase max-w-3xl">Architected for Precision</motion.h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={fadeInUp} className="p-8 border border-white/10 bg-ink rounded-2xl hover:border-sage/50 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:bg-sage/10 transition-colors">
                  <div className="w-3 h-3 bg-sage rounded-full animate-pulse" />
                </div>
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-4">Deep Analytics</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">Transform unstructured regulatory data into structured, actionable insights with real-time analytics engines.</p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="p-8 border border-white/10 bg-ink rounded-2xl hover:border-copper/50 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:bg-copper/10 transition-colors">
                  <div className="w-3 h-3 bg-copper rounded-full" />
                </div>
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-4">Scalable Infrastructure</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">Built on enterprise-grade architecture that securely processes high-volume medical and consumer data effortlessly.</p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="p-8 border border-white/10 bg-ink rounded-2xl hover:border-sage/50 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:bg-sage/10 transition-colors">
                  <div className="w-3 h-3 border-2 border-sage rounded-sm" />
                </div>
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-4">AI Integration</h3>
                <p className="text-white/50 font-sans font-light leading-relaxed text-sm">Proprietary language models fine-tuned specifically for strict regulatory compliance and evidence generation.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* PANEL 4.8: TESTIMONIALS / SOCIAL PROOF */}
        <section id="proof" className="w-full py-32 px-12 md:px-32 relative bg-transparent overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05)_0%,transparent_60%)] pointer-events-none z-0" />
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <div className="max-w-2xl">
                <motion.p variants={fadeInUp} className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage mb-6">Enterprise Trust</motion.p>
                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display tracking-tighter text-white uppercase">Proof in Production.</motion.h2>
              </div>
              <motion.p variants={fadeInUp} className="hidden md:block text-white/40 font-mono text-sm max-w-sm text-right leading-relaxed">Evaluating highly regulated, complex workflows with the world's most critical enterprises.</motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Testimonial 1 */}
              <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-[32px] p-10 hover:border-copper/30 transition-colors flex flex-col justify-between group">
                <div>
                  <div className="text-copper mb-6 text-5xl font-serif leading-none">"</div>
                  <p className="text-white/70 font-sans font-light leading-relaxed text-lg mb-8">
                    RAccelerator didn't just digitize our workflows; it brought absolute traceability to our gap assessments. The ability to directly tie evidence to every decision is a game-changer for audits.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-white/5 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center border border-copper/20 group-hover:bg-copper/20 transition-colors">
                    <span className="text-copper font-display text-xl">S</span>
                  </div>
                  <div>
                    <h4 className="text-white font-sans text-sm mb-1">VP Regulatory Affairs</h4>
                    <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Global MedTech Enterprise</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-[32px] p-10 hover:border-sage/30 transition-colors flex flex-col justify-between group">
                <div>
                  <div className="text-sage mb-6 text-5xl font-serif leading-none">"</div>
                  <p className="text-white/70 font-sans font-light leading-relaxed text-lg mb-8">
                    The autonomous agent landscape is chaotic. ReviewsIntel brought the exact missing layer of trust we needed—making sure agents purchase based on documented, verifiable evidence.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-white/5 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center border border-sage/20 group-hover:bg-sage/20 transition-colors">
                    <span className="text-sage font-display text-xl">E</span>
                  </div>
                  <div>
                    <h4 className="text-white font-sans text-sm mb-1">Head of Digital Commerce</h4>
                    <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Fortune 500 Retailer</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div variants={fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-[32px] p-10 hover:border-white/30 transition-colors flex flex-col justify-between group">
                <div>
                  <div className="text-white/30 mb-6 text-5xl font-serif leading-none">"</div>
                  <p className="text-white/70 font-sans font-light leading-relaxed text-lg mb-8">
                    What stood out wasn't just the AI, but the engineering rigor. Craton approaches enterprise problems like a true partner—filing IP, building secure data layers, and keeping experts in the loop.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-white/5 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                    <span className="text-white/50 font-display text-xl">M</span>
                  </div>
                  <div>
                    <h4 className="text-white font-sans text-sm mb-1">Chief Information Officer</h4>
                    <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Healthcare Network</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* PANEL 5: COMPANY (Scrolling Marquee + Details) */}
        <section id="company" className="w-full py-32 flex flex-col justify-center relative overflow-hidden bg-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.05)_0%,transparent_70%)] z-0 pointer-events-none" />
          
          <div className="relative z-10 w-full overflow-hidden flex flex-col items-center justify-center py-20 mb-24 pointer-events-none transform -skew-y-3">
             {/* Background glow for the marquee */}
             <div className="absolute inset-0 bg-gradient-to-r from-copper/10 via-sage/10 to-copper/10 blur-3xl opacity-50" />
             
             {/* Row 1: Outline text (Moves left) */}
             <motion.div 
               animate={{ x: ["0%", "-50%"] }} 
               transition={{ ease: "linear", duration: 30, repeat: Infinity }}
               className="flex font-display text-[80px] md:text-[140px] uppercase tracking-tighter items-center gap-16 whitespace-nowrap leading-none text-transparent opacity-80"
               style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)" }}
             >
               <span>Bold Thinking</span><span className="text-copper text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
               <span>Grounded Execution</span><span className="text-sage text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
               <span>Rigorous Design</span><span className="text-copper text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
               <span>Bold Thinking</span><span className="text-copper text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
               <span>Grounded Execution</span><span className="text-sage text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
               <span>Rigorous Design</span><span className="text-copper text-4xl opacity-50" style={{ WebkitTextStroke: "0px" }}>✦</span>
             </motion.div>
             
             {/* Row 2: Solid text (Moves right) */}
             <motion.div 
               animate={{ x: ["-50%", "0%"] }} 
               transition={{ ease: "linear", duration: 40, repeat: Infinity }}
               className="flex font-display text-[80px] md:text-[140px] uppercase tracking-tighter items-center gap-16 whitespace-nowrap leading-none text-white/5 mt-4"
             >
               <span>Rigorous Design</span><span className="text-copper/30 text-4xl">✦</span>
               <span>Bold Thinking</span><span className="text-sage/30 text-4xl">✦</span>
               <span>Grounded Execution</span><span className="text-copper/30 text-4xl">✦</span>
               <span>Rigorous Design</span><span className="text-copper/30 text-4xl">✦</span>
               <span>Bold Thinking</span><span className="text-sage/30 text-4xl">✦</span>
               <span>Grounded Execution</span><span className="text-copper/30 text-4xl">✦</span>
             </motion.div>
          </div>

          <div className="max-w-7xl px-8 md:px-16 relative z-10 mx-auto w-full">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Box 1: The Core Philosophy */}
              <motion.div variants={fadeInUp} className="lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-[32px] p-10 md:p-14 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage mb-6">04 // Craton Technologies</p>
                <h2 className="text-4xl md:text-6xl font-display tracking-tighter text-white uppercase mb-8 max-w-2xl">Bold thinking.<br/>Grounded execution.</h2>
                <p className="text-xl text-white/60 font-sans font-light leading-relaxed max-w-2xl relative z-10">
                  A craton is the ancient, stable core of a continent — the bedrock everything else is built on. That is the idea: one method, one engineering discipline, one patent-first habit, from which restless, domain-specific products rise.
                </p>
              </motion.div>

              {/* Box 2: Founder Profile */}
              <motion.div variants={fadeInUp} className="lg:col-span-4 bg-gradient-to-br from-copper/10 to-transparent border border-copper/20 rounded-[32px] p-10 relative overflow-hidden group hover:border-copper/40 transition-colors">
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-copper/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-copper/30 transition-colors duration-700" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-3xl font-display text-white tracking-tighter mb-1">Sheik Ahamed Ali</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper">Founder & CEO</p>
                  </div>
                  <p className="text-white/70 font-sans font-light leading-relaxed text-sm mb-8 flex-grow">
                    Twenty-two years building enterprise systems where failure was expensive — retail integration at national scale, then platform and architecture leadership — with the habit of inventing from inside operating roles.
                  </p>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-copper/20 pt-6">
                    <div><p className="text-2xl font-display text-white">3 / 9</p><p className="text-[9px] uppercase tracking-widest text-copper font-mono mt-1">Patents (Grant / Pend)</p></div>
                    <div><p className="text-2xl font-display text-white">TOGAF</p><p className="text-[9px] uppercase tracking-widest text-copper font-mono mt-1">9.1 Certified</p></div>
                    <div><p className="text-2xl font-display text-white">HQ</p><p className="text-[9px] uppercase tracking-widest text-copper font-mono mt-1">Frisco, TX</p></div>
                    <div><p className="text-2xl font-display text-white">22+</p><p className="text-[9px] uppercase tracking-widest text-copper font-mono mt-1">Yrs Enterprise Exp</p></div>
                  </div>
                </div>
              </motion.div>

              {/* Box 3: The Roster */}
              <motion.div variants={fadeInUp} className="lg:col-span-8 bg-white/[0.02] border border-white/10 rounded-[32px] p-10 md:p-14 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="flex justify-between items-end mb-10">
                  <h3 className="text-3xl font-display text-white tracking-tighter uppercase">Domain Leadership</h3>
                  <p className="hidden md:block text-[9px] font-mono text-white/30 tracking-widest uppercase text-right max-w-[200px]">Roles shown; names appear with each person's consent.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  
                  {/* Roster Cards */}
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">Chief Regulatory Affairs Officer</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">Co-founder · EU MDR / IVDR</span>
                  </div>
                  
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">Chief Product Officer</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">Co-founder · Product & User Acceptance</span>
                  </div>
                  
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">Head of Regulatory Affairs, IVD</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">In vitro diagnostics</span>
                  </div>
                  
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">Chief Commercial Officer</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">Go-to-market</span>
                  </div>
                  
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">Regulatory Consultants</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">Independent MD and IVD specialists</span>
                  </div>
                  
                  <div className="bg-ink-2/50 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <b className="block text-white font-sans text-sm mb-2">AI Engineering Team</b>
                    <span className="text-white/50 font-mono text-[9px] uppercase tracking-widest">Palo Alto</span>
                  </div>

                </div>
                <p className="md:hidden text-[9px] font-mono text-white/30 tracking-widest uppercase mt-6">Roles shown; names appear with each person's consent.</p>
              </motion.div>

              {/* Box 4 & 5: Impact */}
              <motion.div variants={fadeInUp} className="lg:col-span-4 grid grid-rows-2 gap-6">
                
                {/* DiscoverSTEM */}
                <div className="bg-sage/5 border border-sage/20 rounded-[32px] p-8 relative overflow-hidden group hover:border-sage/40 transition-colors flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-sage/20 transition-colors duration-700" />
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-sage mb-3">Next generation</p>
                    <h4 className="text-xl font-display text-white mb-3 tracking-wide uppercase">DiscoverSTEM Foundation</h4>
                    <p className="text-white/60 text-xs font-sans leading-relaxed">A 501(c)(3) our founder helped establish, supporting underprivileged children in STEM, entrepreneurship, and innovation.</p>
                  </div>
                </div>
                
                {/* R&D 100 */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col justify-center">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-widest font-mono text-white/40 mb-3">Recognition</p>
                    <h4 className="text-xl font-display text-white mb-3 tracking-wide uppercase">R&D 100 Awards</h4>
                    <p className="text-white/60 text-xs font-sans leading-relaxed">Our founder serves on the judging panel for one of the longest-running recognitions of applied research and innovation.</p>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* PANEL 6: CONTACT */}
        <section id="contact" className="w-full py-40 flex flex-col items-center justify-center px-12 z-10 bg-transparent text-center relative overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-display mb-8 uppercase tracking-tighter text-white">Let's move it forward.</h2>
          <p className="text-white/40 font-mono text-sm tracking-widest mb-16">START A CONVERSATION TODAY</p>
          
          <div className="w-full max-w-3xl bg-white/[0.02] border border-white/10 p-12 rounded-3xl backdrop-blur-sm text-left shadow-2xl relative group overflow-hidden">
            {/* Animated border line on hover */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-copper via-sage to-transparent -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-1000" />
            
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="NAME" className="w-full bg-transparent border-b border-white/20 px-0 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white focus:border-copper outline-none placeholder:text-white/30 transition-colors" />
                <input type="email" placeholder="WORK EMAIL" className="w-full bg-transparent border-b border-white/20 px-0 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white focus:border-copper outline-none placeholder:text-white/30 transition-colors" />
              </div>
              <input type="text" placeholder="COMPANY" className="w-full bg-transparent border-b border-white/20 px-0 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white focus:border-copper outline-none placeholder:text-white/30 transition-colors" />
              <select className="w-full bg-transparent border-b border-white/20 px-0 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white focus:border-copper outline-none appearance-none transition-colors">
                <option className="bg-ink text-white">Select Conversation Type...</option>
                <option className="bg-ink text-white">Start a pilot</option>
                <option className="bg-ink text-white">Partner with Craton</option>
                <option className="bg-ink text-white">Lead a product</option>
              </select>
              <button className="relative w-full py-5 bg-copper text-ink font-sans text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-white transition-all mt-8 group overflow-hidden shadow-[0_0_30px_rgba(125,211,252,0.2)]">
                Start a conversation
              </button>
            </form>
          </div>
        </section>
        
        {/* FOOTER */}
        <footer className="w-full py-12 px-12 md:px-32 border-t border-white/10 bg-black/40 backdrop-blur-md relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <img src="/bg-r-logo.png" alt="Craton Logo" className="h-6 object-contain opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
              <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase">© 2026 Craton Inc. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-white/50 hover:text-copper font-mono text-[10px] uppercase tracking-[0.2em] transition-colors">Terms</a>
              <a href="#" className="text-white/50 hover:text-copper font-mono text-[10px] uppercase tracking-[0.2em] transition-colors">Privacy</a>
              <a href="#" className="text-white/50 hover:text-sage font-mono text-[10px] uppercase tracking-[0.2em] transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
