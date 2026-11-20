import { describe, expect, it } from 'vitest'
import { formatDeposeeLe, formatPrix } from './format'

// Intl separates thousands and the currency sign with narrow no-break spaces.
const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ')

describe('formatPrix', () => {
  it('says Don when the prix is zero', () => {
    expect(formatPrix(0)).toBe('Don')
  })

  it('shows a round prix in euros without decimals', () => {
    expect(normalizeSpaces(formatPrix(1250000))).toBe('12 500 €')
  })

  it('keeps the centimes when there are some', () => {
    expect(normalizeSpaces(formatPrix(1999))).toBe('19,99 €')
  })
})

describe('formatDeposeeLe', () => {
  it('writes the date in French, in the Paris time zone', () => {
    expect(formatDeposeeLe('2026-11-01T23:30:00Z')).toBe('2 novembre 2026')
  })
})
