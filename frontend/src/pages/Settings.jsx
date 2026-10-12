import { useEffect, useRef, useState } from 'react'
import './Settings.css'
import { useAuth } from '../hooks/useAuth.js'
import { USER_UPDATED_EVENT, useCurrentUser, useMyDevice } from '../hooks/useDeviceStats.js'
import { updateCurrentUser } from '../service/statsService.js'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// El backend guarda fechas en UTC sin zona; se interpretan como UTC.
function memberSince(iso) {
  if (!iso) return ''
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

/* =====================================
   ICONOS
===================================== */

const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  next: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12 5 5L20 7" />,
  reset: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  save: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  idCard: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 17c.5-1.7 1.7-2.5 3-2.5s2.5.8 3 2.5M15 9h3M15 13h3" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />,
  shieldCheck: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  laptop: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 20h20" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M16 7l3 3" />
    </>
  ),
  watch: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2l1 1M16.1 7.7l-.8-4A2 2 0 0 0 13.3 2h-2.6a2 2 0 0 0-2 1.6l-.8 4M7.9 16.4l.8 4a2 2 0 0 0 2 1.6h2.6a2 2 0 0 0 2-1.6l.8-4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
}

function Icon({ name, size = 16, stroke = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

/* =====================================
   DATOS MOCK
   (reemplazar por la API de usuario / dispositivo)
===================================== */

const DEFAULTS = {
  form: {
    // name y email se rellenan desde la API (/users/me)
    name: '',
    phone: '',
    email: '',
    lang: 'es-ES',
    tz: 'Europe/Madrid',
  },
  toggles: {
    sync: true,
    spo2: true,
    haptic: true,
    weekly: true,
    inactivity: true,
    goals: true,
  },
}

const LANGS = [
  ['es-ES', 'Español (España)'],
  ['en-US', 'English (US)'],
  ['pt-BR', 'Português (Brasil)'],
]

const TIMEZONES = [
  ['Europe/Madrid', 'UTC+02:00 Madrid (CEST)'],
  ['Europe/London', 'UTC+01:00 Londres (BST)'],
  ['America/Lima', 'UTC-05:00 Lima (PET)'],
  ['America/Mexico_City', 'UTC-06:00 Ciudad de México (CST)'],
]

const WEARABLE_TOGGLES = [
  ['sync', 'Sincronización en segundo plano', 'Transferencia automática cada 5 min de pasos, cardio y sueño'],
  ['spo2', 'Calibración nocturna de SpO2 continuo', 'Muestreo cada 15 min durante fase REM y descanso'],
  ['haptic', 'Alerta háptica de frecuencia anómala', 'Vibración inmediata si FC > 110 ppm en reposo o < 45 ppm'],
]

const ALERT_TOGGLES = [
  ['weekly', 'Resumen semanal por email', 'Enviado los lunes a las 08:00 AM con métricas'],
  ['inactivity', 'Avisos de inactividad física', 'Alerta tras 60 minutos sin movimiento'],
  ['goals', 'Notificaciones de metas cumplidas', 'Celebración de objetivos al alcanzar 100%'],
]

const TABS = [
  ['cuenta', 'Cuenta', 'user'],
  ['dispositivo', 'Dispositivo', 'watch'],
  ['notificaciones', 'Notificaciones', 'bell'],
  ['privacidad', 'Privacidad y Datos', 'shield'],
]

const MIN_PASSWORD = 10

/* =====================================
   COMPONENTES
===================================== */

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function CardHead({ icon, title, badge, sub, right }) {
  return (
    <header className="set-card-head">
      <span className="set-card-icon">
        <Icon name={icon} size={17} />
      </span>

      <div className="set-card-titles">
        <div className="set-title-row">
          <h2>{title}</h2>
          {badge}
        </div>
        <p>{sub}</p>
      </div>

      {right}
    </header>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`set-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`set-switch${checked ? ' on' : ''}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <i />
    </button>
  )
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="set-toggle-row">
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

/* =====================================
   PÁGINA PRINCIPAL
===================================== */

function Settings({ onNavigate }) {
  const [saved, setSaved] = useState(DEFAULTS)
  const [form, setForm] = useState(DEFAULTS.form)
  const [toggles, setToggles] = useState(DEFAULTS.toggles)
  const [tab, setTab] = useState('cuenta')
  const [toast, setToast] = useState('')

  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [pwAge, setPwAge] = useState('hace 45d')

  const sections = useRef({})

  const { token } = useAuth()
  const { data: user } = useCurrentUser()
  const { data: device } = useMyDevice()

  // Al llegar los datos del usuario, rellenar nombre y correo reales (sin marcar cambios pendientes).
  useEffect(() => {
    if (!user) return
    const real = { name: user.full_name, email: user.email }
    setSaved((s) => ({ ...s, form: { ...s.form, ...real } }))
    setForm((f) => ({ ...f, ...real }))
  }, [user])

  const dirty = JSON.stringify({ form, toggles }) !== JSON.stringify(saved)

  const pwTooShort = pw.next.length > 0 && pw.next.length < MIN_PASSWORD
  const pwMismatch = pw.confirm.length > 0 && pw.next !== pw.confirm
  const pwValid = pw.next.length >= MIN_PASSWORD && pw.next === pw.confirm

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setToggle = (key) => (value) => setToggles((t) => ({ ...t, [key]: value }))

  const save = async () => {
    try {
      const name = form.name.trim()
      if (name && name !== saved.form.name) {
        await updateCurrentUser(token, { fullName: name })
        window.dispatchEvent(new Event(USER_UPDATED_EVENT))
      }
      setSaved({ form: { ...form, name: name || saved.form.name }, toggles })
      setToast('Cambios guardados correctamente')
    } catch (err) {
      setToast(err.message)
    }
  }

  const reset = () => {
    setForm(saved.form)
    setToggles(saved.toggles)
  }

  const updatePassword = () => {
    setPw({ next: '', confirm: '' })
    setPwAge('hoy')
    setToast('Contraseña actualizada')
  }

  const goTo = (id) => {
    setTab(id)
    sections.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const ref = (id) => (el) => {
    sections.current[id] = el
  }

  return (
    <div className="set">

      {/* CABECERA */}

      <div className="set-head">
        <div className="set-head-title">
          <nav className="set-crumbs" aria-label="Ruta de navegación">
            <button type="button" onClick={() => onNavigate?.('dashboard')}>
              <Icon name="home" size={12} />
              Inicio
            </button>
            <Icon name="next" size={11} />
            <strong>Configuración</strong>
          </nav>

          <span className="set-divider" />

          <h1>Configuración y Preferencias</h1>
        </div>

        <div className="set-head-actions">
          <button className="set-btn soft" type="button" onClick={reset} disabled={!dirty}>
            <Icon name="reset" size={13} />
            Restablecer
          </button>
          <button className="set-btn primary" type="button" onClick={save} disabled={!dirty}>
            <Icon name="save" size={13} />
            Guardar
          </button>
        </div>
      </div>

      {/* PESTAÑAS */}

      <div className="set-tabs" role="tablist">
        {TABS.map(([id, label, icon]) => (
          <button
            key={id}
            className={`set-tab${tab === id ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => goTo(id)}
          >
            {icon === 'user' ? <UserIcon /> : <Icon name={icon} size={14} />}
            {label}
          </button>
        ))}
      </div>

      {/* PERFIL */}

      <section className="set-card set-profile" ref={ref('cuenta')}>
        <div className="set-avatar">
          <span>{(form.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</span>
          <i><Icon name="check" size={9} stroke={3} /></i>
        </div>

        <div className="set-profile-info">
          <div className="set-profile-name">
            <h2>{form.name || 'Sin nombre'}</h2>
            <span className="set-badge green"><i className="set-dot" />Plan Pro Activo</span>
            <span className="set-badge gray">ID: HT-{String(user?.id ?? 0).padStart(4, '0')}</span>
          </div>
          <p>{form.email}{user?.created_at ? ` • Miembro desde ${memberSince(user.created_at)}` : ''}</p>
        </div>

        <div className="set-profile-actions">
          <button className="set-btn soft lg" type="button">
            <Icon name="card" size={14} />
            Gestionar Suscripción
          </button>
          <button className="set-btn primary lg" type="button">
            <Icon name="camera" size={14} />
            Cambiar avatar
          </button>
        </div>
      </section>

      {/* INFORMACIÓN PERSONAL + SEGURIDAD */}

      <div className="set-row two">

        <section className="set-card">
          <CardHead
            icon="idCard"
            title="Información Personal"
            sub="Datos vinculados a tu historial de salud"
            right={<span className="set-badge green">Verificada</span>}
          />

          <div className="set-grid">
            <Field label="Nombre Completo">
              <input value={form.name} onChange={setField('name')} autoComplete="name" />
            </Field>

            <Field label="Teléfono Móvil">
              <input value={form.phone} onChange={setField('phone')} type="tel" autoComplete="tel" />
            </Field>

            <Field label="Correo Electrónico Principal" className="full">
              <div className="set-input-wrap">
                <input value={form.email} readOnly type="email" autoComplete="email" />
                <span className="set-badge green inline">
                  <Icon name="check" size={10} stroke={2.6} />
                  Confirmado
                </span>
              </div>
            </Field>

            <Field label="Idioma de Interfaz">
              <div className="set-select">
                <select value={form.lang} onChange={setField('lang')}>
                  {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Icon name="down" size={14} />
              </div>
            </Field>

            <Field label="Zona Horaria">
              <div className="set-select">
                <select value={form.tz} onChange={setField('tz')}>
                  {TIMEZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Icon name="down" size={14} />
              </div>
            </Field>
          </div>

          <footer className="set-card-foot">
            <span>Última sincronización con clínica: Hoy, 09:15</span>
            <button className="set-btn soft" type="button" onClick={save} disabled={!dirty}>
              <Icon name="save" size={13} />
              Guardar cambios
            </button>
          </footer>
        </section>

        <section className="set-card">
          <CardHead
            icon="lock"
            title="Seguridad y Acceso"
            sub="Credenciales y autenticación multicapa"
            right={<span className="set-meta">Clave cambiada {pwAge}</span>}
          />

          <div className="set-grid">
            <Field label="Nueva Contraseña">
              <input
                type="password"
                placeholder="Mínimo 10 caracteres"
                autoComplete="new-password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                aria-invalid={pwTooShort}
              />
            </Field>

            <Field label="Confirmar Contraseña">
              <input
                type="password"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                aria-invalid={pwMismatch}
              />
            </Field>
          </div>

          {(pwTooShort || pwMismatch) && (
            <p className="set-error" role="alert">
              {pwTooShort ? `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` : 'Las contraseñas no coinciden.'}
            </p>
          )}

          <div className="set-2fa">
            <span className="set-2fa-icon"><Icon name="shieldCheck" size={16} /></span>
            <div>
              <strong>Doble Factor (2FA) Activo</strong>
              <span>Google Authenticator &amp; FIDO2 Passkey configuradas</span>
            </div>
            <button className="set-btn white" type="button">Gestionar 2FA</button>
          </div>

          <div className="set-sessions-head">
            <strong>Sesiones Activas</strong>
            <button className="set-link danger" type="button">Cerrar otras sesiones</button>
          </div>

          <div className="set-session">
            <Icon name="laptop" size={15} />
            <div>
              <strong>MacBook Pro 16" • Madrid, España</strong>
              <span>Sesión actual • Chrome v124</span>
            </div>
            <span className="set-badge green">En línea</span>
          </div>

          <div className="set-card-foot end">
            <button className="set-btn soft" type="button" onClick={updatePassword} disabled={!pwValid}>
              <Icon name="key" size={13} />
              Actualizar contraseña
            </button>
          </div>
        </section>

      </div>

      {/* WEARABLE + ALERTAS */}

      <div className="set-row wide">

        <section className="set-card" ref={ref('dispositivo')}>
          <CardHead
            icon="watch"
            title="Preferencias del Wearable"
            badge={<span className="set-badge green">{device ? `${device.name}${device.edition ? ` · ${device.edition}` : ''}` : '…'}</span>}
            sub={
              device
                ? `Firmware v${device.firmware_version ?? '—'} ${device.connection_type} • Batería restante: ${device.battery_level}%`
                : 'Cargando dispositivo…'
            }
            right={<button className="set-btn outline" type="button">Diagnóstico</button>}
          />

          <div className="set-toggles">
            {WEARABLE_TOGGLES.map(([key, title, desc]) => (
              <ToggleRow key={key} title={title} desc={desc} checked={toggles[key]} onChange={setToggle(key)} />
            ))}
          </div>
        </section>

        <section className="set-card" ref={ref('notificaciones')}>
          <CardHead
            icon="bell"
            title="Alertas y Notificaciones"
            sub="Canales push, móviles y por email"
            right={<span className="set-meta ok">Activas</span>}
          />

          <div className="set-toggles">
            {ALERT_TOGGLES.map(([key, title, desc]) => (
              <ToggleRow key={key} title={title} desc={desc} checked={toggles[key]} onChange={setToggle(key)} />
            ))}
          </div>
        </section>

      </div>

      {/* GOBERNANZA */}

      <section className="set-card set-gov" ref={ref('privacidad')}>
        <span className="set-gov-icon"><Icon name="shieldCheck" size={20} /></span>

        <div className="set-gov-copy">
          <div className="set-title-row">
            <h2>Gobernanza y Privacidad de Datos</h2>
            <span className="set-badge green">RGPD Cumplido</span>
          </div>
          <p>
            Tus datos médicos y biométricos están cifrados de punto a punto (AES-256).
            Puedes descargarlos o eliminarlos en cualquier momento.
          </p>
        </div>

        <div className="set-gov-actions">
          <button className="set-btn soft lg" type="button">
            <Icon name="download" size={14} />
            Exportar (.CSV / .PDF)
          </button>
          <button className="set-btn danger lg" type="button">
            <Icon name="trash" size={14} />
            Gestionar borrado
          </button>
        </div>
      </section>

      {/* PIE */}

      <footer className="set-footer">
        <span>
          <i className="set-dot" />
          HealthTrack v3.14.0 (Build 9022-ES) • Certificación CE Medical Device Clase IIa
        </span>

        <nav aria-label="Enlaces legales">
          <a href="#terminos">Términos de servicio</a>
          <a href="#privacidad">Política de Privacidad</a>
          <a href="#soporte">Soporte Técnico Especializado</a>
        </nav>
      </footer>

      {toast && (
        <div className="set-toast" role="status">
          <Icon name="check" size={14} stroke={2.6} />
          {toast}
        </div>
      )}

    </div>
  )
}

export default Settings