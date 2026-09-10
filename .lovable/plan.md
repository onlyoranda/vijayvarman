# Resume Portfolio Dashboard

A light, calm personal portfolio site with a private admin area where you sign in and update everything yourself — no code changes needed.

Design direction chosen: **Sticky editorial rail** — your name, photo, contact buttons and quick facts stay pinned on the left while the content sections flow down the right along a soft curved "water flow" line.

## What visitors see

A single page at `/` in this order:

1. Profile summary + quick facts
2. Skills, as grouped chips
3. Work experience, newest first, with achievement bullets
4. Education
5. Awards & achievements
6. Certifications
7. Contact footer

Plus a prominent **Download resume** button (hidden if no resume uploaded yet), LinkedIn and email links.

Responsive behaviour:
- Desktop: sticky left rail, curved flow line behind the right column, cards gently offset.
- Tablet: simplified flow, single readable column.
- Mobile: one column, small curved arrow connectors between cards, 16–24px side padding.

Order stays the same for screen readers and keyboard use regardless of visual position. Animations stop for anyone who prefers reduced motion.

## What you get as the owner

- `/login` — sign in with your email (magic link or password).
- `/admin` — only your email gets in; anyone else sees "Access denied".
- Editors for profile, skills, work experience, education, awards, certifications — add, edit, delete and reorder entries.
- Resume upload: PDF only, max 10 MB, replaces the live download link when saved.
- Save confirmations and clear validation messages.

## Technical notes

- Built on the project's TanStack Start + Tailwind v4 stack (not Next.js as the document suggests) — same capabilities, this is what this project runs on.
- Backend: Lovable Cloud provides the database, email login and file storage.
- Tables: `profiles`, `skill_groups`, `skills`, `experience`, `education`, `awards`, `certifications`, each with `sort_order`; plus a roles table so admin rights are checked server-side, never from the browser.
- Public read access is limited to portfolio content; all writes and uploads require the owner account. Resume files live in a storage bucket with public read on the active file only.
- Design tokens from the chosen direction go into `src/styles.css`: canvas `#f6f9fc`, ink `#172033`, muted `#526075`, accent `#1677c8`, soft `#dff2ff`, line `#dce6f0`, Manrope loaded via a link tag in the root route.
- Decorative SVG flow paths are `aria-hidden`; one `h1` (your name); WCAG AA contrast.

## Build order

1. Design tokens, fonts, Lovable Cloud enabled, tables + storage bucket created with seed content.
2. Public dashboard: rail, flow line, all six sections, footer, mobile connectors.
3. Login page, admin guard, section editors, resume upload.
4. Responsive and accessibility pass at 320 / 375 / 768 / 1024 / 1440.

## Still needed from you

- Your real name, headline, location, contact email and LinkedIn link.
- The email address that should be the only admin login.
- Your resume PDF and a profile photo (optional — I'll use a generated placeholder portrait until you upload one).

Until you send these, I'll build with clearly-marked placeholder content you can replace in the admin area.
