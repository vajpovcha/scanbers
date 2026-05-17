import LaoSkyline from './LaoSkyline'

/**
 * Layered hero backdrop:
 *   1. Photographic background  — drop a real photo at /public/lao-landmarks.jpg
 *      (Pha That Luang, Patuxai, or any Vientiane scene works well — landscape, ~1920px wide)
 *   2. Brand-colored gradient overlay so text stays readable
 *   3. SVG skyline silhouette along the bottom edge for extra depth
 *
 * Drop-in: the parent must be `relative overflow-hidden`.
 *
 * Props:
 *   variant      — 'blue' (default) | 'dark' (e.g. Appeal page)
 *   showSkyline  — toggle the SVG silhouette layer (default: true)
 *   photo        — override photo path (e.g. '/lao-other.jpg')
 */
export default function HeroBackdrop({
  variant = 'blue',
  showSkyline = true,
  photo = '/lao-landmarks.jpg',
  className = '',
}) {
  const overlay = variant === 'dark'
    ? 'from-gray-900/90 via-gray-900/85 to-gray-800/85'
    : 'from-lao-blue/85 via-lao-blue/70 to-lao-sky/65'

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Layer 1 — photo (silently falls back to overlay if file missing) */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${photo}')` }}
      />
      {/* Layer 2 — brand gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${overlay}`} />
      {/* Layer 3 — SVG silhouette for atmospheric foreground */}
      {showSkyline && (
        <LaoSkyline className="absolute inset-x-0 bottom-0 w-full h-[55%]" />
      )}
    </div>
  )
}
