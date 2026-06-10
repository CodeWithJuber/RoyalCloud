import { Check, Crown } from "lucide-react";
import { siteContent } from "@/lib/content";
import { cn } from "@/lib/utils";

const accentClass = {
  blue: "from-royal-500 to-royal-700",
  mint: "from-mint to-royal-500",
  violet: "from-violet to-royal-500",
  sun: "from-sun to-orange-500"
};

export function PlanCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {siteContent.plans.map((plan) => (
        <article key={plan.slug} className={cn("relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-card transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950", plan.popular ? "border-royal-300 ring-4 ring-royal-100 dark:ring-royal-500/20" : "border-slate-200")}> 
          <div className={cn("absolute inset-x-0 top-0 h-2 bg-gradient-to-r", accentClass[plan.accent])} />
          {plan.popular && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-royal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-royal-700 dark:bg-royal-500/15 dark:text-royal-100">
              <Crown aria-hidden="true" size={14} /> Most chosen
            </div>
          )}
          <h3 className="font-display text-2xl font-black text-ink dark:text-white">{plan.name}</h3>
          <p className="mt-3 min-h-24 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.summary}</p>
          <div className="mt-6 flex items-end gap-1">
            <span className="text-lg font-black text-slate-500">$</span>
            <span className="font-display text-5xl font-black text-ink dark:text-white">{plan.price}</span>
            <span className="pb-2 text-sm font-bold text-slate-500">{plan.period}</span>
          </div>
          <a href={plan.ctaUrl} className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-royal-700 dark:bg-white dark:text-ink dark:hover:bg-royal-100">
            Plans & pricing
          </a>
          <ul className="mt-6 space-y-3" aria-label={`${plan.name} features`}>
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Check aria-hidden="true" className="mt-0.5 shrink-0 text-mint" size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
