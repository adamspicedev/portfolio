import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CatchBoundary } from '@tanstack/react-router'
import { Gamepad2, Pause, Play, RotateCw, X } from 'lucide-react'
import type { ComputerScene } from './computer-scene'

const Arcade = lazy(() => import('./computer-arcade'))

function ArcadeDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return createPortal(
    <dialog
      ref={dialog}
      className="arcade-dialog"
      aria-labelledby="arcade-title"
      onClose={onClose}
    >
      <div className="arcade-heading">
        <div>
          <p className="arcade-eyebrow">Spicey BASIC / Driveway arcade</p>
          <h2 id="arcade-title">Night Shift</h2>
        </div>
        <button
          type="button"
          className="arcade-close"
          aria-label="Close Night Shift"
          onClick={() => dialog.current?.close()}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <CatchBoundary
        getResetKey={() => 'night-shift'}
        errorComponent={() => (
          <p>
            The arcade couldn’t load. Close this window and refresh the page to
            try again.
          </p>
        )}
      >
        <Suspense fallback={<output>Loading BASIC…</output>}>
          <Arcade />
        </Suspense>
      </CatchBoundary>
    </dialog>,
    document.body,
  )
}

function ComputerIllustration() {
  return (
    <svg
      viewBox="0 0 560 480"
      className="computer-illustration"
      aria-hidden="true"
    >
      <ellipse cx="287" cy="425" rx="199" ry="24" fill="#191a1e" />
      <path
        d="m141 105 222-25 76 57v220l-225 32-73-53Z"
        fill="#b1b3b8"
        stroke="#191b1f"
        strokeWidth="3"
      />
      <path
        d="m141 105 222-25 76 57-225 31Z"
        fill="#e5e6e7"
        stroke="#191b1f"
        strokeWidth="3"
      />
      <path
        d="m141 105 73 63v221l-73-53Z"
        fill="#81858d"
        stroke="#191b1f"
        strokeWidth="3"
      />
      <path d="m230 184 191-26v166l-191 28Z" fill="#e5e6e7" />
      <path d="m244 195 162-23v124l-162 23Z" fill="#2b2d31" />
      <g
        fill="#d9dadc"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="25"
        transform="skewY(-8)"
      >
        <text x="257" y="283">
          HELLO,
        </text>
        <text x="257" y="315">
          WORLD_
        </text>
      </g>
      <path
        d="m157 393 228-28 52 39-238 35-69-29Z"
        fill="#c3c5c9"
        stroke="#191b1f"
        strokeWidth="3"
      />
      <path d="m162 391 216-25 39 29-218 30Z" fill="#e5e6e7" />
      <g stroke="#81858d" strokeWidth="4">
        <path d="m163 398 225-27M175 407l225-27M200 385l27 31M229 381l27 31M258 377l27 31M287 373l27 31M316 369l27 31M345 365l27 31" />
      </g>
      <ellipse
        cx="468"
        cy="400"
        rx="23"
        ry="15"
        fill="#ffc93c"
        stroke="#191b1f"
        strokeWidth="3"
      />
    </svg>
  )
}
export function Computer() {
  const launch = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const [arcadeOpen, setArcadeOpen] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<ComputerScene | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function update() {
      setReducedMotion(preference.matches)
    }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    pausedRef.current = paused || reducedMotion || arcadeOpen
    scene.current?.setPaused(pausedRef.current)
  }, [paused, reducedMotion, arcadeOpen])
  useEffect(() => {
    let cancelled = false
    const element = host.current
    const pointerTarget = stage.current
    if (!element || !pointerTarget) return
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        try {
          const { mountComputer } = await import('./computer-scene')
          if (cancelled) return
          scene.current = mountComputer(
            element,
            pointerTarget,
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
              pausedRef.current,
            () => {
              scene.current?.dispose()
              scene.current = null
              setFailed(true)
              setReady(false)
            },
          )
          setReady(true)
        } catch {
          if (!cancelled) setFailed(true)
        }
      },
      { rootMargin: '100px' },
    )
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
      scene.current?.dispose()
      scene.current = null
    }
  }, [])
  return (
    <div className="computer-playground">
      <div className="scene-orbit" aria-hidden="true" />
      <span className="scene-label font-mono">
        a little old-school. a little new-school.
      </span>
      <figure
        ref={stage}
        aria-label="A silver retro desktop computer with a dark Hello World screen"
        className="computer-stage"
      >
        {!ready && <ComputerIllustration />}
        <div
          ref={host}
          className={`computer-canvas ${ready && !failed ? 'is-ready' : ''}`}
        />
        <button
          ref={launch}
          type="button"
          className="arcade-launch"
          aria-haspopup="dialog"
          onClick={() => setArcadeOpen(true)}
        >
          <span>
            <Gamepad2 size={16} aria-hidden="true" /> Play Night Shift
          </span>
        </button>
      </figure>
      {arcadeOpen && (
        <ArcadeDialog
          onClose={() => {
            setArcadeOpen(false)
            launch.current?.focus({ preventScroll: true })
          }}
        />
      )}
      <div className="scene-controls">
        <span className="font-mono text-[10px] scene-hint">
          {failed
            ? 'Illustration mode'
            : reducedMotion || paused
              ? 'Taking it slow'
              : 'Go on, give it a spin'}
        </span>
        {ready && !failed && (
          <div className="flex gap-2">
            <button
              type="button"
              className="scene-button"
              onClick={() => scene.current?.spin()}
              aria-label={
                reducedMotion || paused ? 'Rotate computer' : 'Spin computer'
              }
              title="Give it a spin"
            >
              <RotateCw size={16} />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                className="scene-button"
                onClick={() => setPaused(!paused)}
                aria-label={paused ? 'Play animation' : 'Pause animation'}
                title={paused ? 'Play animation' : 'Pause animation'}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            )}
          </div>
        )}
      </div>
      <span className="scene-sticker" aria-hidden="true">
        hello
        <br />
        world!
      </span>
    </div>
  )
}
