import { Link } from 'react-router-dom'
import { useT } from '../hooks/useT'

export default function Footer() {
  const t = useT()
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2 font-lao">
          <span className="text-lao-red font-bold text-base">ScanBers</span>
          <span>{t.footer.tagline}</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 font-lao">
          <Link to="/" className="hover:text-lao-red transition-colors">{t.nav.home}</Link>
          <Link to="/search" className="hover:text-lao-red transition-colors">{t.nav.search}</Link>
          <Link to="/report" className="hover:text-lao-red transition-colors">{t.nav.report}</Link>
          <Link to="/about" className="hover:text-lao-red transition-colors">{t.nav.about}</Link>
          <Link to="/appeal" className="hover:text-lao-red transition-colors">{t.appeal.badge}</Link>
        </nav>
        <p className="text-xs text-gray-400 font-lao">{t.footer.copyright(new Date().getFullYear())}</p>
      </div>
    </footer>
  )
}
