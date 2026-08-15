# Component Contracts

## Page Model

Each indexable page owns one H1, a unique title and description, canonical URL, breadcrumb path, visible answer content, and a block list. Page blocks render in CMS order and unknown blocks fail safely without breaking the page.

## Required Blocks

| Block | Required fields | Notes |
| --- | --- | --- |
| Hero | eyebrow, title, summary, primary CTA | Optional secondary CTA and reused visual |
| Trust strip | compact proof items | Claims require approval state |
| Pricing grid | plan group, INR/USD prices | Must show period and checkout URL |
| Feature narrative | heading, body, items | Alternate media position by index |
| Infrastructure map | locations, summary | Use existing infrastructure SVGs where suitable |
| Performance proof | metrics, context | No unsupported benchmark claims |
| Testimonials | quote, name, context | Publish only approved testimonials |
| Partner logos | logo, name, URL | Preserve source asset attribution internally |
| Answer section | question, answer | Visible, concise, and page-specific |
| CTA | title, body, action | One primary conversion action |
| Rich text | structured content | Sanitize CMS HTML before rendering |
| Legal content | version date, sections | Preserve legal meaning and update date |

## Shared Interfaces

- Navigation and footer read from one `siteSettings` singleton.
- Currency controls toggle values already present in the HTML.
- External links use explicit labels and safe target attributes.
- Buttons accept only `primary`, `secondary`, or `quiet` variants.
- Every media component requires width, height, and alternative text.
- Every plan requires INR and USD pricing, period, renewal context, limits, and checkout URL.

## Runtime Behavior

- Published pages may be edge cached with stale-while-revalidate.
- Draft preview requests are `private, no-store`.
- Storyblok failures return local migration content where available.
- Unknown CMS blocks render a non-public diagnostic only in preview mode.
- Integrations load after consent and must not block first render.
