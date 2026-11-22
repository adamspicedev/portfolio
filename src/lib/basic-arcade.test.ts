import { describe, expect, it } from 'bun:test'
import { arcadeSource, createArcade } from './basic-arcade'

describe('Night Shift BASIC arcade', () => {
  it('starts clean and a new run restarts the same seeded traffic', () => {
    const start = () => {
      let seed = 123
      return createArcade(arcadeSource, () => {
        seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
        return seed / 2 ** 32
      })
    }
    const first = start()
    const initial = first.read()
    expect(initial).toEqual({
      lanes: 3,
      depth: 9,
      player: 1,
      obstacles: Array(9).fill(-1),
      score: 0,
      crashed: false,
      tickMs: 220,
    })
    first.step(1)
    first.step()
    first.step(-1)
    expect(first.read()).toMatchObject({
      player: 1,
      obstacles: [1, -1, 0, -1, -1, -1, -1, -1, -1],
      score: 3,
    })

    const restarted = start()
    expect(restarted.read()).toEqual(initial)
    restarted.step(1)
    restarted.step()
    restarted.step(-1)
    expect(restarted.read()).toEqual(first.read())
  })

  it('keeps the car on the road and only scores completed ticks', () => {
    const game = createArcade(arcadeSource, () => 0)
    game.step(-1)
    game.step(-1)
    expect(game.read()).toMatchObject({ player: 0, score: 2 })
    for (let tick = 0; tick < 6; tick++) game.step()
    expect(game.read()).toMatchObject({ score: 8, crashed: false })

    game.step()
    const crash = game.read()
    expect(crash).toMatchObject({ player: 0, score: 8, crashed: true })
    expect(crash.obstacles.at(-1)).toBe(0)
    game.step(1)
    expect(game.read()).toEqual(crash)
  })

  it('executes the supplied BASIC rather than hard-coding game rules', () => {
    const source = arcadeSource
      .replace('LET PLAYER = 1', 'LET PLAYER = 2')
      .replace('LET SCORE = SCORE + 1', 'LET SCORE = SCORE + 5')
    const game = createArcade(source, () => 0)
    expect(game.read().player).toBe(2)
    game.step(-1)
    expect(game.read()).toMatchObject({ player: 1, score: 5 })
  })

  it('limits execution before startup and between yields', () => {
    expect(() => createArcade('10 GOTO 10')).toThrow(/instruction limit/i)
    const game = createArcade(
      arcadeSource.replace('150 INPUT DIRECTION', '150 GOTO 150'),
    )
    expect(() => game.step()).toThrow(/instruction limit/i)
  })

  it('rejects invalid input and unreasonable programs', () => {
    const game = createArcade()
    expect(() => game.step(2 as 1)).toThrow(/direction/i)
    expect(() => createArcade('10 DIM OBSTACLE(100000)')).toThrow(/bounds/i)
    expect(() => createArcade('10 CALL something')).toThrow(/statement/i)
    expect(() => createArcade('10 GOTO 999')).toThrow(/line 999/i)
  })
})
