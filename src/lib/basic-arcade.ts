// Night Shift, an original line-numbered BASIC program.
// YIELD hands one completed frame back to the browser; INPUT reads a steering
// value on the next step. RND(n) returns an integer from 1 through n.
export const arcadeSource: string = `10 REM NIGHT SHIFT
20 LET LANES = 3
30 LET DEPTH = 9
40 LET PLAYER = 1
50 LET SCORE = 0
60 LET CRASHED = 0
70 LET TICKMS = 220
80 DIM OBSTACLE(DEPTH - 1)
90 LET ROW = DEPTH - 1
100 LET OBSTACLE(ROW) = -1
110 LET ROW = ROW - 1
120 IF ROW >= 0 THEN GOTO 100
130 LET GAP = 0
140 YIELD
150 INPUT DIRECTION
160 LET NEXTLANE = PLAYER + DIRECTION
170 IF NEXTLANE < 0 THEN GOTO 200
180 IF NEXTLANE >= LANES THEN GOTO 200
190 LET PLAYER = NEXTLANE
200 LET ROW = DEPTH - 1
210 LET PREV = ROW - 1
220 LET OBSTACLE(ROW) = OBSTACLE(PREV)
230 LET ROW = ROW - 1
240 IF ROW > 0 THEN GOTO 210
250 LET OBSTACLE(0) = -1
260 IF GAP > 0 THEN GOTO 290
270 LET OBSTACLE(0) = RND(LANES) - 1
280 LET GAP = 2
290 LET GAP = GAP - 1
300 LET ROW = DEPTH - 1
310 IF OBSTACLE(ROW) = PLAYER THEN GOTO 350
320 LET SCORE = SCORE + 1
330 GOTO 140
350 LET CRASHED = 1
360 END`

const maxSourceLength = 8192
const maxArrayLength = 64
const instructionsPerStep = 512

function integer(value: number) {
  if (!Number.isSafeInteger(value)) throw new Error('Invalid BASIC integer')
  return value
}

function compare(left: number, operator: string, right: number) {
  if (operator === '<') return left < right
  if (operator === '<=') return left <= right
  if (operator === '>') return left > right
  if (operator === '>=') return left >= right
  if (operator === '<>') return left !== right
  return left === right
}

export function createArcade(source = arcadeSource, random = Math.random) {
  if (source.length > maxSourceLength)
    throw new Error('BASIC source is too long')
  const program = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^(\d+)\s+(.+)$/u.exec(line)
      if (!match) throw new Error('Expected a numbered BASIC statement')
      return {
        number: integer(Number(match[1])),
        statement: match[2].toUpperCase(),
      }
    })
    .sort((left, right) => left.number - right.number)
  const labels = new Map(program.map((line, index) => [line.number, index]))
  if (labels.size !== program.length) throw new Error('Duplicate BASIC line')

  const variables = new Map<string, number>()
  const arrays = new Map<string, number[]>()
  let pc = 0
  let ended = false

  function slot(name: string, subscript: string) {
    const values = arrays.get(name)
    const index = evaluate(subscript)
    if (!values || index < 0 || index >= values.length)
      throw new Error('BASIC array index out of bounds')
    return { values, index }
  }

  function atom(token: string): number {
    if (/^-?\d+$/u.test(token)) return integer(Number(token))
    const ref = /^([A-Z][A-Z0-9]*)(?:\(([^()]+)\))?$/u.exec(token)
    if (!ref) throw new Error('Invalid BASIC expression')
    const [, name, subscript] = ref
    if (subscript === undefined) return variables.get(name) ?? 0
    if (name === 'RND') {
      const limit = evaluate(subscript)
      const sample = random()
      if (limit < 1 || !Number.isFinite(sample) || sample < 0 || sample >= 1)
        throw new Error('Invalid BASIC RND bounds')
      return Math.floor(sample * limit) + 1
    }
    const { values, index } = slot(name, subscript)
    return values[index]
  }

  function evaluate(expression: string): number {
    const binary =
      /^(-?\d+|[A-Z][A-Z0-9]*(?:\([^()]+\))?)\s+([+-])\s+(.+)$/u.exec(
        expression.trim(),
      )
    if (!binary) return atom(expression.trim())
    const [, first, operator, second] = binary
    const left = atom(first)
    const right = atom(second)
    return integer(operator === '+' ? left + right : left - right)
  }

  function jump(label: string) {
    const index = labels.get(Number(label))
    if (index === undefined) throw new Error(`Missing BASIC line ${label}`)
    pc = index
  }

  function run(direction: -1 | 0 | 1) {
    if (ended) return
    for (let remaining = instructionsPerStep; remaining > 0; remaining--) {
      const line = program[pc++]
      if (!line) throw new Error('BASIC program ended without END')
      const { statement } = line
      if (statement === 'YIELD') return
      if (statement === 'END') {
        ended = true
        return
      }
      if (/^REM(?:\s|$)/u.test(statement)) continue

      const assignment =
        /^LET ([A-Z][A-Z0-9]*)(?:\(([^()]+)\))?\s*=\s*(.+)$/u.exec(statement)
      if (assignment) {
        const [, name, subscript, expression] = assignment
        const value = evaluate(expression)
        if (subscript === undefined) variables.set(name, value)
        else {
          const { values, index } = slot(name, subscript)
          values[index] = value
        }
        continue
      }
      const dimension = /^DIM ([A-Z][A-Z0-9]*)\(([^()]+)\)$/u.exec(statement)
      if (dimension) {
        const [, name, expression] = dimension
        const upperBound = evaluate(expression)
        if (upperBound < 0 || upperBound >= maxArrayLength)
          throw new Error('BASIC array bounds exceeded')
        arrays.set(name, Array<number>(upperBound + 1).fill(0))
        continue
      }
      const input = /^INPUT ([A-Z][A-Z0-9]*)$/u.exec(statement)
      if (input) {
        variables.set(input[1], direction)
        continue
      }
      const branch =
        /^IF (.+?)\s+(<=|>=|<>|<|>|=)\s+(.+) THEN GOTO (\d+)$/u.exec(statement)
      if (branch) {
        if (compare(evaluate(branch[1]), branch[2], evaluate(branch[3])))
          jump(branch[4])
        continue
      }
      const go = /^GOTO (\d+)$/u.exec(statement)
      if (go) {
        jump(go[1])
        continue
      }
      throw new Error(`Unsupported BASIC statement on line ${line.number}`)
    }
    throw new Error('BASIC instruction limit exceeded')
  }

  // Execute startup through the first YIELD so the initial board is available.
  run(0)
  return {
    step(direction: -1 | 0 | 1 = 0) {
      if (direction !== -1 && direction !== 0 && direction !== 1)
        throw new Error('Invalid arcade direction')
      run(direction)
    },
    read() {
      const lanes = variables.get('LANES') ?? 0
      const depth = variables.get('DEPTH') ?? 0
      const player = variables.get('PLAYER') ?? 0
      const obstacles: readonly number[] = [...(arrays.get('OBSTACLE') ?? [])]
      const score = variables.get('SCORE') ?? 0
      const crashed = variables.get('CRASHED') === 1
      const tickMs = variables.get('TICKMS') ?? 0
      if (
        lanes < 1 ||
        lanes > maxArrayLength ||
        depth < 1 ||
        obstacles.length !== depth ||
        player < 0 ||
        player >= lanes ||
        obstacles.some((lane) => lane < -1 || lane >= lanes) ||
        score < 0 ||
        tickMs < 16
      )
        throw new Error('Invalid BASIC arcade state')
      return { lanes, depth, player, obstacles, score, crashed, tickMs }
    },
  }
}
