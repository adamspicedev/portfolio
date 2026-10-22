import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}
let scriptLoad: Promise<TurnstileApi> | undefined
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!scriptLoad) {
    scriptLoad = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      const timeout = window.setTimeout(() => {
        script.remove()
        reject(new Error('Verification unavailable'))
      }, 12_000)
      script.onload = () => {
        window.clearTimeout(timeout)
        if (window.turnstile) resolve(window.turnstile)
        else {
          script.remove()
          reject(new Error('Verification unavailable'))
        }
      }
      script.onerror = () => {
        window.clearTimeout(timeout)
        script.remove()
        reject(new Error('Verification unavailable'))
      }
      document.head.append(script)
    }).catch((error: unknown) => {
      scriptLoad = undefined
      throw error
    })
  }
  return scriptLoad
}
export type TurnstileHandle = { reset: () => void }
export function Turnstile({
  siteKey,
  onToken,
  onUnavailable,
  ref,
}: {
  siteKey: string
  onToken: (token: string) => void
  onUnavailable: () => void
  ref: Ref<TurnstileHandle>
}) {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<'compact' | 'flexible' | null>(null)
  useEffect(() => {
    if (!container.current) return
    const measure = () =>
      setSize(container.current!.clientWidth < 300 ? 'compact' : 'flexible')
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null)
  const callbacks = useRef({ onToken, onUnavailable })
  useEffect(() => {
    callbacks.current = { onToken, onUnavailable }
  }, [onToken, onUnavailable])
  useImperativeHandle(
    ref,
    () => ({
      reset() {
        callbacks.current.onToken('')
        if (widget.current) {
          try {
            widget.current.api.reset(widget.current.id)
          } catch {
            callbacks.current.onUnavailable()
          }
        }
      },
    }),
    [],
  )
  useEffect(() => {
    if (!size) return
    callbacks.current.onToken('')
    let active = true
    void loadTurnstile()
      .then((api) => {
        if (!active || !container.current) return
        const id = api.render(container.current, {
          sitekey: siteKey,
          action: 'contact',
          size,
          'response-field': false,
          callback: (token: string) => {
            if (active) callbacks.current.onToken(token)
          },
          'expired-callback': () => {
            if (active) callbacks.current.onToken('')
          },
          'error-callback': () => {
            if (active) {
              callbacks.current.onToken('')
              callbacks.current.onUnavailable()
            }
          },
        })
        widget.current = { api, id }
      })
      .catch(() => {
        if (active) callbacks.current.onUnavailable()
      })
    return () => {
      active = false
      if (widget.current) {
        try {
          widget.current.api.remove(widget.current.id)
        } catch {
          /* A failed provider cleanup must not interrupt unmounting. */
        }
      }
      widget.current = null
    }
  }, [siteKey, size])
  return (
    <section
      aria-label="Human verification"
      style={{ width: '100%', minWidth: 0 }}
      ref={container}
    />
  )
}
