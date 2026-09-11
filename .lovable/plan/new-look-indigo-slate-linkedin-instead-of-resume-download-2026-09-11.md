# New look: Indigo Slate, LinkedIn instead of resume download

## What changes

1. **A new colour palette across the whole site.** The page moves from the current soft blue/navy look to "Indigo Slate": a crisp cool-grey canvas (#F7F8FB), near-black ink for text (#111827), indigo as the accent for links, buttons and the flowing line (#4338CA), and a pale grey-lilac for dividers and soft panels (#E2E5EF). Everything — cards, the sticky side rail, the tone switch, section titles, the curved flow line, the sign-in and admin screens — picks up the new colours automatically.

2. **A refreshed template feel to match.** Tighter, more structured cards with thin indigo hairlines, restrained rounded corners, an indigo-tinted rail, and clearer section headings. The layout (sticky rail, flowing cards, curved connector line, swaying titles, tone switch) stays exactly as it is.

3. **Download Resume becomes View LinkedIn.** Both resume download buttons — the one in the side rail and the one in the closing "get in touch" area — are replaced by a single "View LinkedIn" button that opens https://www.linkedin.com/in/vijayvarman in a new tab. Your LinkedIn address is saved with your profile, so you can change it later from your private admin area.

## What stays

- Only your first name and country are shown; no phone number or city.
- The Professional / Conversational tone switch and the gentle sway on section titles.
- Your private admin area, sign-in, and password reset.
- Resume files you upload stay stored and editable in the admin area; they simply are no longer offered as a public download button.

## Technical notes

- `src/styles.css`: replace the `:root` (and matching dark) colour tokens with the Indigo Slate values in `oklch`, including `--accent-soft` and `--line`. No component hardcodes colours, so the change propagates through the semantic tokens.
- `src/routes/index.tsx`: remove the two `<a href="/api/public/resume?tone=...">` download buttons and the `Download` icon import; render a `View LinkedIn` link using the existing `Linkedin` icon and `p.linkedin_url`, with `target="_blank" rel="noopener noreferrer"`. Adjust the closing copy that currently says "Download the resume or get in touch."
- Seed `linkedin_url` on the profile row to `https://www.linkedin.com/in/vijayvarman` via SQL.
- Leave `src/routes/api/public/resume.ts` and the admin resume uploader in place (unused publicly, still reachable by direct link).
- Card/rail styling tweaks are Tailwind class changes in `index.tsx` only.
- Verify with a build plus a browser pass at 375px and 1440px: colours applied, LinkedIn button opens the right URL, tone switch and sway still work.
