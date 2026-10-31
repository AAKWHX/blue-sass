type LegalSection = { title: string; paragraphs: string[] };

export function LegalPage({ title, updated, introduction, sections, updatedLabel = "Last updated" }: {
  eyebrow: string; title: string; updated: string; introduction: string; sections: LegalSection[]; updatedLabel?: string;
}) {
  return (
    <section className="studio-section container-x py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-white/70">{updatedLabel}: {updated}</p>
        <p className="mt-10 text-base leading-8 text-white/85">{introduction}</p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-white/75">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
