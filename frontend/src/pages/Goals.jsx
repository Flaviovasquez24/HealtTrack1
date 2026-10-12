import { useEffect, useMemo, useState } from 'react'
import './Goals.css'
import { useStatsSummary } from '../hooks/useDeviceStats.js'

const STORAGE_KEY = 'wearable_stats_goals_v1'

const DEFAULT_GOALS = [
  { id: 'steps', title: 'Pasos diarios', unit: 'pasos', target: 10000, icon: '👟', tone: 'blue' },
  { id: 'calories', title: 'Calorías quemadas', unit: 'kcal', target: 500, icon: '🔥', tone: 'cyan' },
  { id: 'sleep', title: 'Tiempo de sueño', unit: 'minutos', target: 480, icon: '🌙', tone: 'dark' },
]

function readGoals() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!Array.isArray(saved)) return DEFAULT_GOALS
    return DEFAULT_GOALS.map((goal) => ({
      ...goal,
      target: Number(saved.find((item) => item.id === goal.id)?.target) > 0
        ? Number(saved.find((item) => item.id === goal.id).target)
        : goal.target,
    }))
  } catch {
    return DEFAULT_GOALS
  }
}

function latestValue(metric) {
  if (!metric) return null
  const points = Array.isArray(metric.daily) ? metric.daily : []
  const valid = points.filter((point) => point.value != null && Number.isFinite(Number(point.value)))
  if (valid.length) return Number(valid[valid.length - 1].value)
  return null
}

function formatValue(id, value) {
  if (value == null) return 'Sin datos de hoy'
  if (id === 'sleep') {
    const minutes = Math.max(0, Math.round(value))
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  }
  return `${Math.round(value).toLocaleString('es-PE')} ${id === 'steps' ? 'pasos' : 'kcal'}`
}

function TargetIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
}

function SummaryCard({ label, value, meta, tone = 'gray' }) {
  return <div className={`summary-card ${tone}`}><div className="summary-copy"><span className="summary-label">{label}</span><strong>{value}</strong><span className="summary-meta">{meta}</span></div></div>
}

function Metas() {
  const { data, error, loading, reload } = useStatsSummary('today')
  const [goals, setGoals] = useState(readGoals)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)) } catch { /* El navegador puede bloquear el almacenamiento. */ }
  }, [goals])

  const progress = useMemo(() => goals.map((goal) => {
    const metric = data?.[goal.id]
    const current = latestValue(metric)
    const pct = current == null ? 0 : Math.min(100, Math.round((current / goal.target) * 100))
    return { ...goal, current, pct, completed: current != null && current >= goal.target }
  }), [goals, data])

  const completed = progress.filter((goal) => goal.completed).length
  const withData = progress.filter((goal) => goal.current != null).length
  const overall = withData ? Math.round(progress.reduce((sum, goal) => sum + (goal.current == null ? 0 : goal.pct), 0) / withData) : 0

  function openEditor() {
    setDraft(Object.fromEntries(goals.map((goal) => [goal.id, String(goal.target)])))
    setSaveMessage('')
    setEditing(true)
  }

  function saveGoals(event) {
    event.preventDefault()
    const updated = goals.map((goal) => {
      const value = Number(draft[goal.id])
      return { ...goal, target: Number.isFinite(value) && value > 0 ? value : goal.target }
    })
    setGoals(updated)
    setEditing(false)
    setSaveMessage('Metas guardadas en este navegador.')
  }

  return (
    <div className="metas">
      <div className="metas-header">
        <div className="metas-title">
          <div className="metas-title-icon"><TargetIcon /></div>
          <div>
            <h1>Metas</h1>
            <p>Define tus objetivos diarios y revisa cuánto te falta para alcanzarlos. El progreso se calcula con las lecturas de hoy del dispositivo.</p>
          </div>
        </div>
        <button className="new-goal-button" type="button" onClick={openEditor}>＋ Editar objetivos</button>
      </div>

      {saveMessage && <p role="status" style={{ color: '#218653', marginBottom: 14 }}>{saveMessage}</p>}
      {error && <div role="alert" style={{ marginBottom: 16, color: '#c0394b' }}>No se pudieron cargar las métricas: {error} <button type="button" onClick={reload}>Reintentar</button></div>}

      <div className="summary-grid">
        <SummaryCard label="Objetivos cumplidos" value={`${completed} de ${goals.length}`} meta="Según los datos disponibles de hoy" tone="green" />
        <SummaryCard label="Progreso promedio" value={`${overall}%`} meta={`${withData} de ${goals.length} objetivos con datos`} tone="blue" />
        <SummaryCard label="Pendientes" value={goals.length - completed} meta="Todavía no alcanzados" tone="gray" />
      </div>

      <div className="metas-main-grid">
        <section className="panel goals-panel">
          <div className="panel-header"><h2>Objetivos de hoy</h2><span>{data?.range_label || 'Día actual'}</span></div>
          {loading && !data ? <p style={{ padding: 20 }}>Cargando progreso de hoy…</p> : (
            <div className="goals-list">
              {progress.map((goal) => (
                <div className="goal-row" key={goal.id}>
                  <div className={`goal-icon ${goal.tone}`} aria-hidden="true">{goal.icon}</div>
                  <div className="goal-info">
                    <strong>{goal.title}</strong>
                    <span>Objetivo: {goal.id === 'sleep' ? `${Math.floor(goal.target / 60)} h ${goal.target % 60} min por noche` : `${goal.target.toLocaleString('es-PE')} ${goal.unit} al día`}</span>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-progress-top"><span>{formatValue(goal.id, goal.current)} / {goal.id === 'sleep' ? `${Math.floor(goal.target / 60)} h ${goal.target % 60} min` : `${goal.target.toLocaleString('es-PE')} ${goal.unit}`}</span><strong>{goal.current == null ? '—' : `${goal.pct}%`}</strong></div>
                    <div className="goal-bar"><div className={`goal-bar-fill${goal.completed ? ' done' : ''}`} style={{ width: `${goal.pct}%` }} /></div>
                  </div>
                  <span className={`status-pill ${goal.completed ? 'done' : 'progress'}`}>{goal.current == null ? 'Sin datos' : goal.completed ? 'Cumplida' : 'En progreso'}</span>
                </div>
              ))}
            </div>
          )}
          <p style={{ color: '#8993a4', fontSize: 12, padding: '0 18px 16px' }}>Las metas de agua y distancia no se muestran porque el backend actual no registra esas métricas.</p>
        </section>

        <div className="metas-side">
          <section className="panel progress-panel">
            <h2>Progreso general</h2>
            <div className="donut-wrap">
              <svg className="donut" viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" fill="none" stroke="#eef1f6" strokeWidth="14"/><circle cx="65" cy="65" r="54" fill="none" stroke="#2867df" strokeWidth="14" strokeLinecap="round" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * (1 - overall / 100)} transform="rotate(-90 65 65)"/></svg>
              <div className="donut-center"><strong>{overall}%</strong><span>de progreso</span></div>
            </div>
            <ul className="progress-legend">
              <li><i className="dot green" />Cumplidas<span>{completed}</span></li>
              <li><i className="dot blue" />En progreso<span>{progress.filter((goal) => goal.current != null && !goal.completed).length}</span></li>
              <li><i className="dot gray" />Sin datos<span>{progress.filter((goal) => goal.current == null).length}</span></li>
              <li><i className="dot dark" />Total<span>{goals.length}</span></li>
            </ul>
          </section>
          <div className="tip-banner"><div className="tip-icon"><TargetIcon /></div><div><strong>Consejo</strong><p>Usa metas realistas y ajusta los objetivos según tu rutina. Las estadísticas sirven para analizar tendencias; esta pantalla se centra en tu progreso diario.</p></div></div>
        </div>
      </div>

      {editing && <div className="goal-editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false) }}>
        <form className="goal-editor" onSubmit={saveGoals}>
          <h2>Editar objetivos diarios</h2>
          <p>Los cambios se guardarán en el almacenamiento local de este navegador.</p>
          {goals.map((goal) => <label className="goal-editor-field" key={goal.id}><span>{goal.title}{goal.id === 'sleep' ? ' (minutos)' : ` (${goal.unit})`}</span><input type="number" min="1" step="1" required value={draft[goal.id] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [goal.id]: event.target.value }))}/></label>)}
          <div className="goal-editor-actions"><button type="button" className="filter-select" onClick={() => setEditing(false)}>Cancelar</button><button type="submit" className="new-goal-button">Guardar metas</button></div>
        </form>
      </div>}
    </div>
  )
}

export default Metas
