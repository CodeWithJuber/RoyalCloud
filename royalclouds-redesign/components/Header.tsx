import Image from "next/image";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";

const navItems = [
  { href: "#plans", label: "Hosting" },
  { href: "#domains", label: "Domains" },
  { href: "#speed", label: "Speed" },
  { href: "#support", label: "Support" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-ink/90 text-white shadow-2xl shadow-ink/10 backdrop-blur-xl">
      <a href="#main" className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Royal Clouds home">
          <Image src="/brand/royalclouds-logo-white.png" alt="Royal Clouds" width={178} height={42} priority className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="https://my.royalclouds.net/clientarea.php" className="focus-ring hidden rounded-full px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/10 sm:inline-flex">
            Login
          </a>
          <a href="#plans" className="focus-ring inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 text-sm font-black text-ink shadow-lg shadow-sun/30 transition hover:-translate-y-0.5">
            <Sparkles aria-hidden="true" size={16} /> Start
          </a>
          <button className="focus-ring rounded-full border border-white/15 p-2 md:hidden" aria-label="Open navigation menu">
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
