import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentUser, getDashboard, getMyDevice, getStatsSummary } from '../service/statsService.js'
import { useAuth } from './useAuth.js'

function useRemote(fetcher) {
  const { token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const result = await fetcher(token)
      if (id === requestId.current) setData(result)
    } catch (err) {
      if (id !== requestId.current) return
      // Token vencido o inválido: volver al login.
      if (/credencial|token|autenticad|validate/i.test(err.message)) logout()
      setError(err.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [fetcher, token, logout])

  useEffect(() => {
    load()
  }, [load])

  return { data, error, loading, reload: load }
}

/** Datos del Dashboard del usuario con sesión iniciada. */
export function useDashboard() {
  return useRemote(getDashboard)
}

/** Resumen de la vista Estadísticas para un período: 'today' | '7d' | '30d'. */
export function useStatsSummary(period) {
  const fetcher = useCallback((token) => getStatsSummary(token, period), [period])
  return useRemote(fetcher)
}

/** Perfil básico (nombre/correo) del usuario con sesión iniciada. */
export function useCurrentUser() {
  const result = useRemote(getCurrentUser)
  const { reload } = result

  // Cuando otra pantalla (Perfil/Configuración) guarda cambios, refresca el nombre en todas.
  useEffect(() => {
    window.addEventListener(USER_UPDATED_EVENT, reload)
    return () => window.removeEventListener(USER_UPDATED_EVENT, reload)
  }, [reload])

  return result
}

/** Dispositivo vinculado del usuario con sesión iniciada. */
export function useMyDevice() {
  return useRemote(getMyDevice)
}

export const USER_UPDATED_EVENT = 'ht:user-updated'