# Editorial Spotlight redesign + LinkedIn check

## LinkedIn URL — already correct

The View LinkedIn button already opens your real profile, `https://www.linkedin.com/in/vijayvarman` — I confirmed it is saved with your profile and renders in both buttons. No placeholder remains; no change needed here.

## Creative redesign: Editorial Spotlight

The page keeps its structure (sticky side rail, flowing cards, tone switch, sway titles) but moves to a refined magazine look: warm paper canvas (#FAF9F6), near-black ink (#111827), indigo links and accents (#4338CA), and a gold highlight (#C9A84C) reserved for the stats band and key emphasis. Serif display headlines paired with the existing clean body font.

### 1. Hero with photo and typewriter headline
- The side rail becomes a framed hero card: your photo (uploadable from the existing admin area) in a soft indigo-glow frame, falling back to the current initial avatar if no photo is set.
- Under your name, the headline typewrites through 2–3 rotating phrases (e.g. "Financial Services Professional", "Claims & KYC Specialist"), pausing and deleting between phrases. Respects reduced-motion (shows static headline).

### 2. Animated stats band
- A gold-tinted strip below Profile Summary with animated count-up numbers when scrolled into view: years of experience (computed from earliest role), roles held, certifications, and awards. Numbers animate once, gently.

### 3. Skills constellation
- The skills card becomes an interactive visual cluster: skill chips arranged in organic size-varied groups where important skills are larger; hovering a group name highlights its skills with a soft indigo lift. Falls back to clean wrapping chips on mobile.

### 4. Editorial reveal animations
- Section headings switch to a large serif font with a thin gold rule.
- Cards fade-and-rise into place on scroll (one-off, staggered), with a gentle hover lift. All animations respect reduced-motion settings.

## What stays
- First name only, country only, no phone or city.
- Tone switch (Professional / Conversational), sway on titles, mobile connector line, admin area and sign-in unchanged.
- No public resume download button; LinkedIn and email remain the contact actions.

## Technical notes
- `src/styles.css`: new tokens — paper background, gold accent, serif display font (loaded via `<link>` in `src/routes/__root.tsx`, e.g. Fraunces or DM Serif Display), reveal/count-up keyframes.
- `src/lib/portfolio.functions.ts` / `index.tsx`: derive stats (years, counts) from existing fetched data — no schema changes.
- `src/routes/index.tsx`: hero rail with glow frame + `Typewriter` component, `StatsBand` with IntersectionObserver count-up, skills cluster layout, serif `SwayTitle` with gold rule, reveal-on-scroll wrapper.
- Photo: admin already supports profile photo upload field if present; otherwise reuse existing storage pattern. No new tables.
- Verify with build + browser pass at 375px and 1440px: animations fire once, reduced-motion respected, tone switch and sway still work, LinkedIn opens the correct URL.
