import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type AdminContext = {
  supabase: any;
  userId: string;
};

async function isAdmin(supabase: AdminContext["supabase"], userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function requireAdmin(context: AdminContext) {
  if (!(await isAdmin(context.supabase, context.userId))) {
    throw new Error("Forbidden: this account is not the portfolio owner");
  }
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as AdminContext;
    return { isAdmin: await isAdmin(ctx.supabase, ctx.userId) };
  });

const profileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1).max(80),
  headline: z.string().max(200).nullable(),
  country: z.string().max(80).nullable(),
  email: z.string().email().max(200).nullable().or(z.literal("")),
  linkedin_url: z.string().url().max(500).nullable().or(z.literal("")),
  summary_professional: z.string().max(4000).nullable(),
  summary_conversational: z.string().max(4000).nullable(),
  quick_facts: z.array(z.object({ label: z.string().max(60), value: z.string().max(120) })).max(12),
});

// Email is not readable via the public/authenticated table grants, so the
// admin panel fetches it through the privileged client after a role check.
export const getProfileEmail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as AdminContext;
    await requireAdmin(ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { email: (data?.email as string | null) ?? null };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as AdminContext;
    await requireAdmin(ctx);
    const { error } = await ctx.supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        headline: data.headline,
        country: data.country,
        email: data.email || null,
        linkedin_url: data.linkedin_url || null,
        summary_professional: data.summary_professional,
        summary_conversational: data.summary_conversational,
        quick_facts: data.quick_facts,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const str = (max: number) => z.string().max(max).nullable().optional();
const dateStr = z.string().max(10).nullable().optional().or(z.literal("")).transform((v) => v || null);
const strList = z.array(z.string().max(500)).max(40).optional().default([]);

// Explicit per-table field allowlists: unknown keys are stripped, and
// server-controlled fields (id, profile_id, sort_order) are never accepted.
const rowSchemas = {
  experience: z.object({
    company: z.string().min(1).max(200),
    job_title: z.string().min(1).max(200),
    country: str(80),
    employment_type: str(80),
    start_date: dateStr,
    end_date: dateStr,
    is_current: z.boolean().optional().default(false),
    summary_professional: str(4000),
    summary_conversational: str(4000),
    achievements_professional: strList,
    achievements_conversational: strList,
    skills: strList,
  }),
  education: z.object({
    institution: z.string().min(1).max(200),
    qualification: z.string().min(1).max(200),
    specialisation: str(200),
    start_date: dateStr,
    end_date: dateStr,
    description_professional: str(4000),
    description_conversational: str(4000),
  }),
  awards: z.object({
    title: z.string().min(1).max(200),
    issuer: str(200),
    date_awarded: dateStr,
    description_professional: str(4000),
    description_conversational: str(4000),
    url: str(500),
  }),
  certifications: z.object({
    title: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    issue_date: dateStr,
    expiry_date: dateStr,
    credential_id: str(200),
    verification_url: str(500),
  }),
} as const;

function makeSectionSaver(table: keyof typeof rowSchemas) {
  const schema = z.object({
    profileId: z.string().uuid(),
    rows: z.array(rowSchemas[table]).max(100),
  });
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data) => schema.parse(data))
    .handler(async ({ data, context }) => {
      const ctx = context as AdminContext;
      await requireAdmin(ctx);
      const { error: delError } = await ctx.supabase
        .from(table)
        .delete()
        .eq("profile_id", data.profileId);
      if (delError) throw new Error(delError.message);
      if (data.rows.length > 0) {
        const rows = data.rows.map((row: Record<string, unknown>, i: number) => ({
          ...row,
          profile_id: data.profileId,
          sort_order: i,
        }));
        const { error } = await ctx.supabase.from(table).insert(rows);
        if (error) throw new Error(error.message);
      }
      return { ok: true };
    });
}

export const saveExperience = makeSectionSaver("experience");
export const saveEducation = makeSectionSaver("education");
export const saveAwards = makeSectionSaver("awards");
export const saveCertifications = makeSectionSaver("certifications");

const skillsSchema = z.object({
  profileId: z.string().uuid(),
  groups: z
    .array(z.object({ name: z.string().min(1).max(120), skills: z.array(z.string().min(1).max(120)).max(40) }))
    .max(20),
});

export const saveSkills = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => skillsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as AdminContext;
    await requireAdmin(ctx);
    const { error: delError } = await ctx.supabase
      .from("skill_groups")
      .delete()
      .eq("profile_id", data.profileId);
    if (delError) throw new Error(delError.message);
    for (const [i, group] of data.groups.entries()) {
      const { data: inserted, error } = await ctx.supabase
        .from("skill_groups")
        .insert({ profile_id: data.profileId, name: group.name, sort_order: i })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (group.skills.length > 0) {
        const { error: sErr } = await ctx.supabase
          .from("skills")
          .insert(group.skills.map((name, j) => ({ skill_group_id: inserted.id, name, sort_order: j })));
        if (sErr) throw new Error(sErr.message);
      }
    }
    return { ok: true };
  });

const resumePathSchema = z.object({
  profileId: z.string().uuid(),
  tone: z.enum(["professional", "conversational"]),
  path: z.string().max(300),
});

export const setResumePath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => resumePathSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as AdminContext;
    await requireAdmin(ctx);
    const column =
      data.tone === "professional" ? "resume_url_professional" : "resume_url_conversational";
    const { error } = await ctx.supabase
      .from("profiles")
      .update({ [column]: data.path })
      .eq("id", data.profileId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const profilePhotoPathSchema = z.object({
  profileId: z.string().uuid(),
  path: z.string().min(1).max(300),
});

export const setProfilePhotoPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => profilePhotoPathSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as AdminContext;
    await requireAdmin(ctx);
    const { error } = await ctx.supabase
      .from("profiles")
      .update({ profile_photo_url: data.path })
      .eq("id", data.profileId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
