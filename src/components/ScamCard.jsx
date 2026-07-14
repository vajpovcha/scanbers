import CategoryBadge from './CategoryBadge'
import { useT } from '../hooks/useT'

const CATEGORY_BG = {
  phone:      '/categories/bg-phone.png',
  banking:    '/categories/bg-bank.png',
  online:     '/categories/bg-online.png',
  investment: '/categories/bg-invest.png',
  romance:    '/categories/bg-romance.png',
  job:        '/categories/bg-job.png',
  lottery:    '/categories/bg-lottery.png',
  other:      '/categories/bg-other.png',
}

// Category accent colors (matching design source — oklch)
const CATEGORY_ACCENT = {
  phone:      { pill: 'oklch(0.94 0.05 25)',   text: 'oklch(0.35 0.15 25)' },
  banking:    { pill: 'oklch(0.93 0.04 250)',  text: 'oklch(0.35 0.15 250)' },
  online:     { pill: 'oklch(0.93 0.035 200)', text: 'oklch(0.33 0.13 200)' },
  investment: { pill: 'oklch(0.92 0.04 280)',  text: 'oklch(0.35 0.16 280)' },
  romance:    { pill: 'oklch(0.93 0.04 345)',  text: 'oklch(0.38 0.16 345)' },
  job:        { pill: 'oklch(0.93 0.04 55)',   text: 'oklch(0.38 0.16 55)' },
  lottery:    { pill: 'oklch(0.92 0.04 315)',  text: 'oklch(0.36 0.16 315)' },
  other:      { pill: 'oklch(0.93 0.035 170)', text: 'oklch(0.32 0.13 170)' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function ScamCard({ record, onSelect, highlight = '' }) {
  const { category, scammerName, phoneNumber, accountNumber, bankName, description, reportedAt, reportCount = 1 } = record
  const t = useT()
  const bgImage = CATEGORY_BG[category] ?? CATEGORY_BG.other
  const accent = CATEGORY_ACCENT[category] ?? CATEGORY_ACCENT.other
  const catInfo = { phone: t.categories.phone, banking: t.categories.banking, online: t.categories.online,
                    investment: t.categories.investment, romance: t.categories.romance, job: t.categories.job,
                    lottery: t.categories.lottery, other: t.categories.other }
  const categoryLabel = catInfo[category] || catInfo.other

  // Did the search query match this card's phone/account?
  const q = String(highlight || '').trim().toLowerCase()
  const phoneMatches   = q && phoneNumber   && String(phoneNumber).toLowerCase().includes(q)
  const accountMatches = q && accountNumber && String(accountNumber).toLowerCase().includes(q)
  const hasMatch       = phoneMatches || accountMatches

  const primaryId    = phoneNumber || accountNumber || ''
  const primaryLabel = phoneNumber ? t.card.phone : (bankName || t.card.account)
  const idMatches    = phoneNumber ? phoneMatches : accountMatches

  return (
    <article
      className={`relative rounded-[20px] overflow-hidden group transition-all hover:-translate-y-0.5 ${
        hasMatch ? 'ring-2 ring-lao-red' : 'ring-1 ring-black/5'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        height: '300px',
        boxShadow: '0 16px 34px -18px oklch(0.3 0.03 60 / 0.5)',
      }}
      onClick={onSelect ? () => onSelect(record) : undefined}
    >
      {/* Background illustration — fills entire card */}
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { e.target.style.display = 'none' }}
      />

      {/* White gradient overlay — bottom half becomes solid so text stays readable, top half untouched to show illustration */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.85) 62%, rgba(255,255,255,0.98) 78%, rgba(255,255,255,1) 100%)',
        }}
      />

      {/* Report count badge — top right corner (only if >1) */}
      {reportCount > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 font-lao whitespace-nowrap shadow-sm ${
            reportCount >= 4 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
          }`}>
            <WarningIcon className="w-3 h-3" />
            {reportCount} {t.card.reports}
          </span>
        </div>
      )}

      {/* Content — anchored to bottom */}
      <div className="relative h-full flex flex-col justify-end p-5 gap-2">
        {/* Category pill */}
        <span
          className="self-start px-3 py-1 rounded-full font-lao"
          style={{ background: accent.pill, color: accent.text, fontSize: '12px', fontWeight: 700 }}
        >
          {categoryLabel}
        </span>

        {/* Primary identifier */}
        {primaryId && (
          <div className="text-[13px]" style={{ color: 'oklch(0.35 0.01 60)' }}>
            <span className="font-lao">{primaryLabel} </span>
            <span
              className={`font-mono font-bold text-[15px] tracking-wide ${idMatches ? 'text-lao-red' : ''}`}
              style={idMatches ? {} : { color: 'oklch(0.18 0.01 60)' }}
            >
              {primaryId}
              {idMatches && (
                <span className="ml-1.5 text-[9px] font-bold bg-lao-red text-white px-1.5 py-0.5 rounded uppercase align-middle">match</span>
              )}
            </span>
          </div>
        )}

        {/* Scammer name / short description */}
        {(scammerName || description) && (
          <div
            className="font-lao font-bold leading-snug line-clamp-2"
            style={{ color: 'oklch(0.16 0.01 60)', fontSize: '16px' }}
          >
            {scammerName || description}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-1 text-[12px] font-lao" style={{ color: 'oklch(0.45 0.01 60)' }}>
          <span>{t.card.reported} {formatDate(reportedAt)}</span>
          {onSelect && (
            <span style={{ color: accent.text, fontWeight: 600 }}>{t.card.viewDetail}</span>
          )}
        </div>
      </div>
    </article>
  )
}

function WarningIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  )
}
