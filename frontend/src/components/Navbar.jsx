import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useCurrentUser } from '../hooks/useDeviceStats.js'

const svgProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function BellIcon() {
  return (
    <svg {...svgProps} width={18} height={18}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg {...svgProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  )
}

function Navbar({ onNavigate }) {
  const { logout } = useAuth()
  const { data: user } = useCurrentUser()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const fullName = user?.full_name ?? ''
  const firstName = fullName.split(' ')[0]

  // Cierra el menú al hacer clic fuera o al presionar Escape.
  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (page) => {
    setOpen(false)
    onNavigate?.(page)
  }

  return (
    <header className="topbar">
      <div className="topbar-spacer" />

      <button className="icon-button" type="button" aria-label="Notificaciones">
        <BellIcon />
        <span className="icon-dot" />
      </button>

      <div className="user-menu-wrap" ref={menuRef}>
        <button
          className={`user-menu${open ? ' open' : ''}`}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="avatar">
            {(firstName[0] ?? '·').toUpperCase()}
          </div>

          <div className="user-copy">
            <strong>{firstName || '…'}</strong>
            <span>Usuario</span>
          </div>

          <svg className={`chevron${open ? ' open' : ''}`} {...svgProps}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="user-dropdown" role="menu">
            <div className="user-dropdown-head">
              <strong>{fullName || 'Usuario'}</strong>
              <span>{user?.email ?? ''}</span>
            </div>

            <button className="user-dropdown-item" type="button" role="menuitem" onClick={() => go('profile')}>
              <UserIcon />
              Mi perfil
            </button>

            <button className="user-dropdown-item" type="button" role="menuitem" onClick={() => go('settings')}>
              <SettingsIcon />
              Configuración
            </button>

            <div className="user-dropdown-sep" />

            <button
              className="user-dropdown-item danger"
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar