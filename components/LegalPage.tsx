import Link from "next/link";

type Props = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, updated, children }: Props) {
  return (
    <main className="bg-white min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="mx-auto max-w-[720px] px-6 lg:px-10">
        <div className="eyebrow text-ink/50 inline-flex">Legal</div>
        <h1 className="mt-4 font-grotesk font-bold text-ink leading-[0.95] tracking-[-0.03em] text-4xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-ink/50">
          Last updated · <span className="text-ink/70">{updated}</span>
        </p>

        <div className="mt-3 inline-flex items-start gap-2 px-3 py-2 rounded-lg border border-accent/25 bg-accent/5 text-[0.78rem] text-ink/70 leading-[1.5] max-w-md">
          <span
            aria-hidden
            className="mt-[3px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
          />
          <span>
            Pre-launch draft. Tabby is in development and these policies will
            be updated as the product ships.
          </span>
        </div>

        <article className="legal-prose mt-10 text-ink/80">{children}</article>

        <div className="mt-16 pt-8 border-t border-ink/10 text-sm text-ink/55 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>
            Questions? Ask the &quot;Ask Tabby&quot; chat in the corner — a
            contact address will be published here at launch.
          </span>
          <Link
            href="/"
            className="text-ink/60 hover:text-accent transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
