// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

// Production site URL — drives canonical URLs, sitemap and RSS.
export default defineConfig({
  site: "https://royalclouds.net",
  base: "/",
  trailingSlash: "ignore",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/admin"),
    }),
  ],
  build: {
    // Emit /shared-hosting.html (not /shared-hosting/index.html) so URLs stay
    // extensionless and match the existing site structure on GitHub Pages.
    format: "file",
  },
});
