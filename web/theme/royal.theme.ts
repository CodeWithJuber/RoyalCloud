/**
 * Royal Clouds theme — violet/gold hosting brand on the Astryx system.
 *
 * Extends the Neutral theme and only overrides what differs:
 *   - accent: Royal Clouds violet (#673de6 light / #9b85ff dark)
 *   - primary Button: gold conversion CTA (#ffc94b bg, night ink text)
 *   - type: DM Sans (body + heading), JetBrains Mono (code/data)
 *
 * Contrast notes (WCAG 2.1, verified in web/scripts/check-contrast.mjs):
 *   white on #673de6 = 6.20:1  ·  #2f1c6a on #ffc94b = 9.17:1
 *   #673de6 on #ffffff = 6.20:1 · #faf7ff on #2f1c6a = 14.05:1
 */

import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {royalIconRegistry} from './icons';

export const royalTheme = defineTheme({
  name: 'royal',
  extends: neutralTheme,

  typography: {
    scale: {base: 14, ratio: 1.2},
    body: {
      family: 'var(--font-dm-sans)',
      fallbacks: 'ui-sans-serif, system-ui, sans-serif',
    },
    heading: {
      family: 'var(--font-dm-sans)',
      fallbacks: 'ui-sans-serif, system-ui, sans-serif',
      weights: {1: '700', 2: '700', 3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'var(--font-jetbrains-mono)',
      fallbacks: 'ui-monospace, "SF Mono", Monaco, Consolas, monospace',
    },
  },

  // Slightly snappier than default — marketing-site feel.
  motion: {fast: 125, medium: 300, slow: 700, ratio: 0.75},

  tokens: {
    // ── Brand accent: violet ──────────────────────────────────────────
    '--color-accent': ['#673de6', '#9b85ff'],
    '--color-accent-muted': ['#673de622', '#9b85ff3D'],
    '--color-text-accent': ['#5025d1', '#b8a6ff'],
    '--color-icon-accent': ['#673de6', '#9b85ff'],

    // ── Surfaces: light-lavender canvas, white cards ─────────────────
    '--color-background-body': ['#faf7ff', '#17112b'],
    '--color-background-surface': ['#ffffff', '#241a45'],
    '--color-background-card': ['#ffffff', '#241a45'],
    '--color-background-popover': ['#ffffff', '#241a45'],
    '--color-background-muted': ['#f0edff', '#2c2154'],

    // ── Text ─────────────────────────────────────────────────────────
    '--color-text-primary': ['#2f1c6a', '#f4f1ff'],
    '--color-text-secondary': ['#595b68', '#b3b0c3'],

    // ── Borders: violet-tinted hairlines ─────────────────────────────
    '--color-border': ['#673de614', '#9b85ff26'],
    '--color-border-emphasized': ['#e9e4f7', '#453a75'],

    // ── Shadows: ink-violet tinted ───────────────────────────────────
    '--color-shadow': ['#2f1c6a1A', '#00000066'],

    // ── Status hues keep Astryx defaults; gold is reserved for CTAs ──
  },

  components: {
    button: {
      base: {
        borderRadius: '9999px',
        fontWeight: '700',
      },
      // The conversion action: gold fill, night-ink label. Gold is the ONLY
      // conversion color in the brand system — it never appears elsewhere.
      'variant:primary': {
        backgroundColor: '#ffc94b',
        color: '#2f1c6a',
        '--color-accent': '#ffc94b',
        '--color-on-accent': '#2f1c6a',
      },
      'variant:secondary': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border-emphasized)',
      },
    },
    badge: {
      base: {borderRadius: '9999px', fontWeight: '700'},
    },
    card: {
      base: {borderRadius: '20px'},
    },
  },

  // Brand icon set — semantic content names (server, bolt, …) → Lucide glyphs.
  // Sections render <Icon name="server">; the theme resolves the glyph.
  icons: royalIconRegistry,
});
