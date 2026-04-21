import { useEffect, useMemo, useState } from 'react'
import {
  agregarFavorito,
  asignarEtiqueta,
  crearComentario,
  crearCarpeta,
  crearEtiqueta,
  getArchivosByUsuario,
  getCarpetasByUsuario,
  getComentariosByArchivo,
  getEtiquetasByUsuario,
  getFavoritosByUsuario,
  quitarFavorito,
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
  const [newTagName, setNewTagName] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [selectedTagFileId, setSelectedTagFileId] = useState('')
  const [selectedCommentFileId, setSelectedCommentFileId] = useState('')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
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

  useEffect(() => {
    if (!selectedCommentFileId) {
      setComments([])
      return
    }

    let active = true

    async function loadComments() {
      setIsCommentsLoading(true)
      try {
        const response = await getComentariosByArchivo(selectedCommentFileId)
        if (!active) return
        setComments(response?.data ?? [])
      } catch {
        if (!active) return
        setComments([])
      } finally {
        if (active) setIsCommentsLoading(false)
      }
    }

    loadComments()

    return () => {
      active = false
    }
  }, [selectedCommentFileId])

  const stats = useMemo(
    () => [
      { title: 'Archivos', value: data.archivos.length, hint: 'Total de archivos cargados' },
      { title: 'Carpetas', value: data.carpetas.length, hint: 'Estructuras activas' },
      { title: 'Etiquetas', value: data.etiquetas.length, hint: 'Clasificacion disponible' },
      { title: 'Favoritos', value: data.favoritos.length, hint: 'Accesos rapidos marcados' },
    ],
    [data],
  )

  const favoritesSet = useMemo(
    () => new Set(data.favoritos.map((favorito) => favorito.archivoId)),
    [data.favoritos],
  )

  const formatFileSize = (archivo) => {
    const bytes = archivo.tamano ?? archivo.tamaño ?? 0
    if (bytes / 1024 > 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${Math.max(1, Math.floor(bytes / 1024))} KB`
  }

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
      setSelectedFolderId('')
      setSelectedFile(null)
      setActionMessage('Archivo subido correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleCreateTag = async (event) => {
    event.preventDefault()
    setError('')
    setActionMessage('')

    try {
      await crearEtiqueta({
        usuarioId: user.id,
        nombreEtiqueta: newTagName,
      })
      await refreshData()
      setNewTagName('')
      setActionMessage('Etiqueta creada correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleAssignTag = async (event) => {
    event.preventDefault()
    setError('')
    setActionMessage('')

    if (!selectedTagId || !selectedTagFileId) {
      setError('Selecciona etiqueta y archivo para asignar.')
      return
    }

    try {
      await asignarEtiqueta({ archivoId: selectedTagFileId, etiquetaId: selectedTagId })
      setActionMessage('Etiqueta asignada al archivo.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleToggleFavorite = async (archivoId) => {
    setError('')
    setActionMessage('')

    try {
      if (favoritesSet.has(archivoId)) {
        await quitarFavorito({ usuarioId: user.id, archivoId })
        setActionMessage('Archivo removido de favoritos.')
      } else {
        await agregarFavorito({ usuarioId: user.id, archivoId })
        setActionMessage('Archivo agregado a favoritos.')
      }

      await refreshData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleCreateComment = async (event) => {
    event.preventDefault()
    setError('')
    setActionMessage('')

    if (!selectedCommentFileId || !commentText.trim()) {
      setError('Selecciona archivo y escribe un comentario.')
      return
    }

    try {
      await crearComentario({
        usuarioId: user.id,
        archivoId: selectedCommentFileId,
        comentario: commentText.trim(),
      })

      const response = await getComentariosByArchivo(selectedCommentFileId)
      setComments(response?.data ?? [])
      setCommentText('')
      setActionMessage('Comentario publicado.')
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(archivo.id)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                      favoritesSet.has(archivo.id)
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {favoritesSet.has(archivo.id) ? 'Favorito' : 'Marcar'}
                  </button>

                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {formatFileSize(archivo)}
                  </span>
                </div>
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

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="glass-card fade-up rounded-2xl p-5">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Etiquetas</h2>

          <form onSubmit={handleCreateTag} className="mt-4 space-y-3">
            <input
              required
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Nombre de etiqueta"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
            >
              Crear etiqueta
            </button>
          </form>

          <form onSubmit={handleAssignTag} className="mt-5 space-y-3">
            <select
              required
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            >
              <option value="">Selecciona etiqueta</option>
              {data.etiquetas.map((etiqueta) => (
                <option key={etiqueta.id} value={etiqueta.id}>
                  {etiqueta.nombreEtiqueta}
                </option>
              ))}
            </select>

            <select
              required
              value={selectedTagFileId}
              onChange={(event) => setSelectedTagFileId(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            >
              <option value="">Selecciona archivo</option>
              {data.archivos.map((archivo) => (
                <option key={archivo.id} value={archivo.id}>
                  {archivo.nombre}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Asignar etiqueta
            </button>
          </form>
        </article>

        <article className="glass-card fade-up rounded-2xl p-5 lg:col-span-2">
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Comentarios por archivo</h2>

          <form onSubmit={handleCreateComment} className="mt-4 grid gap-3 md:grid-cols-[1fr_1.6fr_auto]">
            <select
              required
              value={selectedCommentFileId}
              onChange={(event) => setSelectedCommentFileId(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            >
              <option value="">Selecciona archivo</option>
              {data.archivos.map((archivo) => (
                <option key={archivo.id} value={archivo.id}>
                  {archivo.nombre}
                </option>
              ))}
            </select>

            <input
              required
              type="text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Escribe un comentario"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
            />

            <button
              type="submit"
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
            >
              Comentar
            </button>
          </form>

          <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
            {!selectedCommentFileId && (
              <p className="text-sm text-[var(--ink-soft)]">Selecciona un archivo para ver comentarios.</p>
            )}
            {isCommentsLoading && <p className="text-sm text-[var(--ink-soft)]">Cargando comentarios...</p>}
            {selectedCommentFileId && !isCommentsLoading && comments.length === 0 && (
              <p className="text-sm text-[var(--ink-soft)]">Este archivo aun no tiene comentarios.</p>
            )}
            {comments.map((comentario) => (
              <div key={comentario.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
                <p className="text-sm text-[var(--ink)]">{comentario.comentario}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Usuario: {comentario.usuarioId}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
