import { Reveal } from "@/components/ui/Reveal";

export function Company() {
  return (
    <section id="company" className="bg-paper text-ink py-[120px] px-[var(--pad)] border-t border-[var(--line-dark)]">
      <Reveal>
        <div className="mb-[100px]">
          <p className="eyebrow text-sage-deep mb-3">
            <span className="opacity-70 mr-3">08 /</span> The Company
          </p>
          <h2 className="text-[clamp(38px,4.6vw,76px)] font-normal leading-[1.02] tracking-[-0.045em] text-ink max-w-[800px]">
            Built on <span className="font-serif italic text-sage-deep">reality.</span>
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-12">
        
        {/* Left Column: Story & Philosophy */}
        <div className="lg:col-span-5 lg:col-start-1 flex flex-col gap-12">
          
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-sage-deep border-b border-[var(--line-dark)] pb-3 mb-2">
                Company Story
              </h3>
              <p className="text-[17px] text-ink leading-[1.6]">
                Craton was founded with a singular conviction: applying intelligence to high-stakes problems requires fundamentally changing the software architecture.
              </p>
              <p className="text-[15px] text-[#4a4f45] leading-[1.7]">
                We are an independent, founder-funded technology company based in Frisco, Texas. After 22+ years of shipping enterprise systems across heavily regulated industries, we recognized that the &quot;model&quot; is not the product. The truth, backed by a visible chain of evidence, is the product.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-sage-deep border-b border-[var(--line-dark)] pb-3 mb-2">
                Independence & Community
              </h3>
              <p className="text-[15px] text-[#4a4f45] leading-[1.7]">
                By remaining independently funded, we build to solve intractable problems, not to chase valuations or bend to the hype cycle. We are actively embedded in the local technology and founder communities, fostering engineering discipline and genuine innovation.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Founder & Expertise */}
        <div className="lg:col-span-5 lg:col-start-7 flex flex-col gap-12">
          
          <Reveal delay={0.3}>
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-sage-deep border-b border-[var(--line-dark)] pb-3 mb-2">
                Founder & Leadership
              </h3>
              
              <div className="bg-paper border border-[var(--line-dark)] p-6 md:p-8 rounded-xl shadow-sm mt-2">
                <span className="block w-[32px] h-[32px] rounded-full bg-ink text-paper flex items-center justify-center font-serif text-[18px] italic mb-6">
                  S
                </span>
                <h4 className="text-[24px] font-medium tracking-[-0.02em] text-ink leading-none mb-1">
                  Sheik Ahamed Ali
                </h4>
                <span className="block font-mono text-[10px] tracking-[0.1em] text-copper uppercase mb-5">
                  Founder & CEO
                </span>
                <p className="text-[14px] text-[#4a4f45] leading-[1.7]">
                  Drawing on decades of experience in enterprise systems architecture, Sheik leads Craton with a focus on rigorous, evidence-based engineering over conceptual abstraction.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-sage-deep border-b border-[var(--line-dark)] pb-3 mb-2">
                Expertise & Recognition
              </h3>
              <p className="text-[15px] text-[#4a4f45] leading-[1.7]">
                Technology cannot replace genuine domain expertise. Our product leaders bring decades in the field—from MedTech regulatory affairs to complex enterprise commerce.
              </p>
              <p className="text-[15px] text-[#4a4f45] leading-[1.7]">
                This foundation of protected intellectual property and deep domain knowledge gives enterprises the confidence to trust Craton with their most critical workflows.
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
