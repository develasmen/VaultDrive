import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  actualizarComentario,
  actualizarEtiqueta,
  agregarFavorito,
  asignarEtiqueta,
  crearComentario,
  crearCarpeta,
  crearEtiqueta,
  eliminarComentario,
  eliminarEtiqueta,
  getArchivoById,
  getArchivosByUsuario,
  getCarpetasByUsuario,
  getComentariosByArchivo,
  getEtiquetasByUsuario,
  getFavoritosByUsuario,
  getHistorialVersiones,
  logout,
  quitarFavorito,
  subirArchivoConProgreso,
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
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const [folderName, setFolderName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [newTagName, setNewTagName] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [selectedTagFileId, setSelectedTagFileId] = useState('')
  const [editingTagId, setEditingTagId] = useState('')
  const [editingTagName, setEditingTagName] = useState('')

  const [selectedCommentFileId, setSelectedCommentFileId] = useState('')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentText, setEditingCommentText] = useState('')

  const [selectedDetailFileId, setSelectedDetailFileId] = useState('')
  const [selectedDetailFile, setSelectedDetailFile] = useState(null)
  const [versionHistory, setVersionHistory] = useState([])

  const refreshData = useCallback(async () => {
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
  }, [user.id])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setError('')
      setIsLoading(true)
      try {
        await refreshData()
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
  }, [refreshData])

  useEffect(() => {
    if (!selectedCommentFileId) return

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

  const visibleComments = selectedCommentFileId ? comments : []

  const formatFileSize = (archivo) => {
    const bytes = archivo.tamano ?? archivo.tamaño ?? 0
    if (bytes / 1024 > 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${Math.max(1, Math.floor(bytes / 1024))} KB`
  }

  const resetMessages = () => {
    setError('')
    setActionMessage('')
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
    resetMessages()

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

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      setSelectedFile(droppedFile)
    }
  }

  const performUpload = async () => {
    if (!selectedFile || !selectedFolderId) {
      setError('Selecciona carpeta y archivo para subir.')
      return
    }

    setUploadProgress(0)

    await subirArchivoConProgreso({
      usuarioId: user.id,
      carpetaId: selectedFolderId,
      file: selectedFile,
      onProgress: (percent) => setUploadProgress(percent),
    })

    await refreshData()
    setSelectedFolderId('')
    setSelectedFile(null)
    setUploadProgress(0)
    setActionMessage('Archivo subido correctamente.')
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    resetMessages()

    try {
      await performUpload()
    } catch (requestError) {
      setError(requestError.message)
      setUploadProgress(0)
    }
  }

  const handleCreateTag = async (event) => {
    event.preventDefault()
    resetMessages()

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
    resetMessages()

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

  const handleStartEditTag = (etiqueta) => {
    setEditingTagId(etiqueta.id)
    setEditingTagName(etiqueta.nombreEtiqueta)
  }

  const handleSaveEditTag = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!editingTagId) return

    try {
      await actualizarEtiqueta(editingTagId, { nombreEtiqueta: editingTagName })
      await refreshData()
      setEditingTagId('')
      setEditingTagName('')
      setActionMessage('Etiqueta actualizada correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleDeleteTag = async (id) => {
    resetMessages()

    try {
      await eliminarEtiqueta(id)
      await refreshData()
      if (editingTagId === id) {
        setEditingTagId('')
        setEditingTagName('')
      }
      setActionMessage('Etiqueta eliminada correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleToggleFavorite = async (archivoId) => {
    resetMessages()

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
    resetMessages()

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

  const handleStartEditComment = (comentario) => {
    setEditingCommentId(comentario.id)
    setEditingCommentText(comentario.comentario)
  }

  const handleSaveEditComment = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!editingCommentId || !selectedCommentFileId) return

    try {
      await actualizarComentario(editingCommentId, { comentario: editingCommentText })
      const response = await getComentariosByArchivo(selectedCommentFileId)
      setComments(response?.data ?? [])
      setEditingCommentId('')
      setEditingCommentText('')
      setActionMessage('Comentario actualizado correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleDeleteComment = async (id) => {
    resetMessages()

    try {
      await eliminarComentario(id)
      if (selectedCommentFileId) {
        const response = await getComentariosByArchivo(selectedCommentFileId)
        setComments(response?.data ?? [])
      }
      if (editingCommentId === id) {
        setEditingCommentId('')
        setEditingCommentText('')
      }
      setActionMessage('Comentario eliminado correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleSelectDetailFile = async (fileId) => {
    resetMessages()
    setSelectedDetailFileId(fileId)
    setIsDetailLoading(true)

    try {
      const [archivoResponse, historialResponse] = await Promise.all([
        getArchivoById(fileId),
        getHistorialVersiones(fileId),
      ])

      setSelectedDetailFile(archivoResponse?.data ?? null)
      setVersionHistory(historialResponse?.data ?? [])
    } catch (requestError) {
      setSelectedDetailFile(null)
      setVersionHistory([])
      setError(requestError.message)
    } finally {
      setIsDetailLoading(false)
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
            {data.archivos.slice(0, 8).map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => handleSelectDetailFile(archivo.id)}
                  className="text-left transition hover:opacity-80"
                >
                  <p className="font-semibold text-[var(--ink)]">{archivo.nombre}</p>
                  <p className="text-xs text-[var(--ink-soft)]">{archivo.tipoArchivo ?? 'Archivo'}</p>
                </button>

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
          <h2 className="title-font text-xl font-semibold text-[var(--ink)]">Detalle e historial</h2>

          {isDetailLoading && <p className="mt-4 text-sm text-[var(--ink-soft)]">Cargando detalle...</p>}

          {!isDetailLoading && !selectedDetailFileId && (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Selecciona un archivo para ver su historial.</p>
          )}

          {!isDetailLoading && selectedDetailFile && (
            <>
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/70 p-3">
                <p className="font-semibold text-[var(--ink)]">{selectedDetailFile.nombre}</p>
                <p className="text-xs text-[var(--ink-soft)]">Tipo: {selectedDetailFile.tipoArchivo}</p>
                <p className="text-xs text-[var(--ink-soft)]">Peso: {formatFileSize(selectedDetailFile)}</p>
                <p className="text-xs text-[var(--ink-soft)]">Subido: {new Date(selectedDetailFile.fechaSubida).toLocaleString()}</p>
              </div>

              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                {versionHistory.length === 0 && (
                  <p className="text-sm text-[var(--ink-soft)]">Sin historial registrado.</p>
                )}
                {versionHistory.map((version) => (
                  <div key={version.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
                    <p className="text-sm font-semibold text-[var(--ink)]">Version {version.versionNumero}</p>
                    <p className="text-xs text-[var(--ink-soft)]">{version.comentarioCambio || 'Sin comentario'}</p>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {new Date(version.fechaVersion).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
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

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging ? 'border-[var(--brand)] bg-emerald-50' : 'border-[var(--line)] bg-white/60'
              }`}
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Arrastra un archivo aqui</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">o selecciona uno desde tu equipo</p>

              <input
                required={!selectedFile}
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-emerald-700"
              />

              {selectedFile && <p className="mt-2 text-xs text-[var(--ink-soft)]">Seleccionado: {selectedFile.name}</p>}
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full bg-[var(--brand)] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--ink-soft)]">Subiendo... {uploadProgress}%</p>
              </div>
            )}

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

          <div className="mt-5 space-y-2">
            {data.etiquetas.slice(0, 8).map((etiqueta) => (
              <div key={etiqueta.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
                {editingTagId === etiqueta.id ? (
                  <form onSubmit={handleSaveEditTag} className="space-y-2">
                    <input
                      value={editingTagName}
                      onChange={(event) => setEditingTagName(event.target.value)}
                      className="w-full rounded-lg border border-[var(--line)] px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTagId('')
                          setEditingTagName('')
                        }}
                        className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ink)]">{etiqueta.nombreEtiqueta}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditTag(etiqueta)}
                        className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(etiqueta.id)}
                        className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {!selectedCommentFileId && (
              <p className="text-sm text-[var(--ink-soft)]">Selecciona un archivo para ver comentarios.</p>
            )}
            {isCommentsLoading && <p className="text-sm text-[var(--ink-soft)]">Cargando comentarios...</p>}
            {selectedCommentFileId && !isCommentsLoading && visibleComments.length === 0 && (
              <p className="text-sm text-[var(--ink-soft)]">Este archivo aun no tiene comentarios.</p>
            )}

            {visibleComments.map((comentario) => (
              <div key={comentario.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
                {editingCommentId === comentario.id ? (
                  <form onSubmit={handleSaveEditComment} className="space-y-2">
                    <input
                      value={editingCommentText}
                      onChange={(event) => setEditingCommentText(event.target.value)}
                      className="w-full rounded-lg border border-[var(--line)] px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId('')
                          setEditingCommentText('')
                        }}
                        className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--ink)]">{comentario.comentario}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--ink-soft)]">Usuario: {comentario.usuarioId}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditComment(comentario)}
                          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comentario.id)}
                          className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
