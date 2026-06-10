import { Headphones, MousePointerClick, ShieldCheck, Zap } from "lucide-react";
import { siteContent } from "@/lib/content";

const icons = { Headphones, MousePointerClick, ShieldCheck, Zap };

export function FeatureGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {siteContent.features.map((feature) => {
        const Icon = icons[feature.icon as keyof typeof icons] ?? ShieldCheck;
        return (
          <article key={feature.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 inline-flex rounded-2xl bg-royal-50 p-3 text-royal-600 dark:bg-royal-500/15 dark:text-royal-100">
              <Icon aria-hidden="true" size={28} />
            </div>
            <h3 className="font-display text-xl font-black text-ink dark:text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.text}</p>
          </article>
        );
      })}
    </div>
  );
}
