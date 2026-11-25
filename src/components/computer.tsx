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
    <div className="computer-illustration">
      <img src="/sketch/computer.svg" width={580} height={420} alt="" />
      <span className="computer-pencil-screen" aria-hidden="true">
        DRAGON 32
        <br />
        READY.
        <br />
        &gt; _
      </span>
    </div>
  )
}
export function Computer() {
  const launch = useRef<HTMLButtonElement>(null)
  const stage = useRef<HTMLElement>(null)
  const [arcadeOpen, setArcadeOpen] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<ComputerScene | null>(null)
  const [showModel, setShowModel] = useState(false)
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
    if (!showModel) return
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
  }, [showModel])
  return (
    <div className="computer-playground">
      <div className="scene-orbit" aria-hidden="true" />
      <span className="scene-label font-mono">First computer: Dragon 32</span>
      <figure
        ref={stage}
        aria-label="Retro desktop computer, inspired by the Dragon 32"
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
            : !showModel
              ? 'Drawn in pen'
              : reducedMotion || paused
                ? 'Taking it slow'
                : 'Go on, give it a spin'}
        </span>
        {!showModel && (
          <button
            type="button"
            className="text-link"
            onClick={() => setShowModel(true)}
          >
            Show 3D model
          </button>
        )}
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
        tap to play
      </span>
    </div>
  )
}
