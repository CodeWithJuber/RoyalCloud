import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import compress from "astro-compress";
import type { AstroIntegration } from "astro";

import astrowind from "./vendor/integration";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (
  items: (() => AstroIntegration) | (() => AstroIntegration)[] = [],
) =>
  hasExternalScripts
    ? Array.isArray(items)
      ? items.map((item) => item())
      : [items()]
    : [];

export default defineConfig({
  output: "static",

  // Emit flat files (shared-hosting.html, not shared-hosting/index.html) so the
  // cloned pages keep the live site's extensionless URLs and their relative
  // `assets/...` references resolve to /assets/... exactly as on royalclouds.net.
  build: {
    format: "file",
    // Inline all CSS into the HTML — kills the render-blocking stylesheet
    // round-trips PageSpeed flags (the whole system is ~12KB gzipped).
    inlineStylesheets: "always",
  },

  integrations: [
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ["*"],
        logos: [
          "cloudflare",
          "cpanel",
          "cloudlinux",
          "intel",
          "letsencrypt",
          "ubuntu",
          "mysql",
          "php",
          "nginx",
          "wordpress-icon",
        ],
        "flat-color-icons": [
          "template",
          "gallery",
          "approval",
          "document",
          "advertising",
          "currency-exchange",
          "voice-presentation",
          "business-contact",
          "database",
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ["dataLayer.push"] },
      }),
    ),

    compress({
      CSS: true,
      HTML: true,
      Image: false, // images already optimized by Astro's Sharp pipeline
      JavaScript: true,
      SVG: true,
      Logger: 1,
    }),

    astrowind({
      config: "./src/config.yaml",
    }),
  ],

  image: {
    // Astro's default Sharp service handles local images.
    //
    // Most remote CDN images (Unsplash, Cloudinary, Imgix…) are routed by
    // src/components/common/Image.astro through `unpic`, which rewrites the
    // URL with CDN-side query parameters and serves it straight from the
    // provider — Astro never downloads it, so they don't need to be listed.
    //
    // `domains` only matters for remote URLs that fall through to Astro's
    // native <Image /> (i.e. providers Unpic can't detect, like Pixabay).
    // Listed entries are authorized to be processed by Sharp.
    domains: ["cdn.pixabay.com"],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  },
});
