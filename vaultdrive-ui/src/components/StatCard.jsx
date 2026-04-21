export function StatCard({ title, value, hint }) {
  return (
    <article className="glass-card fade-up rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
        {title}
      </p>
      <p className="title-font mt-2 text-3xl font-bold text-[var(--ink)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{hint}</p>
    </article>
  )
}
