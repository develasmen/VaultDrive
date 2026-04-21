export function StatCard({ title, value, hint }) {
  return (
    <article className="glass-card fade-up rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ink-soft)">
        {title}
      </p>
      <p className="title-font mt-2 text-3xl font-bold text-(--ink)">{value}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{hint}</p>
    </article>
  )
}
