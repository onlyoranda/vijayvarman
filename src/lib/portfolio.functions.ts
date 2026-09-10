import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileRow {
  id: string;
  first_name: string;
  headline: string | null;
  country: string | null;
  email: string | null;
  linkedin_url: string | null;
  profile_photo_url: string | null;
  summary_professional: string | null;
  summary_conversational: string | null;
  quick_facts: { label: string; value: string }[];
  resume_url_professional: string | null;
  resume_url_conversational: string | null;
}

export interface SkillGroup {
  id: string;
  name: string;
  sort_order: number;
  skills: { id: string; name: string }[];
}

export interface ExperienceRow {
  id: string;
  company: string;
  job_title: string;
  country: string | null;
  employment_type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  summary_professional: string | null;
  summary_conversational: string | null;
  achievements_professional: string[];
  achievements_conversational: string[];
  skills: string[];
  sort_order: number;
}

export interface EducationRow {
  id: string;
  institution: string;
  qualification: string;
  specialisation: string | null;
  start_date: string | null;
  end_date: string | null;
  description_professional: string | null;
  description_conversational: string | null;
  sort_order: number;
}

export interface AwardRow {
  id: string;
  title: string;
  issuer: string | null;
  date_awarded: string | null;
  description_professional: string | null;
  description_conversational: string | null;
  url: string | null;
  sort_order: number;
}

export interface CertificationRow {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  verification_url: string | null;
  sort_order: number;
}

export interface Portfolio {
  profile: ProfileRow;
  skillGroups: SkillGroup[];
  experience: ExperienceRow[];
  education: EducationRow[];
  awards: AwardRow[];
  certifications: CertificationRow[];
}

export const getPortfolio = createServerFn({ method: "GET" }).handler(
  async (): Promise<Portfolio> => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, headline, country, email, linkedin_url, profile_photo_url, summary_professional, summary_conversational, quick_facts, resume_url_professional, resume_url_conversational",
      )
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("Portfolio not set up yet");

    const [
      { data: groups },
      { data: skills },
      { data: experience },
      { data: education },
      { data: awards },
      { data: certifications },
    ] = await Promise.all([
      supabase
        .from("skill_groups")
        .select("id, name, sort_order")
        .eq("profile_id", profile.id)
        .order("sort_order"),
      supabase.from("skills").select("id, skill_group_id, name, sort_order").order("sort_order"),
      supabase
        .from("experience")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order"),
      supabase
        .from("education")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order"),
      supabase.from("awards").select("*").eq("profile_id", profile.id).order("sort_order"),
      supabase
        .from("certifications")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order"),
    ]);

    return {
      profile: profile as unknown as ProfileRow,
      skillGroups: (groups ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        sort_order: g.sort_order,
        skills: (skills ?? [])
          .filter((s) => s.skill_group_id === g.id)
          .map((s) => ({ id: s.id, name: s.name })),
      })),
      experience: (experience ?? []) as unknown as ExperienceRow[],
      education: (education ?? []) as unknown as EducationRow[],
      awards: (awards ?? []) as unknown as AwardRow[],
      certifications: (certifications ?? []) as unknown as CertificationRow[],
    };
  },
);
