import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  text,
  children,
  className
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("px-4 py-16 sm:px-6 lg:px-8 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl">
        {(eyebrow || title || text) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-royal-600">{eyebrow}</p>}
            {title && <h2 className="font-display text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl lg:text-5xl">{title}</h2>}
            {text && <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{text}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
