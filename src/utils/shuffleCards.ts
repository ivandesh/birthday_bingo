export interface CardAssignment {
  challengeId: string
  row: number
  col: number
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateCardAssignments(
  challengeIds: string[],
  gridSize: number
): CardAssignment[] {
  const totalCells = gridSize * gridSize
  let pool = shuffle(challengeIds)
  while (pool.length < totalCells) {
    pool = [...pool, ...shuffle(challengeIds)]
  }
  const selected = pool.slice(0, totalCells)

  const cells: CardAssignment[] = []
  let idx = 0
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push({ challengeId: selected[idx], row, col })
      idx++
    }
  }
  return cells
}
