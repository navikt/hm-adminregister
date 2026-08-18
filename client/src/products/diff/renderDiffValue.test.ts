import { describe, expect, it } from 'vitest'

import { renderDiffValue } from 'products/diff/renderDiffValue'

describe('renderDiffValue', () => {
  it('renders primitives as strings', () => {
    expect(renderDiffValue('hei')).toBe('hei')
    expect(renderDiffValue(42)).toBe('42')
    expect(renderDiffValue(true)).toBe('true')
  })

  it('renders null and undefined safely', () => {
    expect(renderDiffValue(null)).toBe('null')
    expect(renderDiffValue(undefined)).toBe('')
  })

  it('joins array values', () => {
    expect(renderDiffValue(['a', 'b', 'c'])).toBe('a, b, c')
    expect(renderDiffValue([1, 2])).toBe('1, 2')
  })

  it('renders {title, url} objects instead of crashing', () => {
    expect(renderDiffValue({ title: 'Brosjyre', url: 'https://nav.no/fil.pdf' })).toBe(
      'Brosjyre (https://nav.no/fil.pdf)'
    )
  })

  it('renders objects with only title or only url', () => {
    expect(renderDiffValue({ title: 'Kun tittel' })).toBe('Kun tittel')
    expect(renderDiffValue({ url: 'https://nav.no' })).toBe('https://nav.no')
  })

  it('falls back to JSON for unknown object shapes', () => {
    expect(renderDiffValue({ foo: 'bar' })).toBe('{"foo":"bar"}')
  })

  it('renders an array of media objects', () => {
    expect(
      renderDiffValue([
        { title: 'A', url: 'https://nav.no/a' },
        { title: 'B', url: 'https://nav.no/b' },
      ])
    ).toBe('A (https://nav.no/a), B (https://nav.no/b)')
  })
})
