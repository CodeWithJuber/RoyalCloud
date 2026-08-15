/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_STORYBLOK_ACCESS_TOKEN?: string;
  readonly STORYBLOK_REGION?: string;
  readonly STORYBLOK_PREVIEW_SECRET?: string;
  readonly STORYBLOK_WEBHOOK_SECRET?: string;
  readonly INDEXNOW_KEY?: string;
  readonly INDEXNOW_KEY_LOCATION?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_WHMCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  zaraz?: {
    track: (name: string, properties?: Record<string, unknown>) => void;
  };
}
