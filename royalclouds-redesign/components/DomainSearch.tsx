"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { buildDomainSearchUrl } from "@/lib/domain";
import { domainSearchSchema } from "@/lib/schemas";

const tlds = [".com", ".net", ".org", ".info"] as const;

export function DomainSearch({ portalBase }: { portalBase: string }) {
  const [name, setName] = useState("");
  const [tld, setTld] = useState<(typeof tlds)[number]>(".com");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="rounded-[2rem] border border-white/15 bg-white/95 p-3 shadow-card dark:bg-slate-950"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = domainSearchSchema.safeParse({ name, tld });
        if (!parsed.success) {
          setMessage(parsed.error.issues[0]?.message ?? "Check the domain and try again.");
          return;
        }

        setMessage("Opening Royal Clouds secure domain checker…");
        window.location.href = buildDomainSearchUrl(parsed.data, portalBase);
      }}
    >
      <label htmlFor="domain-name" className="sr-only">Domain name</label>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/10">
          <Search aria-hidden="true" className="text-royal-600" />
          <input
            id="domain-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="yourbrand"
            autoComplete="off"
            inputMode="url"
            className="w-full bg-transparent text-lg font-bold text-ink outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>
        <label htmlFor="domain-tld" className="sr-only">Domain extension</label>
        <select
          id="domain-tld"
          value={tld}
          onChange={(event) => setTld(event.target.value as (typeof tlds)[number])}
          className="focus-ring rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-ink dark:border-white/10 dark:bg-slate-900 dark:text-white"
        >
          {tlds.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button type="submit" className="focus-ring rounded-2xl bg-sun px-6 py-3 font-black text-ink shadow-lg shadow-sun/25 transition hover:-translate-y-0.5">
          Search
        </button>
      </div>
      <p role="status" className="min-h-6 px-2 pt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        {message ?? "Checks through the Royal Clouds billing portal; no domain API key required."}
      </p>
    </form>
  );
}
