import { useEffect, useRef, useState } from 'react'
import { arcadeSource, createArcade } from '../lib/basic-arcade'
import './computer-arcade.css'

type Direction = -1 | 0 | 1

const listing = arcadeSource.trim() + '\n\nRUN'
const typeChunk = Math.max(4, Math.ceil(listing.length / 56))

export default function Arcade() {
  const [typed, setTyped] = useState(0)
  const [typing, setTyping] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [game, setGame] = useState(() => createArcade())
  const [frame, setFrame] = useState(() => game.read())
  const [paused, setPaused] = useState(false)
  const direction = useRef<Direction>(0)
  const terminal = useRef<HTMLPreElement>(null)
  const controls = useRef<HTMLElement>(null)
  const left = useRef<HTMLButtonElement>(null)
  const focusControls = useRef(false)

  useEffect(() => {
    if (!typing) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    function skipIfReduced() {
      if (media.matches) setTyping(false)
    }
    media.addEventListener('change', skipIfReduced)
    let cursor = 0
    let runTimer: number | undefined
    const timer = window.setInterval(() => {
      cursor = Math.min(cursor + typeChunk, listing.length)
      setTyped(cursor)
      if (cursor === listing.length) {
        window.clearInterval(timer)
        runTimer = window.setTimeout(() => setTyping(false), 300)
      }
    }, 32)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(runTimer)
      media.removeEventListener('change', skipIfReduced)
    }
  }, [typing])

  useEffect(() => {
    const view = terminal.current
    if (view) view.scrollTop = view.scrollHeight
  }, [typed])

  useEffect(() => {
    if (!typing && focusControls.current) {
      left.current?.focus({ preventScroll: true })
      focusControls.current = false
    }
  }, [typing])

  useEffect(() => {
    if (typing || paused || frame.crashed) return
    const timer = window.setTimeout(() => {
      // Avoid a surprise death when the tab has gone into the background.
      if (!document.hidden) game.step(direction.current)
      direction.current = 0
      setFrame({ ...game.read() })
    }, frame.tickMs)
    return () => window.clearTimeout(timer)
  }, [frame, game, paused, typing])

  function replay() {
    const next = createArcade()
    direction.current = 0
    setGame(next)
    setFrame(next.read())
    setPaused(false)
  }

  function steer(next: Direction) {
    if (!typing && !paused && !frame.crashed) direction.current = next
  }

  useEffect(() => {
    if (typing || paused || frame.crashed) return
    const dialog = controls.current?.closest('dialog')
    function handleKeys(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return
      if (
        event.target instanceof Element &&
        event.target.closest(
          '.arcade-source, input, textarea, select, [contenteditable]',
        )
      )
        return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      direction.current = event.key === 'ArrowLeft' ? -1 : 1
    }
    dialog?.addEventListener('keydown', handleKeys)
    return () => dialog?.removeEventListener('keydown', handleKeys)
  }, [typing, paused, frame.crashed])

  if (typing) {
    return (
      <section className="arcade-content" aria-label="BASIC loader">
        <div className="arcade-status">Typing the BASIC listing…</div>
        <pre className="arcade-terminal" ref={terminal} aria-hidden="true">
          {listing.slice(0, typed)}▌
        </pre>
        <button
          type="button"
          className="arcade-control"
          onClick={() => {
            focusControls.current = true
            setTyping(false)
          }}
        >
          Skip typing
        </button>
      </section>
    )
  }

  return (
    <section
      className="arcade-content"
      aria-label="Game controls"
      ref={controls}
    >
      <div className="arcade-score">
        <span>Score: {frame.score}</span>
        <output>
          {frame.crashed ? 'Crash. Shift over!' : paused ? 'Paused' : 'Drive!'}
        </output>
      </div>
      <svg
        className="arcade-road"
        viewBox={`0 0 ${frame.lanes * 40} ${frame.depth * 20}`}
        preserveAspectRatio="none"
        aria-labelledby="arcade-road-title"
      >
        <title id="arcade-road-title">Night Shift roadway</title>
        {Array.from({ length: frame.lanes - 1 }, (_, index) => (
          <line
            key={index}
            className="arcade-line"
            x1={(index + 1) * 40}
            x2={(index + 1) * 40}
            y1={0}
            y2={frame.depth * 20}
          />
        ))}
        {frame.obstacles.map(
          (lane, row) =>
            lane >= 0 && (
              <rect
                key={row}
                className="arcade-traffic"
                x={lane * 40 + 10}
                y={row * 20 + 2}
                width={20}
                height={16}
                rx={5}
              />
            ),
        )}
        <rect
          className="arcade-player"
          data-lane={frame.player}
          x={frame.player * 40 + 10}
          y={(frame.depth - 1) * 20 + 2}
          width={20}
          height={16}
          rx={5}
        />
      </svg>
      <p className="arcade-instruction">
        Dodge traffic in the driveway. Use ← and → or the buttons.
      </p>
      <div className="arcade-controls">
        <button
          type="button"
          className="arcade-control"
          aria-label="Move left"
          ref={left}
          disabled={paused || frame.crashed}
          onClick={() => steer(-1)}
        >
          ←
        </button>
        <button
          type="button"
          className="arcade-control"
          aria-label="Move right"
          disabled={paused || frame.crashed}
          onClick={() => steer(1)}
        >
          →
        </button>
        <button
          type="button"
          className="arcade-control"
          disabled={frame.crashed}
          onClick={() => {
            direction.current = 0
            setPaused(!paused)
          }}
        >
          {paused ? 'Resume game' : 'Pause game'}
        </button>
        <button type="button" className="arcade-control" onClick={replay}>
          Replay
        </button>
      </div>
      <details className="arcade-source">
        <summary>View BASIC source</summary>
        <pre className="arcade-terminal">{listing}</pre>
      </details>
    </section>
  )
}
