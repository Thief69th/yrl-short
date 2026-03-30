type SetupCardProps = {
  title: string;
  description: string;
  code?: string;
};

export function SetupCard({ title, description, code }: SetupCardProps) {
  return (
    <main className="app-shell items-center justify-center">
      <section className="glass-card w-full max-w-2xl rounded-[32px] p-8 text-center sm:p-10">
        <span className="pill">Configuration needed</span>
        <h1 className="mt-5 font-display text-3xl font-bold text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-muted">{description}</p>
        {code ? (
          <pre className="surface-card mt-6 overflow-x-auto rounded-[24px] p-4 text-left text-sm text-foreground">
            <code>{code}</code>
          </pre>
        ) : null}
      </section>
    </main>
  );
}
