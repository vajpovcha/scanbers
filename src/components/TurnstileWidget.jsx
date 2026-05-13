import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

/**
 * Cloudflare Turnstile widget
 *
 * Props:
 *   onVerify(token)  — called when user passes the challenge
 *   onExpire()       — called when token expires (need re-verify)
 *   resetKey         — change this value to reset/re-render the widget
 */
export default function TurnstileWidget({ onVerify, onExpire, resetKey = 0 }) {
  const containerRef = useRef(null)
  const widgetId     = useRef(null)

  useEffect(() => {
    let interval = null

    function renderWidget() {
      if (!window.turnstile || !containerRef.current) return

      // Remove previous widget if exists
      if (widgetId.current !== null) {
        try { window.turnstile.remove(widgetId.current) } catch (_) {}
        widgetId.current = null
      }

      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: 'light',
        callback: (token) => {
          onVerify?.(token)
        },
        'expired-callback': () => {
          widgetId.current = null
          onExpire?.()
        },
        'error-callback': () => {
          widgetId.current = null
          onExpire?.()
        },
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      // Script still loading — poll until ready
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval)
          interval = null
          renderWidget()
        }
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (widgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId.current) } catch (_) {}
        widgetId.current = null
      }
    }
  }, [resetKey]) // re-render when resetKey changes (e.g. after form reset)

  return <div ref={containerRef} className="cf-turnstile" />
}
