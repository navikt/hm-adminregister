import { PropsWithChildren } from 'react'

import { updateProductIsoCategory, useSeriesV2 } from 'api/SeriesApi'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { IsoMappingWarning } from 'products/IsoMappingWarning'
import { SWRConfig } from 'swr'
import { FlagProvider } from 'toggles/context'
import { isoCategoryFields, isoCategoryOf, useIsoVersion } from 'utils/iso-version'
import { useActiveIsoCategories, useIsoCategories, useIsoCategories22 } from 'utils/swr-hooks'
import { expect, test } from 'vitest'

import { act, render, renderHook, screen, waitFor } from '@testing-library/react'

test('mapping warning is only visible while the ISO22 flag is enabled', () => {
  const warning = (enabled: boolean) => (
    <FlagProvider toggles={[{ name: 'finnhjelpemiddel.iso22', enabled }]}>
      <IsoMappingWarning />
    </FlagProvider>
  )
  const { rerender } = render(warning(false))
  expect(screen.queryByText('Kunne ikke koble ISO-kategoriene')).not.toBeInTheDocument()

  rerender(warning(true))
  expect(screen.getByText('Kunne ikke koble ISO-kategoriene')).toBeVisible()

  rerender(warning(false))
  expect(screen.queryByText('Kunne ikke koble ISO-kategoriene')).not.toBeInTheDocument()
})

test('toggle changes ordinary category and series cache keys without changing fixed ISO-admin category hooks', async () => {
  const reads: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/:version/isocategories', ({ params }) =>
      HttpResponse.json([{ isoCode: params.version === 'v22' ? '22222222' : '16161616' }])
    ),
    http.get('http://localhost:8080/admreg/api/v1/series/series-id', ({ request }) => {
      const version = new URL(request.url).searchParams.get('isoVersion')
      reads.push(version!)
      return HttpResponse.json({
        title: version,
        isoCategory: { isoCode: '16161616' },
        isoCategory22: { isoCode: '22222222' },
      })
    })
  )
  const cache = new Map()
  let enabled = false
  const wrapper = ({ children }: PropsWithChildren) => (
    <SWRConfig value={{ provider: () => cache, revalidateOnFocus: false }}>
      <FlagProvider toggles={[{ name: 'finnhjelpemiddel.iso22', enabled }]}>{children}</FlagProvider>
    </SWRConfig>
  )
  const { result, rerender } = renderHook(
    () => {
      const version = useIsoVersion()
      const active = useActiveIsoCategories()
      const fixed16 = useIsoCategories()
      const fixed22 = useIsoCategories22()
      const series = useSeriesV2('series-id')
      return { version, active, fixed16, fixed22, series }
    },
    { wrapper }
  )
  await waitFor(() => expect(result.current.series.data?.title).toBe('v16'))
  await waitFor(() => expect(result.current.active.isoCategories?.[0].isoCode).toBe('16161616'))
  enabled = true
  rerender()
  await waitFor(() => expect(result.current.series.data?.title).toBe('v22'))
  expect(result.current.active.isoCategories?.[0].isoCode).toBe('22222222')
  expect(isoCategoryOf(result.current.series.data, result.current.version)?.isoCode).toBe('22222222')
  expect(result.current.fixed16.isoCategories?.[0].isoCode).toBe('16161616')
  expect(result.current.fixed22.isoCategories22?.[0].isoCode).toBe('22222222')
  expect(reads).toEqual(['v16', 'v22'])
  expect([...cache.keys()].filter((key) => key.includes('/series/series-id'))).toHaveLength(2)
})

test('active version selects patch field and draft category fields', async () => {
  const requests: { version: string | null; body: unknown }[] = []
  server.use(
    http.patch('http://localhost:8080/admreg/api/v1/series/series-id', async ({ request }) => {
      requests.push({ version: new URL(request.url).searchParams.get('isoVersion'), body: await request.json() })
      return new HttpResponse(null, { status: 200 })
    })
  )
  let enabled = false
  const wrapper = ({ children }: PropsWithChildren) => (
    <FlagProvider toggles={[{ name: 'finnhjelpemiddel.iso22', enabled }]}>{children}</FlagProvider>
  )
  const { result, rerender } = renderHook(() => useIsoVersion(), { wrapper })
  await act(() => updateProductIsoCategory('series-id', '16161616', false, result.current))
  expect(isoCategoryFields('16161616', result.current)).toEqual({ isoCategory: '16161616' })
  enabled = true
  rerender()
  await act(() => updateProductIsoCategory('series-id', '22222222', true, result.current))
  expect(isoCategoryFields('22222222', result.current)).toEqual({ isoCategory: '', isoCategory22: '22222222' })
  expect(requests[0].version).toBe('v16')
  expect(requests[0].body).toMatchObject({ isoCategory: '16161616', resetTechnicalData: false })
  expect(requests[1].version).toBe('v22')
  expect(requests[1].body).toMatchObject({ isoCategory22: '22222222', resetTechnicalData: true })
  expect(requests[1].body).not.toHaveProperty('isoCategory')
})
