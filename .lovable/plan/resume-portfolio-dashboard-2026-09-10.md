# Resume Portfolio Dashboard

A light, calm personal portfolio site with a private admin area where you sign in and update everything yourself — no code changes needed.

Design direction chosen: **Sticky editorial rail** — your first name, photo, contact buttons and quick facts stay pinned on the left while the content sections flow down the right along a soft curved "water flow" line.

## Privacy rules

- No phone number anywhere on the public site, and none stored for public display.
- No city or street-level location — country only (for example "United Kingdom").
- The big heading shows your **first name only**, never the full name. Full name is kept privately for the resume file itself.
- When a resume is uploaded, the country is read from the document automatically and used for the public location line; you can correct it in the admin area if it's read wrongly.

## Tone switch

A small toggle near the top lets a visitor switch the written copy between two tones of the same career history:

- **Professional** — formal, recruiter-standard phrasing.
- **Conversational** — warmer, plain-English phrasing.

Only wording changes; the sections, dates, employers and facts stay identical. Both versions are editable in the admin area, and each tone can point at its own resume PDF if you upload one. The choice is remembered on the visitor's device, and defaults to Professional.

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

Order stays the same for screen readers and keyboard use regardless of visual position. Animations stop for anyone who prefers reduced motion. The tone toggle is a proper keyboard-operable switch with a clear label.

Subtle motion: each section title (Profile Summary, Skills, Work Experience, Education, Awards & Achievements, Certifications) gets a very mild, slow sway — a small one-off wobble that plays as the title scrolls into view, not a continuous shake, and fully disabled under reduced-motion settings.



## What you get as the owner

- `/login` — sign in with your email (magic link or password).
- `/admin` — only your email gets in; anyone else sees "Access denied".
- Editors for profile, skills, work experience, education, awards, certifications — add, edit, delete and reorder entries.
- Each text field has a Professional and a Conversational version, edited side by side, with a "copy across" button when the wording is the same.
- Resume upload: PDF only, max 10 MB, replaces the live download link when saved. Optional second upload for the conversational tone.
- After upload, the detected country and detected first name are shown for confirmation before saving.
- Save confirmations and clear validation messages.

## Technical notes

- Built on the project's TanStack Start + Tailwind v4 stack (not Next.js as the document suggests) — same capabilities, this is what this project runs on.
- Backend: Lovable Cloud provides the database, email login and file storage.
- Tables: `profiles`, `skill_groups`, `skills`, `experience`, `education`, `awards`, `certifications`, each with `sort_order`; plus a roles table so admin rights are checked server-side, never from the browser.
- Tone handling: text columns are duplicated per tone (`summary_professional` / `summary_conversational`, and the same pattern for role summaries and achievement bullets), plus `resume_url_professional` / `resume_url_conversational`. A single `tone` value in the page state selects which set renders.
- Privacy: the profile stores `first_name` and `country` as the only public identity fields; no `phone` or `city` columns exist, so nothing private can leak through the public read policy. Resume parsing runs in a server function that extracts country and first name and discards the rest.
- Public read access is limited to portfolio content; all writes and uploads require the owner account. Resume files live in a storage bucket with public read on the active files only.
- Design tokens from the chosen direction go into `src/styles.css`: canvas `#f6f9fc`, ink `#172033`, muted `#526075`, accent `#1677c8`, soft `#dff2ff`, line `#dce6f0`, Manrope loaded via a link tag in the root route.
- Decorative SVG flow paths are `aria-hidden`; one `h1` (your first name); WCAG AA contrast.

## Build order

1. Design tokens, fonts, Lovable Cloud enabled, tables + storage bucket created with seed content in both tones.
2. Public dashboard: rail, flow line, all six sections, footer, mobile connectors, tone toggle.
3. Login page, admin guard, section editors with dual-tone fields, resume upload with country/first-name detection.
4. Responsive and accessibility pass at 320 / 375 / 768 / 1024 / 1440.

## Still needed from you

- Your first name, headline, contact email and LinkedIn link.
- The email address that should be the only admin login.
- Your resume PDF (country and first name will be read from it) and a profile photo — optional; I'll use a generated placeholder portrait until you upload one.

Until you send these, I'll build with clearly-marked placeholder content you can replace in the admin area.

