export type CellGrid = boolean[][]

export interface CompletedLine {
  type: 'row' | 'col' | 'diagonal'
  index: number
}

export function findCompletedLines(grid: CellGrid): CompletedLine[] {
  const size = grid.length
  const lines: CompletedLine[] = []

  // Check rows
  for (let r = 0; r < size; r++) {
    if (grid[r].every(cell => cell)) {
      lines.push({ type: 'row', index: r })
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    let complete = true
    for (let r = 0; r < size; r++) {
      if (!grid[r][c]) { complete = false; break }
    }
    if (complete) lines.push({ type: 'col', index: c })
  }

  // Main diagonal (top-left to bottom-right)
  let mainDiag = true
  for (let i = 0; i < size; i++) {
    if (!grid[i][i]) { mainDiag = false; break }
  }
  if (mainDiag) lines.push({ type: 'diagonal', index: 0 })

  // Anti-diagonal (top-right to bottom-left)
  let antiDiag = true
  for (let i = 0; i < size; i++) {
    if (!grid[i][size - 1 - i]) { antiDiag = false; break }
  }
  if (antiDiag) lines.push({ type: 'diagonal', index: 1 })

  return lines
}
