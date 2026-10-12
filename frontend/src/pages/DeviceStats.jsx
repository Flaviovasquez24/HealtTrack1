import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useDashboard, useMyDevice } from '../hooks/useDeviceStats.js'
import { syncMyDevice, unpairMyDevice } from '../service/statsService.js'
import './DeviceStats.css'

/* =====================================
   ICONOS
===================================== */

const ICONS = {
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  next: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 5 5L20 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sync: <path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M18 2v4h-4M6 22v-4h4" />,
  bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
  battery: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M10 1h4M12 8l-2 4h4l-2 4" />
    </>
  ),
  watch: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2l1 1M16.1 7.7l-.8-4A2 2 0 0 0 13.3 2h-2.6a2 2 0 0 0-2 1.6l-.8 4M7.9 16.4l.8 4a2 2 0 0 0 2 1.6h2.6a2 2 0 0 0 2-1.6l.8-4" />
    </>
  ),
  heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
  heartPulse: (
    <>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
      <path d="M3.5 12h5l1.5-3 3 6 1.5-3h4" />
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
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  rotate: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  unlink: <path d="m18.8 12.3 1.7-1.7a5 5 0 0 0-.1-7.1 5 5 0 0 0-7 0l-1.7 1.7M5.2 11.7l-1.7 1.7a5 5 0 0 0 .1 7.1 5 5 0 0 0 7 0l1.7-1.7M8 2v3M2 8h3M16 22v-3M22 16h-3" />,
  warning: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01" />,
  reset: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
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
   CONSTANTES
===================================== */

// El backend aún no expone sensores, MAC ni garantía: se muestran solo los sensores del modelo.
const SENSORS = ['Sensor PPG Óptico', 'Acelerómetro Triaxial', 'Oxímetro SpO2', 'Sensor Térmico cutáneo']

const HR_RATES = [
  [15, 'Baja'],
  [10, 'Media'],
  [5, 'Alta'],
]

const INITIAL_CFG = {
  notifications: true,
  sedentary: true,
  hrRate: 5,
  wristRaise: true,
  autoBrightness: true,
}

const CONFIRMS = {
  unlink: {
    title: '¿Desvincular dispositivo?',
    body: 'Las métricas que no hayan sido sincronizadas con HealthTrack se eliminarán de forma permanente de la memoria de la pulsera.',
    action: 'Desvincular',
  },
  reset: {
    title: '¿Restablecer de fábrica?',
    body: 'Se restaurarán los valores iniciales de la pulsera y se perderán las métricas que no hayan sido sincronizadas.',
    action: 'Restablecer',
  },
}

/* =====================================
   UTILIDADES
===================================== */

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US')

// El backend guarda fechas en UTC sin sufijo "Z"; sin él JS las interpreta como hora local.
function parseUtc(value) {
  if (!value) return null
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value)
  return new Date(hasZone ? value : `${value}Z`)
}
const clock = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })

function ago(date, now) {
  if (!date) return ''
  const min = Math.max(0, Math.floor((now - date) / 60000))
  return min >= 60 ? `hace ${Math.floor(min / 60)} h` : `hace ${min} min`
}

function batteryStatus(pct) {
  if (pct >= 50) return 'Batería en estado óptimo'
  if (pct >= 20) return 'Batería en nivel medio'
  return 'Batería baja, conecta el cargador'
}

/* =====================================
   COMPONENTES
===================================== */

function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`dev-switch${checked ? ' on' : ''}`}
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

function Wearable({ now, battery, bpm, steps }) {
  return (
    <div className="dev-watch" aria-label="Vista previa de la pulsera">
      <i className="dev-strap top" />

      <div className="dev-watch-body">
        <div className="dev-screen">
          <div className="dev-screen-top">
            <span>{clock(now)}</span>
            <span className="bat">
              <i />
              {battery}%
            </span>
          </div>

          <span className="dev-screen-heart"><Icon name="heart" size={14} /></span>

          <strong>{bpm}<small>ppm</small></strong>
          <em>EN REPOSO</em>

          <div className="dev-screen-steps">
            <Icon name="person" size={11} />
            {fmt(steps)}
          </div>
        </div>
      </div>

      <i className="dev-strap bottom" />
    </div>
  )
}

function InfoRow({ label, children, className = '' }) {
  return (
    <div className="dev-info-row">
      <span>{label}</span>
      <strong className={className}>{children}</strong>
    </div>
  )
}

function Setting({ icon, tone = 'blue', title, desc, right, onClick, open, panel, descTone }) {
  const body = (
    <>
      <span className={`dev-setting-icon tone-${tone}`}><Icon name={icon} size={17} /></span>

      <div className="dev-setting-copy">
        <strong>{title}</strong>
        <span className={descTone ?? ''}>{desc}</span>
      </div>

      {right}
    </>
  )

  return (
    <div className="dev-setting-wrap">
      {onClick ? (
        <button className="dev-setting" type="button" onClick={onClick} aria-expanded={open}>
          {body}
        </button>
      ) : (
        <div className="dev-setting">{body}</div>
      )}
      {open && panel}
    </div>
  )
}

/* =====================================
   PÁGINA PRINCIPAL
===================================== */

function DeviceStats({ onNavigate }) {
  const { token } = useAuth()
  const { data: device, error: deviceError, loading: deviceLoading, reload: reloadDevice } = useMyDevice()
  const { data: dash, reload: reloadDash } = useDashboard()

  const [now, setNow] = useState(() => new Date())
  const [syncing, setSyncing] = useState(false)
  const [cfg, setCfg] = useState(INITIAL_CFG)
  const [openRow, setOpenRow] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!confirm) return undefined
    const onKey = (e) => e.key === 'Escape' && setConfirm(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirm])

  if (deviceLoading && !device) {
    return <div className="dev"><div className="dev-card dev-section">Cargando dispositivo…</div></div>
  }

  if (deviceError && !device) {
    return (
      <div className="dev">
        <div className="dev-card dev-section">
          <p>{deviceError}</p>
          <button className="dev-btn primary" type="button" onClick={reloadDevice}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!device) return null

  const lastSync = parseUtc(device.last_sync_at)
  const battery = device.battery_level ?? 0
  const connected = Boolean(device.is_connected)

  const hrSpark = dash?.heart_rate?.sparkline ?? []
  const live = {
    bpm: hrSpark.length ? Math.round(hrSpark[hrSpark.length - 1]) : Math.round(dash?.heart_rate?.value ?? 0),
    steps: dash?.steps?.value ?? 0,
    kcal: Math.round(dash?.calories?.value ?? 0),
    sleep: dash?.sleep?.value_display ?? '0h 0m',
  }

  const sync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      await syncMyDevice(token)
      await Promise.all([reloadDevice(), reloadDash()])
      setNow(new Date())
      setToast('Sincronización completada')
    } catch (err) {
      setToast(err.message || 'No se pudo sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const copySerial = async () => {
    try {
      await navigator.clipboard.writeText(device.serial_number ?? '')
      setToast('Número de serie copiado')
    } catch {
      setToast('No se pudo copiar el número de serie')
    }
  }

  const setC = (key) => (value) => setCfg((c) => ({ ...c, [key]: value }))
  const toggleRow = (id) => setOpenRow((cur) => (cur === id ? null : id))

  const runConfirm = async () => {
    const action = confirm
    setConfirm(null)

    if (action === 'unlink') {
      try {
        await unpairMyDevice(token)
        await Promise.all([reloadDevice(), reloadDash()])
        setToast('Dispositivo desvinculado')
      } catch (err) {
        setToast(err.message || 'No se pudo desvincular')
      }
      return
    }

    setToast('Restablecer de fábrica aún no está disponible en la API')
  }

  const active = [cfg.notifications, true, cfg.sedentary, true, true].filter(Boolean).length
  const rateLabel = HR_RATES.find(([m]) => m === cfg.hrRate)?.[1]
  const autonomy = Math.max(1, Math.round((battery / 100) * 5))

  const stats = [
    { label: 'Ritmo cardíaco', value: live.bpm, unit: 'ppm', icon: 'heart', tone: 'red' },
    { label: 'Pasos hoy', value: fmt(live.steps), icon: 'person', tone: 'blue' },
    { label: 'Calorías quemadas', value: live.kcal, unit: 'kcal', icon: 'flame', tone: 'green' },
    { label: 'Sueño nocturno', value: live.sleep, icon: 'moon', tone: 'blue' },
  ]

  return (
    <div className="dev">

      {/* CABECERA */}

      <div className="dev-top">
        <div>
          <nav className="dev-crumbs" aria-label="Ruta de navegación">
            <button type="button" onClick={() => onNavigate?.('dashboard')}>
              <Icon name="back" size={12} />
              Dashboard
            </button>
            <span>/</span>
            <strong>{device.name}</strong>
          </nav>

          <h1>Detalle del dispositivo</h1>
          <p>Gestiona el estado, sincronización y configuración de tu wearable vinculado.</p>
        </div>

        <div className="dev-top-actions">
          <span className="dev-status">
            <i className="dev-dot" />
            {connected ? 'Conectado y activo' : 'Desconectado'}
          </span>
          <button className="dev-btn outline" type="button" onClick={sync} disabled={syncing}>
            <span className={syncing ? 'spin' : ''}><Icon name="sync" size={13} /></span>
            {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
          </button>
        </div>
      </div>

      {/* HERO */}

      <section className="dev-card dev-hero">
        <div className="dev-hero-visual">
          <Wearable now={now} battery={battery} bpm={live.bpm} steps={live.steps} />
        </div>

        <div className="dev-hero-info">
          <div className="dev-hero-title">
            <h2>{device.name}</h2>
            {device.edition && <span className="dev-edition">{device.edition}</span>}
          </div>

          <p className="dev-hero-line">
            <span className="bt">
              <Icon name="bluetooth" size={13} />
              {connected ? 'Conectado por' : 'Sin conexión'} {device.connection_type}
            </span>
            <span>
              {lastSync
                ? `• Última sincronización ${clock(lastSync)} (${ago(lastSync, now)})`
                : '• Aún sin sincronizar'}
            </span>
          </p>

          <div className="dev-battery">
            <span className="dev-battery-icon"><Icon name="battery" size={20} /></span>

            <div className="dev-battery-bar">
              <div>
                <span>Batería restante</span>
                <strong>{battery}%</strong>
              </div>
              <div className="dev-progress" role="progressbar" aria-valuenow={battery} aria-valuemin={0} aria-valuemax={100}>
                <i style={{ width: `${battery}%` }} />
              </div>
            </div>

            <div className="dev-battery-meta">
              <strong>~{autonomy} días de autonomía</strong>
              <span>{batteryStatus(battery)}</span>
            </div>
          </div>

          <div className="dev-hero-actions">
            <button className="dev-btn primary lg" type="button" onClick={sync} disabled={syncing}>
              <span className={syncing ? 'spin' : ''}><Icon name="sync" size={14} /></span>
              Sincronizar
            </button>
            <button className="dev-btn soft lg" type="button" onClick={() => setToast('Enviando señal a la pulsera…')}>
              <Icon name="watch" size={14} />
              Buscar dispositivo
            </button>
            <button className="dev-btn ghost-danger" type="button" onClick={() => setConfirm('unlink')}>
              <Icon name="unlink" size={14} />
              Desvincular
            </button>
          </div>
        </div>
      </section>

      {/* MÉTRICAS EN VIVO */}

      <div className="dev-stats">
        {stats.map((s) => (
          <div className="dev-card dev-stat" key={s.label}>
            <span className={`dev-stat-icon tone-${s.tone}`}><Icon name={s.icon} size={16} /></span>
            <div>
              <span>{s.label}</span>
              <strong>
                {s.value}
                {s.unit && <small> {s.unit}</small>}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* MODELO + CONFIGURACIÓN */}

      <div className="dev-row">

        <section className="dev-card dev-section">
          <header className="dev-head">
            <h2><Icon name="cpu" size={17} />Información del modelo</h2>
            <span className="dev-tag">Oficial</span>
          </header>

          <div className="dev-info">
            <InfoRow label="Modelo">{device.name}</InfoRow>

            <InfoRow label="Número de serie" className="mono">
              {device.serial_number ?? '—'}
              {device.serial_number && (
                <button className="dev-copy" type="button" onClick={copySerial} aria-label="Copiar número de serie">
                  <Icon name="copy" size={13} />
                </button>
              )}
            </InfoRow>

            <InfoRow label="Versión Firmware" className="green">
              <i className="dev-dot" />
              {device.firmware_version ? `v${device.firmware_version}` : '—'}
            </InfoRow>

            <InfoRow label="Conectividad">{device.connection_type}</InfoRow>

            <InfoRow label="Almacenamiento">
              {device.storage_total_mb != null
                ? `${device.storage_used_mb ?? 0} / ${device.storage_total_mb} MB`
                : '—'}
            </InfoRow>

            <div className="dev-sensors">
              <span>Sensores y componentes</span>
              <div>
                {SENSORS.map((s) => <em key={s}>{s}</em>)}
              </div>
            </div>

            {device.paired_at && (
              <InfoRow label="Vinculado el">
                {parseUtc(device.paired_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </InfoRow>
            )}
          </div>
        </section>

        <section className="dev-card dev-section">
          <header className="dev-head">
            <h2><Icon name="sliders" size={17} />Configuración del dispositivo</h2>
            <span className="dev-count">{active} activas</span>
          </header>

          <div className="dev-settings">
            <Setting
              icon="bell"
              title="Notificaciones del móvil"
              desc="Llamadas entrantes, mensajes y avisos de salud"
              right={<Toggle checked={cfg.notifications} onChange={setC('notifications')} label="Notificaciones del móvil" />}
            />

            <Setting
              icon="heartPulse"
              tone="red"
              title="Monitoreo continuo cardíaco"
              desc={`Medición en tiempo real cada ${cfg.hrRate} minutos`}
              onClick={() => toggleRow('hr')}
              open={openRow === 'hr'}
              right={
                <>
                  <span className="dev-chip">Frecuencia {rateLabel}</span>
                  <span className={`dev-chevron${openRow === 'hr' ? ' open' : ''}`}><Icon name="next" size={14} /></span>
                </>
              }
              panel={
                <div className="dev-panel" role="group" aria-label="Frecuencia de medición">
                  {HR_RATES.map(([min, label]) => (
                    <button
                      key={min}
                      type="button"
                      className={cfg.hrRate === min ? 'active' : ''}
                      onClick={() => setC('hrRate')(min)}
                    >
                      {label}
                      <small>cada {min} min</small>
                    </button>
                  ))}
                </div>
              }
            />

            <Setting
              icon="person"
              title="Alerta de sedentarismo"
              desc="Recordatorio para levantarse tras 60 min de inactividad"
              right={<Toggle checked={cfg.sedentary} onChange={setC('sedentary')} label="Alerta de sedentarismo" />}
            />

            <Setting
              icon="rotate"
              title="Pantalla y gesto de muñeca"
              desc={`${cfg.wristRaise ? 'Encendido al girar muñeca' : 'Encendido manual'} • Brillo automático ${cfg.autoBrightness ? 'activado' : 'desactivado'}`}
              onClick={() => toggleRow('screen')}
              open={openRow === 'screen'}
              right={<span className={`dev-chevron${openRow === 'screen' ? ' open' : ''}`}><Icon name="next" size={14} /></span>}
              panel={
                <div className="dev-panel col">
                  <label>
                    Encender al girar la muñeca
                    <Toggle checked={cfg.wristRaise} onChange={setC('wristRaise')} label="Encender al girar la muñeca" />
                  </label>
                  <label>
                    Brillo automático
                    <Toggle checked={cfg.autoBrightness} onChange={setC('autoBrightness')} label="Brillo automático" />
                  </label>
                </div>
              }
            />

            <Setting
              icon="download"
              tone="mint"
              title="Actualizaciones de software"
              desc="Dispositivo al día con el último firmware"
              descTone="green"
              right={<span className="dev-uptodate"><Icon name="checkCircle" size={13} />Al día</span>}
            />
          </div>
        </section>

      </div>

      {/* ZONA AVANZADA */}

      <section className="dev-card dev-danger">
        <span className="dev-danger-icon"><Icon name="warning" size={18} /></span>

        <div className="dev-danger-copy">
          <h2>Gestión avanzada del wearable</h2>
          <p>
            Al desvincular o restaurar los valores iniciales de la pulsera, las
            métricas que no hayan sido previamente sincronizadas con HealthTrack
            se eliminarán de forma permanente de la memoria interna.
          </p>
        </div>

        <div className="dev-danger-actions">
          <button className="dev-btn gray lg" type="button" onClick={() => setConfirm('reset')}>
            Restablecer de fábrica
          </button>
          <button className="dev-btn danger lg" type="button" onClick={() => setConfirm('unlink')}>
            <Icon name="unlink" size={14} />
            Desvincular pulsera
          </button>
        </div>
      </section>

      {/* CONFIRMACIÓN */}

      {confirm && (
        <div className="dev-overlay" onClick={() => setConfirm(null)}>
          <div
            className="dev-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dev-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="dev-danger-icon"><Icon name="warning" size={18} /></span>
            <h3 id="dev-modal-title">{CONFIRMS[confirm].title}</h3>
            <p>{CONFIRMS[confirm].body}</p>

            <div className="dev-modal-actions">
              <button className="dev-btn gray" type="button" onClick={() => setConfirm(null)} autoFocus>
                Cancelar
              </button>
              <button className="dev-btn danger" type="button" onClick={runConfirm}>
                {CONFIRMS[confirm].action}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="dev-toast" role="status">
          <Icon name="check" size={14} stroke={2.6} />
          {toast}
        </div>
      )}

    </div>
  )
}

export default DeviceStats