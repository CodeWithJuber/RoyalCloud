import cloudflare from "@astrojs/cloudflare";
import { storyblok } from "@storyblok/astro";
import { defineConfig } from "astro/config";

const storyblokToken = process.env.PUBLIC_STORYBLOK_ACCESS_TOKEN ?? "not-configured";

export default defineConfig({
  site: "https://royalclouds.net",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    storyblok({
      accessToken: storyblokToken,
      apiOptions: {
        region: process.env.STORYBLOK_REGION ?? "eu"
      },
      bridge: true,
      livePreview: true,
      enableFallbackComponent: true,
      customFallbackComponent: "storyblok/UnknownBlock"
    })
  ],
  security: {
    checkOrigin: true
  },
  vite: {
    build: {
      cssMinify: "lightningcss"
    }
  }
});
