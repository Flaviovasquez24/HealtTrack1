import { useState } from 'react'
import './Stats.css'
import { useMyDevice, useStatsSummary } from '../hooks/useDeviceStats.js'

/* =====================================
   ICONOS
===================================== */

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
      <path d="M20.8 8.7c0 5.4-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.7C3.2 5.8 5.3 4 7.8 4c1.7 0 3.3.9 4.2 2.2C12.9 4.9 14.5 4 16.2 4c2.5 0 4.6 1.8 4.6 4.7Z" />
    </svg>
  )
}

function StepsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 4.5c1.5 1.4 1.5 3.8.1 5.2-1.3 1.4-3.7 1.3-5.1-.1-1.4-1.5-1.3-3.8.1-5.1 1.4-1.4 3.5-1.4 4.9 0Z" />
      <path d="M17.9 14.2c1.4 1.4 1.4 3.7 0 5.1-1.4 1.4-3.7 1.4-5.1 0-1.4-1.4-1.4-3.7 0-5.1 1.4-1.4 3.7-1.4 5.1 0Z" />
      <path d="m9.2 9.7 5.4 4.6" />
    </svg>
  )
}

function CaloriesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
      <path d="M13.8 2.8c.3 3.1-1.4 4.7-3 6.3-1.4 1.4-2.8 2.8-2.8 5.1 0 2.2 1.8 4 4 4 2.7 0 4.8-2.1 4.8-5 0-1.8-.8-3.5-2.3-4.9.1 2.1-.5 3.2-1.5 4.1.3-2.9-.7-6.5-3.4-9.6.1 2.1 1 3.7 2 5.2 1.2-1.6 2.1-3.1 2.2-5.2Z" />
      <path d="M7.2 17.5c.4 1.9 2 3.2 4.1 3.2 2.5 0 4.4-1.8 4.7-4.2-.8 1.3-2 2.1-3.5 2.1-2.2 0-3.7-1.2-5.3-1.1Z" />
    </svg>
  )
}

function SleepIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 15.5A7.8 7.8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  )
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </svg>
  )
}

/* =====================================
   UTILIDADES
===================================== */

const PERIODS = [
  ['today', 'Hoy'],
  ['7d', 'Últimos 7 días'],
  ['30d', 'Último mes'],
]
const PERIOD_TITLE = { today: 'del Día', '7d': 'de la Semana', '30d': 'del Mes' }
const MAX_BARS = { today: 12, '7d': 7, '30d': 30 }
const METRIC_KEYS = ['heart_rate', 'steps', 'calories', 'sleep']

const EMPTY_STYLE = { padding: '32px 0', textAlign: 'center', color: '#8a94a6' }

const num = (n) => Math.round(n).toLocaleString('en-US')
const fmtSleep = (min) => {
  const t = Math.round(min)
  return `${Math.floor(t / 60)}h ${t % 60}m`
}
const FORMAT = {
  heart_rate: (v) => String(Math.round(v)),
  steps: num,
  calories: num,
  sleep: fmtSleep,
}
const show = (kind, v) => (v == null ? '—' : FORMAT[kind](v))
const signed = (p) => (p > 0 ? `+${p}` : `${p}`)

const hasData = (metric) => metric.daily.some((p) => p.value != null)
const avgOrNull = (metric) => (hasData(metric) ? metric.avg : null)

// El backend guarda fechas en UTC sin zona; se interpretan como UTC.
function parseUtc(value) {
  if (!value) return null
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value)
  const d = new Date(hasZone ? value : `${value}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function fmtDateTime(value) {
  const d = parseUtc(value)
  if (!d) return ''
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function timeAgo(value) {
  const d = parseUtc(value)
  if (!d) return null
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000))
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

// 'today' -> "HH:MM"; resto -> "DD/MM" a partir de la fecha ISO.
const pointLabel = (p, period) =>
  period === 'today' ? p.label : `${p.date.slice(8, 10)}/${p.date.slice(5, 7)}`

function changeBadge(pct) {
  if (pct == null) return { badge: '—', badgeTone: 'badge-gray' }
  return { badge: `${signed(pct)}%`, badgeTone: pct >= 0 ? 'badge-green' : 'badge-red' }
}

function hrStatus(avg) {
  if (avg == null) return { label: 'Sin datos', tone: 'badge-gray', ok: false }
  if (avg < 60 || avg > 100) return { label: 'Atención', tone: 'badge-red', ok: false }
  return { label: 'Normal', tone: 'badge-green', ok: true }
}

function downsample(list, max) {
  if (list.length <= max) return list
  const out = []
  for (let i = 0; i < max; i++) {
    out.push(list[Math.round((i * (list.length - 1)) / (max - 1))])
  }
  return out
}

function smoothPath(xy) {
  if (xy.length === 0) return ''
  let d = `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1]
    const [x1, y1] = xy[i]
    const cx = (x0 + x1) / 2
    d += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return d
}

function exportCsv(stats) {
  const rows = [['periodo', 'metrica', 'fecha', 'valor']]
  METRIC_KEYS.forEach((key) => {
    stats[key].daily.forEach((p) => rows.push([stats.period, key, p.date, p.value ?? '']))
  })
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `estadisticas-${stats.period}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function buildInsights(stats) {
  const parts = []
  const { heart_rate: hr, steps, sleep } = stats

  if (hasData(hr)) {
    const cmp = hr.change_pct != null ? ` (${signed(hr.change_pct)}% vs el período anterior)` : ''
    parts.push(`Tu frecuencia cardíaca promedio fue de ${Math.round(hr.avg)} ppm${cmp}.`)
  }
  if (hasData(steps)) {
    const cmp = steps.change_pct != null ? ` (${signed(steps.change_pct)}% vs el período anterior)` : ''
    parts.push(`Registraste ${num(steps.avg)} pasos${cmp}.`)
  }
  if (hasData(sleep)) {
    const pct = sleep.goal ? Math.round((sleep.avg / sleep.goal) * 100) : null
    parts.push(
      `Dormiste ${fmtSleep(sleep.avg)} en promedio${pct != null ? `, un ${pct}% de tu objetivo` : ''}.`,
    )
  }

  return parts.length > 0
    ? parts.join(' ')
    : 'Aún no hay lecturas suficientes en este período. Sincroniza tu dispositivo para ver tu resumen.'
}

/* =====================================
   TARJETAS DE MÉTRICAS
===================================== */

function StatCard({ title, value, unit, badge, badgeTone, icon, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        <span className={`stat-badge ${badgeTone}`}>{badge}</span>
      </div>

      <div className="stat-value">
        <strong>{value}</strong>
        {unit && <span>{unit}</span>}
      </div>

      <span className="stat-label">{title}</span>
    </div>
  )
}

function Trend({ pct }) {
  if (pct == null) return <span>—</span>
  const up = pct >= 0
  return (
    <span className={up ? 'up' : 'down'}>
      {up ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  )
}

/* =====================================
   GRÁFICO DE RITMO CARDÍACO
===================================== */

const HR_X0 = 40
const HR_X1 = 680
// Misma escala del diseño original: 100 ppm -> y=48, 60 ppm -> y=115 (eje de 30 a 120).
const hrY = (v) => Math.min(175, Math.max(10, 214.67 - v * (5 / 3)))

function buildHrPoints(daily, period) {
  const n = daily.length
  return daily
    .map((p, i) => ({
      x: n === 1 ? (HR_X0 + HR_X1) / 2 : HR_X0 + (i * (HR_X1 - HR_X0)) / (n - 1),
      y: p.value == null ? null : hrY(p.value),
      value: p.value,
      label: pointLabel(p, period),
    }))
    .filter((p) => p.value != null)
}

function buildXLabels(daily, period) {
  const n = daily.length
  const step = Math.max(1, Math.ceil(n / 7))
  const out = []
  daily.forEach((p, i) => {
    if (i % step !== 0) return
    const isLast = i === n - 1
    const text = pointLabel(p, period)
    out.push({
      key: `${p.date}-${i}`,
      text: isLast && period !== 'today' ? `${text} (Hoy)` : text,
      today: isLast && period !== 'today',
    })
  })
  return out
}

function HeartRateChart({ daily, period }) {
  const pts = buildHrPoints(daily, period)

  if (pts.length === 0) {
    return <p style={EMPTY_STYLE}>Sin lecturas de ritmo cardíaco en este período.</p>
  }

  const first = pts[0]
  const last = pts[pts.length - 1]
  const peak = pts.reduce((a, b) => (b.value > a.value ? b : a))

  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : ' L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join('')
  const areaPath = `${linePath} L${last.x.toFixed(1)} 175 L${first.x.toFixed(1)} 175 Z`
  const labels = buildXLabels(daily, period)

  return (
    <div className="hr-chart">
      <div className="hr-y-labels">
        <span>120</span>
        <span>90</span>
        <span>60</span>
        <span>30</span>
      </div>

      <svg className="hr-svg" viewBox="0 0 700 190" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hrGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#eb5470" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#eb5470" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* zona óptima */}
        <rect x="0" y="48" width="700" height="67" fill="#e9f9f1" />
        <text x="8" y="42" className="hr-zone-label">Zona Óptima en Reposo (60 - 100 ppm)</text>

        {/* línea guía punteada hasta el pico */}
        <line x1={peak.x} y1="10" x2={peak.x} y2={peak.y} stroke="#c9d2e0" strokeWidth="1" strokeDasharray="3 3" />

        <path d={areaPath} fill="url(#hrGradient)" />
        <path d={linePath} fill="none" stroke="#eb5470" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {pts.length <= 31 &&
          pts.map((p, i) => (
            <circle key={`${p.label}-${i}`} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#eb5470" strokeWidth="2.2" />
          ))}
      </svg>

      <div className="hr-tooltip" style={{ left: `${(peak.x / 700) * 100}%` }}>
        <strong>{peak.label} · Pico</strong>
        <span>{Math.round(peak.value)} ppm</span>
      </div>

      {last !== peak && (
        <div className="hr-tooltip hr-tooltip-last" style={{ left: `${(last.x / 700) * 100}%` }}>
          <strong>{last.label} · Última lectura</strong>
          <span>{Math.round(last.value)} ppm</span>
        </div>
      )}

      <div className="hr-x-labels">
        {labels.map((l) => (
          <span key={l.key} className={l.today ? 'hr-x-today' : undefined}>
            {l.text}
          </span>
        ))}
      </div>
    </div>
  )
}

/* =====================================
   PASOS DIARIOS
===================================== */

function StepsPanel({ metric, period }) {
  const bars = downsample(metric.daily, MAX_BARS[period])
  const vals = bars.map((b) => b.value ?? 0)
  const maxV = Math.max(...vals, 0)
  const peakIdx = maxV > 0 ? vals.indexOf(maxV) : -1
  const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)))

  return (
    <section className="panel side-panel steps-panel">
      <div className="side-panel-header">
        <span>Pasos Diarios</span>
        <div className="side-panel-value">
          <strong>{show('steps', avgOrNull(metric))}</strong>
          <span>Meta: {num(metric.goal ?? 0)} pasos</span>
        </div>
      </div>

      <div className="steps-bars">
        {bars.map((b, i) => {
          const active = i === peakIdx
          const v = vals[i]
          const height = v > 0 ? Math.max(2, (v / maxV) * 100) : 0
          const showLabel = bars.length <= 12 || i % 5 === 0
          return (
            <div className="steps-bar-col" key={`${b.date}-${i}`}>
              {active && <span className="steps-bar-peak">{fmtK(maxV)}</span>}
              <div
                className={`steps-bar${active ? ' active' : ''}`}
                style={{ height: `${height}%` }}
              />
              <span>{showLabel ? b.label : ''}</span>
            </div>
          )
        })}
      </div>

      <div className="side-panel-footer">
        <span>Máx: {show('steps', metric.max)}</span>
        <span>Mín: {show('steps', metric.min)}</span>
        <Trend pct={metric.change_pct} />
      </div>
    </section>
  )
}

/* =====================================
   CALORÍAS ACTIVAS
===================================== */

function CaloriesPanel({ metric, period }) {
  const n = metric.daily.length
  const pts = metric.daily
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.value != null)
  const maxV = Math.max(...pts.map(({ p }) => p.value), 0)
  const W = 220

  const xy = pts.map(({ p, i }) => [
    n === 1 ? W / 2 : (i * W) / (n - 1),
    60 - (maxV > 0 ? (p.value / maxV) * 50 : 0),
  ])

  const peakPoint = pts.find(({ p }) => p.value === maxV)
  const line = smoothPath(xy)
  const area = xy.length > 1 ? `${line} L${xy[xy.length - 1][0].toFixed(1)} 65 L${xy[0][0].toFixed(1)} 65 Z` : ''

  return (
    <section className="panel side-panel calories-panel">
      <div className="side-panel-header">
        <span>Calorías Activas</span>
        <div className="side-panel-value">
          <strong>
            {show('calories', avgOrNull(metric))} <small>kcal</small>
          </strong>
          <span>Meta: {num(metric.goal ?? 0)} kcal</span>
        </div>
      </div>

      <div className="calories-chart">
        {xy.length > 1 ? (
          <>
            <span className="calories-peak">
              Pico: {num(maxV)} kcal ({pointLabel(peakPoint.p, period)})
            </span>

            <svg viewBox="0 0 220 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="calGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e9a719" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#e9a719" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={area} fill="url(#calGradient)" />
              <path d={line} fill="none" stroke="#e9a719" strokeWidth="2.3" strokeLinecap="round" />
            </svg>
          </>
        ) : (
          <p style={EMPTY_STYLE}>Sin datos suficientes.</p>
        )}
      </div>

      <div className="side-panel-footer">
        <span>Máx: {show('calories', metric.max)} kcal</span>
        <span>Mín: {show('calories', metric.min)} kcal</span>
        <Trend pct={metric.change_pct} />
      </div>
    </section>
  )
}

/* =====================================
   SUEÑO
   (el backend solo guarda minutos dormidos: no hay fases ni eficiencia,
    así que se muestra el cumplimiento del objetivo)
===================================== */

function SleepPanel({ metric }) {
  const avg = avgOrNull(metric)
  const minutes = avg == null ? null : Math.round(avg)
  const goal = metric.goal ?? 480
  const pct = minutes == null ? 0 : Math.min(100, Math.round((minutes / goal) * 100))

  return (
    <section className="panel side-panel sleep-panel">
      <div className="side-panel-header">
        <span>Tiempo de Sueño</span>
        <div className="side-panel-value">
          <strong>
            {minutes == null ? (
              '—'
            ) : (
              <>
                {Math.floor(minutes / 60)}h <small>{minutes % 60}m</small>
              </>
            )}
          </strong>
          <span>Objetivo: {Math.round(goal / 60)}h regulares</span>
        </div>
      </div>

      <div className="sleep-bar-label">
        <span>Cumplimiento del objetivo</span>
        <span className="sleep-eff">{pct}% de la meta</span>
      </div>

      <div className="sleep-bar">
        <div className="sleep-bar-segment" style={{ width: `${pct}%`, background: '#2f5fd0' }} />
        <div className="sleep-bar-segment" style={{ width: `${100 - pct}%`, background: '#e3ecfa' }} />
      </div>

      <div className="sleep-legend">
        <span>
          <i style={{ background: '#2f5fd0' }} />
          Dormido ({pct}%)
        </span>
        <span>
          <i style={{ background: '#e3ecfa' }} />
          Pendiente ({100 - pct}%)
        </span>
      </div>

      <div className="side-panel-footer">
        <span>Máx: {show('sleep', metric.max)}</span>
        <span>Mín: {show('sleep', metric.min)}</span>
        <Trend pct={metric.change_pct} />
      </div>
    </section>
  )
}

/* =====================================
   PÁGINA PRINCIPAL
===================================== */

function Stats({ onNavigate }) {
  const [period, setPeriod] = useState('7d')
  const { data: stats, error, loading, reload } = useStatsSummary(period)
  const { data: device } = useMyDevice()

  if (!stats) {
    return (
      <div className="coming-soon">
        <h2>Estadísticas de Salud</h2>
        {error ? (
          <>
            <p>{error}</p>
            <button className="export-button" type="button" onClick={reload}>
              Reintentar
            </button>
          </>
        ) : (
          <p>Cargando estadísticas…</p>
        )}
      </div>
    )
  }

  const { heart_rate: hr, steps, calories, sleep } = stats
  const hrAvg = avgOrNull(hr)
  const hrState = hrStatus(hrAvg)

  const sleepAvg = avgOrNull(sleep)
  const sleepPct =
    sleepAvg != null && sleep.goal ? Math.round((sleepAvg / sleep.goal) * 100) : null

  const prevHr =
    hr.change_pct != null && hr.change_pct > -100
      ? Math.round(hr.avg / (1 + hr.change_pct / 100))
      : null
  const stable = hr.change_pct != null && Math.abs(hr.change_pct) <= 5

  const deviceBadge = device
    ? [device.name, device.firmware_version && `v${device.firmware_version}`].filter(Boolean).join(' ')
    : ''
  const lastSync = device?.last_sync_at ? timeAgo(device.last_sync_at) : null

  return (
    <div className="estadisticas" style={{ opacity: loading ? 0.65 : 1, transition: 'opacity .2s' }}>

      {/* CABECERA */}

      <div className="estadisticas-header">
        <div>
          <div className="estadisticas-title">
            <h1>Estadísticas de Salud</h1>
            {deviceBadge && <span className="device-badge">{deviceBadge}</span>}
          </div>

          <p>
            Analiza y compara el rendimiento y evolución de tus métricas
            biométricas registradas por tu {device?.name ?? 'dispositivo'}.
          </p>
        </div>

        <div className="estadisticas-actions">
          <div className="period-pills">
            {PERIODS.map(([key, label]) => (
              <button
                key={key}
                className={`period-pill${period === key ? ' active' : ''}`}
                type="button"
                onClick={() => setPeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="date-button">
            <span>▣</span>
            {stats.range_label}
          </span>

          <button className="export-button" type="button" onClick={() => exportCsv(stats)}>
            <ExportIcon />
            Exportar
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ color: '#d6455d', margin: '0 0 12px' }}>
          {error}
        </p>
      )}

      {/* TARJETAS DE RESUMEN */}

      <div className="stats-grid">
        <StatCard
          title="Ritmo Cardíaco"
          value={show('heart_rate', hrAvg)}
          unit="ppm prom."
          badge={hrState.label}
          badgeTone={hrState.tone}
          icon={<HeartIcon />}
          type="heart"
        />

        <StatCard
          title="Pasos Diarios"
          value={show('steps', avgOrNull(steps))}
          unit="pasos/día"
          {...changeBadge(steps.change_pct)}
          icon={<StepsIcon />}
          type="steps"
        />

        <StatCard
          title="Calorías Quemadas"
          value={show('calories', avgOrNull(calories))}
          unit="kcal act."
          {...changeBadge(calories.change_pct)}
          icon={<CaloriesIcon />}
          type="calories"
        />

        <StatCard
          title="Tiempo de Sueño"
          value={show('sleep', sleepAvg)}
          unit="prom./noche"
          badge={sleepPct == null ? '—' : `${sleepPct}% meta`}
          badgeTone={sleepPct != null && sleepPct >= 85 ? 'badge-green' : 'badge-gray'}
          icon={<SleepIcon />}
          type="sleep"
        />
      </div>

      {/* RITMO CARDÍACO DETALLADO */}

      <section className="panel hr-panel">
        <div className="hr-panel-header">
          <div className="panel-title">
            <div className="hr-panel-icon"><HeartIcon /></div>

            <div>
              <div className="hr-panel-title-row">
                <h2>Ritmo Cardíaco Detallado</h2>
                {hrAvg != null && (
                  <span className="badge badge-green-outline">
                    {hrState.ok ? 'Rango Normal' : 'Fuera de rango'}
                  </span>
                )}
              </div>

              <span className="hr-panel-sub">
                {period === 'today' ? 'Promedio por lectura' : 'Promedio por día'}
                {lastSync && ` · Última sincronización ${lastSync}`}
              </span>
            </div>
          </div>

          <div className="hr-panel-controls">
            <button className="view-toggle active" type="button">⟍ Línea</button>
            <button className="view-toggle" type="button">▤ Barras</button>
            <button className="view-toggle" type="button">⇄ Comparativa</button>
            <button className="kebab-button" type="button">⋮</button>
          </div>
        </div>

        <HeartRateChart daily={hr.daily} period={period} />

        <div className="hr-stats-row">
          <div className="hr-stat">
            <span>Ritmo Promedio</span>
            <strong>{show('heart_rate', hrAvg)} <small>ppm</small></strong>
            <span className={`hr-stat-meta${hrState.ok ? ' good' : ''}`}>
              {hrAvg == null
                ? 'Sin lecturas'
                : hrState.ok
                  ? '✓ Dentro del rango saludable'
                  : 'Fuera del rango habitual (60 - 100 ppm)'}
            </span>
          </div>

          <div className="hr-stat">
            <span>Frecuencia Máxima <ArrowUp /></span>
            <strong>{show('heart_rate', hr.max)} <small>ppm</small></strong>
            <span className="hr-stat-meta">{fmtDateTime(hr.max_at) || '—'}</span>
          </div>

          <div className="hr-stat">
            <span>Frecuencia Mínima <ArrowDown /></span>
            <strong>{show('heart_rate', hr.min)} <small>ppm</small></strong>
            <span className="hr-stat-meta">{fmtDateTime(hr.min_at) || '—'}</span>
          </div>

          <div className="hr-stat">
            <span>Variación vs período previo</span>
            <strong>{hr.change_pct == null ? '—' : `${signed(hr.change_pct)}%`}</strong>
            <span className="hr-stat-meta">
              {hr.change_pct == null ? (
                'Sin datos del período previo'
              ) : (
                <>
                  <span className={`badge ${stable ? 'badge-green' : 'badge-green-outline'}`}>
                    {stable ? 'Estable' : 'Cambió'}
                  </span>
                  {prevHr != null && ` vs período previo (${prevHr} ppm)`}
                </>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* PASOS / CALORÍAS / SUEÑO */}

      <div className="side-grid">
        <StepsPanel metric={steps} period={period} />
        <CaloriesPanel metric={calories} period={period} />
        <SleepPanel metric={sleep} />
      </div>

      {/* INSIGHTS */}

      <div className="insights-banner">
        <div className="insights-icon">✦</div>

        <div className="insights-copy">
          <div className="insights-title">
            <strong>Conclusiones de Salud {PERIOD_TITLE[period]}</strong>
            <span className="badge badge-green-outline">Resumen automático</span>
          </div>

          <p>{buildInsights(stats)}</p>
        </div>

        <div className="insights-actions">
          <button className="insights-btn-outline" type="button" onClick={() => onNavigate?.('history')}>
            Ver Registro Completo
          </button>
          <button className="insights-btn" type="button" onClick={() => onNavigate?.('settings')}>
            Configurar Alertas →
          </button>
        </div>
      </div>

    </div>
  )
}

export default Stats