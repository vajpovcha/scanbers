// Paste your deployed Google Apps Script Web App URL here after deployment.
// See SETUP.md for instructions.
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

export const CATEGORIES = [
  { id: 'phone', label: 'Phone Scam', labelLao: 'ສໍ້ໂກງທາງໂທລະສັບ', color: 'orange' },
  { id: 'banking', label: 'Banking Fraud', labelLao: 'ສໍ້ໂກງທາງທະນາຄານ', color: 'red' },
  { id: 'online', label: 'Online Fraud', labelLao: 'ສໍ້ໂກງອອນລາຍ', color: 'purple' },
  { id: 'investment', label: 'Investment Scam', labelLao: 'ສໍ້ໂກງການລົງທຶນ', color: 'yellow' },
  { id: 'romance', label: 'Romance Scam', labelLao: 'ສໍ້ໂກງຄວາມຮັກ', color: 'pink' },
  { id: 'job', label: 'Job Scam', labelLao: 'ສໍ້ໂກງວຽກງານ', color: 'blue' },
  { id: 'lottery', label: 'Lottery / Prize', labelLao: 'ສໍ້ໂກງລາງວັນ', color: 'green' },
  { id: 'other', label: 'Other', labelLao: 'ອື່ນໆ', color: 'gray' },
]

export const CATEGORY_COLORS = {
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
}
