# Automatic Resume Import, Consistent Skills, and Photo Upload

## What will change

- **Automatic resume population:** After the owner uploads a professional PDF, extract its text and send it through the existing secure resume-import service. Replace the profile summary, quick facts, skills, work history, education, awards, and certifications with the imported details, including generated professional and conversational versions.
- **Clear import feedback:** Show an “Importing your resume…” state during processing, prevent duplicate uploads, and report how many sections were filled. If analysis fails after the PDF is stored, explain that the file uploaded but the page content was not changed.
- **Consistent skills presentation:** Remove the intentionally varied “constellation” font sizes. Display every skill with the same font size, weight, height, padding, and alignment, while preserving the existing Executive Navy + Gold appearance.
- **Profile photo upload:** Add a photo control to the Profile tab with preview, replacement, validation, and upload progress. Accept JPG, PNG, and WebP up to 5 MB, store one owner-managed image, and update the profile so the public page shows it immediately.

## Privacy and access

- Resume processing remains owner-only and keeps the existing rule excluding phone numbers, email addresses, street addresses, cities, and full names from public content.
- Photo uploads are writable only by the signed-in owner. Visitors can read only the selected public profile image.
- Existing navigation, sections, tone switch, LinkedIn action, and Executive Navy + Gold design remain unchanged.

## Technical details

- Reuse the existing PDF text extractor and `importResumeContent` server function; expose extracted text from the client helper instead of parsing the file twice.
- Create a dedicated public profile-photo storage bucket and narrow owner-write storage policies, then save its public URL through a protected admin function.
- Keep the import trigger on the professional resume upload. The generated conversational content powers the existing tone switch; the separate conversational PDF upload remains available without overwriting page content.
- Refresh the portfolio data after imports and photo changes so both the owner area and public profile reflect updates.

## Verification

- Test owner upload with a real PDF and confirm all populated sections plus both tones.
- Test photo upload/replacement and verify the image appears publicly.
- Check skills at mobile and desktop sizes for uniform typography and wrapping.
- Confirm invalid file types/sizes, upload failures, reduced-motion behavior, and the current build remain healthy.