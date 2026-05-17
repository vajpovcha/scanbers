import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '../services/sheetsService'
import { CATEGORIES } from '../config'
import { useT } from '../hooks/useT'
import LaoSkyline from '../components/LaoSkyline'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const t = useT()

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categoryEntries = stats?.categories
    ? CATEGORIES
        .map(cat => ({ ...cat, count: stats.categories[cat.id] || 0 }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
    : []

  const maxCount = categoryEntries[0]?.count || 1

  return (
    <div className="flex flex-col">
      {/* Hero — skyline pushed up with bottom offset so it doesn't sit underneath
          the stat cards that overlap from below via -mt-6 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lao-blue to-lao-sky text-white py-12 px-4 pb-20">
        <LaoSkyline className="absolute inset-x-0 bottom-[72px] w-full h-[90%]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium font-lao">
            <span>📊</span>
            <span>{t.dashboard.updatedLive}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-lao drop-shadow-sm">{t.dashboard.title}</h1>
          <p className="text-white/80 font-lao drop-shadow-sm">{t.dashboard.subtitle}</p>
        </div>
      </section>

      {/* Stat cards */}
      <section className="max-w-4xl mx-auto px-4 w-full mt-6 mb-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse space-y-3">
                <div className="h-8 bg-gray-100 rounded w-16 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-lao text-center">
            ⚙️ {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="📋"
              value={stats?.total ?? 0}
              label={t.dashboard.totalReports}
              color="text-lao-red"
            />
            <StatCard
              icon="📱"
              value={stats?.phones ?? 0}
              label={t.dashboard.uniquePhones}
              color="text-lao-blue"
            />
            <StatCard
              icon="🏦"
              value={stats?.accounts ?? 0}
              label={t.dashboard.uniqueAccounts}
              color="text-lao-sky"
            />
            <StatCard
              icon="📅"
              value={stats?.last30days ?? 0}
              label={t.dashboard.thisMonth}
              color="text-emerald-600"
            />
          </div>
        )}
      </section>

      {/* Category breakdown */}
      {!loading && !error && categoryEntries.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12 w-full">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 font-lao flex items-center gap-2">
              <span>🗂️</span> {t.dashboard.byCategory}
            </h2>
            <div className="space-y-4">
              {categoryEntries.map(cat => {
                const pct = Math.round((cat.count / (stats?.total || 1)) * 100)
                const barPct = Math.round((cat.count / maxCount) * 100)
                return (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-lao-sky transition-colors font-lao">
                        {t.categories[cat.id]}
                      </span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-gray-900">{cat.count.toLocaleString()}</span>
                        <span className="text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lao-red rounded-full transition-all duration-500 group-hover:bg-lao-sky"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {!loading && !error && categoryEntries.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12 w-full text-center text-gray-500 font-lao py-8">
          {t.dashboard.noData}
        </section>
      )}

      {/* CTA */}
      <section className="bg-lao-blue text-white py-10 px-4 text-center">
        <p className="text-white/70 mb-3 text-sm font-lao">{t.home.ctaSub}</p>
        <Link to="/report" className="inline-block bg-lao-red text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-lao">
          {t.home.ctaBtn}
        </Link>
      </section>
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card p-5 text-center hover:shadow-md transition-shadow">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-black ${color} leading-none mb-1`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 font-lao mt-1">{label}</div>
    </div>
  )
}
