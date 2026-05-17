import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ScamCard from '../components/ScamCard'
import RecordModal from '../components/RecordModal'
import LaoSkyline from '../components/LaoSkyline'
import { fetchRecentReports } from '../services/sheetsService'
import { CATEGORIES } from '../config'
import { useT } from '../hooks/useT'

export default function HomePage() {
  const [q, setQ] = useState('')
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const t = useT()

  useEffect(() => {
    fetchRecentReports(6)
      .then(setRecent)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="flex flex-col">
      {selected && <RecordModal record={selected} onClose={() => setSelected(null)} />}
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lao-blue to-lao-sky text-white py-16 px-4">
        <LaoSkyline className="absolute inset-x-0 bottom-0 w-full h-[100%]" />

        <div className="relative max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2">
            <ShieldIcon className="w-10 h-10 text-lao-red drop-shadow" />
            <span className="font-black text-3xl tracking-tight text-white drop-shadow">
              Scan<span className="text-lao-red">Bers</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight font-lao drop-shadow-sm">
            {t.home.heroTitle}
          </h1>
          <p className="text-white/85 text-base font-lao drop-shadow-sm">
            {t.home.heroSub}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 mt-4">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              type="search"
              placeholder={t.home.searchPlaceholder}
              className="flex-1 rounded-lg border-0 bg-white/95 backdrop-blur-md placeholder-gray-400 text-gray-900 px-4 py-3 text-sm font-lao focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
            />
            <button type="submit" className="bg-lao-red hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-colors font-lao shadow-lg">
              {t.home.searchBtn}
            </button>
          </form>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap gap-6 justify-center text-sm text-gray-600">
          {[
            [t.home.statsReports, '📋'],
            [t.home.statsPhones, '📱'],
            [t.home.statsAccounts, '🏦'],
          ].map(([label, icon]) => (
            <div key={label} className="flex items-center gap-2 font-lao">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-10 w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4 font-lao">{t.home.categoriesTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="card p-4 flex flex-col gap-1 hover:border-lao-sky transition-colors group"
            >
              <span className="font-semibold text-sm text-gray-800 group-hover:text-lao-sky transition-colors font-lao">
                {t.categories[cat.id]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent reports */}
      <section className="max-w-6xl mx-auto px-4 pb-12 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-lao">{t.home.recentTitle}</h2>
          <Link to="/search" className="text-sm text-lao-sky hover:underline font-lao">{t.home.viewAll}</Link>
        </div>

        {loading && <LoadingGrid />}
        {error && <ConfigNotice message={error} setupMsg={t.home.setupNeeded} />}
        {!loading && !error && recent.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-lao">
            {t.home.noReports}{' '}
            <Link to="/report" className="text-lao-sky hover:underline">{t.home.beFirst}</Link>
          </div>
        )}
        {!loading && !error && recent.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r, i) => <ScamCard key={r.id ?? i} record={r} onSelect={setSelected} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-lao-red text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2 font-lao">{t.home.ctaTitle}</h2>
        <p className="text-white/80 mb-5 font-lao">{t.home.ctaSub}</p>
        <Link to="/report" className="inline-block bg-white text-lao-red font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-lao">
          {t.home.ctaBtn}
        </Link>
      </section>
    </div>
  )
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
    </svg>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-4 space-y-3 animate-pulse">
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

function ConfigNotice({ message, setupMsg }) {
  const isConfig = message.includes('VITE_APPS_SCRIPT_URL')
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-lao">
      {isConfig ? <>⚙️ {setupMsg}</> : <>⚠️ {message}</>}
    </div>
  )
}
