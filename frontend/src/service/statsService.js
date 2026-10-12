import { apiRequest } from './api.js'

/** GET /users/me -> { id, email, full_name, created_at } del usuario autenticado. */
export function getCurrentUser(token) {
  return apiRequest('/users/me', { token })
}

/** PATCH /users/me -> actualiza el nombre del usuario. */
export function updateCurrentUser(token, { fullName }) {
  return apiRequest('/users/me', { method: 'PATCH', token, body: { full_name: fullName } })
}

/** GET /devices/me -> detalle del dispositivo del usuario. */
export function getMyDevice(token) {
  return apiRequest('/devices/me', { token })
}

/** GET /device-stats/dashboard -> payload agregado del Dashboard del usuario autenticado. */
export function getDashboard(token) {
  return apiRequest('/device-stats/dashboard', { token })
}

/** GET /device-stats/summary?period=today|7d|30d -> payload agregado de la vista Estadísticas. */
export function getStatsSummary(token, period = '7d') {
  return apiRequest(`/device-stats/summary?period=${encodeURIComponent(period)}`, { token })
}

/** PATCH /devices/me -> renombra el dispositivo (name / edition). */
export function updateMyDevice(token, { name, edition }) {
  return apiRequest('/devices/me', { method: 'PATCH', token, body: { name, edition } })
}

/** POST /devices/me/sync -> "Sincronizar ahora". Devuelve { synced_at, battery_level, is_connected }. */
export function syncMyDevice(token) {
  return apiRequest('/devices/me/sync', { method: 'POST', token })
}

/** POST /devices/me/unpair -> desvincula el dispositivo (204 sin contenido). */
export function unpairMyDevice(token) {
  return apiRequest('/devices/me/unpair', { method: 'POST', token })
}