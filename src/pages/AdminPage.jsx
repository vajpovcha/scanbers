import { useState, useEffect, useCallback } from 'react'
import { adminFetchAll, adminUpdateStatus, adminDeleteRecord, adminFetchAppeals, adminUpdateAppealStatus } from '../services/sheetsService'
import CategoryBadge from '../components/CategoryBadge'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

const STATUS_TABS = [
  { id: '', label: 'All', labelLo: 'ທັງໝົດ' },
  { id: 'pending', label: 'Pending', labelLo: 'ລໍຖ້າ' },
  { id: 'verified', label: 'Verified', labelLo: 'ຢືນຢັນແລ້ວ' },
  { id: 'removed', label: 'Removed', labelLo: 'ຖືກລຶບ' },
]

function formatDate(d) {
  if (!d) return ''
  try { return new Intl.DateTimeFormat('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(d)) }
  catch { return d }
}

// ---- Login gate ----
function LoginGate({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { onLogin(); setErr(false) }
    else { setErr(true); setPw('') }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1 font-lao">ພື້ນທີ່ຜູ້ດູແລລະບົບ</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(false) }}
              placeholder="Enter admin password"
              className="input-field"
              autoFocus
            />
            {err && <p className="text-xs text-red-600 mt-1">Incorrect password.</p>}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5">Login</button>
        </form>
      </div>
    </div>
  )
}

// ---- Status badge ----
function StatusBadge({ status }) {
  const styles = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    removed:  'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5 ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}

// ---- Appeal status badge ----
function AppealStatusBadge({ status }) {
  const styles = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5 ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}

// ---- Confirm dialog ----
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
          <button onClick={onConfirm} className="btn-primary text-sm py-1.5 px-4 bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

const APPEAL_STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

const REASON_LABELS = {
  impersonation: '🎭 Impersonation',
  incorrect:     '❌ Incorrect Info',
  resolved:      '✅ Resolved',
  other:         '📝 Other',
}

// ---- Main Admin Page ----
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('scanbers_admin') === '1')
  const [mode, setMode] = useState('reports') // 'reports' | 'appeals'
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirm, setConfirm] = useState(null) // { id }
  const [toast, setToast] = useState('')

  function handleLogin() {
    sessionStorage.setItem('scanbers_admin', '1')
    setAuthed(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('scanbers_admin')
    setAuthed(false)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const loadRecords = useCallback(async (tab, currentMode) => {
    setLoading(true)
    setError('')
    try {
      const data = currentMode === 'appeals'
        ? await adminFetchAppeals(tab)
        : await adminFetchAll(tab)
      setRecords(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadRecords(activeTab, mode)
  }, [authed, activeTab, mode, loadRecords])

  async function handleStatus(id, status) {
    setActionLoading(id + status)
    try {
      if (mode === 'appeals') {
        await adminUpdateAppealStatus(id, status)
      } else {
        await adminUpdateStatus(id, status)
      }
      setRecords(r => r.map(rec => rec.id === id ? { ...rec, status } : rec))
      showToast(`Marked as ${status}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id) {
    setConfirm(null)
    setActionLoading(id + 'delete')
    try {
      await adminDeleteRecord(id)
      setRecords(r => r.filter(rec => rec.id !== id))
      showToast('Record deleted')
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (!authed) return <LoginGate onLogin={handleLogin} />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message="Permanently delete this record? This cannot be undone."
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-lao">ຈັດການລາຍງານ ແລະ ຄຳຮ້ອງ</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">Logout</button>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => { setMode('reports'); setActiveTab('') }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 ລາຍງານ / Reports
        </button>
        <button
          onClick={() => { setMode('appeals'); setActiveTab('') }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'appeals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚖️ ຄຳຮ້ອງ / Appeals
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(mode === 'appeals' ? APPEAL_STATUS_TABS : STATUS_TABS).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors font-lao ${
              activeTab === tab.id
                ? 'bg-lao-blue text-white border-lao-blue'
                : 'bg-white text-gray-600 border-gray-300 hover:border-lao-sky'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && records.length > 0 && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-xs">{records.length}</span>
            )}
          </button>
        ))}
        <button onClick={() => loadRecords(activeTab, mode)} className="ml-auto btn-secondary text-sm py-1.5 px-3">
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          ⚠️ {error.includes('Unauthorized') ? 'Unauthorized — check VITE_ADMIN_SECRET in .env matches ADMIN_SECRET in Code.gs' : error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-lao">
          {mode === 'appeals' ? 'ບໍ່ມີຄຳຮ້ອງ / No appeals found' : 'ບໍ່ມີລາຍງານ / No records found'}
        </div>
      ) : mode === 'appeals' ? (

        /* ── Appeals Table ── */
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date','Appellant','Contact Info','Number to Check','Reason','Explanation','Evidence','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(rec.submittedAt)}</td>
                  <td className="px-4 py-3 max-w-[140px]">
                    <p className="font-medium text-gray-800 text-xs truncate font-lao">{rec.fullName}</p>
                    <p className="text-xs text-gray-500">{rec.applicantEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <p className="font-mono">{rec.applicantPhone}</p>
                    {rec.idCardNumber && <p className="text-gray-400">ID: {rec.idCardNumber}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {rec.phoneToCheck   && <p className="font-mono text-gray-700">📱 {rec.phoneToCheck}</p>}
                    {rec.accountToCheck && <p className="font-mono text-gray-700">🏦 {rec.bankName ? `${rec.bankName}: ` : ''}{rec.accountToCheck}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                      {REASON_LABELS[rec.appealReason] ?? rec.appealReason}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-xs text-gray-600 line-clamp-3 font-lao">{rec.explanation}</p>
                  </td>
                  <td className="px-4 py-3 text-xs space-y-1">
                    {rec.evidenceUrl
                      ? rec.evidenceUrl.split(',').filter(Boolean).map((url, i, arr) => (
                          <a key={i} href={url.trim()} target="_blank" rel="noreferrer" className="block text-lao-sky hover:underline">
                            {arr.length > 1 ? `ຮູບ ${i + 1} ↗` : 'Evidence ↗'}
                          </a>
                        ))
                      : rec.evidenceImageUrl
                        ? <a href={rec.evidenceImageUrl} target="_blank" rel="noreferrer" className="block text-lao-sky hover:underline">Image ↗</a>
                        : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <AppealStatusBadge status={rec.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 min-w-[110px]">
                      {rec.status !== 'approved' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'approved')}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {rec.status !== 'pending' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'pending')}
                          className="text-xs px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors disabled:opacity-50"
                        >
                          ↺ Pending
                        </button>
                      )}
                      {rec.status !== 'rejected' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'rejected')}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (

        /* ── Reports Table ── */
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date','Category','Name / Phone / Account','Description','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(rec.reportedAt)}</td>
                  <td className="px-4 py-3"><CategoryBadge categoryId={rec.category} /></td>
                  <td className="px-4 py-3 max-w-[180px]">
                    {rec.scammerName && <p className="font-medium text-gray-800 truncate font-lao">{rec.scammerName}</p>}
                    {rec.phoneNumber  && <p className="font-mono text-xs text-gray-500">{rec.phoneNumber}</p>}
                    {rec.accountNumber && <p className="font-mono text-xs text-gray-500">{rec.bankName ? `${rec.bankName}: ` : ''}{rec.accountNumber}</p>}
                    {rec.reportCount > 1 && (
                      <span className="text-xs text-lao-red font-semibold">⚠ {rec.reportCount} reports</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <p className="text-gray-600 line-clamp-2 text-xs font-lao">{rec.description}</p>
                    {rec.evidenceUrl && rec.evidenceUrl.split(',').filter(Boolean).map((url, i) => (
                      <a key={i} href={url.trim()} target="_blank" rel="noreferrer" className="block text-xs text-lao-sky hover:underline">
                        Evidence {rec.evidenceUrl.split(',').filter(Boolean).length > 1 ? `${i + 1}` : ''} ↗
                      </a>
                    ))}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      {rec.status !== 'verified' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'verified')}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          ✓ Verify
                        </button>
                      )}
                      {rec.status !== 'pending' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'pending')}
                          className="text-xs px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors disabled:opacity-50"
                        >
                          ↺ Pending
                        </button>
                      )}
                      {rec.status !== 'removed' && (
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatus(rec.id, 'removed')}
                          className="text-xs px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          ✕ Remove
                        </button>
                      )}
                      <button
                        disabled={!!actionLoading}
                        onClick={() => setConfirm({ id: rec.id })}
                        className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
