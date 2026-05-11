import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitAppeal } from '../services/sheetsService'
import { uploadImage } from '../services/imgbbService'
import { useT } from '../hooks/useT'

const INITIAL = {
  fullName: '',
  applicantPhone: '',
  applicantEmail: '',
  idCardNumber: '',
  phoneToCheck: '',
  accountToCheck: '',
  bankName: '',
  appealReason: '',
  explanation: '',
  evidenceUrl: '',
  evidenceImageUrl: '',
}

export default function AppealPage() {
  const t = useT()
  const at = t.appeal
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [declare1, setDeclare1] = useState(false)
  const [declare2, setDeclare2] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [refId, setRefId] = useState('')
  const fileRef = useRef()

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors(e2 => ({ ...e2, [field]: '' }))
    }
  }

  function handleImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setImageError(at.fieldImageTooBig); return }
    setImageError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setForm(f => ({ ...f, evidenceImageUrl: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  function validate() {
    const errs = {}
    if (!form.fullName.trim())        errs.fullName        = at.errRequired
    if (!form.applicantPhone.trim())  errs.applicantPhone  = at.errRequired
    if (!form.applicantEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail))
                                      errs.applicantEmail  = at.errEmail
    if (!form.phoneToCheck.trim() && !form.accountToCheck.trim())
                                      errs.contact         = at.errContact
    if (!form.appealReason)           errs.appealReason    = at.errRequired
    if (!form.explanation.trim() || form.explanation.trim().length < 30)
                                      errs.explanation     = at.errExplanation
    if (!declare1 || !declare2)       errs.declare         = at.errDeclare
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); scrollToFirstError(errs); return }

    setStatus('submitting')
    setErrorMsg('')

    try {
      let imgUrl = form.evidenceImageUrl
      if (imageFile && !imgUrl) {
        setUploadingImage(true)
        imgUrl = await uploadImage(imageFile)
        setUploadingImage(false)
      }

      const payload = { ...form, evidenceImageUrl: imgUrl, submittedAt: new Date().toISOString() }
      const data = await submitAppeal(payload)
      setRefId(data.id ?? '')
      setStatus('success')
    } catch (err) {
      setUploadingImage(false)
      setErrorMsg(err.message || at.errSubmit)
      setStatus('error')
    }
  }

  function scrollToFirstError(errs) {
    const firstKey = Object.keys(errs)[0]
    const el = document.getElementById(`appeal-${firstKey}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ── Success State ─────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 font-lao">{at.successTitle}</h1>
          {refId && (
            <p className="inline-block bg-gray-100 text-gray-600 text-sm font-mono px-3 py-1.5 rounded-lg">
              {at.successRef(refId)}
            </p>
          )}
          <p className="text-gray-600 font-lao">{at.successDesc}</p>
          <p className="text-sm text-gray-400 font-lao">{at.successNote}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Link to="/" className="bg-lao-blue text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors font-lao text-sm">
              {at.backHome}
            </Link>
            <button
              onClick={() => { setStatus('idle'); setForm(INITIAL); setDeclare1(false); setDeclare2(false); removeImage() }}
              className="border border-gray-300 text-gray-600 font-semibold px-5 py-2.5 rounded-lg hover:border-gray-400 transition-colors font-lao text-sm"
            >
              {at.newAppeal}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Form ─────────────────────────────────────────────
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-950 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full font-lao">
            {at.badge}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight font-lao">{at.title}</h1>
          <p className="text-white/70 text-sm font-lao max-w-lg mx-auto">{at.subtitle}</p>
        </div>
      </section>

      {/* Process timeline */}
      <section className="bg-gray-50 border-b border-gray-200 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-lao text-center">{at.processTitle}</p>
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-0 relative">
            {at.processSteps.map((step, i) => (
              <div key={i} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 flex-1 relative pb-4 sm:pb-0">
                {/* connector */}
                {i < at.processSteps.length - 1 && (
                  <div className="hidden sm:block absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
                )}
                <div className="relative z-10 w-8 h-8 rounded-full bg-lao-blue text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-gray-600 font-lao sm:text-center leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info notice */}
      <div className="max-w-2xl mx-auto px-4 pt-8 w-full">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
          <p className="font-semibold text-amber-800 text-sm font-lao">{at.infoTitle}</p>
          <p className="text-amber-700 text-sm font-lao leading-relaxed">{at.infoBody}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto px-4 py-8 w-full space-y-8">

        {/* ─── Section 1: Appellant ─────────────────────── */}
        <FormSection
          step="1"
          title={at.sec1Title}
          desc={at.sec1Desc}
          icon="👤"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="appeal-fullName" label={at.fieldFullName} required error={errors.fullName}>
              <input
                id="appeal-fullName"
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder={at.fieldFullNamePlaceholder}
                className={inputCls(errors.fullName)}
              />
            </Field>
            <Field id="appeal-applicantPhone" label={at.fieldApplicantPhone} required error={errors.applicantPhone}>
              <input
                id="appeal-applicantPhone"
                type="tel"
                value={form.applicantPhone}
                onChange={set('applicantPhone')}
                placeholder={at.fieldApplicantPhonePlaceholder}
                className={inputCls(errors.applicantPhone)}
              />
            </Field>
          </div>
          <Field id="appeal-applicantEmail" label={at.fieldEmail} required error={errors.applicantEmail}>
            <input
              id="appeal-applicantEmail"
              type="email"
              value={form.applicantEmail}
              onChange={set('applicantEmail')}
              placeholder={at.fieldEmailPlaceholder}
              className={inputCls(errors.applicantEmail)}
            />
          </Field>
          <Field id="appeal-idCardNumber" label={at.fieldIdCard}>
            <input
              id="appeal-idCardNumber"
              type="text"
              value={form.idCardNumber}
              onChange={set('idCardNumber')}
              placeholder={at.fieldIdCardPlaceholder}
              className={inputCls()}
            />
          </Field>
        </FormSection>

        {/* ─── Section 2: Number/Account ────────────────── */}
        <FormSection
          step="2"
          title={at.sec2Title}
          desc={at.sec2Desc}
          icon="🔍"
        >
          {errors.contact && (
            <p id="appeal-contact" className="text-red-500 text-xs font-lao">{errors.contact}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="appeal-phoneToCheck" label={at.fieldPhoneToCheck} error={errors.contact ? ' ' : ''}>
              <input
                id="appeal-phoneToCheck"
                type="tel"
                value={form.phoneToCheck}
                onChange={set('phoneToCheck')}
                placeholder={at.fieldPhoneToCheckPlaceholder}
                className={inputCls(errors.contact)}
              />
            </Field>
            <Field id="appeal-accountToCheck" label={at.fieldAccountToCheck} error={errors.contact ? ' ' : ''}>
              <input
                id="appeal-accountToCheck"
                type="text"
                value={form.accountToCheck}
                onChange={set('accountToCheck')}
                placeholder={at.fieldAccountToCheckPlaceholder}
                className={inputCls(errors.contact)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="appeal-bankName" label={at.fieldBankName}>
              <input
                id="appeal-bankName"
                type="text"
                value={form.bankName}
                onChange={set('bankName')}
                placeholder={at.fieldBankNamePlaceholder}
                className={inputCls()}
              />
            </Field>
            <Field id="appeal-appealReason" label={at.fieldReason} required error={errors.appealReason}>
              <select
                id="appeal-appealReason"
                value={form.appealReason}
                onChange={set('appealReason')}
                className={inputCls(errors.appealReason) + ' bg-white'}
              >
                <option value="">{at.fieldReasonPlaceholder}</option>
                {at.reasons.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* ─── Section 3: Evidence ──────────────────────── */}
        <FormSection
          step="3"
          title={at.sec3Title}
          desc={at.sec3Desc}
          icon="📎"
        >
          <Field id="appeal-explanation" label={at.fieldExplanation} required error={errors.explanation}>
            <textarea
              id="appeal-explanation"
              rows={5}
              value={form.explanation}
              onChange={set('explanation')}
              placeholder={at.fieldExplanationPlaceholder}
              className={inputCls(errors.explanation) + ' resize-none'}
            />
            <p className="text-xs text-gray-400 mt-1 font-lao">
              {at.fieldExplanationChars(form.explanation.length)}
            </p>
          </Field>

          <Field id="appeal-evidenceUrl" label={at.fieldEvidenceUrl}>
            <input
              id="appeal-evidenceUrl"
              type="url"
              value={form.evidenceUrl}
              onChange={set('evidenceUrl')}
              placeholder={at.fieldEvidenceUrlPlaceholder}
              className={inputCls()}
            />
          </Field>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 font-lao">
              {at.fieldImage}
            </label>
            <p className="text-xs text-gray-400 mb-2 font-lao">{at.fieldImageHint}</p>

            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="h-36 rounded-lg border border-gray-200 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >✕</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lao-sky hover:bg-gray-50 transition-colors">
                <span className="text-2xl mb-1">📁</span>
                <span className="text-xs text-gray-500 font-lao">{at.fieldImage}</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              </label>
            )}
            {imageError && <p className="text-red-500 text-xs mt-1 font-lao">{imageError}</p>}
            {uploadingImage && (
              <p className="text-lao-sky text-xs mt-1 font-lao animate-pulse">{at.uploadingImage}</p>
            )}
          </div>
        </FormSection>

        {/* ─── Section 4: Legal Declaration ─────────────── */}
        <FormSection
          step="4"
          title={at.sec4Title}
          icon="⚖️"
        >
          <div className="space-y-4">
            <DeclarationCheck
              id="declare1"
              checked={declare1}
              onChange={v => { setDeclare1(v); if (errors.declare) setErrors(e => ({ ...e, declare: '' })) }}
              label={at.declare1}
            />
            <DeclarationCheck
              id="declare2"
              checked={declare2}
              onChange={v => { setDeclare2(v); if (errors.declare) setErrors(e => ({ ...e, declare: '' })) }}
              label={at.declare2}
            />
            {errors.declare && (
              <p className="text-red-500 text-xs font-lao">{errors.declare}</p>
            )}
          </div>
        </FormSection>

        {/* Error banner */}
        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-lao">
            ⚠️ {errorMsg || at.errSubmit}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-lao-blue hover:bg-blue-900 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors font-lao text-base"
        >
          {status === 'submitting' ? at.submitting : at.submitBtn}
        </button>

      </form>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function FormSection({ step, title, desc, icon, children }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-lao-blue/10 text-lao-blue font-bold text-sm flex items-center justify-center shrink-0">
          {step}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 font-lao flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
          {desc && <p className="text-xs text-gray-500 mt-0.5 font-lao">{desc}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 font-lao">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && error.trim() && (
        <p className="text-red-500 text-xs mt-1 font-lao">{error}</p>
      )}
    </div>
  )
}

function DeclarationCheck({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-lao-blue border-lao-blue' : 'border-gray-300 group-hover:border-lao-blue'
        }`}>
          {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed font-lao">{label}</p>
    </label>
  )
}

function inputCls(err) {
  const base = 'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors font-lao'
  return err
    ? `${base} border-red-300 bg-red-50 focus:ring-red-200`
    : `${base} border-gray-300 bg-white focus:ring-lao-sky/30 focus:border-lao-sky`
}
