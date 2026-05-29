import { useEffect, useState } from 'react'
import CategoryBadge from './CategoryBadge'
import { useT } from '../hooks/useT'

const LEFT_BORDER = {
  phone: 'bg-orange-400', banking: 'bg-red-500', online: 'bg-purple-500',
  investment: 'bg-yellow-400', romance: 'bg-pink-400', job: 'bg-blue-500',
  lottery: 'bg-green-500', other: 'bg-gray-400',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}

function isImageUrl(url) {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('i.ibb.co')
}

export default function RecordModal({ record, onClose }) {
  const t = useT()
  const { category, scammerName, phoneNumber, accountNumber, bankName, description, evidenceUrl, reportedAt, reportCount = 1 } = record
  const accent = LEFT_BORDER[category] ?? LEFT_BORDER.other
  const [imgOpen, setImgOpen] = useState(null) // stores index of open image, or null

  // Support comma-separated multiple image URLs
  const evidenceUrls = (evidenceUrl || '').split(',').map(u => u.trim()).filter(Boolean)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Color header */}
        <div className={`h-2 w-full rounded-t-2xl ${accent}`} />

        <div className="p-5 flex flex-col gap-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <CategoryBadge categoryId={category} size="sm" />
              {reportCount > 1 && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1 w-fit font-lao ${
                  reportCount >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  ⚠️ {t.modal.reportCount(reportCount)}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scammer name */}
          {scammerName && (
            <p className="text-lg font-bold text-gray-900 font-lao">{scammerName}</p>
          )}

          {/* Identifiers */}
          <div className="space-y-2">
            {phoneNumber && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-lao leading-none mb-0.5">{t.card.phone}</p>
                  <p className="font-mono font-bold text-gray-900 text-lg tracking-wide">{phoneNumber}</p>
                </div>
              </div>
            )}
            {accountNumber && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <BankIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-lao leading-none mb-0.5">{bankName || t.card.account}</p>
                  <p className="font-mono font-bold text-gray-900 text-lg tracking-wide">{accountNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-lao uppercase tracking-wide">ລາຍລະອຽດ / Details</p>
              <p className="text-sm text-gray-700 leading-relaxed font-lao whitespace-pre-wrap">{description}</p>
            </div>
          )}

          {/* Evidence */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-lao uppercase tracking-wide">
              {t.modal.evidence}
              {evidenceUrls.length > 1 && (
                <span className="ml-2 text-lao-sky font-bold">{evidenceUrls.length} ຮູບ / images</span>
              )}
            </p>
            {evidenceUrls.length > 0 ? (
              <>
                {/* Image grid — 1 col for 1 image, 2 cols for 2-3 images */}
                <div className={`grid gap-2 ${evidenceUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {evidenceUrls.map((url, idx) => (
                    isImageUrl(url) ? (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`evidence ${idx + 1}`}
                          onClick={() => setImgOpen(idx)}
                          className="rounded-xl w-full object-cover border border-gray-100 cursor-zoom-in hover:opacity-90 transition-opacity"
                          style={{ maxHeight: evidenceUrls.length === 1 ? '18rem' : '10rem' }}
                          onError={e => { e.target.parentElement.style.display = 'none' }}
                        />
                        {evidenceUrls.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {idx + 1}/{evidenceUrls.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-lao-sky hover:underline font-lao break-all"
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        {t.modal.evidenceLink} {evidenceUrls.length > 1 ? `(${idx + 1})` : ''}
                      </a>
                    )
                  ))}
                </div>

                {/* Fullscreen lightbox */}
                {imgOpen !== null && (
                  <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setImgOpen(null)}
                  >
                    <img
                      src={evidenceUrls[imgOpen]}
                      alt="evidence full"
                      className="max-w-full max-h-full rounded-xl object-contain"
                      onClick={e => e.stopPropagation()}
                    />
                    {/* Prev / Next buttons */}
                    {evidenceUrls.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors disabled:opacity-30"
                          disabled={imgOpen === 0}
                          onClick={e => { e.stopPropagation(); setImgOpen(i => i - 1) }}
                        >◀</button>
                        <button
                          className="absolute right-16 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors disabled:opacity-30"
                          disabled={imgOpen === evidenceUrls.length - 1}
                          onClick={e => { e.stopPropagation(); setImgOpen(i => i + 1) }}
                        >▶</button>
                        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-bold">
                          {imgOpen + 1} / {evidenceUrls.length}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => setImgOpen(null)}
                      className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 font-lao">{t.modal.noEvidence}</p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-lao">{t.card.reported} {formatDate(reportedAt)}</p>
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700 font-lao border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              {t.modal.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
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
function LinkIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}
