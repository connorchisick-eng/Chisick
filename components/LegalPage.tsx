import Link from "next/link";

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type Summary = {
  label: string;
  text: string;
};

type Props = {
  kind: "Privacy" | "Terms" | "Security";
  monogram: string;
  title: string;
  accentWord: string;
  updated: string;
  effective?: string;
  intro: React.ReactNode;
  summary: Summary[];
  sections: Section[];
  outroTagline: string;
  outroQuestion: string;
};

export function LegalPage({
  kind,
  monogram,
  title,
  accentWord,
  updated,
  effective,
  intro,
  summary,
  sections,
  outroTagline,
  outroQuestion,
}: Props) {
  const idx = title.indexOf(accentWord);
  const lead = idx >= 0 ? title.slice(0, idx) : title;
  const tail = idx >= 0 ? title.slice(idx + accentWord.length) : "";

  return (
    <main id="top" className="bg-surface">
      {/* HERO BAND */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-28 overflow-hidden">
        {/* monogram backdrop */}
        <div
          aria-hidden
          className="legal-monogram font-grotesk italic font-bold leading-none select-none pointer-events-none"
        >
          {monogram}
        </div>

        {/* corner crop marks — editorial detail */}
        <CropMarks />

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-body/45">
                <span className="inline-block w-8 h-px bg-body/30" />
                <span>Tabby</span>
                <span className="text-accent">·</span>
                <span>{kind} Doctrine</span>
              </div>

              <h1
                className="mt-7 font-grotesk font-bold text-body leading-[0.92] tracking-[-0.035em]"
                style={{ fontSize: "clamp(3rem, 8.4vw, 8rem)" }}
              >
                {lead}
                <span className="relative inline-block italic font-medium text-accent whitespace-nowrap">
                  {accentWord}
                  <svg
                    aria-hidden
                    viewBox="0 0 220 14"
                    preserveAspectRatio="none"
                    className="absolute left-0 right-0 -bottom-2 w-full h-[0.28em]"
                    fill="none"
                  >
                    <path
                      d="M 4 9 Q 50 1, 110 7 T 216 6"
                      stroke="rgb(255,124,97)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
                {tail}
              </h1>

              <div className="mt-9 max-w-[580px] text-[1.05rem] md:text-[1.14rem] text-body/70 leading-[1.62]">
                {intro}
              </div>

              {/* meta strip */}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.72rem] uppercase tracking-[0.24em] font-semibold text-body/55">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Last updated
                  <span className="text-body">{updated}</span>
                </span>
                {effective && (
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-body/30" />
                    Effective
                    <span className="text-body">{effective}</span>
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-body/30" />
                  Version
                  <span className="text-body">0.1 · pre-launch</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end lg:pt-6">
              <Stamp kind={kind} updated={updated} effective={effective} />
            </div>
          </div>
        </div>
      </section>

      {/* TL;DR — full-bleed cream band */}
      <section className="relative bg-surface-alt border-y border-line/10 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="eyebrow text-body/45">The short version</div>
              <p className="mt-5 font-grotesk text-body text-[1.85rem] md:text-[2.2rem] leading-[1.02] tracking-[-0.025em]">
                If you only read{" "}
                <span className="italic font-medium">one thing,</span>
                <br />
                <span className="text-accent italic font-medium">read this.</span>
              </p>
              <div className="mt-6 inline-flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.26em] font-semibold text-body/45">
                <span aria-hidden className="w-2 h-2 rounded-full bg-accent" />
                Plain English. No fine print games.
              </div>
            </div>

            <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-5">
              {summary.map((s, i) => (
                <li
                  key={s.label}
                  className="legal-tldr-card relative rounded-[18px] bg-surface border border-line/12 p-6"
                >
                  <span className="legal-tldr-num">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="font-grotesk font-bold text-body text-[0.82rem] uppercase tracking-[0.18em]">
                    {s.label}
                  </div>
                  <p className="mt-2 text-body/72 text-[0.99rem] leading-[1.55]">
                    {s.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BODY — TOC + numbered sections */}
      <section className="relative bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-20 lg:pt-28 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* TOC */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-32">
                <div className="eyebrow text-body/45">Contents</div>
                <ol className="mt-6 list-none space-y-1">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="legal-toc-link group relative flex items-baseline gap-3 py-1.5 pl-2 -ml-2 rounded-md text-body/65 hover:text-body hover:bg-line/5 transition-colors"
                      >
                        <span className="font-grotesk font-bold text-[0.7rem] tracking-[0.18em] text-body/35 group-hover:text-accent transition-colors">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="text-[0.95rem] leading-[1.35] tracking-[-0.005em]">
                          {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>

                <div className="mt-10 hidden lg:flex flex-col gap-3 text-[0.72rem] uppercase tracking-[0.24em] font-semibold text-body/45">
                  <a href="#top" className="hover:text-accent transition-colors">
                    ↑ Back to top
                  </a>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    ← Tabby home
                  </Link>
                </div>
              </div>
            </aside>

            {/* SECTIONS */}
            <article className="lg:col-span-9">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="legal-section"
                >
                  <div className="legal-section-head">
                    <span className="legal-section-num">
                      {(i + 1).toString().padStart(2, "0")} —
                    </span>
                    <h2 className="legal-section-title">{s.title}</h2>
                  </div>
                  <div className="legal-prose">{s.content}</div>
                </section>
              ))}

              <div className="mt-16 pt-8 border-t border-line/12 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.24em] font-semibold text-body/45">
                <span>End of {kind.toLowerCase()} document</span>
                <a href="#top" className="hover:text-accent transition-colors">
                  Back to top ↑
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* OUTRO — ink band with marquee */}
      <section data-nav-invert className="relative bg-ink text-cream overflow-hidden">
        <div className="noise" />

        {/* marquee ribbon */}
        <div className="relative border-b border-white/5 overflow-hidden py-3">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-12 pr-12 shrink-0">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={`${rep}-${i}`}
                    className="font-grotesk italic font-medium text-cream/35 tracking-[-0.02em] flex items-center gap-12"
                    style={{ fontSize: "0.95rem" }}
                  >
                    <span>{outroTagline}</span>
                    <span aria-hidden className="text-accent/60 not-italic">✶</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-cream/45">
                <span className="inline-block w-8 h-px bg-cream/25" />
                <span>Need a human</span>
              </div>
              <h2
                className="mt-5 font-grotesk font-bold text-cream leading-[0.96] tracking-[-0.025em]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
              >
                {outroQuestion.split("?")[0]}
                <span className="italic text-accent">?</span>
              </h2>
              <p className="mt-6 max-w-md text-cream/65 leading-[1.55] text-[1.04rem]">
                Tap{" "}
                <span className="text-cream font-semibold">Ask Tabby</span>{" "}
                in the corner — our AI answers in seconds. A dedicated{" "}
                {kind.toLowerCase()} address will be published here at launch.
              </p>
            </div>
            <div className="lg:col-span-5 flex lg:justify-end gap-4">
              <Link href="/" className="legal-back-stamp group">
                <span className="legal-back-stamp-arrow">←</span>
                <span className="flex flex-col leading-none">
                  <span className="text-[0.6rem] uppercase tracking-[0.28em] text-cream/55 font-semibold">
                    Back to
                  </span>
                  <span className="font-grotesk italic font-bold text-cream text-[1.45rem] mt-1.5">
                    tabby.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stamp({
  kind,
  updated,
  effective,
}: {
  kind: string;
  updated: string;
  effective?: string;
}) {
  const ringText = `${kind} doctrine · last revised ${updated} · ${kind} doctrine · last revised ${updated} · `.toUpperCase();
  const id = `stamp-${kind.toLowerCase()}`;
  return (
    <div className="relative flex items-center justify-center w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] animate-stamp-pulse rounded-full">
      <svg
        className="absolute inset-0 w-full h-full animate-stamp-spin"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
      >
        <defs>
          <path
            id={id}
            d="M 60, 60 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
          />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke="rgba(14,14,14,0.18)"
          strokeWidth="0.4"
          fill="none"
          strokeDasharray="1.4 2.2"
        />
        <circle
          cx="60"
          cy="60"
          r="46"
          stroke="rgba(255,124,97,0.35)"
          strokeWidth="0.5"
          fill="none"
        />
        <text
          fill="rgb(255,124,97)"
          style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: "5.4px",
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${id}`} startOffset="0">
            {ringText}
          </textPath>
        </text>
      </svg>
      <div className="relative flex flex-col items-center justify-center -rotate-[5deg] text-center px-4">
        <span className="text-[0.55rem] tracking-[0.32em] uppercase font-bold text-body/45 mb-1.5">
          Document
        </span>
        <div className="w-10 h-px bg-accent/55 mb-2" />
        <span className="font-grotesk italic font-bold text-accent text-[1.55rem] leading-none">
          {kind}
        </span>
        <div className="w-10 h-px bg-accent/55 mt-2" />
        <span className="font-grotesk italic font-medium text-body/55 text-[0.72rem] leading-none mt-2 tracking-[0.04em]">
          v 0.1 · {effective ?? updated}
        </span>
      </div>
    </div>
  );
}

function CropMarks() {
  const corners: Array<{ pos: string; rot: number }> = [
    { pos: "top-6 left-6 lg:top-10 lg:left-10", rot: 0 },
    { pos: "top-6 right-6 lg:top-10 lg:right-10", rot: 90 },
    { pos: "bottom-10 left-6 lg:bottom-14 lg:left-10", rot: 270 },
    { pos: "bottom-10 right-6 lg:bottom-14 lg:right-10", rot: 180 },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute ${c.pos} text-body/15 pointer-events-none hidden md:block`}
          style={{ transform: `rotate(${c.rot}deg)` }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M 0 6 L 0 0 L 6 0"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ))}
    </>
  );
}
