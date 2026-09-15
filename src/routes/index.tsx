import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Briefcase, GraduationCap, Linkedin, Lock, MapPin, Medal, Sparkles, User, Wrench } from "lucide-react";
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
      <MagnifyingCursor />
    </ToneProvider>
  );
}

function MagnifyingCursor() {
  const lensRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion()) return;
    const lens = lensRef.current;
    const word = wordRef.current;
    if (!lens || !word) return;

    let frame = 0;
    const readWord = (event: PointerEvent) => {
      const caret = document.caretPositionFromPoint?.(event.clientX, event.clientY);
      const text = caret?.offsetNode.textContent ?? "";
      const offset = caret?.offset ?? 0;
      const left = text.slice(0, offset).match(/[\p{L}\p{N}'’&/+.-]+$/u)?.[0] ?? "";
      const right = text.slice(offset).match(/^[\p{L}\p{N}'’&/+.-]+/u)?.[0] ?? "";
      return `${left}${right}`.slice(0, 28);
    };
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        lens.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
        const text = readWord(event);
        word.textContent = text;
        lens.dataset.magnifying = text ? "true" : "false";
        lens.dataset.visible = "true";
      });
    };
    const leave = () => { lens.dataset.visible = "false"; };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={lensRef} className="magnifying-cursor" data-visible="false" data-magnifying="false" aria-hidden="true">
      <span ref={wordRef} />
    </div>
  );
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- one-off reveal on scroll ---------- */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
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
    if (reducedMotion()) return;
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
      className={`flex scroll-mt-6 items-center gap-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl ${
        swayed ? "animate-title-sway" : ""
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
        {icon}
      </span>
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="h-px min-w-8 flex-1 bg-gradient-to-r from-gold/70 to-transparent"
      />
    </h2>
  );
}

/* ---------- typewriter headline ---------- */
function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(phrases[0] ?? "");

  useEffect(() => {
    if (phrases.length <= 1 || reducedMotion()) return;
    let phraseIndex = 0;
    let charIndex = (phrases[0] ?? "").length;
    let deleting = true;
    let timer: number;

    const tick = () => {
      const current = phrases[phraseIndex] ?? "";
      if (deleting) {
        charIndex -= 1;
        setText(current.slice(0, Math.max(0, charIndex)));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          timer = window.setTimeout(tick, 350);
          return;
        }
        timer = window.setTimeout(tick, 30);
      } else {
        charIndex += 1;
        setText(current.slice(0, charIndex));
        if (charIndex >= current.length) {
          deleting = true;
          timer = window.setTimeout(tick, 2400);
          return;
        }
        timer = window.setTimeout(tick, 55);
      }
    };

    timer = window.setTimeout(tick, 2600);
    return () => window.clearTimeout(timer);
  }, [phrases]);

  return (
    <span>
      {text}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-4 w-0.5 animate-caret-blink bg-gold align-middle"
      />
    </span>
  );
}

/* ---------- animated stats band ---------- */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return value;
}

function Stat({ target, label, active }: { target: number; label: string; active: boolean }) {
  const value = useCountUp(target, active);
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
        {value}
        <span className="text-gold">+</span>
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function StatsBand({ data }: { data: Portfolio }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const earliest = data.experience
    .map((j) => j.start_date)
    .filter((d): d is string => Boolean(d))
    .sort()[0];
  const years = earliest
    ? Math.max(1, Math.floor((Date.now() - new Date(earliest).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 0;

  const stats: { target: number; label: string }[] = [];
  if (years > 0) stats.push({ target: years, label: "Years Experience" });
  if (data.experience.length > 0) stats.push({ target: data.experience.length, label: "Roles Held" });
  if (data.certifications.length > 0)
    stats.push({ target: data.certifications.length, label: "Certifications" });
  if (data.awards.length > 0) stats.push({ target: data.awards.length, label: "Awards" });
  if (stats.length === 0) return null;

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-4 rounded-2xl border border-gold/40 bg-gold-soft p-5 shadow-sm sm:grid-cols-4 sm:p-6"
    >
      {stats.map((s) => (
        <Stat key={s.label} target={s.target} label={s.label} active={active} />
      ))}
    </div>
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
    <div aria-hidden="true" className="ml-6 flex h-12 items-stretch md:hidden">
      <div className="w-0.5 rounded-full bg-gradient-to-b from-primary/40 via-gold/50 to-primary/40" />
      <div className="-ml-[5px] mt-4 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gold/70 bg-card" />
    </div>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7">
      {children}
    </div>
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

  const headlinePhrases = [
    ...(p.headline ? [p.headline] : []),
    "Financial Services Professional",
    "Claims, KYC & Customer Operations",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-[320px_minmax(0,1fr)] md:gap-12 lg:px-10">
        {/* ------- sticky editorial rail ------- */}
        <aside className="md:sticky md:top-10 md:self-start">
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="inline-block rounded-full ring-2 ring-gold/60 ring-offset-4 ring-offset-card">
              {p.profile_photo_url ? (
                <img
                  src={`/api/public/profile-photo?v=${encodeURIComponent(p.profile_photo_url)}`}
                  alt={`Profile photo of ${p.first_name}`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-primary-foreground"
                >
                  {p.first_name.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
              {p.first_name}
            </h1>
            {headlinePhrases.length > 0 && (
              <p className="mt-1 min-h-6 text-sm font-semibold text-primary">
                <Typewriter phrases={headlinePhrases} />
              </p>
            )}
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.country && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {p.country}
                </li>
              )}
              {p.linkedin_url && (
                <li className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-gold/60 underline-offset-4 transition-colors hover:text-primary hover:decoration-gold"
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
            {p.linkedin_url && (
              <a
                href={p.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                View LinkedIn
              </a>
            )}
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
              <div className="mt-4 space-y-4">
                <Reveal>
                  <SectionCard>
                    <p className="leading-relaxed text-foreground/90">{summary}</p>
                  </SectionCard>
                </Reveal>
                <Reveal delay={120}>
                  <StatsBand data={data} />
                </Reveal>
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
                Want the full picture? Connect on LinkedIn or get in touch.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {p.linkedin_url && (
                  <a
                    href={p.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    View LinkedIn
                  </a>
                )}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                {p.first_name}
                {p.country ? ` · ${p.country}` : ""}
              </p>
              <div className="mt-4 border-t border-line/70 pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                >
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Owner sign-in
                </Link>
              </div>
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
        <Reveal>
          <SectionCard>
            <div className="grid gap-6 sm:grid-cols-2">
              {groups.map((g) => (
                <div key={g.id} className="group/skill">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground transition-colors group-hover/skill:text-primary">
                    {g.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {g.skills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex min-h-8 items-center rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-primary transition-all duration-300 group-hover/skill:-translate-y-0.5 group-hover/skill:shadow-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </Reveal>
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
        {rows.map((job, i) => {
          const summary = tone === "professional" ? job.summary_professional : job.summary_conversational;
          const achievements =
            tone === "professional" ? job.achievements_professional : job.achievements_conversational;
          return (
            <Reveal key={job.id} delay={Math.min(i, 3) * 100}>
              <SectionCard>
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
                    {achievements.map((a, idx) => (
                      <li key={idx}>{a}</li>
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
            </Reveal>
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
        {rows.map((ed, i) => {
          const desc =
            tone === "professional" ? ed.description_professional : ed.description_conversational;
          return (
            <Reveal key={ed.id} delay={Math.min(i, 3) * 100}>
              <SectionCard>
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
            </Reveal>
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
        {rows.map((a, i) => {
          const desc =
            tone === "professional" ? a.description_professional : a.description_conversational;
          return (
            <Reveal key={a.id} delay={Math.min(i, 3) * 100}>
              <SectionCard>
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
                    className="mt-2 inline-block text-sm font-semibold text-primary underline decoration-gold/50 underline-offset-4 transition-colors hover:text-secondary hover:decoration-gold"
                  >
                    Learn more
                  </a>
                )}
              </SectionCard>
            </Reveal>
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
        <Reveal>
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
                        className="text-xs font-bold text-primary underline decoration-gold/50 underline-offset-4 transition-colors hover:text-secondary hover:decoration-gold"
                      >
                        Verify
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </Reveal>
      </div>
    </section>
  );
}
