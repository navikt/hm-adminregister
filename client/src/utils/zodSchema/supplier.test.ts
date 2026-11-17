import { describe, expect, it } from 'vitest'

import { editSupplierSchema } from 'utils/zodSchema/editSupplier'
import { newSupplierSchema } from 'utils/zodSchema/newSupplier'

describe.each([
  ['new supplier', newSupplierSchema.shape.homepage],
  ['edit supplier', editSupplierSchema.shape.homepage],
])('%s homepage', (_, homepage) => {
  it.each([
    'www.nav.no',
    'nav.no',
    'http://www.nav.no',
    'https://www.nav.no',
    'https://nav.no/path?key=value',
    'https://user:pass@nav.no',
    'http://user:pass@nav.no',
    'nav.no:8080',
    'nav.no:8080/path?key=value',
    'nav.no/path?next=https://example.com',
    'https://nav.no:443',
    'nav.no:65535',
    'https://nav.no:0',
    'http://[2606:4700:4700::1111]/index.html',
    'https://[::1]:8080/path',
    '[2606:4700:4700::1111]/index.html',
    'https://nav.no./path',
    'nav.no.',
    'https://127.0.0.1/path',
  ])('accepts %s without rewriting it', (value) => {
    expect(homepage.parse(value)).toBe(value)
  })

  it.each([
    'ftp://www.nav.no',
    'ftps://nav.no',
    'mailto:info@nav.no',
    '//www.nav.no',
    'www.nav .no',
    'invalid',
    'ftp.example://na v.no',
    'ftp.example://nav.no',
    'nav.no:abc',
    'https://nav.no:abc',
    'nav.no:65536',
    'https://nav.no:65536',
    'nav.no:-1',
    'nav.no:99999',
    'https://.no',
    '.no',
    'https://nav..no',
    'nav..no',
    'https://nav.no..',
    'https://.',
    'https://nav.',
    'http://[2606:4700:4700::xyz]/index.html',
    'ftp://[2606:4700:4700::1111]/index.html',
  ])('rejects %s', (value) => {
    expect(homepage.safeParse(value).success).toBe(false)
  })

  it.each(['', '   ', '  www.nav.no  '])('preserves trimming and optional values for "%s"', (value) => {
    expect(homepage.parse(value)).toBe(value.trim())
  })
})
