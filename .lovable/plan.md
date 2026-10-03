# Single-Tone Resume Import, Circle Pointer, and Mobile Motion

## What will change

- **One résumé upload and one professional profile:** Keep a single PDF upload in the owner area. Uploading it will extract the résumé text, securely parse it, and replace the profile summary, quick facts, skills, work history, education, awards, and certifications with the imported information.
- **Remove the conversational option:** Remove the public Professional/Conversational switch, the second résumé upload, and conversational editing fields. The public page and owner area will use professional content only. Existing conversational database values can remain unused, avoiding a destructive data migration.
- **Keep the circle pointer, remove magnification:** Retain the smooth fading circular pointer on mouse/trackpad devices, but remove word detection, enlargement, and copied text inside the circle. Native pointers remain on touch-only devices.
- **Restore mobile motion:** Make the existing typewriter headline, count-up figures, section-title sway, scroll reveals, and connector movement work reliably in mobile browsers. Replace desktop-only hover effects with subtle touch/scroll-driven equivalents where appropriate.

## Behavior and safeguards

- Continue showing only first name and country; imported phone numbers, email addresses, street addresses, cities, postcodes, and full names remain excluded.
- Show clear upload progress and a completion count; if parsing fails after storage, explain that the PDF was saved but page content was unchanged.
- Respect the device’s reduced-motion accessibility setting. Animations will run on normal mobile settings and remain disabled only when reduced motion is explicitly requested.
- Keep the Executive Navy + Gold styling, content sections, owner photo upload, LinkedIn actions, and navigation unchanged.

## Technical details

- Simplify the résumé parser contract and owner forms to professional fields only, while continuing to write through the existing protected import flow.
- Remove the tone context dependency from the public page and render professional summaries, achievements, education, and award descriptions directly.
- Simplify the custom pointer to position and fade one fixed-size circle using animation frames on precise pointers.
- Harden scroll-trigger observers for mobile WebKit/Chromium, add motion-safe CSS fallbacks, and ensure hidden pre-animation states cannot leave content invisible when observers are unavailable.

## Verification

- Upload a real PDF as the owner and confirm all supported sections refresh with professional content.
- Confirm no conversational toggle, second résumé upload, or conversational editor fields remain visible.
- Verify the circle follows a mouse without magnifying or displaying words.
- Test at mobile and desktop widths: typewriter, title sway, reveals, figures, and connectors animate without overlap or hidden content.
- Confirm reduced-motion mode shows all content clearly without motion, and check the latest build and browser console.
