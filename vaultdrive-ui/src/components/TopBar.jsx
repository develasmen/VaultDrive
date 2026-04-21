export function TopBar({ user, onLogout }) {
  return (
    <header className="glass-card fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          VaultDrive Workspace
        </p>
        <h1 className="title-font text-2xl font-semibold text-[var(--ink)]">Panel de control</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 text-right">
          <p className="text-sm font-semibold text-[var(--ink)]">{user.nombre}</p>
          <p className="text-xs text-[var(--ink-soft)]">{user.correo}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
