import { describe, expect, it } from 'vitest'

import { editSupplierSchema } from 'utils/zodSchema/editSupplier'
import { newSupplierSchema } from 'utils/zodSchema/newSupplier'

describe.each([
  ['new supplier', newSupplierSchema.shape.homepage],
  ['edit supplier', editSupplierSchema.shape.homepage],
])('%s homepage', (_, homepage) => {
  it.each(['www.nav.no', 'nav.no', 'http://www.nav.no', 'https://www.nav.no', 'https://nav.no/path?key=value'])(
    'accepts %s',
    (value) => {
      expect(homepage.safeParse(value).success).toBe(true)
    }
  )

  it.each(['ftp://www.nav.no', 'ftps://nav.no', 'mailto:info@nav.no', '//www.nav.no', 'www.nav .no', 'invalid'])(
    'rejects %s',
    (value) => {
      expect(homepage.safeParse(value).success).toBe(false)
    }
  )

  it.each(['', '   ', '  www.nav.no  '])('preserves trimming and optional values for "%s"', (value) => {
    expect(homepage.parse(value)).toBe(value.trim())
  })
})
