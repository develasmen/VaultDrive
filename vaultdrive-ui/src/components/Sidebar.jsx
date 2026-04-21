import {
  ClockIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  LogoutIcon,
  MessageIcon,
  PaintbrushIcon,
  SettingsIcon,
  StarIcon,
  TagIcon,
} from './Icons'

const navItems = [
  { key: 'overview',       label: 'Inicio',         Icon: GridIcon },
  { key: 'files',          label: 'Archivos',       Icon: FileIcon },
  { key: 'folders',        label: 'Carpetas',       Icon: FolderIcon },
  { key: 'tags',           label: 'Etiquetas',      Icon: TagIcon },
  { key: 'favorites',      label: 'Favoritos',      Icon: StarIcon },
  { key: 'comments',       label: 'Comentarios',    Icon: MessageIcon },
  { key: 'activity',       label: 'Actividad',      Icon: ClockIcon },
  { key: 'customization',  label: 'Personalizar',   Icon: PaintbrushIcon },
  { key: 'settings',       label: 'Configuración',  Icon: SettingsIcon },
]

export function Sidebar({ activeSection, onSectionChange, user, onLogout }) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-(--paper) border-r border-(--line)">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-(--line)">
        <div className="logo-mark" aria-hidden="true">
          <span className="logo-mark__layer logo-mark__layer--bottom" />
          <span className="logo-mark__layer logo-mark__layer--top" />
        </div>
        <span className="title-font text-[17px] font-semibold text-(--ink) tracking-tight">
          VaultDrive
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ key, label, Icon }) => {
          const isActive = activeSection === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSectionChange(key)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-(--brand-light) text-(--brand-text)'
                  : 'text-(--ink-soft) hover:bg-(--line-soft) hover:text-(--ink)'
              }`}
            >
              <span className={isActive ? 'text-(--brand)' : 'text-(--ink-xsoft)'}>
                <Icon />
              </span>
              {label}
            </button>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-(--line) px-3 py-3 space-y-1">
        <div className="rounded-lg bg-(--line-soft) px-3 py-2">
          <p className="text-[13px] font-semibold text-(--ink) truncate">{user.nombre}</p>
          <p className="text-xs text-(--ink-soft) truncate">{user.correo}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-(--ink-soft) hover:bg-(--danger-light) hover:text-(--danger-text) transition-colors"
        >
          <span className="text-(--ink-xsoft)">
            <LogoutIcon />
          </span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
