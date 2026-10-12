import { useEffect, useRef, useState } from 'react'
import './Profile.css'
import { useAuth } from '../hooks/useAuth.js'
import { USER_UPDATED_EVENT, useCurrentUser, useMyDevice } from '../hooks/useDeviceStats.js'
import { updateCurrentUser } from '../service/statsService.js'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// El backend guarda fechas en UTC sin zona; se interpretan como UTC.
const parseUtc = (iso) => new Date(iso.endsWith('Z') ? iso : `${iso}Z`)

function memberSince(iso) {
  if (!iso) return ''
  const d = parseUtc(iso)
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

function syncLabel(iso) {
  if (!iso) return 'Sin sincronizar'
  const min = Math.max(0, Math.round((Date.now() - parseUtc(iso).getTime()) / 60000))
  if (min < 1) return 'Sincronizado ahora'
  if (min < 60) return `Sincronizado hace ${min} min`
  if (min < 1440) return `Sincronizado hace ${Math.round(min / 60)} h`
  return `Sincronizado hace ${Math.round(min / 1440)} d`
}

/* =====================================
   ICONOS
===================================== */

const ICONS = {
  next: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12 5 5L20 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  pencil: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
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
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  userCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18c1.5-2 3.5-3 5.8-3s4.3 1 5.8 3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10.5c0 5.6-7 10.5-7 10.5s-7-4.9-7-10.5a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  cake: <path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M12 12V8M12 5.5c.6-.7 1-1.4 0-2.5-1 1.1-.6 1.8 0 2.5Z" />,
  ruler: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 12 3-3M12 7v1M7 12h1M16 12h1" />
    </>
  ),
  trendDown: <path d="M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6" />,
  watch: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2l1 1M16.1 7.7l-.8-4A2 2 0 0 0 13.3 2h-2.6a2 2 0 0 0-2 1.6l-.8 4M7.9 16.4l.8 4a2 2 0 0 0 2 1.6h2.6a2 2 0 0 0 2-1.6l.8-4" />
    </>
  ),
  idCard: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 17c.5-1.7 1.7-2.5 3-2.5s2.5.8 3 2.5M15 9h3M15 13h3" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  sliders: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="5" r="1.2" />
      <path d="m9 20 3-6 3 6M6 8l6 2 6-2M12 10v4" />
    </>
  ),
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  drop: <path d="M12 3.5S6 10.4 6 14.5a6 6 0 0 0 12 0C18 10.4 12 3.5 12 3.5Z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2.1 2.1 0 1 1-3 3l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2.1 2.1 0 1 1-4.2 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2.1 2.1 0 1 1-3-3l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1h-.2a2.1 2.1 0 1 1 0-4.2h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2.1 2.1 0 1 1 3-3l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6v-.2a2.1 2.1 0 1 1 4.2 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2.1 2.1 0 1 1 3 3l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2.1 2.1 0 1 1 0 4.2h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  sync: <path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M18 2v4h-4M6 22v-4h4" />,
  trophy: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />,
  bed: <path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7.5 11.5h.01" />,
  waves: <path d="M3 8c2 0 2-2 4.5-2S10 8 12 8s2.5-2 4.5-2S19 8 21 8M3 14c2 0 2-2 4.5-2S10 14 12 14s2.5-2 4.5-2S19 14 21 14M3 20c2 0 2-2 4.5-2S10 20 12 20s2.5-2 4.5-2S19 20 21 20" />,
  heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
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
   (reemplazar por la API de usuario / biometría)
===================================== */

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const BIO = {
  birth: '1993-10-14',
  height: 1.78,
  heightDate: 'Mayo 2024',
  weight: 74.5,
  weightDelta: -1.2,
  vitalIndex: 94,
}

const GOALS = {
  steps: { value: 7840, goal: 10000 },
  kcal: { value: 340, goal: 500 },
  sleep: { avg: '7h 24m', goal: '8h', consistency: 92 },
  water: { value: 1.6, goal: 2.0, glasses: 8 },
  weightTarget: 72.0,
  weeklyPace: 0.3,
}

// Nombre y correo vienen de la API (/users/me). El resto aún no existe en el backend.
const INITIAL_PERSON = {
  name: '',
  email: '',
  phone: '',
  gender: 'Prefiero no decirlo',
  blood: '',
  emergency: '',
  emergencyPhone: '',
}

const INITIAL_PREFS = {
  units: 'metric',
  time: '24h',
  toggles: { hr: true, sedentary: true, weekly: true, research: false },
}

const GENDERS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo']
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const UNITS = [
  ['metric', 'Sistema métrico (kg, cm, km)'],
  ['imperial', 'Sistema imperial (lb, ft, mi)'],
]

const TIME_FORMATS = [
  ['24h', '24 horas (ej. 18:45)'],
  ['12h', '12 horas (ej. 6:45 PM)'],
]

const ALERT_TOGGLES = [
  ['hr', 'Alertas de frecuencia cardíaca alta/baja', 'Notificar instantáneamente cuando las pulsaciones superen 110 ppm en reposo'],
  ['sedentary', 'Recordatorio de sedentarismo', 'Aviso si detecta inactividad continua superior a 50 minutos'],
  ['weekly', 'Resumen semanal por correo electrónico', 'Enviar los lunes a las 08:00 un PDF con la evolución del sueño y actividad'],
  ['research', 'Compartir anónimamente con estudios médicos', 'Contribución sin identificación a la investigación cardiológica'],
]

const TABS = [
  ['datos', 'Datos personales', 'idCard'],
  ['objetivos', 'Objetivos de salud', 'flag'],
  ['preferencias', 'Preferencias & Notificaciones', 'sliders'],
  ['seguridad', 'Seguridad y Cuenta', 'shield'],
]

const BADGES = [
  ['bed', 'Sueño Zen', '7 días 8h+'],
  ['waves', 'Hidratado', '100% meta'],
  ['heart', 'Cardio Pro', 'Zona 2 OK'],
]

/* =====================================
   UTILIDADES
===================================== */

function ageFrom(iso, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number)
  const before = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  return now.getFullYear() - y - (before ? 1 : 0)
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

const fmt = (n) => n.toLocaleString('en-US')
const pct = (v, goal) => Math.min(100, Math.round((v / goal) * 100))

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso', tone: 'blue' }
  if (bmi < 25) return { label: 'Normal', tone: 'green' }
  if (bmi < 30) return { label: 'Sobrepeso', tone: 'orange' }
  return { label: 'Obesidad', tone: 'red' }
}

// Escala visual del IMC (16 – 27)
const BMI_MIN = 16
const BMI_MAX = 27
const bmiPos = (v) => `${Math.max(0, Math.min(100, ((v - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100))}%`

/* =====================================
   COMPONENTES
===================================== */

function SectionHead({ icon, title, sub, right, tone = 'blue' }) {
  return (
    <header className="prf-head">
      <span className={`prf-head-icon tone-${tone}`}>
        <Icon name={icon} size={18} />
      </span>

      <div className="prf-head-titles">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>

      {right}
    </header>
  )
}

function Tile({ label, badge, sub, children }) {
  return (
    <div className="prf-tile">
      <div className="prf-tile-label">
        <span>{label}</span>
        {badge}
      </div>
      {children}
      {sub && <small>{sub}</small>}
    </div>
  )
}

function Progress({ value, tone = 'blue' }) {
  return (
    <div className="prf-progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <i className={`tone-${tone}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`prf-switch${checked ? ' on' : ''}`}
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

function SelectBox({ label, value, onChange, options }) {
  return (
    <label className="prf-tile prf-select-tile">
      <span className="prf-tile-label">{label}</span>
      <div className="prf-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Icon name="down" size={14} />
      </div>
    </label>
  )
}

/* =====================================
   PÁGINA PRINCIPAL
===================================== */

function Profile({ onNavigate }) {
  const [person, setPerson] = useState(INITIAL_PERSON)
  const [draft, setDraft] = useState(INITIAL_PERSON)
  const [editing, setEditing] = useState(false)
  const [prefs, setPrefs] = useState(INITIAL_PREFS)
  const [tab, setTab] = useState('datos')
  const [toast, setToast] = useState('')

  const { token } = useAuth()
  const { data: user } = useCurrentUser()
  const { data: device } = useMyDevice()

  // Al llegar los datos del usuario, rellenar nombre y correo reales.
  useEffect(() => {
    if (!user) return
    setPerson((p) => ({ ...p, name: user.full_name, email: user.email }))
    setDraft((d) => ({ ...d, name: user.full_name, email: user.email }))
  }, [user])

  const sections = useRef({})
  const ref = (id) => (el) => {
    sections.current[id] = el
  }

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const goTo = (id) => {
    setTab(id)
    sections.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startEdit = () => {
    setDraft(person)
    setEditing(true)
    goTo('datos')
  }

  const saveEdit = async () => {
    const name = draft.name.trim() || person.name
    try {
      if (name !== person.name) {
        await updateCurrentUser(token, { fullName: name })
        window.dispatchEvent(new Event(USER_UPDATED_EVENT))
      }
      setPerson({ ...draft, name })
      setEditing(false)
      setToast('Perfil actualizado')
    } catch (err) {
      setToast(err.message)
    }
  }

  const setField = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const setPref = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }))
  const setToggle = (key) => (value) => setPrefs((p) => ({ ...p, toggles: { ...p.toggles, [key]: value } }))

  const go = (page) => () => onNavigate?.(page)

  /* Cálculos derivados */
  const age = ageFrom(BIO.birth)
  const bmi = BIO.weight / BIO.height ** 2
  const bmiInfo = bmiCategory(bmi)
  const stepsPct = pct(GOALS.steps.value, GOALS.steps.goal)
  const kcalPct = pct(GOALS.kcal.value, GOALS.kcal.goal)
  const weightLeft = (BIO.weight - GOALS.weightTarget).toFixed(1)
  const ring = 2 * Math.PI * 26

  return (
    <div className="prf">

      {/* CABECERA */}

      <div className="prf-top">
        <div>
          <nav className="prf-crumbs" aria-label="Ruta de navegación">
            <button type="button" onClick={go('dashboard')}>Inicio</button>
            <Icon name="next" size={11} />
            <strong>Perfil de Usuario</strong>
          </nav>

          <h1>Perfil de Usuario</h1>
          <p>
            Administra tu información personal, biometría, metas de salud y
            ajustes de cuenta.
          </p>
        </div>

        <div className="prf-top-actions">
          <button className="prf-btn soft" type="button" onClick={go('settings')}>
            <Icon name="shield" size={14} />
            Configuración de privacidad
          </button>
          <button className="prf-btn soft" type="button" onClick={go('settings')}>
            <Icon name="lock" size={14} />
            Cambiar contraseña
          </button>
          <button className="prf-btn primary" type="button" onClick={startEdit} disabled={editing}>
            <Icon name="pencil" size={13} />
            Editar perfil
          </button>
        </div>
      </div>

      {/* TARJETA DE PERFIL */}

      <section className="prf-card prf-hero">
        <div className="prf-hero-main">
          <div className="prf-avatar">
            <span>{person.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</span>
            <i className="prf-online" />
            <button type="button" aria-label="Cambiar foto">
              <Icon name="camera" size={14} />
            </button>
          </div>

          <div className="prf-hero-info">
            <div className="prf-hero-name">
              <h2>{person.name}</h2>
              <span className="prf-badge gray">
                <Icon name="shieldCheck" size={12} />
                Verificado
              </span>
              <span className="prf-badge green">
                <Icon name="star" size={12} />
                Miembro Pro
              </span>
            </div>

            <p><Icon name="mail" size={13} />{person.email}</p>
            <p className="wrap">
              <span><Icon name="userCircle" size={13} />Usuario Activo{user?.created_at ? ` • Registrado en ${memberSince(user.created_at)}` : ''}</span>
              <span><Icon name="pin" size={13} />Madrid, España • UTC+2</span>
            </p>
          </div>
        </div>

        <div className="prf-vital">
          <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#dfe7f5" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              stroke="#0c7a4d"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(BIO.vitalIndex / 100) * ring} ${ring}`}
              transform="rotate(-90 30 30)"
            />
          </svg>
          <strong className="prf-vital-value">{BIO.vitalIndex}</strong>
          <div>
            <span>Índice vital</span>
            <strong>Excelente</strong>
            <em>Top 5% de usuarios</em>
          </div>
        </div>

        <div className="prf-bio">
          <div className="prf-bio-tile">
            <div className="prf-bio-top">
              <span>Edad</span>
              <i><Icon name="cake" size={15} /></i>
            </div>
            <strong>{age} <small>años</small></strong>
            <em>Fecha nac.: {formatDate(BIO.birth)}</em>
          </div>

          <div className="prf-bio-tile">
            <div className="prf-bio-top">
              <span>Altura</span>
              <i><Icon name="ruler" size={15} /></i>
            </div>
            <strong>{BIO.height.toFixed(2)} <small>m</small></strong>
            <em>Última medición: {BIO.heightDate}</em>
          </div>

          <div className="prf-bio-tile">
            <div className="prf-bio-top">
              <span>Peso actual</span>
              <i><Icon name="gauge" size={15} /></i>
            </div>
            <strong>{BIO.weight.toFixed(1)} <small>kg</small></strong>
            <em className="down">
              <Icon name="trendDown" size={12} />
              {BIO.weightDelta} kg este mes
            </em>
          </div>

          <div className="prf-bio-tile bmi">
            <div className="prf-bio-top">
              <span>IMC calculado</span>
              <b className={`prf-bmi-badge tone-${bmiInfo.tone}`}>{bmiInfo.label}</b>
            </div>
            <strong>{bmi.toFixed(1)} <small>kg/m²</small></strong>

            <div className="prf-bmi-scale">
              <div className="prf-bmi-track">
                <i className="under" style={{ width: bmiPos(18.5) }} />
                <i className="ok" style={{ left: bmiPos(18.5), width: `calc(${bmiPos(25)} - ${bmiPos(18.5)})` }} />
                <i className="over" style={{ left: bmiPos(25), right: 0 }} />
                <b style={{ left: bmiPos(bmi) }} />
              </div>
              <div className="prf-bmi-labels">
                <span style={{ left: bmiPos(18.5) }}>18.5</span>
                <span className="now" style={{ left: bmiPos(bmi) }}>{bmi.toFixed(1)} {bmiInfo.label}</span>
                <span style={{ left: bmiPos(25) }}>25.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑAS */}

      <div className="prf-tabs" role="tablist">
        {TABS.map(([id, label, icon]) => (
          <button
            key={id}
            className={`prf-tab${tab === id ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => goTo(id)}
          >
            <Icon name={icon} size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="prf-layout">

        {/* ===== COLUMNA PRINCIPAL ===== */}

        <div className="prf-col">

          {/* DATOS PERSONALES */}

          <section className="prf-card prf-section" ref={ref('datos')}>
            <SectionHead
              icon="user"
              title="Datos Personales"
              right={
                editing ? (
                  <div className="prf-edit-actions">
                    <button className="prf-link muted" type="button" onClick={() => setEditing(false)}>Cancelar</button>
                    <button className="prf-btn primary sm" type="button" onClick={saveEdit}>Guardar</button>
                  </div>
                ) : (
                  <button className="prf-link" type="button" onClick={startEdit}>
                    <Icon name="pencil" size={12} />
                    Modificar
                  </button>
                )
              }
            />

            <div className="prf-tiles">
              <Tile label="Nombre completo">
                {editing ? (
                  <input value={draft.name} onChange={setField('name')} autoComplete="name" />
                ) : (
                  <strong>{person.name}</strong>
                )}
              </Tile>

              <Tile
                label="Correo electrónico"
                badge={
                  <span className="prf-badge green sm">
                    <Icon name="check" size={10} stroke={2.6} />
                    Verificado
                  </span>
                }
              >
                <strong className="email">{person.email}</strong>
              </Tile>

              <Tile label="Teléfono móvil">
                {editing ? (
                  <input value={draft.phone} onChange={setField('phone')} type="tel" autoComplete="tel" />
                ) : (
                  <strong>{person.phone || '—'}</strong>
                )}
              </Tile>

              <Tile label="Género">
                {editing ? (
                  <select value={draft.gender} onChange={setField('gender')}>
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                ) : (
                  <strong>{person.gender}</strong>
                )}
              </Tile>

              <Tile label="Grupo sanguíneo">
                {editing ? (
                  <select value={draft.blood} onChange={setField('blood')}>
                    <option value="">—</option>
                    {BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                ) : (
                  <strong className="blood">
                    <i />
                    {person.blood
                      ? `${person.blood} (${person.blood.endsWith('+') ? 'Positivo' : 'Negativo'})`
                      : '—'}
                  </strong>
                )}
              </Tile>

              <Tile label="Contacto de emergencia" sub={editing ? undefined : person.emergencyPhone}>
                {editing ? (
                  <>
                    <input value={draft.emergency} onChange={setField('emergency')} />
                    <input value={draft.emergencyPhone} onChange={setField('emergencyPhone')} type="tel" />
                  </>
                ) : (
                  <strong>{person.emergency || '—'}</strong>
                )}
              </Tile>
            </div>

            <div className="prf-device">
              <span className="prf-device-icon"><Icon name="watch" size={18} /></span>

              <div>
                <strong>
                  {device ? `${device.name}${device.serial_number ? ` (${device.serial_number})` : ''}` : 'Cargando…'}
                  {device && <em><i className="prf-dot" />{syncLabel(device.last_sync_at)}</em>}
                </strong>
                <span>
                  {device
                    ? `Batería restante: ${device.battery_level}%${device.firmware_version ? ` • Firmware v${device.firmware_version}` : ''}`
                    : ''}
                </span>
              </div>

              <button className="prf-btn soft" type="button" onClick={go('device')}>Administrar</button>
            </div>
          </section>

          {/* METAS */}

          <section className="prf-card prf-section" ref={ref('objetivos')}>
            <SectionHead
              icon="target"
              tone="green"
              title="Metas y Objetivos Diarios"
              sub="Configuración actual de telemetría y hábitos"
              right={
                <button className="prf-link" type="button" onClick={go('goals')}>
                  <Icon name="sliders" size={13} />
                  Ajustar objetivos
                </button>
              }
            />

            <div className="prf-goal">
              <div className="prf-goal-top">
                <span><Icon name="person" size={16} />Pasos diarios</span>
                <p><strong>{fmt(GOALS.steps.value)}</strong> / {fmt(GOALS.steps.goal)} pasos</p>
              </div>
              <Progress value={stepsPct} />
              <div className="prf-goal-foot">
                <span>Avance actual {stepsPct}%</span>
                <span className="link">Faltan {fmt(Math.max(0, GOALS.steps.goal - GOALS.steps.value))} pasos</span>
              </div>
            </div>

            <div className="prf-goal">
              <div className="prf-goal-top">
                <span><Icon name="flame" size={16} />Calorías activas</span>
                <p><strong>{GOALS.kcal.value}</strong> / {GOALS.kcal.goal} kcal</p>
              </div>
              <Progress value={kcalPct} tone="slate" />
              <div className="prf-goal-foot">
                <span>Avance actual {kcalPct}%</span>
                <span>{Math.max(0, GOALS.kcal.goal - GOALS.kcal.value)} kcal restantes</span>
              </div>
            </div>

            <div className="prf-pair">
              <div className="prf-goal">
                <div className="prf-goal-top">
                  <span><Icon name="moon" size={16} />Sueño reparador</span>
                  <em className="prf-meta">Meta: {GOALS.sleep.goal}</em>
                </div>
                <div className="prf-big">
                  <strong>{GOALS.sleep.avg}</strong>
                  <span>promedio semanal</span>
                </div>
                <div className="prf-goal-foot ok">
                  <span><Icon name="checkCircle" size={13} />{GOALS.sleep.consistency}% de consistencia</span>
                </div>
              </div>

              <div className="prf-goal">
                <div className="prf-goal-top">
                  <span><Icon name="drop" size={16} />Hidratación</span>
                  <em className="prf-meta">Meta: {GOALS.water.goal.toFixed(1)} L</em>
                </div>
                <div className="prf-big">
                  <strong>{GOALS.water.value.toFixed(1)}</strong>
                  <span>/ {GOALS.water.goal.toFixed(1)} Litros</span>
                </div>
                <div className="prf-goal-foot">
                  <span>{GOALS.water.glasses} vasos consumidos hoy</span>
                </div>
              </div>
            </div>

            <div className="prf-weight">
              <span className="prf-weight-icon"><Icon name="gauge" size={18} /></span>

              <div>
                <strong>Meta de Peso a Largo Plazo: {GOALS.weightTarget.toFixed(1)} kg</strong>
                <span>
                  Peso actual: {BIO.weight.toFixed(1)} kg • Ritmo saludable recomendado: {GOALS.weeklyPace} kg / semana
                </span>
              </div>

              <b className="prf-badge green solid">Faltan {weightLeft} kg</b>
            </div>
          </section>

          {/* PREFERENCIAS */}

          <section className="prf-card prf-section" ref={ref('preferencias')}>
            <SectionHead
              icon="gear"
              title="Preferencias y Notificaciones"
              sub="Personaliza la presentación de métricas y frecuencias"
            />

            <div className="prf-pair">
              <SelectBox label="Unidades de medida" value={prefs.units} onChange={setPref('units')} options={UNITS} />
              <SelectBox label="Formato horario" value={prefs.time} onChange={setPref('time')} options={TIME_FORMATS} />
            </div>

            <h3 className="prf-eyebrow">Alertas y salud en tiempo real</h3>

            <div className="prf-toggles">
              {ALERT_TOGGLES.map(([key, title, desc]) => (
                <div className="prf-toggle-row" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                  <Toggle checked={prefs.toggles[key]} onChange={setToggle(key)} label={title} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ===== COLUMNA LATERAL ===== */}

        <aside className="prf-col">

          <section className="prf-card prf-section" ref={ref('seguridad')}>
            <SectionHead icon="sync" title="Seguridad y Acceso" />

            <div className="prf-row">
              <div>
                <strong>Contraseña</strong>
                <span>Último cambio hace 45 días</span>
              </div>
              <em className="ok"><Icon name="checkCircle" size={18} /></em>
            </div>

            <div className="prf-row ok">
              <div>
                <strong>Autenticación 2FA</strong>
                <strong className="green">Activado (Google Authenticator)</strong>
              </div>
              <em className="ok"><Icon name="shieldCheck" size={18} /></em>
            </div>

            <div className="prf-row">
              <div>
                <strong>Sesiones abiertas</strong>
                <span>2 dispositivos conectados</span>
              </div>
              <button className="prf-link sm" type="button" onClick={go('settings')}>Ver todas</button>
            </div>

            <button className="prf-btn soft block" type="button" onClick={go('settings')}>
              Cambiar contraseña
            </button>
          </section>

          <section className="prf-card prf-section">
            <SectionHead icon="folder" title="Datos y Cumplimiento" />

            <p className="prf-text">
              Tus datos de salud están protegidos bajo estándares RGPD y HIPAA.
              Cuentas con derecho irrevocable de descarga y portabilidad integral.
            </p>

            <button className="prf-action" type="button">
              <Icon name="download" size={17} />
              <div>
                <strong>Exportar historial médico</strong>
                <span>Formato CSV y JSON estructurado</span>
              </div>
              <Icon name="next" size={13} />
            </button>

            <button className="prf-action" type="button" onClick={go('device')}>
              <Icon name="sync" size={17} />
              <div>
                <strong>Permisos de telemetría</strong>
                <span>Administrar {device?.name ?? 'dispositivo'} API</span>
              </div>
              <Icon name="next" size={13} />
            </button>

            <button className="prf-btn soft block" type="button" onClick={go('settings')}>
              Configuración de privacidad
            </button>
          </section>

          <section className="prf-card prf-section">
            <SectionHead
              icon="trophy"
              tone="green"
              title="Logros Recientes"
              right={<span className="prf-level">Nivel 8</span>}
            />

            <div className="prf-feature">
              <span className="prf-feature-icon"><Icon name="person" size={26} stroke={2} /></span>

              <div>
                <div className="prf-feature-title">
                  <strong>Caminante Constante</strong>
                  <b className="prf-badge green solid sm">Racha</b>
                </div>
                <p>15 días consecutivos superando los 8,000 pasos diarios.</p>
              </div>
            </div>

            <div className="prf-badges">
              {BADGES.map(([icon, title, sub]) => (
                <div key={title}>
                  <Icon name={icon} size={18} />
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </div>
              ))}
            </div>

            <button className="prf-link center" type="button">Ver vitrina completa de trofeos (14)</button>
          </section>
        </aside>
      </div>

      {toast && (
        <div className="prf-toast" role="status">
          <Icon name="check" size={14} stroke={2.6} />
          {toast}
        </div>
      )}

    </div>
  )
}

export default Profile