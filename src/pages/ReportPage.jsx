import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitReport } from '../services/sheetsService'
import { uploadImage } from '../services/imgbbService'
import { CATEGORIES } from '../config'
import { useT } from '../hooks/useT'

const INITIAL = {
  category: '',
  scammerName: '',
  phoneNumber: '',
  accountNumber: '',
  bankName: '',
  description: '',
  evidenceUrl: '',
  reporterEmail: '',
}

// URL for the official 1533 online complaint portal — update if needed
const COMPLAINT_URL = 'tel:1533'

export default function ReportPage() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const fileRef = useRef()
  const t = useT()

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const errs = {}
    if (!form.category) errs.category = t.report.errCategory
    if (!form.description.trim() || form.description.trim().length < 20)
      errs.description = t.report.errDesc
    if (!form.phoneNumber.trim() && !form.accountNumber.trim())
      errs.contact = t.report.errContact
    if (form.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporterEmail))
      errs.reporterEmail = t.report.errEmail
    return errs
  }

  function handleImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setImageError(t.report.fieldImageTooBig); return }
    setImageError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    const formData = { ...form, reportedAt: new Date().toISOString() }

    if (imageFile) {
      setStatus('uploading')
      try {
        formData.evidenceUrl = await uploadImage(imageFile)
      } catch (err) {
        setErrorMsg(err.message === 'FILE_TOO_BIG' ? t.report.fieldImageTooBig : err.message)
        setStatus('error')
        return
      }
    }

    setStatus('submitting')
    try {
      await submitReport(formData)
      setStatus('success')
      setForm(INITIAL)
      removeImage()
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white font-lao">{t.report.successTitle}</h2>
          <p className="text-white/90 font-lao text-lg">{t.report.successLao}</p>
          <p className="text-white/70 text-sm font-lao">{t.report.successDesc}</p>
          <div className="flex gap-3 justify-center pt-2 flex-wrap">
            <button
              onClick={() => setStatus('idle')}
              className="bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-lao text-sm"
            >
              {t.report.submitAnother}
            </button>
            <Link
              to="/search"
              className="bg-white/20 text-white border border-white/40 font-semibold px-5 py-2.5 rounded-lg hover:bg-white/30 transition-colors font-lao text-sm"
            >
              {t.report.searchReports}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-lao-blue to-lao-sky text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-lao">
            🛡️ {t.report.heroBadge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-lao">{t.report.title}</h1>
          <p className="text-white/80 font-lao">{t.report.subtitle}</p>
        </div>
      </section>

      {/* Why report strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm font-lao text-gray-500">
          {t.report.whyItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        {status === 'error' && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 font-lao flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <div>
              {t.report.errFailed}:{' '}
              {errorMsg.includes('VITE_APPS_SCRIPT_URL')
                ? 'VITE_APPS_SCRIPT_URL not set — see SETUP.md'
                : errorMsg}
              <button className="ml-2 underline font-semibold" onClick={() => setStatus('idle')}>
                {t.report.tryAgain}
              </button>
            </div>
          </div>
        )}

        {/* Notice banner */}
        <div className="rounded-lg border border-red-300 bg-red-50 overflow-hidden mb-1">
          <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
            <h3 className="text-white font-semibold text-xs font-lao">{t.report.noticeTitle}</h3>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-sm text-red-800 leading-relaxed font-lao">{t.report.noticeBody}</p>
            <p className="text-sm text-red-700 font-lao">
              {t.report.noticeContact}{' '}
              <strong>1533</strong>{' '}
              {t.report.noticeOr}{' '}
              <a href={COMPLAINT_URL} className="underline font-semibold hover:text-red-600">
                {t.report.noticeLinkText}
              </a>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-3" noValidate>
          {/* Section 1: Scammer info */}
          <div className="card p-6 space-y-5">
            <SectionHeader num="1" title={t.report.section1Title} desc={t.report.section1Desc} />

            <Field label={t.report.fieldCategory} required error={errors.category}>
              <select value={form.category} onChange={set('category')} className="input-field font-lao">
                <option value="">{t.report.fieldCategoryPlaceholder}</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{t.categories[c.id]}</option>
                ))}
              </select>
            </Field>

            <Field label={t.report.fieldName}>
              <input
                value={form.scammerName} onChange={set('scammerName')} type="text"
                placeholder={t.report.fieldNamePlaceholder} className="input-field font-lao"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.report.fieldPhone} required error={errors.contact}>
                <input
                  value={form.phoneNumber} onChange={set('phoneNumber')} type="tel"
                  placeholder={t.report.fieldPhonePlaceholder} className="input-field font-lao"
                />
              </Field>
              <Field label={t.report.fieldAccount} required>
                <input
                  value={form.accountNumber} onChange={set('accountNumber')} type="text"
                  placeholder={t.report.fieldAccountPlaceholder} className="input-field font-lao"
                />
              </Field>
            </div>
            {errors.contact && (
              <p className="text-xs text-red-600 -mt-3 font-lao flex items-center gap-1">
                <span>⚠️</span>{errors.contact}
              </p>
            )}

            <Field label={t.report.fieldBank}>
              <input
                value={form.bankName} onChange={set('bankName')} type="text"
                placeholder={t.report.fieldBankPlaceholder} className="input-field font-lao"
              />
            </Field>
          </div>

          {/* Section 2: What happened */}
          <div className="card p-6 space-y-5">
            <SectionHeader num="2" title={t.report.section2Title} desc={t.report.section2Desc} />

            <Field label={t.report.fieldDesc} required error={errors.description}>
              <textarea
                value={form.description} onChange={set('description')} rows={5}
                placeholder={t.report.fieldDescPlaceholder}
                className="input-field resize-y font-lao"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400 font-lao">{t.report.fieldDescChars(form.description.length)}</span>
                {form.description.length >= 20 && <span className="text-xs text-emerald-600">✓</span>}
              </div>
            </Field>

            {/* Image upload */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 font-lao">{t.report.fieldImage}</label>
              <p className="text-xs text-red-600 font-lao">⚠️ {t.report.fieldImageWarning}</p>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-full rounded-xl object-cover max-h-52 border border-gray-200" />
                  <button
                    type="button" onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1 rounded-lg transition-colors font-lao"
                  >
                    {t.report.fieldImageRemove}
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-lao-sky hover:bg-blue-50/30 transition-colors">
                  <UploadIcon className="w-7 h-7 text-gray-300" />
                  <span className="text-sm text-gray-500 font-lao">{t.report.fieldImageHint}</span>
                  <input
                    ref={fileRef} type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden" onChange={handleImagePick}
                  />
                </label>
              )}
              {imageError && <p className="text-xs text-red-600 font-lao">{imageError}</p>}
            </div>

            {/* URL fallback — shown only when no image selected */}
            {!imagePreview && (
              <Field label={t.report.fieldEvidence}>
                <input
                  value={form.evidenceUrl} onChange={set('evidenceUrl')} type="url"
                  placeholder={t.report.fieldEvidencePlaceholder} className="input-field"
                />
              </Field>
            )}
          </div>

          {/* Section 3: Reporter details */}
          <div className="card p-6 space-y-5">
            <SectionHeader num="3" title={t.report.section3Title} desc={t.report.section3Desc} />

            <Field label={t.report.fieldEmail} error={errors.reporterEmail}>
              <input
                value={form.reporterEmail} onChange={set('reporterEmail')} type="email"
                placeholder={t.report.fieldEmailPlaceholder} className="input-field font-lao"
              />
            </Field>
          </div>

          {/* Submit */}
          <div className="space-y-3 pb-4">
            <p className="text-xs text-gray-400 text-center font-lao px-2">{t.report.disclaimer}</p>
            <button
              type="submit"
              disabled={status === 'submitting' || status === 'uploading'}
              className="w-full flex items-center justify-center gap-2 bg-lao-red hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-base transition-colors font-lao shadow-sm"
            >
              {status === 'uploading' ? (
                <><SpinIcon className="w-5 h-5 animate-spin" />{t.report.uploadingImage}</>
              ) : status === 'submitting' ? (
                <><SpinIcon className="w-5 h-5 animate-spin" />{t.report.submitting}</>
              ) : (
                <><ShieldIcon className="w-5 h-5" />{t.report.submitBtn}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionHeader({ num, title, desc }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-lao-blue text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {num}
      </span>
      <div>
        <h3 className="font-semibold text-gray-900 font-lao">{title}</h3>
        {desc && <p className="text-xs text-gray-500 mt-0.5 font-lao">{desc}</p>}
      </div>
    </div>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 font-lao">
        {label}
        {required && <span className="text-lao-red ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 font-lao flex items-center gap-1"><span>⚠️</span>{error}</p>}
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

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function SpinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
