import { APPS_SCRIPT_URL } from '../config'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

function checkConfig() {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set. See SETUP.md.')
}

export async function fetchRecentReports(limit = 20) {
  checkConfig()
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch reports')
  const data = await res.json()
  return data.records ?? []
}

export async function searchReports(query) {
  checkConfig()
  if (!query || !query.trim()) return []
  const res = await fetch(`${APPS_SCRIPT_URL}?action=search&q=${encodeURIComponent(query.trim())}`)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.records ?? []
}

export async function fetchStats() {
  checkConfig()
  const res = await fetch(`${APPS_SCRIPT_URL}?action=stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return await res.json()
}

export async function submitReport(formData) {
  checkConfig()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'submit', ...formData }),
  })
  if (!res.ok) throw new Error('Submission failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Unknown error')
  return data
}

// ------- Appeal -------
export async function submitAppeal(formData) {
  checkConfig()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'submitAppeal', ...formData }),
  })
  if (!res.ok) throw new Error('Submission failed')
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Unknown error')
  return data
}

// ------- Admin -------
export async function adminFetchAll(statusFilter = '') {
  checkConfig()
  const url = `${APPS_SCRIPT_URL}?action=admin-list&secret=${encodeURIComponent(ADMIN_SECRET)}${statusFilter ? `&status=${statusFilter}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.records ?? []
}

export async function adminUpdateStatus(id, status) {
  checkConfig()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateStatus', id, status, secret: ADMIN_SECRET }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Failed')
  return data
}

export async function adminFetchAppeals(statusFilter = '') {
  checkConfig()
  const url = `${APPS_SCRIPT_URL}?action=admin-appeals&secret=${encodeURIComponent(ADMIN_SECRET)}${statusFilter ? `&status=${statusFilter}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch appeals')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.records ?? []
}

export async function adminUpdateAppealStatus(id, status) {
  checkConfig()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateAppealStatus', id, status, secret: ADMIN_SECRET }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Failed')
  return data
}

export async function adminDeleteRecord(id) {
  checkConfig()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'deleteRecord', id, secret: ADMIN_SECRET }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'Failed')
  return data
}
