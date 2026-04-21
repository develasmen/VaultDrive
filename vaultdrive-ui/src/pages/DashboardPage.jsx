import { useEffect, useMemo, useState } from 'react'
import {
  getArchivosByUsuario,
  getCarpetasByUsuario,
  getEtiquetasByUsuario,
  getFavoritosByUsuario,
  logout,
} from '../lib/api'
import { clearSession } from '../lib/session'
import { StatCard } from '../components/StatCard'
import { TopBar } from '../components/TopBar'

export function DashboardPage({ user, onSessionClosed }) {
  const [data, setData] = useState({
    archivos: [],
    carpetas: [],
    etiquetas: [],
    favoritos: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setError('')
      setIsLoading(true)
      try {
        const [archivosResponse, carpetasResponse, etiquetasResponse, favoritosResponse] = await Promise.all([
          getArchivosByUsuario(user.id),
          getCarpetasByUsuario(user.id),
          getEtiquetasByUsuario(user.id),
          getFavoritosByUsuario(user.id),
        ])

        if (!isMounted) return

        setData({
          archivos: archivosResponse?.data ?? [],
          carpetas: Array.isArray(carpetasResponse) ? carpetasResponse : [],
          etiquetas: etiquetasResponse?.data ?? [],
          favoritos: favoritosResponse?.data ?? [],
        })
      } catch (requestError) {
        if (!isMounted) return
        setError(requestError.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user.id])

  const stats = useMemo(
    () => [
      { title: 'Archivos', value: data.archivos.length, hint: 'Total de archivos cargados' },
      { title: 'Carpetas', value: data.carpetas.length, hint: 'Estructuras activas' },
      { title: 'Etiquetas', value: data.etiquetas.length, hint: 'Clasificacion disponible' },
      { title: 'Favoritos', value: data.favoritos.length, hint: 'Accesos rapidos marcados' },
    ],
    [data],
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Si falla el endpoint de logout, limpiamos la sesion local igualmente.
    }

    clearSession()
    onSessionClosed()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-7 md:px-6">
      <TopBar user={user} onLogout={handleLogout} />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} hint={item.hint} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article className="glass-card fade-up rounded-2xl p-5">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Ultimos archivos</h2>
          <div className="mt-4 space-y-3">
            {isLoading && <p className="text-sm text-[var(--ink-soft)]">Cargando archivos...</p>}
            {!isLoading && data.archivos.length === 0 && (
              <p className="text-sm text-[var(--ink-soft)]">No hay archivos todavia.</p>
            )}
            {data.archivos.slice(0, 6).map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-[var(--ink)]">{archivo.nombre}</p>
                  <p className="text-xs text-[var(--ink-soft)]">{archivo.tipoArchivo ?? 'Archivo'}</p>
                </div>
                <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {(archivo.tamano ?? 0) / 1024 > 1024
                    ? `${((archivo.tamano ?? 0) / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.max(1, Math.floor((archivo.tamano ?? 0) / 1024))} KB`}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card fade-up rounded-2xl p-5">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Carpetas recientes</h2>
          <div className="mt-4 space-y-2">
            {isLoading && <p className="text-sm text-[var(--ink-soft)]">Cargando carpetas...</p>}
            {!isLoading && data.carpetas.length === 0 && (
              <p className="text-sm text-[var(--ink-soft)]">Aun no tienes carpetas.</p>
            )}
            {data.carpetas.slice(0, 6).map((carpeta) => (
              <div key={carpeta.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
                <p className="font-semibold text-[var(--ink)]">{carpeta.nombre}</p>
                <p className="text-xs text-[var(--ink-soft)]">{carpeta.portadaImg || 'Sin portada'}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
