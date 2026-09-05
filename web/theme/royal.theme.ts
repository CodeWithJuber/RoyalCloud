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
    // 16px body is the one source of truth for the whole site: site.css
    // consumes --font-size-* / --text-* tokens and Astryx components read
    // the same scale (sm 13 · base 16 · lg 19 · xl 23 · 2xl 28 · 4xl 40).
    scale: {base: 16, ratio: 1.2},
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

    // ── Type pins the scale cannot express ───────────────────────────
    // Secondary text never drops below 14px; display sizes are fluid so
    // the same heading reads at 390, 917 and 1280 without media queries.
    '--text-supporting-size': '0.875rem',
    '--text-display-1-size': 'clamp(2.25rem, 4vw, 3.25rem)',
    '--text-display-1-weight': '700',
    '--text-display-1-leading': '1.05',
    '--text-display-2-size': 'clamp(1.75rem, 1.1rem + 2.6vw, 2.5rem)',
    '--text-display-2-weight': '700',
    '--text-display-2-leading': '1.12',
  },

  components: {
    button: {
      // Sizes are the touch policy for the whole site: md is the 44px floor,
      // lg (52px) is every conversion row (hero, CTA band, plan cards, mobile
      // bar), sm is chips and table cells. Astryx pins a fixed height per
      // size, so height is released and a min-height carries the floor.
      base: {
        borderRadius: '9999px',
        fontWeight: '700',
        height: 'auto',
        lineHeight: '1.2',
      },
      'size:sm': {
        minHeight: 'var(--spacing-9)',
        paddingInline: 'var(--spacing-4)',
        fontSize: 'var(--font-size-sm)',
      },
      'size:md': {
        minHeight: 'var(--spacing-11)',
        paddingInline: 'var(--spacing-6)',
        fontSize: 'var(--font-size-base)',
      },
      'size:lg': {
        minHeight: '3.25rem',
        paddingInline: 'var(--spacing-7)',
        fontSize: 'var(--font-size-base)',
      },
      // The conversion action: gold fill, night-ink label. Gold is the ONLY
      // conversion color in the brand system — it never appears elsewhere.
      'variant:primary': {
        backgroundColor: '#ffc94b',
        color: '#2f1c6a',
        '--color-accent': '#ffc94b',
        '--color-on-accent': '#2f1c6a',
        boxShadow: '0 10px 22px -10px #c8aa008c',
        ':hover': {backgroundColor: '#ffd97a'},
      },
      'variant:secondary': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border-emphasized)',
        backgroundColor: 'var(--color-background-card)',
        color: 'var(--color-text-primary)',
      },
    },
    badge: {
      base: {borderRadius: '9999px', fontWeight: '700'},
    },
    card: {
      // One card padding for the site (20px phones → 28px desktop), owned by
      // site.css :root as --rc-card-pad so native .card elements match.
      base: {borderRadius: '20px', padding: 'var(--rc-card-pad)'},
    },
  },

  // Brand icon set — semantic content names (server, bolt, …) → Lucide glyphs.
  // Sections render <Icon name="server">; the theme resolves the glyph.
  icons: royalIconRegistry,
});
