# Executive Navy + Gold Visual Redesign

Re-skin the portfolio with a premium private-banking aesthetic. No changes to content, sections, layout structure, navigation, buttons, or functionality — colours, typography, and surface treatment only.

## Colour system (src/styles.css tokens)

Replace the current indigo accent across all design tokens:

- Primary / accent: navy `#102A43` (secondary navy `#173B5E` for hover and deep surfaces)
- Gold accent: `#B08D57` (sparingly — small rules, icons, avatar ring, hover accents), pale gold tint for subtle highlights
- Background: `#FAF9F6` (unchanged), cards: white
- Text: `#182230` primary, `#697586` secondary
- Borders/lines: `#E5E7EB`
- Focus rings, chart tones, and the rail tint updated to navy/gold to match

## Typography

- Keep the serif display font (Fraunces) for the name and major section headings — it already suits the executive brief
- Body/labels/buttons switch from Manrope to Inter (font link updated in `src/routes/__root.tsx`) for a restrained financial-services feel
- Headings in dark navy/charcoal; gold only in the thin rules and small accents already present

## Component-level changes (src/routes/index.tsx + styles)

- **Avatar:** deep navy circle keeping the "V" monogram, with a thin gold ring; photo variant gets the same gold ring. Remove the glow effect behind the hero avatar.
- **"View LinkedIn" buttons:** navy background, white text, hover shifts to secondary navy with a subtle gold accent.
- **Section titles & icons:** dark navy headings; the small gold rules under titles shift to the new gold tone.
- **Stats band:** numbers in navy, labels in secondary text, gold dividers kept subtle.
- **Skill chips & cards:** white cards, hairline borders, softer/flatter shadows, hover becomes gentle elevation with a navy/gold tint instead of indigo.
- **Flow line / connectors (desktop S-curve and mobile):** re-tinted from indigo to navy/gold.
- **Tone toggle & links:** navy interactive colour with gold hover accents; focus-visible rings in navy.
- **Typewriter headline & caret:** caret and accent word switch from indigo to gold/navy.

## Motion

- Keep the one-off gentle title sway (already subtle and reduced-motion safe).
- Remove/soften any glow or heavier hover effects; hover transitions become quick, gentle elevation and colour shifts only.
- No new animations added.

## Unchanged

- All content, sections, ordering, layout, tone toggle behaviour, LinkedIn URL, privacy rules, login/admin, resume storage.

## Verification

- Build passes; browser-check desktop (1440px) and mobile (375px): no purple/indigo remains, headings don't overflow on mobile, buttons remain tappable, tone toggle and sway still work, no console errors.

## Technical notes

- All work is token edits in `src/styles.css` plus class-name swaps in `src/routes/index.tsx` (indigo utilities → navy/gold tokens) and the font link in `src/routes/__root.tsx`. Token work was started in a previous session (palette tokens and Inter font token already updated); remaining work is the font link, leftover indigo/glow references, and verification. No schema, server-function, or route changes.
