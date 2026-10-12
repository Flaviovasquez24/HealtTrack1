import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import './Login.css'

/* =========================
   ICONOS
========================= */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.400 13.900a6 6 0 0 1 0-3.800V7.500H3.100a10 10 0 0 0 0 9l3.300-2.600Z" />
      <path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.900 1.500l2.800-2.800A10 10 0 0 0 3.100 7.500l3.300 2.600C7.200 7.800 9.400 6 12 6Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.700c0-2.400 2-3.500 2.100-3.600-1.200-1.700-3-1.900-3.600-1.900-1.500-.2-3 .9-3.800.9-.8 0-2-.9-3.300-.8-1.700 0-3.300 1-4.100 2.500-1.800 3.100-.5 7.600 1.300 10.100.8 1.200 1.800 2.600 3.100 2.500 1.200-.1 1.700-.8 3.200-.8s1.900.8 3.200.8c1.300 0 2.200-1.200 3-2.400.9-1.400 1.300-2.700 1.300-2.800-.1 0-2.400-.9-2.400-3.500ZM14 5.500c.7-.8 1.100-2 1-3.100-1 0-2.200.7-2.900 1.500-.6.700-1.200 1.900-1 3 1.100.1 2.200-.6 2.900-1.400Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M15.600 12v1.300a2.300 2.300 0 0 0 4.600 0V12a8.200 8.200 0 1 0-3.200 6.500" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg {...svgProps}>
      <rect x="4.500" y="10.500" width="15" height="9.500" rx="2.200" />
      <path d="M8 10.500V8a4 4 0 0 1 7.600-1.700" />
    </svg>
  )
}

function EyeIcon({ off }) {
  return (
    <svg {...svgProps}>
      <path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" />
      <circle cx="12" cy="12" r="2.800" />
      {off && <path d="m4 4 16 16" />}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg {...svgProps} width="15" height="15">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function FingerprintIcon() {
  return (
    <svg {...svgProps}>
      <path d="M6.500 5.800A8.500 8.500 0 0 1 20 11.500c0 1.500-.2 3-.7 4.400" />
      <path d="M4 11.500a8 8 0 0 1 .5-2.800" />
      <path d="M8 18.500c.6-1.800.9-3.500.9-5.500a3.100 3.100 0 0 1 6.200 0c0 2.500.4 4.500 1.400 6.300" />
      <path d="M12 13c0 3-.6 5.300-1.600 7.300" />
      <path d="M4.500 15.500c.3-1.300.5-2.600.5-4" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m7.800 12.300 2.900 2.900 5.500-6" fill="none" stroke="#0b1530" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M12 2.500 4.500 5.500v5.700c0 4.700 3.200 8.600 7.500 10.300 4.300-1.700 7.500-5.600 7.500-10.300V5.500L12 2.500Z" fill="currentColor" />
      <path d="m8.800 12.200 2.400 2.400 4-4.400" fill="none" stroke="#0b1530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockSolid() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M8 10V7.500a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" />
      <rect x="4.500" y="10" width="15" height="11" rx="2.500" fill="currentColor" />
    </svg>
  )
}

function WatchIcon() {
  return (
    <svg {...svgProps} width="20" height="20">
      <path d="M8.500 7V3.500h7V7M8.500 17v3.500h7V17" />
      <rect x="6" y="7" width="12" height="10" rx="3" />
      <path d="M12 9.800V12l1.600 1.200" />
    </svg>
  )
}

/* =========================
   DATOS
========================= */

const STANDARDS = [
  { icon: <CheckCircle />, label: '+99.4% Precisión telemetría' },
  { icon: <ShieldCheck />, label: 'Certificado CE Medical Device' },
  { icon: <LockSolid />, label: 'Encriptación biométrica AES-256' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* =========================
   PÁGINA
========================= */

function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const found = {}
    if (!email.trim()) found.email = 'Ingresa tu correo electrónico.'
    else if (!EMAIL_RE.test(email.trim())) found.email = 'El correo no tiene un formato válido.'
    if (!password) found.password = 'Ingresa tu contraseña.'
    return found
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')
    setNotice('')

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await login({ email: email.trim(), password, remember })
      // AuthContext actualiza el estado y App.jsx muestra el dashboard.
    } catch (error) {
      setServerError(error.message)
      setSubmitting(false)
    }
  }

  const comingSoon = (what) => () => {
    setServerError('')
    setNotice(`${what} estará disponible próximamente.`)
  }

  return (
    <div className="lg-page">
      {/* ===== Panel izquierdo ===== */}
      <aside className="lg-hero">
        <div className="lg-hero-inner">
          <div className="lg-logo-row">
            <span className="lg-logo-mark">
              <span />
            </span>
            <div className="lg-logo-copy">
              <div className="lg-logo-line">
                <span className="lg-logo-text">HealthTrack</span>
                <span className="lg-logo-pill">PRO</span>
              </div>
              <small>Portal de Salud del Consumidor</small>
            </div>
          </div>

          <div className="lg-hero-body">
            <span className="lg-live">
              <i /> TELEMETRÍA BIOMÉTRICA EN TIEMPO REAL
            </span>

            <h2>
              Tu salud y rendimiento biométrico, <span className="lg-grad">bajo control</span> en un
              solo lugar.
            </h2>

            <p className="lg-hero-lead">
              Monitorea pulso cardíaco, calidad del sueño, gasto calórico y sincronización
              instantánea con tu FitBand Pro mediante analítica clínica avanzada.
            </p>

            <div className="lg-device">
              <div className="lg-device-head">
                <span className="lg-device-icon">
                  <WatchIcon />
                </span>
                <div>
                  <strong>FitBand Pro</strong>
                  <span className="lg-device-status">
                    <i /> Conectado · Batería 78%
                  </span>
                </div>
                <span className="lg-device-time">Hoy, 18:45</span>
              </div>

              <div className="lg-device-stats">
                <div>
                  <span>Ritmo cardíaco</span>
                  <p>
                    <b className="lg-hr">♥ 72</b> <small>ppm</small>
                  </p>
                </div>
                <div>
                  <span>Pasos diarios</span>
                  <p>
                    <b className="lg-steps">8,432</b>
                  </p>
                </div>
                <div>
                  <span>Calorías</span>
                  <p>
                    <b className="lg-cal">342</b> <small>kcal</small>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg-standards">
            <h3>ESTÁNDARES DE GRADO HOSPITALARIO</h3>
            <ul>
              {STANDARDS.map((item) => (
                <li key={item.label}>
                  {item.icon}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* ===== Panel derecho ===== */}
      <main className="lg-panel">
        <div className="lg-panel-inner">
          <form className="lg-form" onSubmit={handleSubmit} noValidate>
            <span className="lg-tag">
              <i /> Portal de Pacientes &amp; Consumidor
            </span>

            <h1>Bienvenido de nuevo</h1>
            <p className="lg-sub">
              Inicia sesión para acceder a tu historial biométrico, metas y estadísticas de
              FitBand Pro.
            </p>

            <div className="lg-social">
              <button type="button" onClick={comingSoon('El acceso con Google')}>
                <GoogleIcon /> Google
              </button>
              <button type="button" onClick={comingSoon('El acceso con Apple')}>
                <AppleIcon /> Apple
              </button>
            </div>

            <div className="lg-divider">
              <span>O INGRESA CON TU CORREO</span>
            </div>

            {serverError && (
              <div className="lg-alert lg-alert-error" role="alert">
                {serverError}
              </div>
            )}
            {notice && (
              <div className="lg-alert lg-alert-info" role="status">
                {notice}
              </div>
            )}

            <div className="lg-field">
              <label htmlFor="lg-email">CORREO ELECTRÓNICO</label>
              <div className={`lg-input${errors.email ? ' has-error' : ''}`}>
                <MailIcon />
                <input
                  id="lg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="alejandro.morales@healthtrack.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="lg-error">{errors.email}</p>}
            </div>

            <div className="lg-field">
              <div className="lg-label-row">
                <label htmlFor="lg-password">CONTRASEÑA</label>
                <a href="#/" onClick={(e) => { e.preventDefault(); comingSoon('La recuperación de contraseña')() }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className={`lg-input${errors.password ? ' has-error' : ''}`}>
                <LockIcon />
                <input
                  id="lg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="lg-eye"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {errors.password && <p className="lg-error">{errors.password}</p>}
            </div>

            <label className="lg-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="lg-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.500 4.500 4.500L19 7.500" />
                </svg>
              </span>
              Recordar este dispositivo por 30 días
            </label>

            <button className="lg-submit" type="submit" disabled={submitting}>
              {submitting ? 'Iniciando sesión…' : (<>Iniciar Sesión <ArrowIcon /></>)}
            </button>

            <button type="button" className="lg-passkey" onClick={comingSoon('El acceso con Passkey')}>
              <FingerprintIcon /> Acceder con llave biométrica / Passkey
            </button>

            <p className="lg-register">
              ¿Aún no tienes una cuenta? <a href="#/registro">Regístrate aquí</a>
            </p>
          </form>

          <footer className="lg-footer">
            <div className="lg-footer-links">
              <span><i /> Conforme con RGPD (UE)</span>
              <span><i /> HIPAA Compliant</span>
              <a href="#/">Términos de Servicio</a>
              <a href="#/">Privacidad Biometría</a>
            </div>
            <p>© 2026 HealthTrack Technologies Inc. Todos los derechos reservados.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Login