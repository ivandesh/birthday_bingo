import { describe, it, expect } from 'vitest'
import { findCompletedLines, type CellGrid } from '../utils/bingoDetection'

function makeGrid(size: number, completed: [number, number][]): CellGrid {
  const grid: CellGrid = []
  for (let r = 0; r < size; r++) {
    grid[r] = []
    for (let c = 0; c < size; c++) {
      grid[r][c] = completed.some(([cr, cc]) => cr === r && cc === c)
    }
  }
  return grid
}

describe('findCompletedLines', () => {
  it('detects a completed row', () => {
    const grid = makeGrid(4, [[0,0],[0,1],[0,2],[0,3]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 0 })
  })

  it('detects a completed column', () => {
    const grid = makeGrid(4, [[0,2],[1,2],[2,2],[3,2]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'col', index: 2 })
  })

  it('detects main diagonal', () => {
    const grid = makeGrid(4, [[0,0],[1,1],[2,2],[3,3]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'diagonal', index: 0 })
  })

  it('detects anti-diagonal', () => {
    const grid = makeGrid(4, [[0,3],[1,2],[2,1],[3,0]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'diagonal', index: 1 })
  })

  it('returns empty array when no lines complete', () => {
    const grid = makeGrid(4, [[0,0],[0,1],[0,2]])
    const lines = findCompletedLines(grid)
    expect(lines).toEqual([])
  })

  it('works with 5x5 grid', () => {
    const grid = makeGrid(5, [[2,0],[2,1],[2,2],[2,3],[2,4]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 2 })
  })

  it('detects multiple completed lines at once', () => {
    const grid = makeGrid(4, [
      [0,0],[0,1],[0,2],[0,3],
      [1,0],[2,0],[3,0]
    ])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 0 })
    expect(lines).toContainEqual({ type: 'col', index: 0 })
  })
})
