import { useMemo, useState } from 'react'
import './History.css'

/* =====================================
   ICONOS
===================================== */

const ICONS = {
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  down: <path d="m6 9 6 6 6-6" />,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  filterOff: (
    <>
      <path d="M13 3H2l8 9.5V19l4 2v-6.5" />
      <path d="m22 3-5 5M17 3l5 5" />
    </>
  ),
  upload: <path d="M4 14v6h16v-6M12 15V3M8 7l4-4 4 4" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  person: (
    <>
      <circle cx="12" cy="5" r="1.2" />
      <path d="m9 20 3-6 3 6M6 8l6 2 6-2M12 10v4" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  ),
  heart: (
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  trend: <path d="M22 7l-8.5 8.5-5-5L2 17M16 7h6v6" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  watch: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2l1 1M16.1 7.7l-.8-4A2 2 0 0 0 13.3 2h-2.6a2 2 0 0 0-2 1.6l-.8 4M7.9 16.4l.8 4a2 2 0 0 0 2 1.6h2.6a2 2 0 0 0 2-1.6l.8-4" />
    </>
  ),
  chart: <path d="M4 20V10M12 20V4M20 20v-7" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
}

function Icon({ name, size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
   (reemplazar por la API cuando exista statsService)
===================================== */

const SUMMARY = [
  { label: 'Total registros', value: '148', unit: 'sesiones', icon: 'expand', tone: 'blue', foot: '+24 sesiones este mes', footIcon: 'trend' },
  { label: 'Pasos acumulados', value: '248,510', icon: 'person', tone: 'blue', foot: '+12% vs período anterior', footIcon: 'trend' },
  { label: 'Calorías totales', value: '18,420', unit: 'kcal', icon: 'flame', tone: 'orange', foot: '+8% consumo activo', footIcon: 'trend' },
  { label: 'Ritmo cardíaco prom.', value: '71', unit: 'ppm', icon: 'heart', tone: 'red', foot: 'Rango normal saludable', footIcon: 'check', neutral: true },
]

const TYPE_ICON = { carrera: 'person', caminata: 'person', ciclismo: 'bike', fuerza: 'expand', sueno: 'moon' }

const TYPE_FILTERS = [
  ['todas', 'Todas las actividades'],
  ['carrera', 'Carrera'],
  ['caminata', 'Caminata'],
  ['ciclismo', 'Ciclismo'],
  ['fuerza', 'Fuerza'],
  ['sueno', 'Sueño'],
]

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const pad = (n) => String(n).padStart(2, '0')
const fmt = (n) => n.toLocaleString('en-US')
const m = (l, v, u, hot = false) => ({ l, v, u, hot })

const SEEDS = [
  {
    date: '16 Sep 2025', tag: 'Hoy', time: '18:45', type: 'carrera', name: 'Carrera vespertina', sub: 'Outdoor • 4.2 km',
    steps: 8432, kcal: 342, bpm: 72, zone: 'Reposo', minutes: 32, peak: 142, dur: '32 min activos',
    metrics: [m('Distancia total', '4.20', 'km'), m('Ritmo medio', `5'12"`, '/km'), m('Pico cardíaco', '142', 'ppm', true), m('Cadencia media', '164', 'spm')],
  },
  {
    date: '16 Sep 2025', tag: 'Noche', time: '07:15', type: 'sueno', name: 'Sueño Reparador', sub: 'Eficiencia 91%',
    steps: null, kcal: 480, bpm: 58, zone: 'Profundo', minutes: 444, peak: 64, dur: '7h 24m de sueño',
    metrics: [m('Duración', '7h 24m'), m('Eficiencia', '91', '%'), m('FC mínima', '48', 'ppm', true), m('Sueño profundo', '1h 55m')],
  },
  {
    date: '15 Sep 2025', tag: 'Ayer', time: '18:32', type: 'caminata', name: 'Caminata Urbana', sub: 'Ritmo suave • 3.8 km',
    steps: 7921, kcal: 318, bpm: 68, zone: 'Reposo', minutes: 41, peak: 104, dur: '41 min activos',
    metrics: [m('Distancia total', '3.80', 'km'), m('Ritmo medio', `10'47"`, '/km'), m('Pico cardíaco', '104', 'ppm', true), m('Cadencia media', '112', 'spm')],
  },
  {
    date: '14 Sep 2025', time: '18:20', type: 'ciclismo', name: 'Ciclismo de Ruta', sub: 'Cardio moderado • 12 km',
    steps: 9203, kcal: 365, bpm: 75, zone: 'Cardio', minutes: 38, peak: 138, dur: '38 min activos',
    metrics: [m('Distancia total', '12.00', 'km'), m('Velocidad media', '18.9', 'km/h'), m('Pico cardíaco', '138', 'ppm', true), m('Cadencia media', '84', 'rpm')],
  },
  {
    date: '13 Sep 2025', time: '18:10', type: 'caminata', name: 'Paseo diario', sub: 'Parque central • 4.1 km',
    steps: 8756, kcal: 340, bpm: 70, zone: 'Reposo', minutes: 44, peak: 98, dur: '44 min activos',
    metrics: [m('Distancia total', '4.10', 'km'), m('Ritmo medio', `10'44"`, '/km'), m('Pico cardíaco', '98', 'ppm', true), m('Cadencia media', '108', 'spm')],
  },
  {
    date: '12 Sep 2025', time: '17:58', type: 'caminata', name: 'Caminata de tarde', sub: 'Poblado • 3.2 km',
    steps: 7421, kcal: 302, bpm: 66, zone: 'Reposo', minutes: 35, peak: 101, dur: '35 min activos',
    metrics: [m('Distancia total', '3.20', 'km'), m('Ritmo medio', `10'56"`, '/km'), m('Pico cardíaco', '101', 'ppm', true), m('Cadencia media', '110', 'spm')],
  },
  {
    date: '11 Sep 2025', time: '17:46', type: 'fuerza', name: 'Fuerza y Acondicionamiento', sub: 'Gimnasio • 50 min',
    steps: 8998, kcal: 356, bpm: 73, zone: 'Reposo', minutes: 50, peak: 131, dur: '50 min activos',
    metrics: [m('Duración', '50', 'min'), m('Series totales', '18'), m('Pico cardíaco', '131', 'ppm', true), m('Descanso prom.', '75', 's')],
  },
  {
    date: '10 Sep 2025', time: '17:32', type: 'caminata', name: 'Caminata Ligera', sub: 'Retorno laboral • 3.5 km',
    steps: 8201, kcal: 327, bpm: 69, zone: 'Reposo', minutes: 37, peak: 99, dur: '37 min activos',
    metrics: [m('Distancia total', '3.50', 'km'), m('Ritmo medio', `10'34"`, '/km'), m('Pico cardíaco', '99', 'ppm', true), m('Cadencia media', '114', 'spm')],
  },
]

// 8 sesiones reales del diseño + el resto generado hasta completar 148
function buildSessions(total = 148) {
  const list = SEEDS.map((s, i) => ({ ...s, id: i + 1 }))
  const pool = SEEDS.filter((s) => s.type !== 'sueno')
  const base = new Date(2025, 8, 9)

  for (let i = list.length; i < total; i++) {
    const t = pool[i % pool.length]
    const d = new Date(base)
    d.setDate(base.getDate() - (i - SEEDS.length))

    list.push({
      ...t,
      id: i + 1,
      tag: undefined,
      date: `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      time: `${17 + (i % 3)}:${pad((i * 7) % 60)}`,
      steps: t.steps + ((i * 137) % 900) - 450,
      kcal: t.kcal + ((i * 31) % 60) - 30,
    })
  }
  return list
}

const SESSIONS = buildSessions()

/* =====================================
   UTILIDADES
===================================== */

const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function getPages(cur, total) {
  const set = new Set([1, total, cur - 1, cur, cur + 1])
  if (cur <= 2) set.add(3)
  const nums = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return nums.flatMap((p, i) => (i > 0 && p - nums[i - 1] > 1 ? ['…', p] : [p]))
}

// Forma normalizada de la curva de esfuerzo (0 = reposo, 1 = pico)
const SHAPE = [0.05, 0.3, 0.55, 0.6, 0.45, 0.4, 0.62, 0.92, 1, 0.85]
const clock = (min) => (min >= 60 ? `${Math.floor(min / 60)}h ${pad(min % 60)}m` : `${pad(min)}:00`)

function buildCurve(rest, peak, w = 260, h = 90) {
  const pts = SHAPE.map((k, i) => {
    const bpm = rest + k * (peak - rest)
    return [(i / (SHAPE.length - 1)) * w, h - 6 - ((bpm - 40) / 130) * (h - 12)]
  })

  let line = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    line += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
  }

  const mid = Math.round(rest + ((SHAPE[4] + SHAPE[5]) / 2) * (peak - rest))
  return { line, area: `${line} L${w} ${h} L0 ${h} Z`, mid }
}

/* =====================================
   COMPONENTES
===================================== */

function SummaryCard({ item }) {
  return (
    <div className="hist-card hist-summary">
      <div className="hist-summary-top">
        <span className="hist-summary-label">{item.label}</span>
        <span className={`hist-summary-icon tone-${item.tone}`}>
          <Icon name={item.icon} size={17} />
        </span>
      </div>

      <div className="hist-summary-value">
        <strong>{item.value}</strong>
        {item.unit && <span>{item.unit}</span>}
      </div>

      <div className={`hist-summary-foot${item.neutral ? ' neutral' : ''}`}>
        <Icon name={item.footIcon} size={12} />
        {item.foot}
      </div>
    </div>
  )
}

function Select({ value, onChange, children, className = '' }) {
  return (
    <label className={`hist-select ${className}`}>
      <select value={value} onChange={onChange}>
        {children}
      </select>
      <Icon name="down" size={14} />
    </label>
  )
}

function DetailPanel({ s, onFichaPdf }) {
  const curve = useMemo(() => buildCurve(s.bpm, s.peak), [s])

  return (
    <aside className="hist-side">
      <section className="hist-card hist-detail">
        <div className="hist-detail-top">
          <span className="hist-chip">Sesión seleccionada</span>
          <button className="hist-icon-btn" type="button" aria-label="Compartir sesión">
            <Icon name="share" size={15} />
          </button>
        </div>

        <div className="hist-detail-title">
          <span className="hist-type-icon lg">
            <Icon name={TYPE_ICON[s.type]} size={20} />
          </span>
          <div>
            <h3>{s.name}</h3>
            <span>{s.date} · {s.time} hrs</span>
          </div>
        </div>

        <div className="hist-metrics">
          {s.metrics.map((x) => (
            <div key={x.l}>
              <span>{x.l}</span>
              <strong className={x.hot ? 'hot' : ''}>
                {x.v}
                {x.u && <small> {x.u}</small>}
              </strong>
            </div>
          ))}
        </div>

        <div className="hist-curve-head">
          <strong>Curva de Esfuerzo (lpm)</strong>
          <span>{s.dur}</span>
        </div>

        <div className="hist-curve">
          <svg viewBox="0 0 260 90" preserveAspectRatio="none" role="img" aria-label="Curva de esfuerzo">
            <defs>
              <linearGradient id="histCurveFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#eb5470" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#eb5470" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={curve.area} fill="url(#histCurveFill)" />
            <path d={curve.line} fill="none" stroke="#d5384f" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="hist-curve-axis">
          <span>00:00 ({s.bpm} lpm)</span>
          <span>{clock(Math.floor(s.minutes / 2))} ({curve.mid} lpm)</span>
          <span>{clock(s.minutes)} ({s.peak} lpm)</span>
        </div>

        <div className="hist-device">
          <Icon name="watch" size={16} />
          <div>
            <strong>FitBand Pro</strong>
            <span>ID: FB-9021 • Batería 78%</span>
          </div>
          <i className="hist-dot" />
        </div>

        <div className="hist-detail-actions">
          <button className="hist-btn soft" type="button" onClick={() => onFichaPdf?.(s)}>
            <Icon name="download" size={14} />
            Ficha PDF
          </button>
          <button className="hist-btn primary" type="button">
            <Icon name="chart" size={14} />
            Análisis completo
          </button>
        </div>
      </section>

      <section className="hist-tip">
        <Icon name="info" size={16} />
        <div>
          <strong>Consistencia Semanal</strong>
          <p>
            Has alcanzado tu objetivo de pasos en 5 de los últimos 7 días.
            ¡Excelente mantenimiento de carga cardiovascular!
          </p>
        </div>
      </section>
    </aside>
  )
}

/* =====================================
   PÁGINA PRINCIPAL
===================================== */

function History({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('todas')
  const [rows, setRows] = useState(8)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(SESSIONS[0].id)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return SESSIONS.filter((s) => {
      if (type !== 'todas' && s.type !== type) return false
      if (!q) return true
      return normalize(`${s.name} ${s.sub} ${s.date} ${s.tag ?? ''}`).includes(q)
    })
  }, [query, type])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rows))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * rows
  const visible = filtered.slice(start, start + rows)
  const selected = filtered.find((s) => s.id === selectedId) ?? visible[0] ?? null
  const hasFilters = query !== '' || type !== 'todas'

  const clearFilters = () => {
    setQuery('')
    setType('todas')
    setPage(1)
  }

  const exportReport = () => {
    const columns = ['Fecha', 'Hora', 'Actividad', 'Tipo', 'Pasos', 'Calorías (kcal)', 'Frecuencia cardíaca (ppm)', 'Duración']
    const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const lines = [columns, ...filtered.map((s) => [s.date, s.time, s.name, s.type, s.steps, s.kcal, s.bpm, s.dur])]
    const csv = '\uFEFF' + lines.map((line) => line.map(csvCell).join(';')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `historial-actividades-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const printFichaPdf = (session) => {
    if (!session) return
    const escapeHtml = (value) => String(value ?? '—').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const metricRows = (session.metrics || []).map((metric) => `<tr><th>${escapeHtml(metric.l)}</th><td>${escapeHtml(metric.v)} ${escapeHtml(metric.u || '')}</td></tr>`).join('')
    const printWindow = window.open('', '_blank', 'width=850,height=700')
    if (!printWindow) {
      window.alert('Permite las ventanas emergentes para generar la ficha PDF.')
      return
    }
    printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ficha de actividad - ${escapeHtml(session.name)}</title><style>body{font-family:Arial,sans-serif;color:#172b46;margin:40px;line-height:1.45}h1{margin-bottom:6px;color:#1d3557}p{color:#65758b}.tag{display:inline-block;background:#e8f2ff;color:#245edb;padding:5px 10px;border-radius:20px;font-size:12px}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{text-align:left;padding:12px;border-bottom:1px solid #e2e8f0}th{width:45%;color:#52637a}footer{margin-top:35px;font-size:11px;color:#7b8798}@media print{body{margin:20mm}}</style></head><body><span class="tag">FICHA DE ACTIVIDAD</span><h1>${escapeHtml(session.name)}</h1><p>${escapeHtml(session.date)} · ${escapeHtml(session.time)} hrs · ${escapeHtml(session.sub)}</p><table><tr><th>Tipo de actividad</th><td>${escapeHtml(session.type)}</td></tr><tr><th>Pasos</th><td>${escapeHtml(session.steps == null ? 'No aplica' : Number(session.steps).toLocaleString('es-PE'))}</td></tr><tr><th>Calorías</th><td>${escapeHtml(session.kcal)} kcal</td></tr><tr><th>Frecuencia cardíaca</th><td>${escapeHtml(session.bpm)} ppm</td></tr><tr><th>Duración</th><td>${escapeHtml(session.dur)}</td></tr>${metricRows}</table><footer>Generado desde HealthTrack · ${new Date().toLocaleString('es-PE')}</footer><script>window.addEventListener('load',()=>{window.focus();window.print()})</script></body></html>`)
    printWindow.document.close()
  }

  return (
    <div className="hist">

      {/* CABECERA */}

      <div className="hist-head">
        <div>
          <nav className="hist-crumbs" aria-label="Ruta de navegación">
            <button type="button" onClick={() => onNavigate?.('dashboard')}>
              <Icon name="back" size={12} />
              Panel general
            </button>
            <span>/</span>
            <span>Registro histórico</span>
          </nav>

          <h1>Historial de Actividades</h1>
          <p>
            Consulta, filtra y analiza el registro cronológico completo de tus
            sesiones, métricas biométricas y actividades sincronizadas.
          </p>
        </div>

        <div className="hist-head-actions">
          <button className="hist-btn" type="button" onClick={exportReport}>
            <Icon name="upload" size={13} />
            Exportar reporte
            <Icon name="down" size={13} />
          </button>
        </div>
      </div>

      {/* RESUMEN */}

      <div className="hist-summary-grid">
        {SUMMARY.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>

      {/* FILTROS */}

      <div className="hist-card hist-filters">
        <label className="hist-search">
          <Icon name="search" size={15} />
          <input
            type="search"
            placeholder="Buscar por actividad, notas o fecha…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
        </label>

        <button className="hist-filter-btn" type="button">
          <Icon name="calendar" size={14} />
          01 Sep 2025 - 16 Sep 2025
          <Icon name="down" size={13} />
        </button>

        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(1)
          }}
        >
          {TYPE_FILTERS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>

        <Select value="fitband" onChange={() => {}}>
          <option value="fitband">Dispositivo: FitBand Pro</option>
        </Select>

        <button
          className="hist-icon-btn"
          type="button"
          aria-label="Limpiar filtros"
          title="Limpiar filtros"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          <Icon name="filterOff" size={16} />
        </button>
      </div>

      {/* TABLA + DETALLE */}

      <div className="hist-main">
        <section className="hist-card hist-table-card">
          <div className="hist-table-head">
            <div className="hist-table-title">
              <h2>Sesiones Registradas</h2>
              <span className="hist-count">{filtered.length} total</span>
            </div>
            <span className="hist-sync">
              <i className="hist-dot" />
              Sincronizado vía Bluetooth
            </span>
          </div>

          <div className="hist-table-scroll">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tipo / Actividad</th>
                  <th>Pasos</th>
                  <th>Calorías</th>
                  <th>Frecuencia</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((s) => (
                  <tr
                    key={s.id}
                    className={s.id === selected?.id ? 'is-selected' : ''}
                    tabIndex={0}
                    onClick={() => setSelectedId(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedId(s.id)
                      }
                    }}
                  >
                    <td>
                      <div className="hist-date">
                        <span>{s.date}</span>
                        {s.tag && <em className="hist-tag">{s.tag}</em>}
                      </div>
                    </td>

                    <td className="hist-time">{s.time}</td>

                    <td>
                      <div className="hist-activity">
                        <span className="hist-type-icon">
                          <Icon name={TYPE_ICON[s.type]} size={15} />
                        </span>
                        <div>
                          <strong>{s.name}</strong>
                          <span>{s.sub}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {s.steps == null ? (
                        <span className="hist-muted">—</span>
                      ) : (
                        <div className="hist-steps">
                          <strong>{fmt(s.steps)}</strong>
                          <div className="hist-bar">
                            <i
                              className={s.steps >= 9000 ? 'high' : ''}
                              style={{ width: `${Math.min(100, s.steps / 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className={`hist-kcal${s.type === 'sueno' ? ' muted' : ''}`}>
                        <Icon name="flame" size={13} />
                        {s.kcal} kcal
                      </span>
                    </td>

                    <td>
                      <div className="hist-bpm">
                        <span>
                          <Icon name="heart" size={12} />
                          {s.bpm} ppm
                        </span>
                        <em className={`hist-zone zone-${s.zone.toLowerCase()}`}>{s.zone}</em>
                      </div>
                    </td>
                  </tr>
                ))}

                {visible.length === 0 && (
                  <tr className="hist-empty">
                    <td colSpan={6}>No se encontraron actividades con esos filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}

          <div className="hist-pagination">
            <span className="hist-showing">
              Mostrando <strong>{filtered.length ? start + 1 : 0} - {Math.min(start + rows, filtered.length)}</strong> de{' '}
              {filtered.length} actividades registradas
            </span>

            <label className="hist-rows">
              Filas por página:
              <select
                value={rows}
                onChange={(e) => {
                  setRows(Number(e.target.value))
                  setPage(1)
                }}
              >
                {[8, 16, 24].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            <nav className="hist-pages" aria-label="Paginación">
              <button
                className="hist-page-nav"
                type="button"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                <Icon name="left" size={13} />
                Anterior
              </button>

              {getPages(current, totalPages).map((p, i) =>
                p === '…' ? (
                  <span className="hist-ellipsis" key={`e${i}`}>…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`hist-page${p === current ? ' active' : ''}`}
                    aria-current={p === current ? 'page' : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                className="hist-page-nav"
                type="button"
                disabled={current === totalPages}
                onClick={() => setPage(current + 1)}
              >
                Siguiente
                <Icon name="right" size={13} />
              </button>
            </nav>
          </div>
        </section>

        {selected && <DetailPanel s={selected} onFichaPdf={printFichaPdf} />}
      </div>

    </div>
  )
}

export default History