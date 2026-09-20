type LegalSection = { title: string; paragraphs: string[] };

export function LegalPage({ eyebrow, title, updated, introduction, sections, updatedLabel = "Last updated" }: {
  eyebrow: string; title: string; updated: string; introduction: string; sections: LegalSection[]; updatedLabel?: string;
}) {
  return (
    <section className="container-x py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mono-label text-neon-cyan">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ink-high sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-ink-low">{updatedLabel}: {updated}</p>
        <p className="mt-10 text-base leading-8 text-ink-mid">{introduction}</p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-ink-high">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-ink-low">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
