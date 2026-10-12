import './Dashboard.css'
import { useDashboard } from '../hooks/useDeviceStats.js'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatDate(iso) {
  const [y, m, d] = (iso ?? '').split('-').map(Number)
  if (!y) return ''
  return `Hoy, ${d} de ${MONTHS_ES[m - 1]} ${y}`
}

/** Convierte una serie de valores en un path SVG para el viewBox 180x52. */
function sparkPath(values) {
  const v = (values ?? []).filter((n) => typeof n === 'number')
  if (v.length === 0) return 'M0 40 L180 40'
  if (v.length === 1) return 'M0 26 L180 26'
  const min = Math.min(...v)
  const max = Math.max(...v)
  const span = max - min || 1
  return v
    .map((n, i) => {
      const x = (i / (v.length - 1)) * 180
      const y = 46 - ((n - min) / span) * 38
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function formatTime(iso) {
  if (!iso) return '--:--'
  // El backend guarda fechas en UTC sin zona; se interpretan como UTC.
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function minutesAgo(iso) {
  if (!iso) return null
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 60000))
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
      <path d="M20.8 8.7c0 5.4-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.7C3.2 5.8 5.3 4 7.8 4c1.7 0 3.3.9 4.2 2.2C12.9 4.9 14.5 4 16.2 4c2.5 0 4.6 1.8 4.6 4.7Z" />
    </svg>
  )
}

function StepsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 15.5A7.8 7.8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  )
}

function MetricCard({
  title,
  value,
  unit,
  meta,
  change,
  icon,
  type,
  points,
}) {
  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-top">
        <div className="metric-title">
          <div className="metric-icon">
            {icon}
          </div>

          <span>{title}</span>
        </div>

        {change != null && (
          <span
            className="metric-change"
            style={change < 0 ? { background: '#fdeeee', color: '#d04b4b' } : undefined}
          >
            {change < 0 ? '↓' : '↑'} {Math.abs(change)}%
          </span>
        )}
      </div>

      <div className="metric-value">
        <strong>{value}</strong>

        {unit && (
          <span>{unit}</span>
        )}

        {meta && (
          <small>{meta}</small>
        )}
      </div>

      <svg
        className="metric-chart"
        viewBox="0 0 180 52"
        preserveAspectRatio="none"
      >
        <path
          d={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function ActivityChart({ data }) {
  const pts = (data ?? []).filter((p) => p.steps != null)
  const maxSteps = Math.max(5000, ...pts.map((p) => p.steps))
  const top = Math.ceil(maxSteps / 5000) * 5000
  const toXY = (p) => {
    const [h, m] = p.time.split(':').map(Number)
    return [((h * 60 + m) / 1440) * 650, 210 - (p.steps / top) * 190]
  }
  const xy = pts.map(toXY)
  const line = xy.length
    ? xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    : 'M0 210 L650 210'
  const area = xy.length
    ? `${line} L${xy[xy.length - 1][0].toFixed(1)} 250 L${xy[0][0].toFixed(1)} 250 Z`
    : 'M0 250 Z'
  const last = pts[pts.length - 1]
  const lastXY = xy[xy.length - 1]
  const fmtK = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))

  return (
    <div className="activity-chart">

      <div className="chart-y-labels">
        <span>{fmtK(top)}</span>
        <span>{fmtK(Math.round((top * 2) / 3))}</span>
        <span>{fmtK(Math.round(top / 3))}</span>
        <span>0</span>
      </div>

      <svg
        className="activity-svg"
        viewBox="0 0 650 250"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="activityGradient"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopOpacity="0.20"
            />
            <stop
              offset="100%"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#activityGradient)" />

        <path d={line} fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {lastXY && (
        <circle
          cx={lastXY[0]}
          cy={lastXY[1]}
          r="5"
          fill="currentColor"
          stroke="#fff"
          strokeWidth="3"
        />
        )}
      </svg>

      <div className="chart-x-labels">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>24:00</span>
      </div>

      {last && (
        <div
          className="chart-tooltip"
          style={{ left: `${Math.min(85, Math.max(5, (lastXY[0] / 650) * 100))}%` }}
        >
          <strong>{last.time} hrs</strong>
          <span>{last.steps.toLocaleString('en-US')} pasos</span>
        </div>
      )}

    </div>
  )
}

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M9.5 6h5" />
      <path d="M9.5 18h5" />
    </svg>
  )
}

function Dashboard() {
  const { data, error, loading, reload } = useDashboard()

  if (loading && !data) {
    return <div className="dashboard"><p>Cargando tus datos…</p></div>
  }
  if (error && !data) {
    return (
      <div className="dashboard">
        <p>{error}</p>
        <button type="button" onClick={reload}>Reintentar</button>
      </div>
    )
  }

  const { heart_rate, steps, calories, sleep, activity_chart, device } = data
  const ago = minutesAgo(device.last_sync_at)
  const lastTime = formatTime(device.last_sync_at)

  return (
    <div className="dashboard">

      {/* CABECERA */}

      <div className="dashboard-header">

        <div>
          <h1>¡Hola, {data.greeting_name}!</h1>

          <p>
            Aquí tienes un resumen de la actividad y estadísticas
            de tus dispositivos de hoy.
          </p>
        </div>

        <div className="dashboard-actions">

          <button className="date-button">
            <span>▣</span>
            {formatDate(data.date)}
          </button>

          <button className="filter-button">
            ☷
            Filtrar
          </button>

        </div>

      </div>


      {/* TARJETAS */}

      <div className="metrics-grid">

        <MetricCard
          title="Ritmo cardíaco promedio"
          value={heart_rate.value_display}
          unit={heart_rate.unit}
          change={heart_rate.change_pct}
          type="heart"
          icon={<HeartIcon />}
          points={sparkPath(heart_rate.sparkline)}
        />

        <MetricCard
          title="Pasos diarios"
          value={steps.value_display}
          unit={steps.unit}
          change={steps.change_pct}
          type="steps"
          icon={<StepsIcon />}
          points={sparkPath(steps.sparkline)}
        />

        <MetricCard
          title="Calorías quemadas"
          value={calories.value_display}
          unit={calories.unit}
          change={calories.change_pct}
          type="calories"
          icon={<CaloriesIcon />}
          points={sparkPath(calories.sparkline)}
        />

        <MetricCard
          title="Tiempo de sueño"
          value={sleep.value_display}
          meta={sleep.meta}
          change={sleep.change_pct}
          type="sleep"
          icon={<SleepIcon />}
          points={sparkPath(sleep.sparkline)}
        />

      </div>


      {/* PARTE INFERIOR */}

      <div className="dashboard-main-grid">

        {/* ACTIVIDAD */}

        <section className="panel activity-panel">

          <div className="panel-header">

            <div className="panel-title">
              <h2>Actividad del día</h2>
              <span className="title-dot"></span>
            </div>

            <button className="today-button">
              ▣ Hoy
              <span>⌄</span>
            </button>

          </div>

          <ActivityChart data={activity_chart} />

        </section>


        {/* DISPOSITIVO */}

        <section className="panel device-panel">

          <div className="panel-header">
            <h2>Dispositivo<br />conectado</h2>

            <span className="connected">
              <i></i>
              {device.is_connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="device-card">

            <div className="watch">
              <div className="watch-screen">
                <small>{lastTime}</small>
                <strong>♥</strong>
                <span>{heart_rate.value_display}</span>
                <div></div>
              </div>
            </div>

            <div className="device-info">
              <strong>{device.name}</strong>
              <span>{device.edition}</span>

              <div className="battery">
                <span>♧</span>
                {device.battery_level}%
                <small>Hoy · {lastTime}</small>
              </div>
            </div>

          </div>

          <button className="device-details">
            Ver detalles del dispositivo
            <span>→</span>
          </button>

        </section>

      </div>


      {/* SINCRONIZACIÓN */}

      <div className="sync-banner">

        <div className="sync-icon">
          i
        </div>

        <div>
          <strong>Sincronización activa:</strong>
          <span>
            Mantén tu dispositivo vinculado para asegurar un flujo
            constante y métricas en tiempo real.
          </span>
        </div>

        <button>
          Entendido
        </button>

      </div>


      {/* ACCESOS RÁPIDOS */}

      <section className="panel quick-panel">

        <div className="panel-header">
          <h2>Accesos rápidos</h2>
          <span className="quick-symbol">ϟ</span>
        </div>

        <div className="quick-grid">

          <button className="quick-item">
            <div className="quick-icon blue">
              ◷
            </div>

            <div>
              <strong>Iniciar entrenamiento</strong>
              <span>Registrar nueva sesión</span>
            </div>
          </button>

          <button className="quick-item">
            <div className="quick-icon cyan">
              ◇
            </div>

            <div>
              <strong>Añadir registro de agua</strong>
              <span>Vasos consumidos: 6 / 8</span>
            </div>
          </button>

          <button className="quick-item">
            <div className="quick-icon purple">
              ⚑
            </div>

            <div>
              <strong>Nueva meta personal</strong>
              <span>Personalizar objetivos diarios</span>
            </div>
          </button>

          <button className="quick-item">
            <div className="quick-icon green">
              ↻
            </div>

            <div>
              <strong>Sincronizar ahora</strong>
              <span>{ago == null ? 'Sin sincronizar' : `Última hace ${ago} min`}</span>
            </div>
          </button>

        </div>

      </section>

    </div>
  )
}

export default Dashboard