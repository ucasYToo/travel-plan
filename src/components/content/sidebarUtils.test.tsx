import { describe, expect, it } from 'vitest'
import { formatDate } from './sidebarUtils'

describe('formatDate', () => {
  it('formats an itinerary date without timezone conversion', () => {
    expect(formatDate('2026-10-03')).toBe('10/3')
  })

  it('returns invalid input unchanged', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
