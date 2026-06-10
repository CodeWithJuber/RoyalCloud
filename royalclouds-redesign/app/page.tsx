import Image from "next/image";
import { Database, Globe2, LockKeyhole, Rocket, Server } from "lucide-react";
import { DomainSearch } from "@/components/DomainSearch";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PlanCards } from "@/components/PlanCards";
import { Section } from "@/components/Section";
import { SupportBand } from "@/components/SupportBand";
import { siteContent } from "@/lib/content";

const stack = [
  { icon: Rocket, label: "LiteSpeed + LSCache", text: "Performance-first stack for WordPress and app launches." },
  { icon: LockKeyhole, label: "Free SSL + DDoS", text: "Safer defaults for visitors, checkouts, and admin panels." },
  { icon: Database, label: "Daily Backups", text: "Recovery-minded hosting for routine site changes." },
  { icon: Server, label: "SSD Infrastructure", text: "Royal Clouds SSD plans surfaced with clearer comparison paths." }
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />

        <Section id="plans" eyebrow="Hosting Command Center" title="Choose by momentum, not confusing server jargon." text="The redesign keeps Royal Clouds real offers visible, but turns them into decision cards that compare price, use case, and included value at a glance.">
          <PlanCards />
        </Section>

        <Section id="domains" className="bg-gradient-to-br from-royal-50 via-white to-mint/20 dark:from-slate-950 dark:via-ink dark:to-slate-900">
          <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[.22em] text-royal-600">Find the perfect domain</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-ink dark:text-white sm:text-5xl">A domain search that feels connected to hosting checkout.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Customers can validate the name format on-page, then continue into Royal Clouds' secure billing portal for the real availability check.</p>
            </div>
            <DomainSearch portalBase={siteContent.portalBase} />
          </div>
        </Section>

        <Section id="speed" eyebrow="Why Royal Clouds" title="Performance, safety, and support visualized as a service system." text="Instead of generic feature blocks, the page frames hosting as a managed operating layer around each customer website.">
          <FeatureGrid />
        </Section>

        <Section className="bg-ink text-white">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-black uppercase tracking-[.22em] text-mint">Managed server care</p>
              <h2 className="mt-3 font-display text-3xl font-black sm:text-5xl">Let customers see what “managed” actually covers.</h2>
              <p className="mt-5 text-lg leading-8 text-white/70">OS updates, security hardening, failover response, uptime focus, and remote backups are presented as a visible operations loop.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {stack.map((item) => (
                  <article key={item.label} className="rounded-3xl border border-white/10 bg-white/8 p-5">
                    <item.icon aria-hidden="true" className="mb-4 text-sun" />
                    <h3 className="font-display font-black">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-10 rounded-full bg-royal-500/25 blur-3xl" />
              <Image src="/brand/cloud-server.png" alt="Royal Clouds cloud server illustration" width={720} height={620} className="relative mx-auto w-full max-w-xl" />
            </div>
          </div>
        </Section>

        <Section eyebrow="Customer Feedback" title="Real social proof kept short, scannable, and credible." text="Testimonials from the existing Royal Clouds site are reused without invented names or filler.">
          <div className="grid gap-5 md:grid-cols-3">
            {siteContent.testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-slate-950">
                <div className="mb-5 flex text-sun" aria-label="Five star rating">★★★★★</div>
                <blockquote className="text-slate-700 dark:text-slate-200">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-6 border-t border-slate-100 pt-4 dark:border-white/10">
                  <p className="font-display font-black text-ink dark:text-white">{testimonial.name}</p>
                  <p className="text-sm font-semibold text-royal-600">{testimonial.company}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="support" className="pt-0">
          <SupportBand />
        </Section>

        <Section className="bg-gradient-to-r from-royal-700 to-violet text-white">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-black sm:text-5xl">Ready to move your site into faster clouds?</h2>
              <p className="mt-4 max-w-3xl text-white/75">Start with SSD shared hosting from $1.99/month or compare VPS and dedicated options when your project needs more control.</p>
            </div>
            <a href="https://my.royalclouds.net/cart.php" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-black text-ink shadow-glow transition hover:-translate-y-1">
              Open secure cart <Globe2 aria-hidden="true" size={18} />
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
