import { domainSearchSchema, type DomainSearch } from "./schemas";

export function buildDomainSearchUrl(input: DomainSearch, portalBase: string) {
  const validInput = domainSearchSchema.parse(input);
  const base = new URL(portalBase);
  if (base.protocol !== "https:") {
    throw new Error("Portal base must use HTTPS.");
  }

  const url = new URL("/cart.php", base);
  url.searchParams.set("a", "add");
  url.searchParams.set("domain", "register");
  url.searchParams.set("query", `${validInput.name.toLowerCase()}${validInput.tld}`);
  return url.toString();
}
