import { useLang } from '../context/LanguageContext'
import translations from '../i18n'

export function useT() {
  const { lang } = useLang()
  return translations[lang]
}
