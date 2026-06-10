import Image from "next/image";
import { ArrowRight, Gauge, ShieldCheck, Star } from "lucide-react";
import { siteContent } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-mesh px-4 pb-20 pt-12 text-white sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-white/10 to-transparent" />
      <Image src="/brand/shape-seven.png" alt="" width={200} height={200} className="absolute left-4 top-24 -z-10 hidden opacity-50 sm:block" />
      <Image src="/brand/shape-eight.png" alt="" width={180} height={180} className="absolute bottom-12 right-10 -z-10 opacity-40" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
        <div>
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/88 backdrop-blur">
            <Star aria-hidden="true" size={16} className="fill-sun text-sun" />
            Rated {siteContent.trustBadges[0]} · plans from $1.99/mo
          </div>
          <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Hosting that feels like a control room, not a template.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
            Royal Clouds gets a custom cloud-console experience: SSD hosting, KVM VPS, WordPress, and dedicated servers presented with the same mascot, blues, golds, and high-speed brand energy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#plans" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-ink shadow-glow transition hover:-translate-y-1">
              View hosting plans <ArrowRight aria-hidden="true" size={18} />
            </a>
            <a href="#domains" className="focus-ring inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-black text-white transition hover:bg-white/10">
              Search a domain
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {["Free SSL", "LiteSpeed", "24/7 Support"].map((metric) => (
              <div key={metric} className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                <dt className="text-sm text-white/65">Included</dt>
                <dd className="mt-1 font-display text-xl font-black">{metric}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-8 rounded-[3rem] bg-royal-500/30 blur-3xl" />
          <div className="relative rounded-[2.25rem] border border-white/20 bg-white/12 p-4 shadow-glow backdrop-blur-xl">
            <div className="rounded-[1.75rem] bg-white p-5 text-ink shadow-2xl dark:bg-slate-950 dark:text-white">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-royal-600">Live Cloud Deck</p>
                  <h2 className="mt-1 font-display text-2xl font-black">Deploy-ready stack</h2>
                </div>
                <Gauge className="text-royal-500" aria-hidden="true" />
              </div>
              <div className="grid gap-4 py-5 sm:grid-cols-2">
                <Image src="/brand/mascot.png" alt="Royal Clouds mascot character" width={320} height={320} className="mx-auto max-h-72 w-auto object-contain" priority />
                <div className="space-y-3 self-center">
                  {["SSD RAID-10", "Cloudflare ready", "Daily backups", "Managed security"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                      <ShieldCheck aria-hidden="true" className="text-mint" size={20} />
                      <span className="font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-gradient-to-r from-royal-600 to-violet p-4 text-white">
                <p className="text-sm text-white/75">Current launch offer</p>
                <p className="font-display text-2xl font-black">Up to 30% off hosting & domains</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
