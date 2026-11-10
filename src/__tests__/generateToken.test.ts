import { describe, it, expect } from 'vitest'
import { generateToken } from '../utils/generateToken'

describe('generateToken', () => {
  it('returns a 6-character string', () => {
    const token = generateToken()
    expect(token).toHaveLength(6)
  })

  it('contains only alphanumeric characters', () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-z0-9]{6}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()))
    expect(tokens.size).toBeGreaterThan(90)
  })
})
