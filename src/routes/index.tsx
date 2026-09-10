import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Briefcase, Download, GraduationCap, Linkedin, Mail, MapPin, Medal, Sparkles, User, Wrench } from "lucide-react";
import { getPortfolio, type Portfolio } from "@/lib/portfolio.functions";
import { ToneProvider, useTone } from "@/lib/tone";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vijayavarman — Resume Portfolio" },
      {
        name: "description",
        content:
          "Resume portfolio of Vijayavarman — financial services and customer operations professional covering claims, KYC/AML, CRM platforms, education, awards and certifications.",
      },
      { property: "og:title", content: "Vijayavarman — Resume Portfolio" },
      {
        property: "og:description",
        content:
          "Financial services and customer operations professional — skills, work experience, education, awards and certifications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <ToneProvider>
      <PortfolioView />
    </ToneProvider>
  );
}

/* ---------- scroll-into-view sway ---------- */
function SwayTitle({
  icon,
  children,
  id,
}: {
  icon: ReactNode;
  children: ReactNode;
  id: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [swayed, setSwayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSwayed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2
      ref={ref}
      id={id}
      className={`flex scroll-mt-6 items-center gap-2.5 text-lg font-extrabold tracking-tight text-foreground sm:text-xl ${
        swayed ? "animate-title-sway" : ""
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-primary">
        {icon}
      </span>
      {children}
    </h2>
  );
}

/* ---------- decorative flow line behind the content column ---------- */
function FlowLine() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-full md:block"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
    >
      <path
        d="M 18 0 C 60 90, -30 180, 18 300 C 66 420, -30 520, 18 640 C 60 760, -20 860, 18 1000"
        fill="none"
        stroke="var(--color-primary)"
        strokeOpacity="0.18"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function MobileConnector({ first }: { first?: boolean }) {
  if (first) return null;
  return (
    <div aria-hidden="true" className="ml-5 flex h-10 items-start md:hidden">
      <div className="h-full w-px border-l-2 border-dashed border-primary/30" />
    </div>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-7">{children}</div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

function formatRange(start: string | null, end: string | null, current?: boolean) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const s = start ? fmt(start) : null;
  const e = current ? "Present" : end ? fmt(end) : null;
  if (s && e) return `${s} — ${e}`;
  return s ?? e ?? "";
}

/* ---------- tone toggle ---------- */
function ToneToggle() {
  const { tone, setTone } = useTone();
  const conversational = tone === "conversational";
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="flex items-center gap-3 rounded-full border border-line bg-card px-4 py-2.5 shadow-lg">
        <span
          className={`text-xs font-bold ${!conversational ? "text-primary" : "text-muted-foreground"}`}
        >
          Professional
        </span>
        <Switch
          checked={conversational}
          onCheckedChange={(checked) => setTone(checked ? "conversational" : "professional")}
          aria-label="Switch between professional and conversational resume tone"
        />
        <span
          className={`text-xs font-bold ${conversational ? "text-primary" : "text-muted-foreground"}`}
        >
          Conversational
        </span>
      </div>
    </div>
  );
}

/* ---------- main view ---------- */
function PortfolioView() {
  const { data } = useQuery({ queryKey: ["portfolio"], queryFn: () => getPortfolio() });
  const { tone } = useTone();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading portfolio…
      </div>
    );
  }

  const p = data.profile;
  const summary = tone === "professional" ? p.summary_professional : p.summary_conversational;

  const hasAnyAwards = data.awards.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-[320px_minmax(0,1fr)] md:gap-12 lg:px-10">
        {/* ------- sticky editorial rail ------- */}
        <aside className="md:sticky md:top-10 md:self-start">
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            {p.profile_photo_url ? (
              <img
                src={p.profile_photo_url}
                alt={`Profile photo of ${p.first_name}`}
                className="h-20 w-20 rounded-full border border-line object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-primary-foreground"
              >
                {p.first_name.charAt(0)}
              </div>
            )}
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
              {p.first_name}
            </h1>
            {p.headline && <p className="mt-1 text-sm font-semibold text-primary">{p.headline}</p>}
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.country && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {p.country}
                </li>
              )}
              {p.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${p.email}`} className="story-link break-all text-foreground">
                    {p.email}
                  </a>
                </li>
              )}
              {p.linkedin_url && (
                <li className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="story-link text-foreground"
                  >
                    LinkedIn profile
                  </a>
                </li>
              )}
            </ul>
            {p.quick_facts.length > 0 && (
              <dl className="mt-5 space-y-2 border-t border-line pt-4">
                {p.quick_facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-bold text-foreground">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a
              href={`/api/public/resume?tone=${tone}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Resume
            </a>
          </div>
        </aside>

        {/* ------- flowing content column ------- */}
        <main className="relative">
          <FlowLine />
          <div className="relative">
            <MobileConnector first />
            <section aria-labelledby="profile-summary" className="scroll-mt-6">
              <SwayTitle id="profile-summary" icon={<User className="h-4 w-4" aria-hidden="true" />}>
                Profile Summary
              </SwayTitle>
              <div className="mt-4">
                <SectionCard>
                  <p className="leading-relaxed text-foreground/90">{summary}</p>
                </SectionCard>
              </div>
            </section>

            <MobileConnector />
            <SkillsSection groups={data.skillGroups} />

            <MobileConnector />
            <ExperienceSection rows={data.experience} tone={tone} />

            <MobileConnector />
            <EducationSection rows={data.education} tone={tone} />

            {hasAnyAwards && (
              <>
                <MobileConnector />
                <AwardsSection rows={data.awards} tone={tone} />
              </>
            )}

            {data.certifications.length > 0 && (
              <>
                <MobileConnector />
                <CertificationsSection rows={data.certifications} />
              </>
            )}

            <footer className="mt-12 rounded-2xl border border-line bg-accent-soft/60 p-6 text-center sm:p-8">
              <p className="text-sm font-semibold text-foreground">
                Want the full picture? Download the resume or get in touch.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`/api/public/resume?tone=${tone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Resume
                </a>
                {p.email && (
                  <a
                    href={`mailto:${p.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {p.email}
                  </a>
                )}
                {p.linkedin_url && (
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                {p.first_name}
                {p.country ? ` · ${p.country}` : ""}
              </p>
            </footer>
          </div>
        </main>
      </div>
      <ToneToggle />
    </div>
  );
}

function SkillsSection({ groups }: { groups: Portfolio["skillGroups"] }) {
  return (
    <section aria-labelledby="skills" className="scroll-mt-6">
      <SwayTitle id="skills" icon={<Wrench className="h-4 w-4" aria-hidden="true" />}>
        Skills
      </SwayTitle>
      <div className="mt-4">
        <SectionCard>
          <div className="grid gap-5 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id}>
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                  {g.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <Chip key={s.id}>{s.name}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}

function ExperienceSection({
  rows,
  tone,
}: {
  rows: Portfolio["experience"];
  tone: "professional" | "conversational";
}) {
  return (
    <section aria-labelledby="work-experience" className="scroll-mt-6">
      <SwayTitle id="work-experience" icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}>
        Work Experience
      </SwayTitle>
      <div className="mt-4 space-y-4">
        {rows.map((job) => {
          const summary = tone === "professional" ? job.summary_professional : job.summary_conversational;
          const achievements =
            tone === "professional" ? job.achievements_professional : job.achievements_conversational;
          return (
            <SectionCard key={job.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-extrabold text-foreground">{job.job_title}</h3>
                <p className="text-xs font-bold text-primary">
                  {formatRange(job.start_date, job.end_date, job.is_current)}
                </p>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-muted-foreground">
                {job.company}
                {job.country ? ` · ${job.country}` : ""}
                {job.employment_type ? ` · ${job.employment_type}` : ""}
              </p>
              {summary && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{summary}</p>}
              {achievements.length > 0 && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
                  {achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
              {job.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>
    </section>
  );
}

function EducationSection({
  rows,
  tone,
}: {
  rows: Portfolio["education"];
  tone: "professional" | "conversational";
}) {
  return (
    <section aria-labelledby="education" className="scroll-mt-6">
      <SwayTitle id="education" icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}>
        Education
      </SwayTitle>
      <div className="mt-4 space-y-4">
        {rows.map((ed) => {
          const desc =
            tone === "professional" ? ed.description_professional : ed.description_conversational;
          return (
            <SectionCard key={ed.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-extrabold text-foreground">{ed.qualification}</h3>
                <p className="text-xs font-bold text-primary">
                  {formatRange(ed.start_date, ed.end_date)}
                </p>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-muted-foreground">
                {ed.institution}
                {ed.specialisation ? ` · ${ed.specialisation}` : ""}
              </p>
              {desc && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{desc}</p>}
            </SectionCard>
          );
        })}
      </div>
    </section>
  );
}

function AwardsSection({
  rows,
  tone,
}: {
  rows: Portfolio["awards"];
  tone: "professional" | "conversational";
}) {
  return (
    <section aria-labelledby="awards" className="scroll-mt-6">
      <SwayTitle id="awards" icon={<Medal className="h-4 w-4" aria-hidden="true" />}>
        Awards &amp; Achievements
      </SwayTitle>
      <div className="mt-4 space-y-4">
        {rows.map((a) => {
          const desc =
            tone === "professional" ? a.description_professional : a.description_conversational;
          return (
            <SectionCard key={a.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-extrabold text-foreground">{a.title}</h3>
                {a.date_awarded && (
                  <p className="text-xs font-bold text-primary">
                    {new Date(a.date_awarded).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              {a.issuer && (
                <p className="mt-0.5 text-sm font-semibold text-muted-foreground">{a.issuer}</p>
              )}
              {desc && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{desc}</p>}
              {a.url && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="story-link mt-2 inline-block text-sm font-semibold text-primary"
                >
                  Learn more
                </a>
              )}
            </SectionCard>
          );
        })}
      </div>
    </section>
  );
}

function CertificationsSection({ rows }: { rows: Portfolio["certifications"] }) {
  return (
    <section aria-labelledby="certifications" className="scroll-mt-6">
      <SwayTitle id="certifications" icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}>
        Certifications
      </SwayTitle>
      <div className="mt-4">
        <SectionCard>
          <ul className="divide-y divide-line">
            {rows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-extrabold text-foreground">{c.title}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{c.issuer}</p>
                </div>
                <div className="flex items-center gap-3">
                  {c.issue_date && (
                    <p className="text-xs font-bold text-primary">
                      {new Date(c.issue_date).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })}
                      {c.expiry_date
                        ? ` — ${new Date(c.expiry_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                  )}
                  {c.verification_url && (
                    <a
                      href={c.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="story-link text-xs font-bold text-primary"
                    >
                      Verify
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </section>
  );
}
