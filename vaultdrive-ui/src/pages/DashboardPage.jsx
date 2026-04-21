import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  actualizarComentario,
  actualizarConfiguracion,
  actualizarEtiqueta,
  actualizarPersonalizacion,
  agregarFavorito,
  asignarEtiqueta,
  crearComentario,
  crearCarpeta,
  crearEtiqueta,
  crearPersonalizacion,
  eliminarArchivo,
  eliminarCarpeta,
  eliminarComentario,
  eliminarEtiqueta,
  eliminarPersonalizacion,
  getArchivoById,
  getArchivosByCarpeta,
  getArchivosByUsuario,
  getCarpetasByUsuario,
  getComentariosByArchivo,
  getConfiguracion,
  getEtiquetasByUsuario,
  getEtiquetasPorArchivos,
  getFavoritosByUsuario,
  getHistorialVersiones,
  getPersonalizacion,
  getPersonalizacionesBulk,
  getRegistroActividad,
  logout,
  quitarEtiqueta,
  quitarFavorito,
  registrarActividad,
  subirArchivoConProgreso,
} from '../lib/api'
import { clearSession } from '../lib/session'
import { Sidebar } from '../components/Sidebar'
import {
  ChevronLeftIcon,
  CheckIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  MessageIcon,
  MoonIcon,
  PaintbrushIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from '../components/Icons'

// ---------- helpers ----------
function formatSize(archivo) {
  const bytes = archivo.tamano ?? archivo.tamaño ?? 0
  if (bytes / 1024 > 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.floor(bytes / 1024))} KB`
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="title-font text-xl font-semibold text-(--ink)">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-(--ink-soft)">{subtitle}</p>}
    </div>
  )
}

function EmptyState({ message }) {
  return <p className="py-4 text-sm text-(--ink-soft)">{message}</p>
}

function ActionBar({ error, message, onDismiss }) {
  if (!error && !message) return null
  const isError = Boolean(error)
  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
        isError
          ? 'border-red-200 bg-(--danger-light) text-(--danger-text)'
          : 'border-emerald-200 bg-(--brand-light) text-(--brand-text)'
      }`}
    >
      <span>{error || message}</span>
      <button type="button" onClick={onDismiss} className="ml-3 opacity-60 hover:opacity-100">
        <XIcon />
      </button>
    </div>
  )
}

// ---------- main component ----------
export function DashboardPage({ user, onSessionClosed }) {
  const [data, setData] = useState({ archivos: [], carpetas: [], etiquetas: [], favoritos: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const [activeSection, setActiveSection] = useState('overview')

  // Folder drill-down
  const [openFolder, setOpenFolder] = useState(null)
  const [folderFiles, setFolderFiles] = useState([])
  const [isFolderLoading, setIsFolderLoading] = useState(false)

  // Upload
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // New folder
  const [folderName, setFolderName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  // Tags
  const [newTagName, setNewTagName] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [selectedTagFileId, setSelectedTagFileId] = useState('')
  const [editingTagId, setEditingTagId] = useState('')
  const [editingTagName, setEditingTagName] = useState('')

  // Comments
  const [selectedCommentFileId, setSelectedCommentFileId] = useState('')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentText, setEditingCommentText] = useState('')

  // Detail / versions
  const [selectedDetailFileId, setSelectedDetailFileId] = useState('')
  const [selectedDetailFile, setSelectedDetailFile] = useState(null)
  const [versionHistory, setVersionHistory] = useState([])
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // Activity
  const [activity, setActivity] = useState([])
  const [isActivityLoading, setIsActivityLoading] = useState(false)

  // Theme (ConfiguracionUsuario)
  const [theme, setTheme] = useState('Claro')

  // ArchivoPersonalizado
  const [customFileId, setCustomFileId] = useState('')
  const [customData, setCustomData] = useState(null)
  const [isCustomLoading, setIsCustomLoading] = useState(false)
  const [customForm, setCustomForm] = useState({ imagenPortada: '', colorTexto: '#000000', fuente: 'Arial' })
  // Map archivoId → personalizacion para aplicar en el listado
  const [personalizacionesMap, setPersonalizacionesMap] = useState({})
  // Map archivoId → ArchivoEtiqueta[] para mostrar chips de etiquetas
  const [fileTagsMap, setFileTagsMap] = useState({})

  // ---------- data loading ----------
  const refreshPersonalizaciones = useCallback(async (archivos) => {
    if (!archivos || archivos.length === 0) { setPersonalizacionesMap({}); return }
    try {
      const ids = archivos.map((a) => a.id)
      const res = await getPersonalizacionesBulk(ids)
      const list = res?.data ?? []
      const map = {}
      list.forEach((p) => { map[p.archivoId] = p })
      setPersonalizacionesMap(map)
    } catch {
      setPersonalizacionesMap({})
    }
  }, [])

  const refreshFileTagsMap = useCallback(async (archivos) => {
    if (!archivos || archivos.length === 0) { setFileTagsMap({}); return }
    try {
      const ids = archivos.map((a) => a.id)
      const res = await getEtiquetasPorArchivos(ids)
      const list = res?.data ?? []
      const map = {}
      list.forEach((ae) => {
        if (!map[ae.archivoId]) map[ae.archivoId] = []
        map[ae.archivoId].push(ae)
      })
      setFileTagsMap(map)
    } catch {
      setFileTagsMap({})
    }
  }, [])

  const refreshData = useCallback(async () => {
    const [archivosRes, carpetasRes, etiquetasRes, favoritosRes] = await Promise.all([
      getArchivosByUsuario(user.id),
      getCarpetasByUsuario(user.id),
      getEtiquetasByUsuario(user.id),
      getFavoritosByUsuario(user.id),
    ])
    const archivos = archivosRes?.data ?? []
    setData({
      archivos,
      carpetas: Array.isArray(carpetasRes) ? carpetasRes : [],
      etiquetas: etiquetasRes?.data ?? [],
      favoritos: favoritosRes?.data ?? [],
    })
    await Promise.all([refreshPersonalizaciones(archivos), refreshFileTagsMap(archivos)])
  }, [user.id, refreshPersonalizaciones, refreshFileTagsMap])

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    refreshData()
      .catch((err) => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [refreshData])

  useEffect(() => {
    if (!selectedCommentFileId) return
    let active = true
    setIsCommentsLoading(true)
    getComentariosByArchivo(selectedCommentFileId)
      .then((res) => { if (active) setComments(res?.data ?? []) })
      .catch(() => { if (active) setComments([]) })
      .finally(() => { if (active) setIsCommentsLoading(false) })
    return () => { active = false }
  }, [selectedCommentFileId])

  // ---------- derived ----------
  const favoritesSet = useMemo(
    () => new Set(data.favoritos.map((f) => f.archivoId)),
    [data.favoritos],
  )

  const stats = useMemo(
    () => [
      { title: 'Archivos',  value: data.archivos.length,  color: 'text-(--brand)' },
      { title: 'Carpetas',  value: data.carpetas.length,  color: 'text-blue-500' },
      { title: 'Etiquetas', value: data.etiquetas.length, color: 'text-purple-500' },
      { title: 'Favoritos', value: data.favoritos.length, color: 'text-amber-500' },
    ],
    [data],
  )

  const etiquetasById = useMemo(() => {
    const map = {}
    data.etiquetas.forEach((e) => { map[e.id] = e })
    return map
  }, [data.etiquetas])

  // ---------- handlers ----------
  const resetMessages = () => { setError(''); setActionMessage('') }

  const logActivity = useCallback(async (accion, archivoId = null, carpetaId = null) => {
    try {
      await registrarActividad({ usuarioId: user.id, accion, archivoId, carpetaId })
    } catch (err) { console.error('[logActivity]', err) }
  }, [user.id])

  const handleLogout = async () => {
    try { await logout() } catch { /* swallow */ }
    clearSession()
    onSessionClosed()
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    resetMessages()
    try {
      const res = await crearCarpeta({ usuarioId: user.id, nombre: folderName, portadaImg: coverUrl, carpetaPadre: null })
      await refreshData()
      setFolderName('')
      setCoverUrl('')
      setActionMessage('Carpeta creada correctamente.')
      logActivity(`Carpeta creada: ${folderName}`, null, res?.data?.id ?? null)
    } catch (err) { setError(err.message) }
  }

  const handleDeleteFolder = async (id) => {
    resetMessages()
    try {
      await eliminarCarpeta(id)
      await refreshData()
      if (openFolder?.id === id) setOpenFolder(null)
      setActionMessage('Carpeta eliminada.')
      logActivity('Carpeta eliminada', null, id)
    } catch (err) { setError(err.message) }
  }

  const handleOpenFolder = async (carpeta) => {
    setOpenFolder(carpeta)
    setIsFolderLoading(true)
    try {
      const res = await getArchivosByCarpeta(carpeta.id)
      setFolderFiles(res?.data ?? [])
    } catch {
      setFolderFiles([])
    } finally {
      setIsFolderLoading(false)
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) setSelectedFile(f)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!selectedFile || !selectedFolderId) { setError('Selecciona carpeta y archivo.'); return }
    setUploadProgress(0)
    const fileName = selectedFile.name
    try {
      const res = await subirArchivoConProgreso({
        usuarioId: user.id,
        carpetaId: selectedFolderId,
        file: selectedFile,
        onProgress: setUploadProgress,
      })
      await refreshData()
      setSelectedFolderId('')
      setSelectedFile(null)
      setUploadProgress(0)
      setActionMessage('Archivo subido correctamente.')
      logActivity(`Archivo subido: ${fileName}`, res?.data?.id ?? null, selectedFolderId)
    } catch (err) { setError(err.message); setUploadProgress(0) }
  }

  const handleDeleteFile = async (id) => {
    resetMessages()
    try {
      const archivo = data.archivos.find((a) => a.id === id)
      await eliminarArchivo(id)
      await refreshData()
      if (openFolder) {
        const res = await getArchivosByCarpeta(openFolder.id)
        setFolderFiles(res?.data ?? [])
      }
      if (selectedDetailFileId === id) { setSelectedDetailFile(null); setSelectedDetailFileId('') }
      setActionMessage('Archivo eliminado.')
      logActivity(`Archivo eliminado: ${archivo?.nombre ?? id}`, id)
    } catch (err) { setError(err.message) }
  }

  const handleToggleFavorite = async (archivoId) => {
    resetMessages()
    try {
      if (favoritesSet.has(archivoId)) {
        await quitarFavorito({ usuarioId: user.id, archivoId })
        setActionMessage('Removido de favoritos.')
      } else {
        await agregarFavorito({ usuarioId: user.id, archivoId })
        setActionMessage('Añadido a favoritos.')
      }
      await refreshData()
    } catch (err) { setError(err.message) }
  }

  const handleRemoveTag = async (archivoId, etiquetaId) => {
    resetMessages()
    try {
      await quitarEtiqueta({ archivoId, etiquetaId })
      await refreshFileTagsMap(data.archivos)
      setActionMessage('Etiqueta quitada.')
    } catch (err) { setError(err.message) }
  }

  const handleSelectDetailFile = async (fileId) => {
    resetMessages()
    setSelectedDetailFileId(fileId)
    setIsDetailLoading(true)
    try {
      const [archivoRes, historialRes] = await Promise.all([getArchivoById(fileId), getHistorialVersiones(fileId)])
      setSelectedDetailFile(archivoRes?.data ?? null)
      setVersionHistory(historialRes?.data ?? [])
    } catch (err) {
      setSelectedDetailFile(null)
      setVersionHistory([])
      setError(err.message)
    } finally { setIsDetailLoading(false) }
  }

  const handleCreateTag = async (e) => {
    e.preventDefault()
    resetMessages()
    try {
      await crearEtiqueta({ usuarioId: user.id, nombreEtiqueta: newTagName })
      await refreshFileTagsMap(data.archivos)
      await refreshData()
      setNewTagName('')
      setActionMessage('Etiqueta creada.')
    } catch (err) { setError(err.message) }
  }

  const handleAssignTag = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!selectedTagId || !selectedTagFileId) { setError('Selecciona etiqueta y archivo.'); return }
    try {
      await asignarEtiqueta({ archivoId: selectedTagFileId, etiquetaId: selectedTagId })
      await refreshFileTagsMap(data.archivos)
      setActionMessage('Etiqueta asignada.')
    } catch (err) { setError(err.message) }
  }

  const handleSaveEditTag = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!editingTagId) return
    try {
      await actualizarEtiqueta(editingTagId, { nombreEtiqueta: editingTagName })
      await refreshData()
      setEditingTagId('')
      setEditingTagName('')
      setActionMessage('Etiqueta actualizada.')
    } catch (err) { setError(err.message) }
  }

  const handleDeleteTag = async (id) => {
    resetMessages()
    try {
      await eliminarEtiqueta(id)
      await refreshData()
      if (editingTagId === id) { setEditingTagId(''); setEditingTagName('') }
      setActionMessage('Etiqueta eliminada.')
    } catch (err) { setError(err.message) }
  }

  const handleCreateComment = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!selectedCommentFileId || !commentText.trim()) { setError('Selecciona archivo y escribe un comentario.'); return }
    try {
      await crearComentario({ usuarioId: user.id, archivoId: selectedCommentFileId, comentario: commentText.trim() })
      const res = await getComentariosByArchivo(selectedCommentFileId)
      setComments(res?.data ?? [])
      setCommentText('')
      setActionMessage('Comentario publicado.')
    } catch (err) { setError(err.message) }
  }

  const handleSaveEditComment = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!editingCommentId) return
    try {
      await actualizarComentario(editingCommentId, { comentario: editingCommentText })
      const res = await getComentariosByArchivo(selectedCommentFileId)
      setComments(res?.data ?? [])
      setEditingCommentId('')
      setEditingCommentText('')
      setActionMessage('Comentario actualizado.')
    } catch (err) { setError(err.message) }
  }

  const handleDeleteComment = async (id) => {
    resetMessages()
    try {
      await eliminarComentario(id)
      if (selectedCommentFileId) {
        const res = await getComentariosByArchivo(selectedCommentFileId)
        setComments(res?.data ?? [])
      }
      if (editingCommentId === id) { setEditingCommentId(''); setEditingCommentText('') }
      setActionMessage('Comentario eliminado.')
    } catch (err) { setError(err.message) }
  }

  const handleLoadActivity = useCallback(async () => {
    setIsActivityLoading(true)
    try {
      const res = await getRegistroActividad(user.id)
      setActivity(res?.data ?? [])
    } catch {
      setActivity([])
    } finally {
      setIsActivityLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    if (activeSection === 'activity') handleLoadActivity()
  }, [activeSection, handleLoadActivity])

  // Log session start on mount
  useEffect(() => {
    registrarActividad({ usuarioId: user.id, accion: 'Sesión iniciada' })
      .catch((err) => console.error('[logActivity mount]', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load user config (theme) on mount
  useEffect(() => {
    let mounted = true
    getConfiguracion(user.id)
      .then((res) => { if (mounted && res?.data?.tema) setTheme(res.data.tema) })
      .catch(() => {})
    return () => { mounted = false }
  }, [user.id])

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'Oscuro')
  }, [theme])

  const handleToggleTheme = async () => {
    const next = theme === 'Claro' ? 'Oscuro' : 'Claro'
    setTheme(next)
    try { await actualizarConfiguracion(user.id, { tema: next }) } catch { /* swallow */ }
  }

  const handleLoadCustom = async (archivoId) => {
    if (!archivoId) return
    setCustomFileId(archivoId)
    setIsCustomLoading(true)
    setCustomData(null)
    try {
      const res = await getPersonalizacion(archivoId)
      if (res?.data) {
        setCustomData(res.data)
        setCustomForm({
          imagenPortada: res.data.imagenPortada ?? '',
          colorTexto: res.data.colorTexto ?? '#000000',
          fuente: res.data.fuente ?? 'Arial',
        })
      } else {
        setCustomForm({ imagenPortada: '', colorTexto: '#000000', fuente: 'Arial' })
      }
    } catch {
      setCustomForm({ imagenPortada: '', colorTexto: '#000000', fuente: 'Arial' })
    } finally {
      setIsCustomLoading(false)
    }
  }

  const handleSaveCustom = async (e) => {
    e.preventDefault()
    resetMessages()
    if (!customFileId) { setError('Selecciona un archivo primero.'); return }
    try {
      if (customData) {
        await actualizarPersonalizacion({ id: customData.id, ...customForm })
      } else {
        await crearPersonalizacion({ archivoId: customFileId, ...customForm })
        const res = await getPersonalizacion(customFileId)
        if (res?.data) setCustomData(res.data)
      }
      setActionMessage('Personalización guardada.')
      refreshPersonalizaciones(data.archivos)
    } catch (err) { setError(err.message) }
  }

  const handleDeleteCustom = async () => {
    if (!customData) return
    resetMessages()
    try {
      await eliminarPersonalizacion(customData.id)
      setCustomData(null)
      setCustomForm({ imagenPortada: '', colorTexto: '#000000', fuente: 'Arial' })
      setActionMessage('Personalización eliminada.')
      refreshPersonalizaciones(data.archivos)
    } catch (err) { setError(err.message) }
  }

  // ---------- section renderers ----------
  const renderOverview = () => (
    <div className="fade-up space-y-5">
      <SectionHeader
        title="Panel de control"
        subtitle={`Hola, ${user.nombre}. Aquí tienes un resumen de tu espacio.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-(--ink-soft)">{s.title}</p>
            <p className={`title-font mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent files */}
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-(--ink)">Archivos recientes</h3>
          {isLoading && <EmptyState message="Cargando..." />}
          {!isLoading && data.archivos.length === 0 && <EmptyState message="No hay archivos todavía." />}
          <div className="space-y-0.5">
            {data.archivos.slice(0, 8).map((archivo) => (
              <div
                key={archivo.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-(--line-soft) transition-colors"
              >
                <span className="shrink-0 text-(--ink-xsoft)"><FileIcon /></span>
                <button
                  type="button"
                  onClick={() => handleSelectDetailFile(archivo.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-(--ink)">{archivo.nombre}</p>
                  <p className="text-xs text-(--ink-xsoft)">
                    {archivo.tipoArchivo ?? 'Archivo'} · {formatSize(archivo)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(archivo.id)}
                  className={`shrink-0 transition-colors ${
                    favoritesSet.has(archivo.id)
                      ? 'text-amber-400'
                      : 'text-(--ink-xsoft) opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <StarIcon size={14} filled={favoritesSet.has(archivo.id)} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-(--ink)">Detalle y versiones</h3>
          {isDetailLoading && <EmptyState message="Cargando..." />}
          {!isDetailLoading && !selectedDetailFileId && (
            <EmptyState message="Haz clic en un archivo para ver su historial." />
          )}
          {!isDetailLoading && selectedDetailFile && (
            <>
              <div className="mb-3 rounded-lg border border-(--line) p-3">
                <p className="text-sm font-semibold text-(--ink)">{selectedDetailFile.nombre}</p>
                <p className="mt-1 text-xs text-(--ink-soft)">Tipo: {selectedDetailFile.tipoArchivo}</p>
                <p className="text-xs text-(--ink-soft)">Peso: {formatSize(selectedDetailFile)}</p>
                <p className="text-xs text-(--ink-soft)">
                  Subido: {new Date(selectedDetailFile.fechaSubida).toLocaleDateString()}
                </p>
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--ink-soft)">
                Versiones
              </p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {versionHistory.length === 0 && <EmptyState message="Sin historial." />}
                {versionHistory.map((v) => (
                  <div key={v.id} className="rounded-lg border border-(--line) px-3 py-2">
                    <p className="text-[13px] font-semibold text-(--ink)">v{v.versionNumero}</p>
                    <p className="text-xs text-(--ink-soft)">{v.comentarioCambio || 'Sin comentario'}</p>
                    <p className="text-xs text-(--ink-xsoft)">
                      {new Date(v.fechaVersion).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick upload */}
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-(--ink)">Subida rápida</h3>
        <form onSubmit={handleUpload} className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
          <select
            required
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="field"
          >
            <option value="">Selecciona carpeta</option>
            {data.carpetas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 transition-colors ${
              isDragging ? 'border-(--brand) bg-(--brand-light)' : 'border-(--line) bg-white'
            }`}
          >
            <span className="text-(--ink-xsoft)"><UploadIcon size={14} /></span>
            <span className="flex-1 truncate text-sm text-(--ink-soft)">
              {selectedFile ? selectedFile.name : 'Arrastra o selecciona'}
            </span>
            <input
              type="file"
              required={!selectedFile}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-(--brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--brand-strong)"
          >
            <UploadIcon size={14} /> Subir
          </button>
        </form>
        {uploadProgress > 0 && (
          <div className="mt-3 space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-(--line)">
              <div
                className="h-full bg-(--brand) transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-(--ink-soft)">{uploadProgress}%</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderFiles = () => (
    <div className="fade-up">
      <SectionHeader
        title="Archivos"
        subtitle={`${data.archivos.length} archivos en total`}
      />
      {isLoading && <EmptyState message="Cargando archivos..." />}
      {!isLoading && data.archivos.length === 0 && (
        <div className="card p-10 text-center">
          <span className="mx-auto mb-3 block w-fit text-(--ink-xsoft)"><FileIcon size={32} /></span>
          <p className="text-sm text-(--ink-soft)">No hay archivos. Súbelos desde el Panel de control.</p>
        </div>
      )}
      {data.archivos.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--line) bg-(--line-soft)">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-soft)">Nombre</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-soft) sm:table-cell">Tipo</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--ink-soft) md:table-cell">Tamaño</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-(--ink-soft)">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.archivos.map((archivo, i) => {
                const p = personalizacionesMap[archivo.id]
                const tags = fileTagsMap[archivo.id] ?? []
                return (
                  <tr
                    key={archivo.id}
                    className={`hover:bg-(--line-soft) transition-colors ${i < data.archivos.length - 1 ? 'border-b border-(--line)' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {p?.imagenPortada ? (
                          <img
                            src={p.imagenPortada}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <span className="shrink-0 text-(--ink-xsoft)"><FileIcon /></span>
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleSelectDetailFile(archivo.id)}
                            className="block max-w-50 truncate font-medium transition-colors hover:text-(--brand)"
                            style={{
                              color: p?.colorTexto ?? undefined,
                              fontFamily: p?.fuente ?? undefined,
                            }}
                          >
                            {archivo.nombre}
                          </button>
                          {tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {tags.map((ae) => {
                                const tag = etiquetasById[ae.etiquetaId]
                                if (!tag) return null
                                return (
                                  <span
                                    key={ae.etiquetaId}
                                    className="inline-flex items-center gap-0.5 rounded-full bg-(--brand-light) px-2 py-0.5 text-[11px] font-medium text-(--brand-text)"
                                  >
                                    <TagIcon size={10} />
                                    {tag.nombreEtiqueta}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(archivo.id, ae.etiquetaId)}
                                      className="ml-0.5 opacity-60 hover:opacity-100"
                                      title="Quitar etiqueta"
                                    >
                                      <XIcon size={10} />
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-(--ink-soft) sm:table-cell">{archivo.tipoArchivo ?? '—'}</td>
                    <td className="hidden px-4 py-3 text-(--ink-soft) md:table-cell">{formatSize(archivo)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(archivo.id)}
                          className={`rounded-lg p-1.5 transition-colors ${favoritesSet.has(archivo.id) ? 'bg-(--accent-light) text-amber-500' : 'text-(--ink-xsoft) hover:bg-(--line-soft)'}`}
                          title={favoritesSet.has(archivo.id) ? 'Quitar favorito' : 'Marcar favorito'}
                        >
                          <StarIcon size={14} filled={favoritesSet.has(archivo.id)} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedCommentFileId(archivo.id); setActiveSection('comments') }}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:bg-(--line-soft) hover:text-blue-500"
                          title="Ver comentarios"
                        >
                          <MessageIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCustomFileId(archivo.id); handleLoadCustom(archivo.id); setActiveSection('customization') }}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:bg-(--line-soft) hover:text-purple-500"
                          title="Personalizar"
                        >
                          <PaintbrushIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(archivo.id)}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:bg-(--danger-light) hover:text-(--danger-text)"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderFolders = () => {
    if (openFolder) {
      return (
        <div className="fade-up">
          <div className="mb-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenFolder(null)}
              className="flex items-center gap-1 text-sm text-(--ink-soft) transition-colors hover:text-(--ink)"
            >
              <ChevronLeftIcon /> Carpetas
            </button>
            <span className="text-(--ink-xsoft)">/</span>
            <span className="text-sm font-semibold text-(--ink)">{openFolder.nombre}</span>
          </div>

          {isFolderLoading && <EmptyState message="Cargando archivos..." />}
          {!isFolderLoading && folderFiles.length === 0 && (
            <div className="card p-10 text-center">
              <span className="mx-auto mb-3 block w-fit text-(--ink-xsoft)"><FileIcon size={28} /></span>
              <p className="text-sm text-(--ink-soft)">Esta carpeta está vacía.</p>
            </div>
          )}
          {folderFiles.length > 0 && (
            <div className="card overflow-hidden">
              <div className="border-b border-(--line) bg-(--line-soft) px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--ink-soft)">
                  {folderFiles.length} archivo{folderFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-(--line)">
                {folderFiles.map((archivo) => {
                  const p = personalizacionesMap[archivo.id]
                  const tags = fileTagsMap[archivo.id] ?? []
                  return (
                    <div
                      key={archivo.id}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-(--line-soft)"
                    >
                      {p?.imagenPortada ? (
                        <img
                          src={p.imagenPortada}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <span className="shrink-0 text-(--ink-xsoft)"><FileIcon /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium"
                          style={{
                            color: p?.colorTexto ?? undefined,
                            fontFamily: p?.fuente ?? undefined,
                          }}
                        >
                          {archivo.nombre}
                        </p>
                        <p className="text-xs text-(--ink-xsoft)">{formatSize(archivo)}</p>
                        {tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tags.map((ae) => {
                              const tag = etiquetasById[ae.etiquetaId]
                              if (!tag) return null
                              return (
                                <span
                                  key={ae.etiquetaId}
                                  className="inline-flex items-center gap-0.5 rounded-full bg-(--brand-light) px-2 py-0.5 text-[11px] font-medium text-(--brand-text)"
                                >
                                  <TagIcon size={10} />
                                  {tag.nombreEtiqueta}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(archivo.id, ae.etiquetaId)}
                                    className="ml-0.5 opacity-60 hover:opacity-100"
                                    title="Quitar etiqueta"
                                  >
                                    <XIcon size={10} />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(archivo.id)}
                          className={`rounded-lg p-1.5 transition-colors ${favoritesSet.has(archivo.id) ? 'text-amber-400' : 'text-(--ink-xsoft) hover:text-amber-400'}`}
                          title={favoritesSet.has(archivo.id) ? 'Quitar favorito' : 'Marcar favorito'}
                        >
                          <StarIcon size={14} filled={favoritesSet.has(archivo.id)} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedCommentFileId(archivo.id); setActiveSection('comments') }}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:text-blue-500"
                          title="Ver comentarios"
                        >
                          <MessageIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCustomFileId(archivo.id); handleLoadCustom(archivo.id); setActiveSection('customization') }}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:text-purple-500"
                          title="Personalizar"
                        >
                          <PaintbrushIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(archivo.id)}
                          className="rounded-lg p-1.5 text-(--ink-xsoft) transition-colors hover:text-(--danger-text)"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="fade-up">
        <SectionHeader title="Carpetas" subtitle={`${data.carpetas.length} carpetas activas`} />

        <div className="card mb-5 p-4">
          <p className="mb-3 text-[13px] font-semibold text-(--ink-soft)">Nueva carpeta</p>
          <form onSubmit={handleCreateFolder} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              required
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              className="field"
            />
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="URL de portada (opcional)"
              className="field"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-(--brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--brand-strong)"
            >
              <PlusIcon /> Crear
            </button>
          </form>
        </div>

        {data.carpetas.length === 0 && <EmptyState message="No hay carpetas todavía." />}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.carpetas.map((carpeta) => {
            const count = data.archivos.filter((a) => a.carpetaId === carpeta.id).length
            return (
              <div key={carpeta.id} className="card group p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenFolder(carpeta)}
                    className="flex flex-1 items-center gap-2.5 text-left"
                  >
                    <span className="text-amber-400"><FolderIcon size={20} /></span>
                    <div>
                      <p className="text-sm font-semibold text-(--ink)">{carpeta.nombre}</p>
                      <p className="mt-0.5 text-xs text-(--ink-soft)">
                        {count} archivo{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(carpeta.id)}
                    className="rounded-lg p-1.5 text-(--ink-xsoft) opacity-0 transition-all hover:bg-(--danger-light) hover:text-(--danger-text) group-hover:opacity-100"
                    title="Eliminar carpeta"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTags = () => (
    <div className="fade-up">
      <SectionHeader title="Etiquetas" subtitle="Clasifica tus archivos con etiquetas personalizadas" />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Create + list */}
        <div className="card space-y-4 p-5">
          <p className="text-[13px] font-semibold text-(--ink-soft)">Crear etiqueta</p>
          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              required
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nombre de etiqueta"
              className="field"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1 rounded-lg bg-(--brand) px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--brand-strong)"
            >
              <PlusIcon /> Crear
            </button>
          </form>
          <div className="space-y-1.5 border-t border-(--line) pt-3">
            {data.etiquetas.length === 0 && <EmptyState message="No hay etiquetas todavía." />}
            {data.etiquetas.map((et) => (
              <div
                key={et.id}
                className="flex items-center gap-2 rounded-lg border border-(--line) px-3 py-2"
              >
                {editingTagId === et.id ? (
                  <form onSubmit={handleSaveEditTag} className="flex flex-1 gap-2">
                    <input
                      value={editingTagName}
                      onChange={(e) => setEditingTagName(e.target.value)}
                      className="field py-1 text-xs"
                    />
                    <button type="submit" className="rounded-md bg-(--brand) p-1.5 text-white">
                      <CheckIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingTagId(''); setEditingTagName('') }}
                      className="rounded-md bg-(--line) p-1.5 text-(--ink-soft)"
                    >
                      <XIcon />
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-(--ink)">{et.nombreEtiqueta}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingTagId(et.id); setEditingTagName(et.nombreEtiqueta) }}
                      className="rounded-md p-1.5 text-(--ink-xsoft) transition-colors hover:bg-(--line-soft)"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(et.id)}
                      className="rounded-md p-1.5 text-(--ink-xsoft) transition-colors hover:bg-(--danger-light) hover:text-(--danger-text)"
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assign */}
        <div className="card p-5">
          <p className="mb-3 text-[13px] font-semibold text-(--ink-soft)">Asignar etiqueta a archivo</p>
          <form onSubmit={handleAssignTag} className="space-y-3">
            <select
              required
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="field"
            >
              <option value="">Selecciona etiqueta</option>
              {data.etiquetas.map((et) => (
                <option key={et.id} value={et.id}>{et.nombreEtiqueta}</option>
              ))}
            </select>
            <select
              required
              value={selectedTagFileId}
              onChange={(e) => setSelectedTagFileId(e.target.value)}
              className="field"
            >
              <option value="">Selecciona archivo</option>
              {data.archivos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full rounded-lg bg-(--ink) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Asignar etiqueta
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  const renderFavorites = () => {
    const favoriteFiles = data.archivos.filter((a) => favoritesSet.has(a.id))
    return (
      <div className="fade-up">
        <SectionHeader
          title="Favoritos"
          subtitle={`${favoriteFiles.length} archivo${favoriteFiles.length !== 1 ? 's' : ''} marcado${favoriteFiles.length !== 1 ? 's' : ''}`}
        />
        {favoriteFiles.length === 0 && (
          <div className="card p-10 text-center">
            <span className="mx-auto mb-3 block w-fit text-amber-300"><StarIcon size={32} /></span>
            <p className="text-sm text-(--ink-soft)">Aún no tienes favoritos. Márcalos desde Archivos.</p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteFiles.map((archivo) => (
            <div key={archivo.id} className="card group p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-(--ink-xsoft)"><FileIcon /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--ink)">{archivo.nombre}</p>
                  <p className="mt-0.5 text-xs text-(--ink-soft)">{formatSize(archivo)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(archivo.id)}
                  className="shrink-0 text-amber-400 transition-colors hover:text-amber-500"
                >
                  <StarIcon size={14} filled />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderComments = () => (
    <div className="fade-up">
      <SectionHeader title="Comentarios" subtitle="Discusiones por archivo" />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card space-y-3 p-5">
          <p className="text-[13px] font-semibold text-(--ink-soft)">Nuevo comentario</p>
          <form onSubmit={handleCreateComment} className="space-y-3">
            <select
              required
              value={selectedCommentFileId}
              onChange={(e) => setSelectedCommentFileId(e.target.value)}
              className="field"
            >
              <option value="">Selecciona un archivo</option>
              {data.archivos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            <textarea
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={3}
              className="field resize-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-(--brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--brand-strong)"
            >
              Publicar
            </button>
          </form>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-[13px] font-semibold text-(--ink-soft)">
            {selectedCommentFileId
              ? `Comentarios · ${comments.length}`
              : 'Selecciona un archivo para ver comentarios'}
          </p>
          {isCommentsLoading && <EmptyState message="Cargando comentarios..." />}
          {!isCommentsLoading && selectedCommentFileId && comments.length === 0 && (
            <EmptyState message="Sin comentarios en este archivo." />
          )}
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-(--line) px-3 py-2.5">
                {editingCommentId === c.id ? (
                  <form onSubmit={handleSaveEditComment} className="space-y-2">
                    <input
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="field text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-md bg-(--brand) px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        <CheckIcon /> Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingCommentId(''); setEditingCommentText('') }}
                        className="rounded-md bg-(--line) px-2.5 py-1 text-xs font-semibold text-(--ink-soft)"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm text-(--ink)">{c.comentario}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-xs text-(--ink-xsoft)">
                        {new Date(c.fechaComentario ?? Date.now()).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.comentario) }}
                          className="rounded-md p-1 text-(--ink-xsoft) transition-colors hover:bg-(--line-soft)"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="rounded-md p-1 text-(--ink-xsoft) transition-colors hover:bg-(--danger-light) hover:text-(--danger-text)"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderActivity = () => (
    <div className="fade-up">
      <SectionHeader title="Actividad" subtitle="Registro de acciones recientes" />
      {isActivityLoading && <EmptyState message="Cargando actividad..." />}
      {!isActivityLoading && activity.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm text-(--ink-soft)">Sin actividad registrada todavía.</p>
        </div>
      )}
      {activity.length > 0 && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-(--line)">
            {activity.map((reg, i) => (
              <div key={reg.id ?? i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--brand)" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--ink)">{reg.accion}</p>
                  <p className="mt-0.5 text-xs text-(--ink-xsoft)">
                    {new Date(reg.fecha ?? Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderCustomization = () => (
    <div className="fade-up">
      <SectionHeader title="Personalizar archivo" subtitle="Imagen de portada, color de texto y fuente por archivo" />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* File picker + form */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-(--ink-soft)">Archivo</label>
            <select
              value={customFileId}
              onChange={(e) => handleLoadCustom(e.target.value)}
              className="field"
            >
              <option value="">Selecciona un archivo</option>
              {data.archivos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {isCustomLoading && <EmptyState message="Cargando personalización..." />}

          {!isCustomLoading && customFileId && (
            <form onSubmit={handleSaveCustom} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-(--ink-soft)">
                  URL imagen de portada
                </label>
                <input
                  type="url"
                  value={customForm.imagenPortada}
                  onChange={(e) => setCustomForm((p) => ({ ...p, imagenPortada: e.target.value }))}
                  placeholder="https://..."
                  className="field"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-semibold text-(--ink-soft)">
                    Color de texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customForm.colorTexto}
                      onChange={(e) => setCustomForm((p) => ({ ...p, colorTexto: e.target.value }))}
                      className="h-9 w-12 cursor-pointer rounded border border-(--line) bg-(--paper) p-1"
                    />
                    <span className="text-sm text-(--ink-soft)">{customForm.colorTexto}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-semibold text-(--ink-soft)">
                    Fuente
                  </label>
                  <select
                    value={customForm.fuente}
                    onChange={(e) => setCustomForm((p) => ({ ...p, fuente: e.target.value }))}
                    className="field"
                  >
                    {['Arial', 'Georgia', 'Helvetica', 'Inter', 'Courier New', 'Times New Roman', 'Verdana'].map(
                      (f) => <option key={f} value={f}>{f}</option>,
                    )}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-(--brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--brand-strong)"
                >
                  {customData ? 'Actualizar' : 'Crear'}
                </button>
                {customData && (
                  <button
                    type="button"
                    onClick={handleDeleteCustom}
                    className="rounded-lg border border-(--line) px-4 py-2 text-sm font-semibold text-(--ink-soft) transition-colors hover:bg-(--danger-light) hover:text-(--danger-text)"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Preview */}
        <div className="card p-5">
          <p className="mb-3 text-[13px] font-semibold text-(--ink-soft)">Vista previa</p>
          {!customFileId ? (
            <EmptyState message="Selecciona un archivo para ver la vista previa." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-(--line)">
              {customForm.imagenPortada && (
                <div className="h-32 w-full overflow-hidden bg-(--line-soft)">
                  <img
                    src={customForm.imagenPortada}
                    alt="Portada"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              )}
              <div className="p-4">
                <p
                  style={{ color: customForm.colorTexto, fontFamily: customForm.fuente }}
                  className="text-base font-semibold"
                >
                  {data.archivos.find((a) => a.id === customFileId)?.nombre ?? 'Nombre del archivo'}
                </p>
                <p
                  style={{ fontFamily: customForm.fuente }}
                  className="mt-1 text-sm text-(--ink-soft)"
                >
                  Fuente: {customForm.fuente}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="fade-up">
      <SectionHeader title="Configuración" subtitle="Preferencias de tu cuenta" />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theme */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-(--ink)">Tema de la interfaz</p>
              <p className="mt-0.5 text-xs text-(--ink-soft)">
                Actualmente en modo <span className="font-medium">{theme === 'Oscuro' ? 'oscuro' : 'claro'}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`relative flex h-9 w-16 items-center rounded-full transition-colors ${
                theme === 'Oscuro' ? 'bg-(--brand)' : 'bg-(--line)'
              }`}
              aria-label="Cambiar tema"
            >
              <span
                className={`absolute flex h-7 w-7 items-center justify-center rounded-full bg-white shadow transition-transform ${
                  theme === 'Oscuro' ? 'translate-x-8' : 'translate-x-1'
                }`}
              >
                {theme === 'Oscuro'
                  ? <MoonIcon size={13} />
                  : <SunIcon size={13} />
                }
              </span>
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="card p-5 space-y-2">
          <p className="text-[13px] font-semibold text-(--ink-soft)">Información de cuenta</p>
          <div className="rounded-lg bg-(--line-soft) px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-(--ink)">{user.nombre}</p>
            <p className="text-xs text-(--ink-soft)">{user.correo}</p>
            <p className="text-xs text-(--ink-xsoft)">ID: {user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const sectionMap = {
    overview:      renderOverview,
    files:         renderFiles,
    folders:       renderFolders,
    tags:          renderTags,
    favorites:     renderFavorites,
    comments:      renderComments,
    activity:      renderActivity,
    customization: renderCustomization,
    settings:      renderSettings,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s) => {
          setActiveSection(s)
          if (s !== 'folders') setOpenFolder(null)
          resetMessages()
        }}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <ActionBar error={error} message={actionMessage} onDismiss={resetMessages} />
          {sectionMap[activeSection]?.()}
        </div>
      </main>
    </div>
  )
}