import { describe, expect, it } from 'vitest'
import { scoreOptions } from '../src/transport.js'

describe('transport scoring', () => {
  it('makes cheap and comfortable choices differ', () => {
    const base: any[] = [
      { id: 'cheap', price: 100, durationMinutes: 500, comfort: 40, transfers: 1 },
      { id: 'comfort', price: 500, durationMinutes: 100, comfort: 95, transfers: 0 }
    ]
    const scored = scoreOptions(base)
    expect(scored.sort((a, b) => b.scores.budget - a.scores.budget)[0].id).toBe('cheap')
    expect(scored.sort((a, b) => b.scores.comfort - a.scores.comfort)[0].id).toBe('comfort')
  })
})
