# Finish Editorial Spotlight: browser verification

The redesign code is complete and the build passes. Remaining step: verify it in the browser and fix anything that looks off.

## Steps
1. Browser pass at 1440px (desktop) and 375px (mobile):
   - Hero rail shows photo/avatar with soft indigo-glow frame; typewriter cycles headline phrases (static text when reduced-motion is on).
   - Gold stats band counts up once when scrolled into view (years, roles, certifications, awards).
   - Section titles render in serif with the thin gold rule and keep the gentle sway.
   - Cards fade-and-rise once on scroll; skill chips lift on group hover.
   - Tone switch (Professional / Conversational) still swaps text; View LinkedIn opens https://www.linkedin.com/in/vijayvarman.
2. Fix any visual or console issues found, then re-check the build.
