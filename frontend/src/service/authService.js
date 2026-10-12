import { apiRequest } from './api.js'

/** POST /auth/register -> crea la cuenta y devuelve el usuario. */
export function registerUser({ fullName, email, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { full_name: fullName, email, password },
  })
}

/** POST /auth/login -> devuelve { access_token, token_type }. */
export function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}