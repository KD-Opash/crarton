const fs = require('fs');
const path = '/Users/computerk/Desktop/craton/src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  'import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";',
  'import { motion, useScroll, useTransform, AnimatePresence, animate } from "framer-motion";'
);

// Remove GSAP Horizontal Scroll Setup
content = content.replace(
  /const panels = gsap\.utils\.toArray[\s\S]*?ScrollTrigger\.getAll\(\)\.forEach\(t => t\.kill\(\)\);\n    };/g,
  '// GSAP horizontal scroll removed in favor of Kumo-style interactive UI'
);

// Add state for Kumo UI
content = content.replace(
  'const [loadingProgress, setLoadingProgress] = useState(0);',
  `const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const targetProgress = activeStep / 4;
    const controls = animate(useStore.getState().progress, targetProgress, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1], // expoOut
      onUpdate: (latest) => setProgress(latest)
    });
    return () => controls.stop();
  }, [activeStep, setProgress]);`
);

// Replace Section 1 UI
const oldSectionRegex = /<div ref=\{horizontalRef\} className="h-screen w-full relative z-10 overflow-hidden bg-transparent">[\s\S]*?<\/div>\s*<\/div>/;
const newSection = `      {/* ============================================================== */}
      {/* SECTION 1: INTERACTIVE NARRATIVE (KUMO-STYLE)                  */}
      {/* ============================================================== */}
      <section className="h-screen w-full relative z-10 overflow-hidden bg-transparent flex flex-col justify-end pb-20">
        
        {/* Giant Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <AnimatePresence mode="wait">
            <motion.h1
              key={activeStep}
              initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(20px)' }}
              animate={{ opacity: 0.04, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, y: -50, filter: 'blur(20px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18vw] font-display uppercase tracking-tighter text-ink-3 dark:text-cream whitespace-nowrap"
            >
              {['SCATTERED', 'IDEAS', 'FOCUS', 'FORWARD', 'CRATON'][activeStep]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Front Content UI (Kumo Style) */}
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-12 md:px-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 bg-ink-2/30 dark:bg-black/20 backdrop-blur-2xl border border-cream/10 rounded-[40px] p-10 shadow-2xl">
            
            {/* Left text description */}
            <div className="max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="font-serif italic text-copper mb-4 text-xl">0{activeStep + 1} / 05</p>
                  <h2 className="text-4xl md:text-5xl font-display mb-4 text-cream tracking-tighter">
                    {['Scattered possibility.', 'Ideas gather.', 'Focus & Innovation.', 'Moving Forward.', 'Foundation built.'][activeStep]}
                  </h2>
                  <p className="text-cream/70 font-sans font-light text-sm leading-relaxed">
                    {[
                      'A field of scattered points, representing raw, unorganized data in regulated work.',
                      'The points gather into a sphere. The data begins to take shape.',
                      'Taking the shape of a light bulb. True innovation requires rigorous design.',
                      'Opening into an infinity loop. AI-enabled products for evidence-heavy work.',
                      'From possibility to purpose. Keep scrolling to explore the platform.'
                    ][activeStep]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Interactive Controls */}
            <div className="flex flex-col items-end gap-6">
              <p className="text-[10px] uppercase font-mono tracking-widest text-cream/50">Select Phase</p>
              <div className="flex gap-4">
                {[0,1,2,3,4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-md border \${
                      activeStep === step 
                        ? 'bg-copper/20 border-copper/50 text-copper shadow-[0_0_30px_rgba(56,189,248,0.4)] scale-110' 
                        : 'bg-white/5 border-cream/10 text-cream/50 hover:bg-white/10 hover:text-cream hover:scale-105'
                    }\`}
                  >
                    <span className="font-mono text-[11px] font-bold">0{step+1}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>`;

content = content.replace(oldSectionRegex, newSection);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated page.tsx');
