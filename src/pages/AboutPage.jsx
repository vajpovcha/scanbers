import { Link } from 'react-router-dom'
import { useT } from '../hooks/useT'

export default function AboutPage() {
  const t = useT()
  const a = t.about

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-lao-blue to-lao-sky text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <ShieldIcon className="w-14 h-14 text-white/90 mx-auto" />
          <h1 className="text-3xl font-bold font-lao">{a.title}</h1>
          <p className="text-white/80 font-lao">{a.subtitle}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 w-full">
        {/* What is ScanBers */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💡</span>
            <h2 className="font-semibold text-lg text-gray-900 font-lao">{a.whatTitle}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-lao">{a.whatBody}</p>
        </div>

        {/* How it works — timeline */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚙️</span>
            <h2 className="font-semibold text-lg text-gray-900 font-lao">{a.howTitle}</h2>
          </div>
          <ol className="space-y-3 mt-1">
            {a.howSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lao-blue text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed font-lao">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Scam types — compact list with link to full page */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚠️</span>
              <h2 className="font-semibold text-lg text-gray-900 font-lao">{a.scamTypesTitle}</h2>
            </div>
            <Link to="/scam-types" className="text-xs text-lao-sky hover:underline font-lao whitespace-nowrap">
              {t.home.viewAll}
            </Link>
          </div>
          <ul className="space-y-2.5">
            {a.scamTypes.map(([title, desc]) => (
              <li key={title} className="flex gap-2 text-sm">
                <span className="text-amber-500 mt-0.5 flex-shrink-0 font-bold">▸</span>
                <div className="font-lao">
                  <span className="font-semibold text-gray-800">{title}</span>
                  <span className="text-gray-500 ml-1">— {desc.slice(0, 80)}…</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <h2 className="font-semibold text-gray-800 font-lao">{a.disclaimerTitle}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-lao">{a.disclaimerBody}</p>
        </div>

        {/* Emergency contacts — tap-to-call cards */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🆘</span>
            <h2 className="font-semibold text-lg text-gray-900 font-lao">{a.emergencyTitle}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {a.emergency.map(([icon, label, number]) => (
              <a
                key={label}
                href={`tel:${number}`}
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-gray-100 hover:border-lao-red hover:bg-red-50 transition-all text-center group cursor-pointer"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-2xl font-black text-lao-red group-hover:text-red-700 transition-colors tracking-tight">
                  {number}
                </span>
                <span className="text-xs text-gray-500 font-lao leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
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
