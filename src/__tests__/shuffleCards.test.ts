import { describe, it, expect } from 'vitest'
import { generateCardAssignments } from '../utils/shuffleCards'

describe('generateCardAssignments', () => {
  const challengeIds = Array.from({ length: 25 }, (_, i) => `ch-${i}`)

  it('returns correct number of cells for a 4x4 grid', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    expect(cells).toHaveLength(16)
  })

  it('returns correct number of cells for a 5x5 grid', () => {
    const cells = generateCardAssignments(challengeIds, 5)
    expect(cells).toHaveLength(25)
  })

  it('each cell has row and col within grid bounds', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    for (const cell of cells) {
      expect(cell.row).toBeGreaterThanOrEqual(0)
      expect(cell.row).toBeLessThan(4)
      expect(cell.col).toBeGreaterThanOrEqual(0)
      expect(cell.col).toBeLessThan(4)
    }
  })

  it('each position (row,col) is unique', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    const positions = cells.map(c => `${c.row},${c.col}`)
    expect(new Set(positions).size).toBe(16)
  })

  it('uses challenges from the provided pool', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    for (const cell of cells) {
      expect(challengeIds).toContain(cell.challengeId)
    }
  })

  it('produces different arrangements on multiple calls', () => {
    const results = Array.from({ length: 10 }, () =>
      generateCardAssignments(challengeIds, 4).map(c => c.challengeId).join(',')
    )
    const unique = new Set(results)
    expect(unique.size).toBeGreaterThan(1)
  })
})
