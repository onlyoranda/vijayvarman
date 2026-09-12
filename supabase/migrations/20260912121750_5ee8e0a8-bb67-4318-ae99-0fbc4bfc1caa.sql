-- Revoke table-level SELECT from authenticated (it covers the email column)
revoke select on public.profiles from authenticated;

-- Re-grant column-level SELECT excluding email
grant select (id, first_name, headline, country, linkedin_url, profile_photo_url, summary_professional, summary_conversational, quick_facts, resume_url_professional, resume_url_conversational, updated_at) on public.profiles to authenticated;