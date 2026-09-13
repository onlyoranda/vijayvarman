import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Ctx = { supabase: any; userId: string };

async function requireAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: this account is not the portfolio owner");
}

const inputSchema = z.object({
  profileId: z.string().uuid(),
  text: z.string().min(50).max(120000),
});

const parsedSchema = z.object({
  first_name: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  summary_professional: z.string().nullable().optional(),
  summary_conversational: z.string().nullable().optional(),
  quick_facts: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .default([]),
  skill_groups: z
    .array(z.object({ name: z.string(), skills: z.array(z.string()).default([]) }))
    .optional()
    .default([]),
  experience: z
    .array(
      z.object({
        company: z.string(),
        job_title: z.string(),
        country: z.string().nullable().optional(),
        employment_type: z.string().nullable().optional(),
        start_date: z.string().nullable().optional(),
        end_date: z.string().nullable().optional(),
        is_current: z.boolean().optional().default(false),
        summary_professional: z.string().nullable().optional(),
        summary_conversational: z.string().nullable().optional(),
        achievements_professional: z.array(z.string()).optional().default([]),
        achievements_conversational: z.array(z.string()).optional().default([]),
        skills: z.array(z.string()).optional().default([]),
      }),
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        qualification: z.string(),
        specialisation: z.string().nullable().optional(),
        start_date: z.string().nullable().optional(),
        end_date: z.string().nullable().optional(),
        description_professional: z.string().nullable().optional(),
        description_conversational: z.string().nullable().optional(),
      }),
    )
    .optional()
    .default([]),
  awards: z
    .array(
      z.object({
        title: z.string(),
        issuer: z.string().nullable().optional(),
        date_awarded: z.string().nullable().optional(),
        description_professional: z.string().nullable().optional(),
        description_conversational: z.string().nullable().optional(),
      }),
    )
    .optional()
    .default([]),
  certifications: z
    .array(
      z.object({
        title: z.string(),
        issuer: z.string(),
        issue_date: z.string().nullable().optional(),
        expiry_date: z.string().nullable().optional(),
        credential_id: z.string().nullable().optional(),
        verification_url: z.string().nullable().optional(),
      }),
    )
    .optional()
    .default([]),
});

const SYSTEM = `You convert a resume/CV into structured JSON for a public professional portfolio site.

Rules:
- Output ONLY a JSON object. No markdown fences, no commentary.
- PRIVACY: never include phone numbers, street addresses, city/town names, postcodes or email addresses anywhere in the output. Location is ONLY the country name (e.g. "United Kingdom").
- first_name: the person's first name only.
- headline: a short senior-level professional title (max 100 chars).
- Write EVERY text field twice: "*_professional" in formal third-person-free executive tone, and "*_conversational" as the same facts told warmly in first person ("I led...", plain language, friendly but credible). Never leave a conversational field empty when a professional one exists.
- summary_professional / summary_conversational: 3-5 sentences each.
- quick_facts: up to 4 short label/value pairs (e.g. "Experience" / "12+ years"). No contact details.
- Dates use "YYYY-MM-DD" (use the 1st of the month when only month/year is known) or null.
- skill_groups: 3-6 themed groups with concise skill names.
- Keep achievements as short bullet strings, max 6 per role.`;

function collectText(node: unknown, out: string[]) {
  if (typeof node === "string") return;
  if (Array.isArray(node)) {
    for (const n of node) collectText(n, out);
    return;
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o["text"] === "string") out.push(o["text"] as string);
    for (const v of Object.values(o)) collectText(v, out);
  }
}

function extractJson(raw: string) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI response did not contain readable resume data.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export const importResumeContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    await requireAdmin(ctx);

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Resume text:\n\n${data.text.slice(0, 60000)}` },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("The AI service is busy right now — please try again in a minute.");
      if (res.status === 402) throw new Error("AI credits are exhausted. Add credits in Lovable to keep using resume import.");
      if (res.status === 403) throw new Error("AI access is blocked for this workspace.");
      throw new Error(`Resume analysis failed (${res.status}). ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    let raw = typeof json["output_text"] === "string" ? (json["output_text"] as string) : "";
    if (!raw) {
      const parts: string[] = [];
      collectText(json["output"], parts);
      raw = parts.join("\n");
    }
    const parsed = parsedSchema.parse(extractJson(raw));

    const profileId = data.profileId;
    const profileUpdate: Record<string, unknown> = {};
    if (parsed.first_name) profileUpdate["first_name"] = parsed.first_name.slice(0, 80);
    if (parsed.headline) profileUpdate["headline"] = parsed.headline.slice(0, 200);
    if (parsed.country) profileUpdate["country"] = parsed.country.slice(0, 80);
    if (parsed.summary_professional) profileUpdate["summary_professional"] = parsed.summary_professional.slice(0, 4000);
    if (parsed.summary_conversational)
      profileUpdate["summary_conversational"] = parsed.summary_conversational.slice(0, 4000);
    if (parsed.quick_facts.length > 0) profileUpdate["quick_facts"] = parsed.quick_facts.slice(0, 6);

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await ctx.supabase.from("profiles").update(profileUpdate).eq("id", profileId);
      if (error) throw new Error(error.message);
    }

    const replace = async (table: string, rows: Record<string, unknown>[]) => {
      if (rows.length === 0) return 0;
      const { error: delErr } = await ctx.supabase.from(table).delete().eq("profile_id", profileId);
      if (delErr) throw new Error(delErr.message);
      const { error } = await ctx.supabase
        .from(table)
        .insert(rows.map((r, i) => ({ ...r, profile_id: profileId, sort_order: i })));
      if (error) throw new Error(error.message);
      return rows.length;
    };

    const experienceCount = await replace(
      "experience",
      parsed.experience.map((e) => ({
        company: e.company,
        job_title: e.job_title,
        country: e.country ?? null,
        employment_type: e.employment_type ?? null,
        start_date: e.start_date ?? null,
        end_date: e.end_date ?? null,
        is_current: e.is_current ?? false,
        summary_professional: e.summary_professional ?? null,
        summary_conversational: e.summary_conversational ?? e.summary_professional ?? null,
        achievements_professional: e.achievements_professional,
        achievements_conversational:
          e.achievements_conversational.length > 0 ? e.achievements_conversational : e.achievements_professional,
        skills: e.skills,
      })),
    );

    const educationCount = await replace(
      "education",
      parsed.education.map((e) => ({
        institution: e.institution,
        qualification: e.qualification,
        specialisation: e.specialisation ?? null,
        start_date: e.start_date ?? null,
        end_date: e.end_date ?? null,
        description_professional: e.description_professional ?? null,
        description_conversational: e.description_conversational ?? e.description_professional ?? null,
      })),
    );

    const awardCount = await replace(
      "awards",
      parsed.awards.map((a) => ({
        title: a.title,
        issuer: a.issuer ?? null,
        date_awarded: a.date_awarded ?? null,
        description_professional: a.description_professional ?? null,
        description_conversational: a.description_conversational ?? a.description_professional ?? null,
      })),
    );

    const certCount = await replace(
      "certifications",
      parsed.certifications.map((c) => ({
        title: c.title,
        issuer: c.issuer,
        issue_date: c.issue_date ?? null,
        expiry_date: c.expiry_date ?? null,
        credential_id: c.credential_id ?? null,
        verification_url: c.verification_url ?? null,
      })),
    );

    let skillCount = 0;
    if (parsed.skill_groups.length > 0) {
      const { error: delErr } = await ctx.supabase.from("skill_groups").delete().eq("profile_id", profileId);
      if (delErr) throw new Error(delErr.message);
      for (const [i, group] of parsed.skill_groups.slice(0, 20).entries()) {
        const { data: inserted, error } = await ctx.supabase
          .from("skill_groups")
          .insert({ profile_id: profileId, name: group.name.slice(0, 120), sort_order: i })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        const skills = group.skills.slice(0, 40);
        if (skills.length > 0) {
          const { error: sErr } = await ctx.supabase.from("skills").insert(
            skills.map((name, j) => ({ skill_group_id: inserted.id, name: name.slice(0, 120), sort_order: j })),
          );
          if (sErr) throw new Error(sErr.message);
          skillCount += skills.length;
        }
      }
    }

    return {
      ok: true,
      counts: {
        experience: experienceCount,
        education: educationCount,
        awards: awardCount,
        certifications: certCount,
        skills: skillCount,
        skillGroups: parsed.skill_groups.length,
      },
    };
  });
