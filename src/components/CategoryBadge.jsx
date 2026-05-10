import { CATEGORIES, CATEGORY_COLORS } from '../config'
import { useT } from '../hooks/useT'

export default function CategoryBadge({ categoryId, size = 'sm' }) {
  const cat = CATEGORIES.find(c => c.id === categoryId) ?? CATEGORIES.at(-1)
  const colors = CATEGORY_COLORS[cat.color]
  const t = useT()

  return (
    <span className={`inline-flex items-center rounded-full border font-medium font-lao ${colors} ${
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      {t.categories[cat.id]}
    </span>
  )
}
