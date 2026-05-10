import CategoryBadge from './CategoryBadge'
import { useT } from '../hooks/useT'

const LEFT_BORDER = {
  phone:      'bg-orange-400',
  banking:    'bg-red-500',
  online:     'bg-purple-500',
  investment: 'bg-yellow-400',
  romance:    'bg-pink-400',
  job:        'bg-blue-500',
  lottery:    'bg-green-500',
  other:      'bg-gray-400',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function ScamCard({ record, onSelect }) {
  const { category, scammerName, phoneNumber, accountNumber, bankName, description, reportedAt, reportCount = 1 } = record
  const t = useT()
  const borderColor = LEFT_BORDER[category] ?? LEFT_BORDER.other

  return (
    <article
      className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex overflow-hidden ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? () => onSelect(record) : undefined}
    >
      {/* Left category color strip */}
      <div className={`w-1.5 shrink-0 ${borderColor}`} />

      <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
        {/* Top row: category + report count */}
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge categoryId={category} />
          {reportCount > 1 && (
            <span className={`shrink-0 flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1 font-lao whitespace-nowrap ${
              reportCount >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              <WarningIcon className="w-3 h-3" />
              {reportCount} {t.card.reports}
            </span>
          )}
        </div>

        {/* Identifiers — hero of the card */}
        <div className="space-y-1.5">
          {phoneNumber && (
            <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
              <PhoneIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-lao leading-none mb-0.5">{t.card.phone}</p>
                <p className="font-mono font-bold text-gray-900 text-base tracking-wide">{phoneNumber}</p>
              </div>
            </div>
          )}
          {accountNumber && (
            <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
              <BankIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-lao leading-none mb-0.5">{bankName || t.card.account}</p>
                <p className="font-mono font-bold text-gray-900 text-base tracking-wide">{accountNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scammer name */}
        {scammerName && (
          <p className="text-sm font-semibold text-gray-800 font-lao -mt-1">{scammerName}</p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-lao">{description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <p className="text-xs text-gray-400 font-lao">{t.card.reported} {formatDate(reportedAt)}</p>
          {onSelect && (
            <span className="text-xs text-lao-sky font-lao font-medium">{t.card.viewDetail}</span>
          )}
        </div>
      </div>
    </article>
  )
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function BankIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function WarningIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  )
}
