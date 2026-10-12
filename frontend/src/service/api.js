const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/**
 * Wrapper mínimo sobre fetch para hablar con la API de FastAPI.
 * Lanza un Error con el mensaje `detail` que devuelve el backend.
 */
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    // FastAPI devuelve un string en errores propios y una lista en errores de validación.
    const message = Array.isArray(detail)
      ? 'Revisa los datos ingresados: alguno no tiene un formato válido.'
      : detail || 'Ocurrió un error inesperado.'
    throw new Error(message)
  }

  return data
}