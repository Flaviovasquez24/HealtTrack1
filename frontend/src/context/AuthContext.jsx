import { createContext, useCallback, useMemo, useState } from 'react'
import { loginUser } from '../service/authService.js'

const TOKEN_KEY = 'ht_token'

export const AuthContext = createContext(null)

// Lee el token guardado: primero "recordar dispositivo" (localStorage), luego la sesión actual.
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

function storeToken(token, remember) {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)

  const login = useCallback(async ({ email, password, remember }) => {
    const data = await loginUser({ email, password })
    storeToken(data.access_token, remember)
    setToken(data.access_token)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* noop */
    }
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}