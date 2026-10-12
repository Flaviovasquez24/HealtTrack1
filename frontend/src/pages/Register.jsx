import { useState } from 'react'
import { registerUser } from '../service/authService.js'
import './Register.css'

/* ---------- Iconos ---------- */

function Svg({ children, size = 16, fill = 'none', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
)
const MailIcon = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
)
const LockIcon = () => (
  <Svg>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
)
const ShieldIcon = () => (
  <Svg>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15 10.5" />
  </Svg>
)
const EyeIcon = ({ off }) => (
  <Svg size={17}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
    {off && <path d="m4 4 16 16" />}
  </Svg>
)
const InfoIcon = () => (
  <Svg size={13}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
)
const ArrowIcon = () => (
  <Svg size={16}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)
const CheckIcon = () => (
  <Svg size={12} strokeWidth="3">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)
const PhoneIcon = () => (
  <Svg size={17}>
    <rect x="7" y="2.8" width="10" height="18.4" rx="2.5" />
    <path d="M10 18.5h4" />
  </Svg>
)
const BoltIcon = () => (
  <Svg size={17}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
  </Svg>
)
const DocIcon = () => (
  <Svg size={17}>
    <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z" />
    <path d="m9.8 14.2 1.7 1.7 3-3.2" />
  </Svg>
)
const LockSmallIcon = () => (
  <Svg size={13}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
)
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5Z" />
    <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3a11.5 11.5 0 0 0 10.2 6.3Z" />
    <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
    <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3c.9-2.7 3.4-4.4 6.4-4.4Z" />
  </svg>
)
const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
)

/* ---------- Datos ---------- */

const FEATURES = [
  {
    icon: <PhoneIcon />,
    title: 'Sincronización en tiempo real',
    text: 'Compatible al instante con FitBand Pro, Apple Watch, Garmin y sensores biométricos de precisión.',
  },
  {
    icon: <BoltIcon />,
    title: 'Asesor de Salud IA Predictivo',
    text: 'Análisis preventivo y detección temprana de anomalías cardíacas, niveles de estrés y sueño reparador.',
  },
  {
    icon: <DocIcon />,
    title: 'Reportes clínicos listos para tu médico',
    text: 'Genera fichas y resúmenes validados para compartir de inmediato con tu cardiólogo o especialista.',
  },
]

const WEARABLES = [
  'FitBand Pro (Recomendado)',
  'FitBand Lite',
  'Apple Watch',
  'Garmin',
  'Otro dispositivo',
]

const MIN_PASSWORD_LENGTH = 8

/** Devuelve nivel 0-3 de seguridad de la clave y su etiqueta. */
function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '' }

  const checks = [
    password.length >= MIN_PASSWORD_LENGTH,
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  if (!checks[0] || score <= 1) return { level: 1, label: 'Débil' }
  if (score <= 3) return { level: 2, label: 'Media / Buena' }
  return { level: 3, label: 'Fuerte' }
}

const INITIAL_FORM = {
  fullName: '',
  email: '',
  birthDate: '',
  wearable: WEARABLES[0],
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  acceptNews: true,
}

function validate(form) {
  const errors = {}

  if (form.fullName.trim().length < 2) errors.fullName = 'Ingresa tu nombre completo.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Ingresa un correo válido.'

  if (!form.birthDate) errors.birthDate = 'Indica tu fecha de nacimiento.'
  else if (new Date(form.birthDate) > new Date()) errors.birthDate = 'La fecha no puede ser futura.'

  if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La clave debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Las contraseñas no coinciden.'
  if (!form.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos para continuar.'

  return errors
}

/* ---------- Página ---------- */

function Register() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [created, setCreated] = useState(false)

  const strength = getPasswordStrength(form.password)

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')
    setNotice('')

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setCreated(true)
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rg-page">
      {/* ===== Panel izquierdo ===== */}
      <aside className="rg-hero">
        <div className="rg-hero-inner">
          <div className="rg-logo-row">
            <span className="rg-logo-mark">
              <span />
            </span>
            <span className="rg-logo-text">
              Health<span>Track</span>
            </span>
            <span className="rg-logo-pill">PORTAL CLÍNICO</span>
          </div>

          <div className="rg-hero-body">
            <span className="rg-version">
              <i /> Plataforma de Salud
            </span>

            <h2>Comienza a monitorear tu salud de forma inteligente</h2>
            <p className="rg-hero-lead">
              Centraliza tus constantes vitales, actividad diaria y biométricos en una plataforma
              con grado médico y privacidad estricta.
            </p>

            <ul className="rg-features">
              {FEATURES.map((feature) => (
                <li key={feature.title}>
                  <span className="rg-feature-icon">{feature.icon}</span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rg-proof">
            <div className="rg-avatars" aria-hidden="true">
              <span style={{ background: '#2f6df6' }}>MD</span>
              <span style={{ background: '#16a37a' }}>DR</span>
              <span style={{ background: '#2a3a55' }}>+1k</span>
            </div>
            <div>
              <div className="rg-rating">
                <span className="rg-stars" aria-hidden="true">★★★★★</span>
                <b>4.9/5</b>
              </div>
              <p>Recomendado por cardiólogos y especialistas en medicina deportiva preventiva.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Panel derecho ===== */}
      <main className="rg-panel">
        <div className="rg-form-wrap">
          {created ? (
            <div className="rg-success" role="status">
              <span className="rg-success-icon">
                <CheckIcon />
              </span>
              <h1>Cuenta creada</h1>
              <p>
                Tu cuenta en HealthTrack está lista. Ya puedes iniciar sesión y vincular tu
                wearable.
              </p>
              <a className="rg-submit rg-submit-link" href="#/">
                Ir a HealthTrack
              </a>
            </div>
          ) : (
            <>
              <span className="rg-badge">Acceso al Portal Paciente</span>
              <h1>Crea tu cuenta en HealthTrack</h1>
              <p className="rg-subtitle">Monitorea tus hábitos, biometría y descanso hoy mismo.</p>

              <div className="rg-social">
                <button
                  type="button"
                  onClick={() => setNotice('El registro con Google estará disponible pronto.')}
                >
                  <GoogleIcon /> Registrar con Google
                </button>
                <button
                  type="button"
                  onClick={() => setNotice('El registro con Apple estará disponible pronto.')}
                >
                  <AppleIcon /> Registrar con Apple
                </button>
              </div>
              {notice && (
                <p className="rg-notice" role="status">
                  {notice}
                </p>
              )}

              <div className="rg-divider">
                <span>O COMPLETA TUS DATOS PERSONALES</span>
              </div>

              <form className="rg-form" onSubmit={handleSubmit} noValidate>
                <div className="rg-field">
                  <label htmlFor="rg-name">NOMBRE COMPLETO</label>
                  <div className={`rg-input${errors.fullName ? ' has-error' : ''}`}>
                    <UserIcon />
                    <input
                      id="rg-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Ej. Alejandro Morales"
                      value={form.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                    />
                  </div>
                  {errors.fullName && <span className="rg-error">{errors.fullName}</span>}
                </div>

                <div className="rg-field">
                  <label htmlFor="rg-email">CORREO ELECTRÓNICO</label>
                  <div className={`rg-input${errors.email ? ' has-error' : ''}`}>
                    <MailIcon />
                    <input
                      id="rg-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alejandro@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                  {errors.email && <span className="rg-error">{errors.email}</span>}
                </div>

                <div className="rg-row">
                  <div className="rg-field">
                    <label htmlFor="rg-birth">FECHA DE NACIMIENTO</label>
                    <div className={`rg-input${errors.birthDate ? ' has-error' : ''}`}>
                      <input
                        id="rg-birth"
                        type="date"
                        autoComplete="bday"
                        value={form.birthDate}
                        onChange={(e) => setField('birthDate', e.target.value)}
                      />
                    </div>
                    {errors.birthDate && <span className="rg-error">{errors.birthDate}</span>}
                  </div>

                  <div className="rg-field">
                    <label htmlFor="rg-wearable">WEARABLE PRINCIPAL</label>
                    <div className="rg-input rg-select">
                      <select
                        id="rg-wearable"
                        value={form.wearable}
                        onChange={(e) => setField('wearable', e.target.value)}
                      >
                        {WEARABLES.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                      <svg className="rg-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="rg-field">
                  <label htmlFor="rg-password">CONTRASEÑA DE ACCESO</label>
                  <div className={`rg-input${errors.password ? ' has-error' : ''}`}>
                    <LockIcon />
                    <input
                      id="rg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                    />
                    <button
                      type="button"
                      className="rg-eye"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>

                  <div className="rg-strength" data-level={strength.level}>
                    <div className="rg-strength-head">
                      <span>Seguridad de la clave:</span>
                      <b>{strength.label}</b>
                    </div>
                    <div className="rg-strength-bars" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>

                  {errors.password ? (
                    <span className="rg-error">{errors.password}</span>
                  ) : (
                    <p className="rg-hint">
                      <InfoIcon /> Mínimo 8 caracteres, combinación de números y caracteres
                      especiales.
                    </p>
                  )}
                </div>

                <div className="rg-field">
                  <label htmlFor="rg-confirm">CONFIRMAR CONTRASEÑA</label>
                  <div className={`rg-input${errors.confirmPassword ? ' has-error' : ''}`}>
                    <ShieldIcon />
                    <input
                      id="rg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setField('confirmPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      className="rg-eye"
                      aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      <EyeIcon off={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="rg-error">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="rg-checks">
                  <label className="rg-check">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => setField('acceptTerms', e.target.checked)}
                    />
                    <span className="rg-box">
                      <CheckIcon />
                    </span>
                    <span>
                      Acepto los <a href="#/registro">Términos de Servicio</a> y la{' '}
                      <a href="#/registro">Política de Tratamiento de Datos Biométricos</a> según
                      directrices RGPD y estándares HIPAA.
                    </span>
                  </label>
                  {errors.acceptTerms && <span className="rg-error">{errors.acceptTerms}</span>}

                  <label className="rg-check">
                    <input
                      type="checkbox"
                      checked={form.acceptNews}
                      onChange={(e) => setField('acceptNews', e.target.checked)}
                    />
                    <span className="rg-box">
                      <CheckIcon />
                    </span>
                    <span>
                      Deseo recibir recomendaciones de salud preventiva, alertas biométricas y
                      resúmenes semanales por correo.
                    </span>
                  </label>
                </div>

                {serverError && (
                  <p className="rg-alert" role="alert">
                    {serverError}
                  </p>
                )}

                <button className="rg-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Creando tu cuenta…' : 'Crear mi cuenta gratuita'}
                  {!submitting && <ArrowIcon />}
                </button>
              </form>

              <p className="rg-login">
                ¿Ya tienes cuenta en HealthTrack? <a href="#/">Inicia sesión aquí</a>
              </p>

              <div className="rg-trust">
                <span>
                  <ShieldIcon /> Cifrado de extremo a extremo AES-256
                </span>
                <span>
                  <LockSmallIcon /> Certificación HIPAA &amp; ISO 27001
                </span>
              </div>

              <p className="rg-legal">
                © 2026 HealthTrack Inc. Todos los derechos reservados. Plataforma para uso preventivo
                y de seguimiento de bienestar.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Register