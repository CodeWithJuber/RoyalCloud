import Image from "next/image";
import { Mail, MessageCircle, TicketCheck } from "lucide-react";
import { siteContent } from "@/lib/content";

export function SupportBand() {
  return (
    <div className="grid overflow-hidden rounded-[2.5rem] bg-ink text-white shadow-glow lg:grid-cols-[.9fr_1.1fr]">
      <div className="relative min-h-80">
        <Image src="/brand/support.jpg" alt="Support specialist workspace" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
        <Image src="/brand/mascot.png" alt="Royal Clouds support mascot" width={180} height={180} className="absolute bottom-4 right-4 w-32 sm:w-44" />
      </div>
      <div className="p-6 sm:p-10 lg:p-12">
        <p className="text-sm font-black uppercase tracking-[.22em] text-mint">Need help?</p>
        <h2 className="mt-3 font-display text-3xl font-black sm:text-5xl">A calmer support path for every customer.</h2>
        <p className="mt-5 text-white/75">Choose chat for fast answers, email for account questions, or tickets when you want a tracked technical conversation.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a href="https://royalclouds.net/contact" className="focus-ring rounded-3xl bg-white/10 p-5 hover:bg-white/15">
            <MessageCircle aria-hidden="true" className="mb-4 text-mint" />
            <span className="font-black">Live Chat</span>
          </a>
          <a href={`mailto:${siteContent.contactEmail}`} className="focus-ring rounded-3xl bg-white/10 p-5 hover:bg-white/15">
            <Mail aria-hidden="true" className="mb-4 text-sun" />
            <span className="font-black">Send Email</span>
          </a>
          <a href="https://my.royalclouds.net/submitticket.php" className="focus-ring rounded-3xl bg-white/10 p-5 hover:bg-white/15">
            <TicketCheck aria-hidden="true" className="mb-4 text-royal-300" />
            <span className="font-black">Submit Ticket</span>
          </a>
        </div>
      </div>
    </div>
  );
}
