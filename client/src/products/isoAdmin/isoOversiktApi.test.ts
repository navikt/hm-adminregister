import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { expect, test } from 'vitest'

import { fetchSeriesForIsoCode } from './isoOversiktApi'
import { IsoOverviewSeries } from './isoOversiktTypes'

const series = (id: string, isoCategory: string, isoCategory22: string | null = null): IsoOverviewSeries => ({
  id,
  title: id,
  isoCategory,
  isoCategory22,
  variants: [],
  status: 'DONE',
  isExpired: false,
  isPublished: true,
  variantCount: 0,
  updated: '2026-01-01T00:00:00',
  updatedByUser: 'admin',
  mainProduct: true,
})

test('scoped loader collects pages and excludes records outside the requested v16 prefix', async () => {
  const pages: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const params = new URL(request.url).searchParams
      expect(params.get('isoCode')).toBe('18')
      pages.push(params.get('page') ?? '')
      return HttpResponse.json({
        content:
          params.get('page') === '0'
            ? [series('one', '18090301')]
            : [series('two', '18120301'), series('other', '04010101')],
        totalPages: 2,
      })
    })
  )
  const result = await fetchSeriesForIsoCode('18', () => {}, new AbortController().signal)
  expect(result.map((item) => item.id)).toEqual(['one', 'two'])
  expect(pages).toEqual(['0', '1'])
})

test('v22 loader fetches missing details and filters stored v22 codes, not v16 or recommendations', async () => {
  const progress: number[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const params = new URL(request.url).searchParams
      expect(params.get('isoCode22')).toBe('22')
      expect(params.has('isoCode')).toBe(false)
      return HttpResponse.json({ content: [{ id: 'one' }, { id: 'other' }], totalPages: 1 })
    }),
    http.get('http://localhost:8080/admreg/api/v1/series/one', () =>
      HttpResponse.json(series('one', '05030301', '22091201'))
    ),
    http.get('http://localhost:8080/admreg/api/v1/series/other', () =>
      HttpResponse.json(series('other', '22091201', null))
    )
  )
  const result = await fetchSeriesForIsoCode(
    '22',
    (loaded) => progress.push(loaded),
    new AbortController().signal,
    'v22'
  )
  expect(result.map((item) => item.id)).toEqual(['one'])
  expect(progress).toHaveLength(2)
})

test('loader reuses the initial page and does not request it again', async () => {
  let calls = 0
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', () => {
      calls++
      return HttpResponse.json({ content: [], totalPages: 1 })
    })
  )
  const result = await fetchSeriesForIsoCode('18', () => {}, new AbortController().signal, 'v16', {
    content: [series('one', '18090301')],
    totalPages: 1,
    totalSize: 1,
    pageNumber: 0,
    size: 200,
    pageable: { number: 0, size: 200, mode: 'OFFSET', sort: { orderBy: [] }, orderBy: [] },
  })
  expect(result.map((item) => item.id)).toEqual(['one'])
  expect(calls).toBe(0)
})

test('loader propagates errors rather than accepting partial pages', async () => {
  server.use(
    http.get(
      'http://localhost:8080/admreg/api/v1/series',
      () => new HttpResponse(null, { status: 503, statusText: 'Unavailable' })
    )
  )
  await expect(fetchSeriesForIsoCode('18', () => {}, new AbortController().signal)).rejects.toThrow('Unavailable')
})
