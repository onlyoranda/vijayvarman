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

const sectionSchema = z.object({
  profileId: z.string().uuid(),
  rows: z.array(z.record(z.string(), z.unknown())),
});

function makeSectionSaver(
  table: "experience" | "education" | "awards" | "certifications" | "skill_groups",
) {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data) => sectionSchema.parse(data))
    .handler(async ({ data, context }) => {
      const ctx = context as AdminContext;
      await requireAdmin(ctx);
      const { error: delError } = await ctx.supabase
        .from(table)
        .delete()
        .eq("profile_id", data.profileId);
      if (delError) throw new Error(delError.message);
      if (data.rows.length > 0) {
        const rows = data.rows.map((row, i) => ({
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
