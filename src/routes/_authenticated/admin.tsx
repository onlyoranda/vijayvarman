import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageUp, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPortfolio } from "@/lib/portfolio.functions";
import {
  checkIsAdmin,
  getProfileEmail,
  updateProfile,
  saveSkills,
  saveExperience,
  saveEducation,
  saveAwards,
  saveCertifications,
  setResumePath,
  setProfilePhotoPath,
} from "@/lib/admin.functions";
import { detectFromResume } from "@/lib/resume-detect";
import { importResumeContent } from "@/lib/resume-import.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Resume Portfolio" },
      { name: "description", content: "Manage resume portfolio content." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Resume Portfolio" },
      { property: "og:description", content: "Manage resume portfolio content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const { data } = useQuery({ queryKey: ["portfolio"], queryFn: () => getPortfolio() });

  useEffect(() => {
    checkIsAdmin()
      .then((r) => setAllowed(r.isAdmin))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading admin…
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-extrabold text-foreground">Not authorised</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is not the portfolio owner. Please sign in with the owner account.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["portfolio"] });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Portfolio admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit each section, then press its Save button. Both tone versions live side by side.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-5">
            <ProfileEditor key={data.profile.id} data={data} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="skills" className="mt-5">
            <SkillsEditor key={JSON.stringify(data.skillGroups)} data={data} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="experience" className="mt-5">
            <ExperienceEditor key={JSON.stringify(data.experience)} data={data} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="education" className="mt-5">
            <EducationEditor key={JSON.stringify(data.education)} data={data} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="awards" className="mt-5">
            <AwardsEditor key={JSON.stringify(data.awards)} data={data} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="certifications" className="mt-5">
            <CertificationsEditor
              key={JSON.stringify(data.certifications)}
              data={data}
              onSaved={refresh}
            />
          </TabsContent>
          <TabsContent value="resumes" className="mt-5">
            <ResumeEditor key={data.profile.id + "r"} data={data} onSaved={refresh} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

type PortfolioData = NonNullable<Awaited<ReturnType<typeof getPortfolio>>>;

/* ---------------- Profile ---------------- */
function ProfileEditor({
  data,
  onSaved,
}: {
  data: PortfolioData;
  onSaved: () => void;
}) {
  const p = data.profile;
  const [form, setForm] = useState({
    first_name: p.first_name,
    headline: p.headline ?? "",
    country: p.country ?? "",
    email: "",
    linkedin_url: p.linkedin_url ?? "",
    summary_professional: p.summary_professional ?? "",
    summary_conversational: p.summary_conversational ?? "",
    quick_facts: p.quick_facts,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfileEmail()
      .then((r) => setForm((f) => ({ ...f, email: r.email ?? "" })))
      .catch(() => {});
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <ProfilePhotoUpload
        profileId={p.id}
        currentPath={p.profile_photo_url}
        firstName={p.first_name}
        onSaved={onSaved}
      />
      <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await updateProfile({
            data: {
              id: p.id,
              first_name: form.first_name,
              headline: form.headline || null,
              country: form.country || null,
              email: form.email || null,
              linkedin_url: form.linkedin_url || null,
              summary_professional: form.summary_professional || null,
              summary_conversational: form.summary_conversational || null,
              quick_facts: form.quick_facts,
            },
          });
          toast.success("Profile saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save profile");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name (shown publicly)">
          <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
        </Field>
        <Field label="Headline">
          <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </Field>
        <Field label="Country">
          <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="LinkedIn URL">
          <Input
            type="url"
            value={form.linkedin_url}
            onChange={(e) => set("linkedin_url", e.target.value)}
            placeholder="https://www.linkedin.com/in/…"
          />
        </Field>
      </div>
      <Field label="Summary — professional tone">
        <Textarea rows={4} value={form.summary_professional} onChange={(e) => set("summary_professional", e.target.value)} />
      </Field>
      <Field label="Summary — conversational tone">
        <Textarea rows={4} value={form.summary_conversational} onChange={(e) => set("summary_conversational", e.target.value)} />
      </Field>
      <div>
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Quick facts
        </Label>
        <div className="mt-2 space-y-2">
          {form.quick_facts.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label={`Quick fact ${i + 1} label`}
                value={f.label}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quick_facts: prev.quick_facts.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x,
                    ),
                  }))
                }
                placeholder="Label"
              />
              <Input
                aria-label={`Quick fact ${i + 1} value`}
                value={f.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quick_facts: prev.quick_facts.map((x, j) =>
                      j === i ? { ...x, value: e.target.value } : x,
                    ),
                  }))
                }
                placeholder="Value"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove quick fact ${i + 1}`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    quick_facts: prev.quick_facts.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                quick_facts: [...prev.quick_facts, { label: "", value: "" }],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add fact
          </Button>
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
      </form>
    </div>
  );
}

function ProfilePhotoUpload({
  profileId,
  currentPath,
  firstName,
  onSaved,
}: {
  profileId: string;
  currentPath: string | null;
  firstName: string;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentPath ? `/api/public/profile-photo?v=${encodeURIComponent(currentPath)}` : null,
  );

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  const onFile = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setBusy(true);
    try {
      const path = "profile-photo";
      const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });
      if (error) throw new Error(error.message);
      await setProfilePhotoPath({ data: { profileId, path } });
      setPreview(`/api/public/profile-photo?v=${Date.now()}`);
      toast.success("Profile photo updated");
      onSaved();
    } catch (err) {
      setPreview(currentPath ? `/api/public/profile-photo?v=${encodeURIComponent(currentPath)}` : null);
      toast.error(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-card p-6" aria-labelledby="profile-photo-title">
      <div className="flex flex-wrap items-center gap-5">
        {preview ? (
          <img src={preview} alt={`Profile preview for ${firstName}`} className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/60 ring-offset-4 ring-offset-card" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-2 ring-gold/60 ring-offset-4 ring-offset-card" aria-hidden="true">
            {firstName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 id="profile-photo-title" className="text-sm font-extrabold text-foreground">Profile photo</h2>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB.</p>
          <Label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <ImageUp className="h-4 w-4" aria-hidden="true" />
            {busy ? "Uploading…" : currentPath ? "Replace photo" : "Upload photo"}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              className="sr-only"
              aria-label="Upload profile photo"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
                e.target.value = "";
              }}
            />
          </Label>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Skills ---------------- */
function SkillsEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  const [groups, setGroups] = useState(
    data.skillGroups.map((g) => ({ name: g.name, skills: g.skills.map((s) => s.name) })),
  );
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await saveSkills({
            data: {
              profileId: data.profile.id,
              groups: groups
                .filter((g) => g.name.trim())
                .map((g) => ({
                  name: g.name.trim(),
                  skills: g.skills.map((s) => s.trim()).filter(Boolean),
                })),
            },
          });
          toast.success("Skills saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save skills");
        } finally {
          setSaving(false);
        }
      }}
    >
      {groups.map((g, i) => (
        <div key={i} className="rounded-xl border border-line p-4">
          <div className="flex gap-2">
            <Input
              aria-label={`Skill group ${i + 1} name`}
              value={g.name}
              onChange={(e) =>
                setGroups((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
              }
              placeholder="Group name"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove skill group ${i + 1}`}
              onClick={() => setGroups((prev) => prev.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Label className="mt-3 block text-xs text-muted-foreground">
            Skills (one per line)
          </Label>
          <Textarea
            rows={3}
            className="mt-1"
            value={g.skills.join("\n")}
            onChange={(e) =>
              setGroups((prev) =>
                prev.map((x, j) => (j === i ? { ...x, skills: e.target.value.split("\n") } : x)),
              )
            }
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setGroups((prev) => [...prev, { name: "", skills: [] }])}
        >
          <Plus className="mr-1 h-4 w-4" /> Add group
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save skills"}
        </Button>
      </div>
    </form>
  );
}

/* ---------------- generic row list helpers ---------------- */
function RowShell({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-foreground">{title}</p>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${title}`} onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

/* ---------------- Experience ---------------- */
interface ExpForm {
  company: string;
  job_title: string;
  country: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  summary_professional: string;
  summary_conversational: string;
  achievements_professional: string;
  achievements_conversational: string;
  skills: string;
}

function ExperienceEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  const empty: ExpForm = {
    company: "", job_title: "", country: "", employment_type: "", start_date: "",
    end_date: "", is_current: false, summary_professional: "", summary_conversational: "",
    achievements_professional: "", achievements_conversational: "", skills: "",
  };
  const [rows, setRows] = useState<ExpForm[]>(
    data.experience.map((x) => ({
      company: x.company, job_title: x.job_title, country: x.country ?? "",
      employment_type: x.employment_type ?? "", start_date: x.start_date ?? "",
      end_date: x.end_date ?? "", is_current: x.is_current,
      summary_professional: x.summary_professional ?? "",
      summary_conversational: x.summary_conversational ?? "",
      achievements_professional: x.achievements_professional.join("\n"),
      achievements_conversational: x.achievements_conversational.join("\n"),
      skills: x.skills.join("\n"),
    })),
  );
  const [saving, setSaving] = useState(false);
  const set = (i: number, k: keyof ExpForm, v: string | boolean) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await saveExperience({
            data: {
              profileId: data.profile.id,
              rows: rows.filter((r) => r.company.trim() && r.job_title.trim()).map((r) => ({
                company: r.company.trim(), job_title: r.job_title.trim(),
                country: r.country.trim() || null, employment_type: r.employment_type.trim() || null,
                start_date: r.start_date || null, end_date: r.is_current ? null : r.end_date || null,
                is_current: r.is_current,
                summary_professional: r.summary_professional || null,
                summary_conversational: r.summary_conversational || null,
                achievements_professional: r.achievements_professional.split("\n").map((s) => s.trim()).filter(Boolean),
                achievements_conversational: r.achievements_conversational.split("\n").map((s) => s.trim()).filter(Boolean),
                skills: r.skills.split("\n").map((s) => s.trim()).filter(Boolean),
              })),
            },
          });
          toast.success("Experience saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save experience");
        } finally {
          setSaving(false);
        }
      }}
    >
      {rows.map((r, i) => (
        <RowShell key={i} title={r.job_title || `Role ${i + 1}`} onRemove={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title"><Input value={r.job_title} onChange={(e) => set(i, "job_title", e.target.value)} /></Field>
            <Field label="Company"><Input value={r.company} onChange={(e) => set(i, "company", e.target.value)} /></Field>
            <Field label="Country"><Input value={r.country} onChange={(e) => set(i, "country", e.target.value)} /></Field>
            <Field label="Employment type"><Input value={r.employment_type} onChange={(e) => set(i, "employment_type", e.target.value)} placeholder="Full-time" /></Field>
            <Field label="Start date"><Input type="date" value={r.start_date} onChange={(e) => set(i, "start_date", e.target.value)} /></Field>
            <Field label="End date">
              <Input type="date" value={r.end_date} disabled={r.is_current} onChange={(e) => set(i, "end_date", e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input type="checkbox" checked={r.is_current} onChange={(e) => set(i, "is_current", e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
            Current role
          </label>
          <Field label="Summary — professional"><Textarea rows={2} value={r.summary_professional} onChange={(e) => set(i, "summary_professional", e.target.value)} /></Field>
          <Field label="Summary — conversational"><Textarea rows={2} value={r.summary_conversational} onChange={(e) => set(i, "summary_conversational", e.target.value)} /></Field>
          <Field label="Achievements — professional (one per line)"><Textarea rows={3} value={r.achievements_professional} onChange={(e) => set(i, "achievements_professional", e.target.value)} /></Field>
          <Field label="Achievements — conversational (one per line)"><Textarea rows={3} value={r.achievements_conversational} onChange={(e) => set(i, "achievements_conversational", e.target.value)} /></Field>
          <Field label="Skill tags (one per line)"><Textarea rows={2} value={r.skills} onChange={(e) => set(i, "skills", e.target.value)} /></Field>
        </RowShell>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { ...empty }])}>
          <Plus className="mr-1 h-4 w-4" /> Add role
        </Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save experience"}</Button>
      </div>
    </form>
  );
}

/* ---------------- Education ---------------- */
interface EduForm {
  institution: string; qualification: string; specialisation: string;
  start_date: string; end_date: string;
  description_professional: string; description_conversational: string;
}

function EducationEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  const empty: EduForm = {
    institution: "", qualification: "", specialisation: "", start_date: "",
    end_date: "", description_professional: "", description_conversational: "",
  };
  const [rows, setRows] = useState<EduForm[]>(
    data.education.map((x) => ({
      institution: x.institution, qualification: x.qualification, specialisation: x.specialisation ?? "",
      start_date: x.start_date ?? "", end_date: x.end_date ?? "",
      description_professional: x.description_professional ?? "",
      description_conversational: x.description_conversational ?? "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const set = (i: number, k: keyof EduForm, v: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await saveEducation({
            data: {
              profileId: data.profile.id,
              rows: rows.filter((r) => r.institution.trim() && r.qualification.trim()).map((r) => ({
                institution: r.institution.trim(), qualification: r.qualification.trim(),
                specialisation: r.specialisation.trim() || null,
                start_date: r.start_date || null, end_date: r.end_date || null,
                description_professional: r.description_professional || null,
                description_conversational: r.description_conversational || null,
              })),
            },
          });
          toast.success("Education saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save education");
        } finally {
          setSaving(false);
        }
      }}
    >
      {rows.map((r, i) => (
        <RowShell key={i} title={r.qualification || `Education ${i + 1}`} onRemove={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Qualification"><Input value={r.qualification} onChange={(e) => set(i, "qualification", e.target.value)} /></Field>
            <Field label="Institution"><Input value={r.institution} onChange={(e) => set(i, "institution", e.target.value)} /></Field>
            <Field label="Specialisation"><Input value={r.specialisation} onChange={(e) => set(i, "specialisation", e.target.value)} /></Field>
            <Field label="Start date"><Input type="date" value={r.start_date} onChange={(e) => set(i, "start_date", e.target.value)} /></Field>
            <Field label="End date"><Input type="date" value={r.end_date} onChange={(e) => set(i, "end_date", e.target.value)} /></Field>
          </div>
          <Field label="Description — professional"><Textarea rows={2} value={r.description_professional} onChange={(e) => set(i, "description_professional", e.target.value)} /></Field>
          <Field label="Description — conversational"><Textarea rows={2} value={r.description_conversational} onChange={(e) => set(i, "description_conversational", e.target.value)} /></Field>
        </RowShell>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { ...empty }])}>
          <Plus className="mr-1 h-4 w-4" /> Add education
        </Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save education"}</Button>
      </div>
    </form>
  );
}

/* ---------------- Awards ---------------- */
interface AwardForm {
  title: string; issuer: string; date_awarded: string; url: string;
  description_professional: string; description_conversational: string;
}

function AwardsEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  const empty: AwardForm = {
    title: "", issuer: "", date_awarded: "", url: "",
    description_professional: "", description_conversational: "",
  };
  const [rows, setRows] = useState<AwardForm[]>(
    data.awards.map((x) => ({
      title: x.title, issuer: x.issuer ?? "", date_awarded: x.date_awarded ?? "", url: x.url ?? "",
      description_professional: x.description_professional ?? "",
      description_conversational: x.description_conversational ?? "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const set = (i: number, k: keyof AwardForm, v: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await saveAwards({
            data: {
              profileId: data.profile.id,
              rows: rows.filter((r) => r.title.trim()).map((r) => ({
                title: r.title.trim(), issuer: r.issuer.trim() || null,
                date_awarded: r.date_awarded || null, url: r.url.trim() || null,
                description_professional: r.description_professional || null,
                description_conversational: r.description_conversational || null,
              })),
            },
          });
          toast.success("Awards saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save awards");
        } finally {
          setSaving(false);
        }
      }}
    >
      {rows.map((r, i) => (
        <RowShell key={i} title={r.title || `Award ${i + 1}`} onRemove={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={r.title} onChange={(e) => set(i, "title", e.target.value)} /></Field>
            <Field label="Issuer"><Input value={r.issuer} onChange={(e) => set(i, "issuer", e.target.value)} /></Field>
            <Field label="Date awarded"><Input type="date" value={r.date_awarded} onChange={(e) => set(i, "date_awarded", e.target.value)} /></Field>
            <Field label="Link (optional)"><Input type="url" value={r.url} onChange={(e) => set(i, "url", e.target.value)} /></Field>
          </div>
          <Field label="Description — professional"><Textarea rows={2} value={r.description_professional} onChange={(e) => set(i, "description_professional", e.target.value)} /></Field>
          <Field label="Description — conversational"><Textarea rows={2} value={r.description_conversational} onChange={(e) => set(i, "description_conversational", e.target.value)} /></Field>
        </RowShell>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { ...empty }])}>
          <Plus className="mr-1 h-4 w-4" /> Add award
        </Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save awards"}</Button>
      </div>
    </form>
  );
}

/* ---------------- Certifications ---------------- */
interface CertForm {
  title: string; issuer: string; issue_date: string; expiry_date: string;
  credential_id: string; verification_url: string;
}

function CertificationsEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  const empty: CertForm = {
    title: "", issuer: "", issue_date: "", expiry_date: "", credential_id: "", verification_url: "",
  };
  const [rows, setRows] = useState<CertForm[]>(
    data.certifications.map((x) => ({
      title: x.title, issuer: x.issuer, issue_date: x.issue_date ?? "",
      expiry_date: x.expiry_date ?? "", credential_id: x.credential_id ?? "",
      verification_url: x.verification_url ?? "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const set = (i: number, k: keyof CertForm, v: string) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await saveCertifications({
            data: {
              profileId: data.profile.id,
              rows: rows.filter((r) => r.title.trim() && r.issuer.trim()).map((r) => ({
                title: r.title.trim(), issuer: r.issuer.trim(),
                issue_date: r.issue_date || null, expiry_date: r.expiry_date || null,
                credential_id: r.credential_id.trim() || null,
                verification_url: r.verification_url.trim() || null,
              })),
            },
          });
          toast.success("Certifications saved");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not save certifications");
        } finally {
          setSaving(false);
        }
      }}
    >
      {rows.map((r, i) => (
        <RowShell key={i} title={r.title || `Certification ${i + 1}`} onRemove={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={r.title} onChange={(e) => set(i, "title", e.target.value)} /></Field>
            <Field label="Issuer"><Input value={r.issuer} onChange={(e) => set(i, "issuer", e.target.value)} /></Field>
            <Field label="Issue date"><Input type="date" value={r.issue_date} onChange={(e) => set(i, "issue_date", e.target.value)} /></Field>
            <Field label="Expiry date (optional)"><Input type="date" value={r.expiry_date} onChange={(e) => set(i, "expiry_date", e.target.value)} /></Field>
            <Field label="Credential ID (optional)"><Input value={r.credential_id} onChange={(e) => set(i, "credential_id", e.target.value)} /></Field>
            <Field label="Verification URL (optional)"><Input type="url" value={r.verification_url} onChange={(e) => set(i, "verification_url", e.target.value)} /></Field>
          </div>
        </RowShell>
      ))}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((prev) => [...prev, { ...empty }])}>
          <Plus className="mr-1 h-4 w-4" /> Add certification
        </Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save certifications"}</Button>
      </div>
    </form>
  );
}

/* ---------------- Resumes ---------------- */
function ResumeEditor({ data, onSaved }: { data: PortfolioData; onSaved: () => void }) {
  return (
    <div className="space-y-4">
      <ResumeUpload tone="professional" profileId={data.profile.id} currentPath={data.profile.resume_url_professional} onSaved={onSaved} />
      <ResumeUpload tone="conversational" profileId={data.profile.id} currentPath={data.profile.resume_url_conversational} onSaved={onSaved} />
      <p className="text-xs text-muted-foreground">
        If a tone has no resume uploaded, visitors downloading in that tone get the other one.
        Phone numbers and city details in the PDF itself are never shown on this site — the
        public page displays only your first name and country.
      </p>
    </div>
  );
}

function ResumeUpload({
  tone,
  profileId,
  currentPath,
  onSaved,
}: {
  tone: "professional" | "conversational";
  profileId: string;
  currentPath: string | null;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB");
      return;
    }
    setBusy(true);
    try {
      const path = `resume-${tone}.pdf`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
        upsert: true,
        contentType: "application/pdf",
      });
      if (upErr) throw new Error(upErr.message);
      await setResumePath({ data: { profileId, tone, path } });

      if (tone === "professional") {
        toast.loading("Importing your resume and creating both tones…", { id: "resume-import" });
        const detected = await detectFromResume(file);
        if (!detected.text.trim()) throw new Error("The PDF has no readable text.");
        const imported = await importResumeContent({ data: { profileId, text: detected.text } });
        const filled = Object.values(imported.counts).reduce((total, count) => total + count, 0);
        toast.success(`Resume imported. ${filled} items filled across the page.`, {
          id: "resume-import",
          duration: 8000,
        });
      } else {
        toast.success("Conversational resume uploaded");
      }
      onSaved();
    } catch (err) {
      toast.error(
        tone === "professional"
          ? `PDF uploaded, but page content was not changed: ${err instanceof Error ? err.message : "import failed"}`
          : err instanceof Error ? err.message : "Upload failed",
        { id: tone === "professional" ? "resume-import" : undefined, duration: 9000 },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="text-sm font-extrabold capitalize text-foreground">{tone} resume</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {currentPath ? "A resume is currently uploaded for this tone." : "No resume uploaded for this tone yet."}{" "}
        PDF only, up to 10 MB.
      </p>
      <div className="mt-3">
        <Input
          type="file"
          accept="application/pdf"
          disabled={busy}
          aria-label={`Upload ${tone} resume PDF`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
