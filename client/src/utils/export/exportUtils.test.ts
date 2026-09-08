import { describe, expect, it } from 'vitest'

import {
  buildDefaultFileName,
  formatBytes,
  formatNumber,
  rowsToJson,
  rowsToXls,
  sanitizeFileName,
  todayIso,
} from 'utils/export/exportUtils'

const textOf = (blob: Blob) => blob.text()
// Extract the inner text of every <th>/<td>, ignoring any attributes (styling).
const cells = (html: string, tag: 'th' | 'td') =>
  [...html.matchAll(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'g'))].map((m) => m[1])

describe('rowsToJson', () => {
  it('produces valid, pretty-printed JSON matching the input', async () => {
    const rows = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }]
    const blob = rowsToJson(rows)
    expect(blob.type).toBe('application/json')
    expect(JSON.parse(await textOf(blob))).toEqual(rows)
  })

  it('handles an empty array', async () => {
    expect(JSON.parse(await textOf(rowsToJson([])))).toEqual([])
  })
})

describe('rowsToXls', () => {
  it('builds a header row from the union of keys in first-seen order', async () => {
    const html = await textOf(rowsToXls([{ a: 1, b: 2 }, { a: 3, c: 4 }]))
    expect(cells(html, 'th')).toEqual(['a', 'b', 'c'])
    // missing key renders as empty cell; row values in column order
    expect(cells(html, 'td')).toEqual(['1', '2', '', '3', '', '4'])
  })

  it('escapes HTML in headers and cells', async () => {
    const html = await textOf(rowsToXls([{ '<h>&"': '<b>&"x' }]))
    expect(cells(html, 'th')).toEqual(['&lt;h&gt;&amp;&quot;'])
    expect(cells(html, 'td')).toEqual(['&lt;b&gt;&amp;&quot;x'])
  })

  it('preserves text values verbatim (no formula sanitization)', async () => {
    // supplierRef / articleName are free text: values must be exported exactly as stored.
    const html = await textOf(
      rowsToXls([{ supplierRef: '-12345', articleName: '=A-100', code: '+B', ref: '@x', safe: 'hello' }])
    )
    expect(cells(html, 'td')).toEqual(['-12345', '=A-100', '+B', '@x', 'hello'])
  })

  it('renders null/undefined as empty cells', async () => {
    const html = await textOf(rowsToXls([{ a: null, b: undefined }]))
    expect(cells(html, 'td')).toEqual(['', ''])
  })

  it('renders a plain table (Excel default gridlines) with the excel mime type', async () => {
    const blob = rowsToXls([{ a: 1 }])
    expect(blob.type).toContain('application/vnd.ms-excel')
    const html = await textOf(blob)
    expect(html).toContain('<table>')
    expect(html).not.toContain('border')
  })
})

describe('sanitizeFileName', () => {
  it('strips characters that are invalid in file names', () => {
    expect(sanitizeFileName('pro/du:kt*er?', 'fallback')).toBe('produkter')
    expect(sanitizeFileName('a\\b<c>d|e"f', 'fallback')).toBe('abcdef')
  })

  it('collapses whitespace and trims', () => {
    expect(sanitizeFileName('  min   fil  ', 'fallback')).toBe('min fil')
  })

  it('falls back when the result is empty', () => {
    expect(sanitizeFileName('   ', 'produkter')).toBe('produkter')
    expect(sanitizeFileName('///', 'produkter')).toBe('produkter')
  })
})

describe('formatBytes', () => {
  it('formats bytes, KB and MB at boundaries', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })
})

describe('formatNumber', () => {
  it('groups thousands with a separator (nb-NO)', () => {
    const out = formatNumber(151354)
    expect(out.replace(/[\s\u00a0\u202f]/g, '')).toBe('151354')
    expect(out.length).toBeGreaterThan(6)
  })
})

describe('todayIso', () => {
  it('formats a zero-padded ISO date', () => {
    expect(todayIso(new Date(2026, 8, 4))).toBe('2026-09-04')
    expect(todayIso(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('buildDefaultFileName', () => {
  const d = new Date(2026, 8, 4)
  it('appends the date to the base', () => {
    expect(buildDefaultFileName('produkter', [], d)).toBe('produkter_2026-09-04')
  })
  it('includes non-empty context parts, hyphenating spaces', () => {
    expect(buildDefaultFileName('produkter', ['Rulle stol', 'LevX'], d)).toBe('produkter_Rulle-stol_LevX_2026-09-04')
  })
  it('drops empty/nullish parts', () => {
    expect(buildDefaultFileName('varianter', ['', undefined, null, '  '], d)).toBe('varianter_2026-09-04')
  })
})
