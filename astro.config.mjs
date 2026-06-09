// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

// Production site URL — drives canonical URLs, sitemap and RSS.
export default defineConfig({
  site: "https://royalclouds.net",
  base: "/",
  trailingSlash: "ignore",
  integrations: [
    mdx(),
    icon({
      include: {
        lucide: ["*"],
        logos: [
          "cloudflare", "cpanel", "cloudlinux", "intel", "letsencrypt",
          "ubuntu", "mysql", "php", "nginx", "wordpress-icon",
        ],
      },
    }),
    sitemap({ filter: (page) => !page.includes("/admin") }),
  ],
  build: {
    // Emit /shared-hosting.html so URLs stay extensionless on Cloudflare.
    format: "file",
  },
});
