const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5213/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'include',
    ...options,
  })

  const raw = await response.text()
  const data = raw ? JSON.parse(raw) : null

  if (!response.ok) {
    const message = data?.mensaje ?? data?.message ?? 'Error en la solicitud'
    throw new Error(message)
  }

  return data
}

export function registro(payload) {
  return request('/Auth/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return request('/Auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request('/Auth/logout', {
    method: 'POST',
  })
}

export function getArchivosByUsuario(usuarioId) {
  return request(`/Archivo/usuario/${usuarioId}`)
}

export function getCarpetasByUsuario(usuarioId) {
  return request(`/carpetas/${usuarioId}`)
}

export function getEtiquetasByUsuario(usuarioId) {
  return request(`/Etiquetas/${usuarioId}`)
}

export function getFavoritosByUsuario(usuarioId) {
  return request(`/Favoritos/${usuarioId}`)
}

export function crearCarpeta(payload) {
  return request('/carpetas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function crearEtiqueta(payload) {
  return request('/Etiquetas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function actualizarEtiqueta(id, payload) {
  return request(`/Etiquetas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function eliminarEtiqueta(id) {
  return request(`/Etiquetas/${id}`, {
    method: 'DELETE',
  })
}

export function asignarEtiqueta(payload) {
  return request('/Etiquetas/asignar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function agregarFavorito(payload) {
  return request('/Favoritos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function quitarFavorito(payload) {
  return request('/Favoritos', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function crearComentario(payload) {
  return request('/Comentarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function actualizarComentario(id, payload) {
  return request(`/Comentarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function eliminarComentario(id) {
  return request(`/Comentarios/${id}`, {
    method: 'DELETE',
  })
}

export function getComentariosByArchivo(archivoId) {
  return request(`/Comentarios/${archivoId}`)
}

export function getArchivoById(id) {
  return request(`/Archivo/${id}`)
}

export function getHistorialVersiones(archivoId) {
  return request(`/VersionArchivo/historial/${archivoId}`)
}

export async function subirArchivo({ usuarioId, carpetaId, file }) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `${API_BASE_URL}/Archivo/subir?usuarioId=${usuarioId}&carpetaId=${carpetaId}`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    },
  )

  const raw = await response.text()
  const data = raw ? JSON.parse(raw) : null

  if (!response.ok) {
    const message = data?.mensaje ?? data?.message ?? 'No se pudo subir el archivo'
    throw new Error(message)
  }

  return data
}

export function subirArchivoConProgreso({ usuarioId, carpetaId, file, onProgress }) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/Archivo/subir?usuarioId=${usuarioId}&carpetaId=${carpetaId}`)
    xhr.withCredentials = true

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress?.(percent)
      }
    }

    xhr.onload = () => {
      let data = null

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        data = null
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
        return
      }

      const message = data?.mensaje ?? data?.message ?? 'No se pudo subir el archivo'
      reject(new Error(message))
    }

    xhr.onerror = () => {
      reject(new Error('Error de red al subir archivo'))
    }

    xhr.send(formData)
  })
}

export function getArchivosByCarpeta(carpetaId) {
  return request(`/Archivo/carpeta/${carpetaId}`)
}

export function eliminarArchivo(id) {
  return request(`/Archivo/${id}`, { method: 'DELETE' })
}

export function eliminarCarpeta(id) {
  return request(`/carpetas/${id}`, { method: 'DELETE' })
}

export function getRegistroActividad(usuarioId) {
  return request(`/RegistroActividad/${usuarioId}`)
}

// ---------- ConfiguracionUsuario ----------
export function getConfiguracion(usuarioId) {
  return request(`/ConfiguracionUsuario/${usuarioId}`)
}

export function actualizarConfiguracion(usuarioId, dto) {
  return request(`/ConfiguracionUsuario/${usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  })
}

// ---------- ArchivoPersonalizado ----------
export function getPersonalizacion(archivoId) {
  return request(`/ArchivoPersonalizado/archivo/${archivoId}`)
}

export function getPersonalizacionesBulk(archivoIds) {
  return request('/ArchivoPersonalizado/bulk', { method: 'POST', body: JSON.stringify(archivoIds) })
}

export function crearPersonalizacion(dto) {
  return request('/ArchivoPersonalizado', { method: 'POST', body: JSON.stringify(dto) })
}

export function actualizarPersonalizacion(dto) {
  return request('/ArchivoPersonalizado', { method: 'PUT', body: JSON.stringify(dto) })
}

export function eliminarPersonalizacion(id) {
  return request(`/ArchivoPersonalizado/${id}`, { method: 'DELETE' })
}
