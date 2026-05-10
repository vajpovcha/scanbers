import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { useT } from '../hooks/useT'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, toggle } = useLang()
  const t = useT()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium font-lao transition-colors ${isActive ? 'text-lao-red' : 'text-gray-700 hover:text-lao-red'}`

  return (
    <header className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200 shadow-sm">
      {/* Lao flag stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-lao-red" />
        <div className="flex-[2] bg-lao-blue" />
        <div className="flex-1 bg-lao-red" />
      </div>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <ShieldIcon className="w-9 h-9 text-lao-red" />
          <span className="font-black text-2xl tracking-tight text-gray-900">
            Scan<span className="text-lao-red">Bers</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 ml-auto">
          <NavLink to="/" end className={linkClass}>{t.nav.home}</NavLink>
          <NavLink to="/dashboard" className={linkClass}>{t.nav.dashboard}</NavLink>
          <NavLink to="/search" className={linkClass}>{t.nav.search}</NavLink>
          <NavLink to="/report" className={linkClass}>{t.nav.report}</NavLink>
          <NavLink to="/scam-types" className={linkClass}>{t.nav.scamTypes}</NavLink>
          <NavLink to="/about" className={linkClass}>{t.nav.about}</NavLink>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs font-semibold font-lao text-gray-700 hover:border-lao-sky hover:text-lao-sky transition-colors"
            title={lang === 'lo' ? 'Switch to English' : 'ສ່ຽງເປັນພາສາລາວ'}
          >
            <span>{lang === 'lo' ? '🇬🇧' : '🇱🇦'}</span>
            <span>{lang === 'lo' ? 'EN' : 'ລາວ'}</span>
          </button>

          <Link to="/report" className="btn-primary py-1.5 px-4 text-xs font-lao">
            {t.nav.reportBtn}
          </Link>
        </nav>

        {/* Mobile: language toggle + menu */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gray-300 text-xs font-semibold font-lao text-gray-700"
          >
            <span>{lang === 'lo' ? '🇬🇧' : '🇱🇦'}</span>
            <span>{lang === 'lo' ? 'EN' : 'ລາວ'}</span>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-2">
            {[
              ['/', t.nav.home, true],
              ['/dashboard', t.nav.dashboard, false],
              ['/search', t.nav.search, false],
              ['/report', t.nav.report, false],
              ['/scam-types', t.nav.scamTypes, false],
              ['/about', t.nav.about, false],
            ].map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
    </svg>
  )
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
