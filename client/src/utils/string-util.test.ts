import { describe, expect, it } from 'vitest'

import { validateNorwegianDecimal } from 'utils/string-util'

describe('validateNorwegianDecimal', () => {
  it('accepts integers', () => {
    expect(validateNorwegianDecimal('5')).toBe(true)
    expect(validateNorwegianDecimal('100')).toBe(true)
  })

  it('accepts comma-separated decimals', () => {
    expect(validateNorwegianDecimal('1,5')).toBe(true)
    expect(validateNorwegianDecimal('10,25')).toBe(true)
    expect(validateNorwegianDecimal('0,75')).toBe(true)
  })

  it('accepts values with surrounding whitespace', () => {
    expect(validateNorwegianDecimal(' 1,5 ')).toBe(true)
  })

  it('rejects dot as decimal separator with specific message', () => {
    expect(validateNorwegianDecimal('1.5')).toBe('Bruk komma som desimalskilletegn f.eks. 1,5')
    expect(validateNorwegianDecimal('10.25')).toBe('Bruk komma som desimalskilletegn f.eks. 1,5')
  })

  it('rejects non-numeric input', () => {
    expect(validateNorwegianDecimal('abc')).toBe('Må være et tall')
    expect(validateNorwegianDecimal('1a2')).toBe('Må være et tall')
    expect(validateNorwegianDecimal('1,2,3')).toBe('Må være et tall')
  })
})
