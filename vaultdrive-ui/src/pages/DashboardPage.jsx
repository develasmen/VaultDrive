import { useEffect, useMemo, useState } from 'react'
import {
  crearCarpeta,
  getArchivosByUsuario,
  getCarpetasByUsuario,
  getEtiquetasByUsuario,
  getFavoritosByUsuario,
  logout,
  subirArchivo,
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
  const [folderName, setFolderName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

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

  async function refreshData() {
    const [archivosResponse, carpetasResponse, etiquetasResponse, favoritosResponse] = await Promise.all([
      getArchivosByUsuario(user.id),
      getCarpetasByUsuario(user.id),
      getEtiquetasByUsuario(user.id),
      getFavoritosByUsuario(user.id),
    ])

    setData({
      archivos: archivosResponse?.data ?? [],
      carpetas: Array.isArray(carpetasResponse) ? carpetasResponse : [],
      etiquetas: etiquetasResponse?.data ?? [],
      favoritos: favoritosResponse?.data ?? [],
    })
  }

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

  const handleCreateFolder = async (event) => {
    event.preventDefault()
    setError('')
    setActionMessage('')

    try {
      await crearCarpeta({
        usuarioId: user.id,
        nombre: folderName,
        portadaImg: coverUrl,
        carpetaPadre: null,
      })

      await refreshData()
      setFolderName('')
      setCoverUrl('')
      setActionMessage('Carpeta creada correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setError('')
    setActionMessage('')

    if (!selectedFile || !selectedFolderId) {
      setError('Selecciona carpeta y archivo para subir.')
      return
    }

    try {
      await subirArchivo({
        usuarioId: user.id,
        carpetaId: selectedFolderId,
        file: selectedFile,
      })

      await refreshData()
      setSelectedFile(null)
      setActionMessage('Archivo subido correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-7 md:px-6">
      <TopBar user={user} onLogout={handleLogout} />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {actionMessage && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </p>
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

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="glass-card fade-up rounded-2xl p-5">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Crear carpeta</h2>
          <form onSubmit={handleCreateFolder} className="mt-4 space-y-3">
            <input
              type="text"
              required
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Nombre de la carpeta"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            />
            <input
              type="url"
              value={coverUrl}
              onChange={(event) => setCoverUrl(event.target.value)}
              placeholder="URL de portada (opcional)"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
            >
              Crear carpeta
            </button>
          </form>
        </article>

        <article className="glass-card fade-up rounded-2xl p-5">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Subir archivo</h2>
          <form onSubmit={handleUpload} className="mt-4 space-y-3">
            <select
              required
              value={selectedFolderId}
              onChange={(event) => setSelectedFolderId(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            >
              <option value="">Selecciona una carpeta</option>
              {data.carpetas.map((carpeta) => (
                <option key={carpeta.id} value={carpeta.id}>
                  {carpeta.nombre}
                </option>
              ))}
            </select>

            <input
              required
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-emerald-700"
            />

            <button
              type="submit"
              className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Subir archivo
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}
