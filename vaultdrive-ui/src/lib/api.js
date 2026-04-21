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
