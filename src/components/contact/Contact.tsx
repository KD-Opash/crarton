"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

const CONTACT_INTENTS = [
  {
    id: "pilot",
    label: "Start a pilot",
    desc: "Evaluate RAccelerator or ReviewsIntel in your environment with real data.",
  },
  {
    id: "partner",
    label: "Partner with Craton",
    desc: "Integrate our evidence-layer architecture into your enterprise systems.",
  },
  {
    id: "lead",
    label: "Lead a product",
    desc: "Bring your deep domain expertise to build the next Craton product.",
  },
  {
    id: "join",
    label: "Join Craton",
    desc: "Join an engineering culture that values rigorous truth over hype.",
  },
  {
    id: "other",
    label: "Something else",
    desc: "Have another inquiry? Let us know how we can help.",
  }
];

export function Contact() {
  const [intent, setIntent] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  // Automatically select intent if passed via URL Hash (e.g. #contact?intent=Start%20a%20pilot)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#contact?intent=")) {
        const intentParam = decodeURIComponent(hash.split("intent=")[1]);
        const matched = CONTACT_INTENTS.find(i => i.label.toLowerCase() === intentParam.toLowerCase());
        if (matched) {
          setIntent(matched.id);
        }
      }
    };
    
    // Check on mount
    handleHash();
    
    // Listen for changes
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const activeIntent = CONTACT_INTENTS.find(i => i.id === intent);
    
    // Fallback Mailto implementation since no backend API exists yet.
    // Kept ready for fetch() replacement.
    try {
      const subject = encodeURIComponent(`Craton Inquiry: ${activeIntent?.label}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\n\nMessage:\n${formData.message}`);
      
      // Simulate slight network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      window.location.href = `mailto:hello@craton.com?subject=${subject}&body=${body}`;
      setStatus("success");
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeIntentData = CONTACT_INTENTS.find(i => i.id === intent);

  return (
    <section id="contact" className="bg-ink text-paper py-[120px] px-[var(--pad)] border-t border-[var(--line)] overflow-hidden relative">
      <div className="max-w-[1000px] mx-auto w-full relative z-10">
        <Reveal>
          <div className="text-center mb-[80px]">
            <p className="eyebrow text-[#9da197] mb-3">
              <span className="opacity-70 mr-3">09 /</span> Engagement
            </p>
            <h2 className="text-[clamp(38px,4.6vw,76px)] font-normal leading-[1.02] tracking-[-0.045em] text-white">
              Start a <span className="font-serif italic text-[#e6e5d9]">conversation.</span>
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Intent Selectors */}
          <div className="w-full lg:w-5/12 flex flex-col gap-8">
            <h3 className="font-mono text-[12px] tracking-[0.14em] uppercase text-[#9da197] border-b border-[var(--line)] pb-4">
              How would you like to work with Craton?
            </h3>
            
            <div className="flex flex-col gap-3">
              {CONTACT_INTENTS.map((item) => {
                const isActive = intent === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIntent(item.id);
                      setStatus("idle");
                    }}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-lg border text-left transition-all duration-300 group outline-none",
                      isActive 
                        ? "bg-copper/10 border-copper/50 shadow-[0_0_20px_rgba(2,132,199,0.1)]" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <span className={cn(
                      "text-[17px] tracking-[-0.01em]",
                      isActive ? "text-cream font-medium" : "text-[#c9ccc0]"
                    )}>
                      {item.label}
                    </span>
                    <ArrowRight className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive ? "text-copper translate-x-1" : "text-muted group-hover:translate-x-1 group-hover:text-[#a9ac9f]"
                    )} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Form */}
          <div className="w-full lg:w-7/12 min-h-[500px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {!intent ? (
                // Empty State
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full border border-dashed border-[var(--line)] rounded-xl flex items-center justify-center p-12 text-center"
                >
                  <p className="text-[15px] text-muted">
                    Select an inquiry type to continue.
                  </p>
                </motion.div>
              ) : status === "success" ? (
                // Success State
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full bg-ink-3 border border-sage/30 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-2" aria-hidden="true">
                    <Send className="w-6 h-6 text-sage" />
                  </div>
                  <h3 className="text-[24px] text-cream" role="status">Request Sent</h3>
                  <p className="text-[15px] text-[#a9ac9f]">
                    Thank you. We have opened your email client to complete the request.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => { setIntent(null); setStatus("idle"); }}>
                    Start another inquiry
                  </Button>
                </motion.div>
              ) : (
                // Form State
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col"
                >
                  <div className="mb-8">
                    <h3 className="text-[28px] font-normal tracking-[-0.03em] text-white mb-2">
                      {activeIntentData?.label}
                    </h3>
                    <p className="text-[15px] text-[#a9ac9f] leading-[1.6]">
                      {activeIntentData?.desc}
                    </p>
                  </div>

                  <form onSubmit={submitContactForm} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="font-mono text-[10px] tracking-[0.1em] text-[#8e9187] uppercase ml-1">Full Name *</label>
                        <input 
                          id="name" name="name" required
                          value={formData.name} onChange={handleInputChange}
                          className="w-full bg-ink-2 border border-[var(--line)] rounded-lg px-4 py-3 text-[15px] text-cream placeholder:text-muted focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/50 transition-colors"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="font-mono text-[10px] tracking-[0.1em] text-[#8e9187] uppercase ml-1">Work Email *</label>
                        <input 
                          id="email" name="email" type="email" required
                          value={formData.email} onChange={handleInputChange}
                          className="w-full bg-ink-2 border border-[var(--line)] rounded-lg px-4 py-3 text-[15px] text-cream placeholder:text-muted focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/50 transition-colors"
                          placeholder="jane@company.com"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label htmlFor="company" className="font-mono text-[10px] tracking-[0.1em] text-[#8e9187] uppercase ml-1">Company / Organization *</label>
                      <input 
                        id="company" name="company" required
                        value={formData.company} onChange={handleInputChange}
                        className="w-full bg-ink-2 border border-[var(--line)] rounded-lg px-4 py-3 text-[15px] text-cream placeholder:text-muted focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/50 transition-colors"
                        placeholder="Company Ltd."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="font-mono text-[10px] tracking-[0.1em] text-[#8e9187] uppercase ml-1">How can we help? *</label>
                      <textarea 
                        id="message" name="message" required rows={4}
                        value={formData.message} onChange={handleInputChange}
                        className="w-full bg-ink-2 border border-[var(--line)] rounded-lg px-4 py-3 text-[15px] text-cream placeholder:text-muted focus:outline-none focus:border-copper/50 focus:ring-1 focus:ring-copper/50 transition-colors resize-none"
                        placeholder="Please provide details about your requirements..."
                      />
                    </div>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="mt-4 self-start"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
