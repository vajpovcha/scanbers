import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ScamCard from '../components/ScamCard'
import RecordModal from '../components/RecordModal'
import { searchReports, fetchRecentReports } from '../services/sheetsService'
import { CATEGORIES } from '../config'
import { useT } from '../hooks/useT'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const initialCat = searchParams.get('category') ?? ''

  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState(initialCat)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const t = useT()

  const doSearch = useCallback(async (query, cat) => {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      let data = query.trim() ? await searchReports(query) : await fetchRecentReports(50)
      if (cat) data = data.filter(r => r.category === cat)
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    doSearch(initialQ, initialCat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setSearchParams(q ? { q, ...(category && { category }) } : category ? { category } : {})
    doSearch(q, category)
  }

  function handleCategoryFilter(catId) {
    const next = catId === category ? '' : catId
    setCategory(next)
    setSearchParams(q ? { q, ...(next && { category: next }) } : next ? { category: next } : {})
    doSearch(q, next)
  }

  return (
    <div className="flex flex-col">
      {selected && <RecordModal record={selected} onClose={() => setSelected(null)} />}
      {/* Hero with search bar */}
      <section className="bg-gradient-to-br from-lao-blue to-lao-sky py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center text-white space-y-1">
            <h1 className="text-3xl font-bold font-lao">{t.search.title}</h1>
            <p className="text-white/80 font-lao text-sm">{t.search.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                type="search"
                placeholder={t.search.placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 font-lao text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-lao-red hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-colors font-lao whitespace-nowrap"
            >
              {t.search.btn}
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-5">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors font-lao ${
                category === cat.id
                  ? 'bg-lao-blue text-white border-lao-blue'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-lao-sky hover:text-lao-sky'
              }`}
            >
              {t.categories[cat.id]}
            </button>
          ))}
          {category && (
            <button
              onClick={() => handleCategoryFilter('')}
              className="text-xs text-gray-400 hover:text-lao-red px-2 font-lao transition-colors"
            >
              {t.search.clearFilter}
            </button>
          )}
        </div>

        {loading && <LoadingGrid />}

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-lao">
            {error.includes('VITE_APPS_SCRIPT_URL') ? <>⚙️ {t.search.setupNeeded}</> : <>⚠️ {error}</>}
          </div>
        )}

        {!loading && !error && searched && (
          <>
            <p className="text-sm text-gray-500 font-lao">
              {results.length === 0
                ? t.search.noResults
                : q ? t.search.foundFor(results.length, q) : t.search.found(results.length)}
            </p>

            {results.length === 0 ? (
              <div className="card p-10 text-center space-y-3">
                <p className="text-5xl">🔍</p>
                <p className="font-semibold text-gray-700 font-lao">{t.search.notFoundTitle}</p>
                <p className="text-sm text-gray-500 font-lao">
                  {t.search.notFoundDesc}{' '}
                  <Link to="/report" className="text-lao-sky hover:underline">{t.search.submitLink}</Link>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r, i) => <ScamCard key={r.id ?? i} record={r} onSelect={setSelected} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-4 space-y-3 animate-pulse">
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-12 bg-gray-100 rounded mt-2" />
        </div>
      ))}
    </div>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
