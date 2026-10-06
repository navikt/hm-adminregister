import { MemoryRouter } from 'react-router-dom'

import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { SWRConfig } from 'swr'
import { todayIso } from 'utils/export/exportUtils'
import { exportRows } from 'utils/export/exportUtils'
import { useAuthStore } from 'utils/store/useAuthStore'
import { afterEach, expect, test, vi } from 'vitest'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import Parts from './Parts'

vi.mock('utils/export/exportUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/export/exportUtils')>()
  return { ...actual, exportRows: vi.fn() }
})

const baseUser = {
  userId: 'user-id',
  userName: 'Bruker',
  supplierId: undefined,
  supplierName: undefined,
  exp: undefined,
}
const adminUser = { ...baseUser, isAdmin: true, isHmsUser: false, isAdminOrHmsUser: true, isSupplier: false }
const hmsUser = { ...baseUser, isAdmin: false, isHmsUser: true, isAdminOrHmsUser: true, isSupplier: false }

const PARTS_URL = 'http://localhost:8080/admreg/common/api/v1/part'

const dummyPart = (overrides: Record<string, unknown> = {}) => ({
  id: 'part-1',
  seriesUUID: 'series-1',
  hmsArtNr: '123456',
  supplierRef: 'LEV-1',
  articleName: 'Hjul 10 tommer',
  accessory: false,
  sparePart: true,
  created: '2024-05-24T09:54:25.595163',
  isExpired: false,
  isPublished: true,
  agreements: [],
  productData: {
    techData: [],
    attributes: {
      compatibleWith: { seriesIds: ['linked-series-1'], productIds: ['linked-product-1', 'linked-product-2'] },
      egnetForKommunalTekniker: true,
      egnetForBrukerpass: false,
    },
  },
  ...overrides,
})

const seriesDetail = (id: string, media: { type: string; source?: string }[] = []) => ({
  id,
  title: `Serie ${id}`,
  supplierName: 'Leverandør AS',
  isoCategory: { isoCode: '12 34 56 78 90', isoTitle: 'Hjul' },
  status: 'DONE',
  updated: '2024-05-24T09:54:25.595163',
  published: '2024-05-20T09:54:25.595163',
  seriesData: { media, attributes: {} },
  variants: [],
})

const mockParts = (content: ReturnType<typeof dummyPart>[], onRequest?: (url: URL) => void, totalPages = 1) =>
  server.use(
    http.get(PARTS_URL, ({ request }) => {
      const url = new URL(request.url)
      onRequest?.(url)
      return HttpResponse.json({ content, totalSize: content.length * totalPages, totalPages })
    })
  )

const renderTab = (initialEntry = '/deler') =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Parts />
      </MemoryRouter>
    </SWRConfig>
  )

const openExportDialog = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  return within(await screen.findByRole('dialog'))
}

afterEach(() => {
  useAuthStore.setState({ loggedInUser: undefined })
  vi.mocked(exportRows).mockClear()
})

test('viser eksporterknappen kun for admin', async () => {
  mockParts([dummyPart()])

  useAuthStore.setState({ loggedInUser: hmsUser })
  const { unmount } = renderTab()
  await screen.findByText('Hjul 10 tommer')
  expect(screen.queryByRole('button', { name: 'Eksporter' })).not.toBeInTheDocument()
  unmount()

  useAuthStore.setState({ loggedInUser: adminUser })
  renderTab()
  await screen.findByText('Hjul 10 tommer')
  expect(await screen.findByRole('button', { name: 'Eksporter' })).toBeInTheDocument()
})

test('eksporterer standardfelter for denne siden, inkludert leverandør, ISO og antall koblinger', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () => HttpResponse.json(seriesDetail('series-1')))
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows, format, fileName] = vi.mocked(exportRows).mock.calls[0]
  expect(format).toBe('excel')
  expect(fileName).toBe(`deler_side-1_${todayIso()}`)
  expect(rows).toEqual([
    {
      Navn: 'Hjul 10 tommer',
      'Lev-artnr': 'LEV-1',
      'HMS-nr.': '123456',
      Type: 'Reservedel',
      Leverandør: 'Leverandør AS',
      'ISO-kode': '12345678',
      Avtale: 'Nei',
      Publisert: 'Ja',
      Utgått: 'Nei',
      'Antall koblinger til produktserier': 1,
      'Antall koblinger til enkeltprodukter': 2,
    },
  ])
})

test('henter ikke seriedetaljer når ingen felter fra serien er valgt', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])
  const detailSpy = vi.fn()
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () => {
      detailSpy()
      return HttpResponse.json(seriesDetail('series-1'))
    })
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Leverandør' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: 'ISO-kode' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  expect(detailSpy).not.toHaveBeenCalled()
})

test('eksporterer mediafelter fra seriedetaljer', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () =>
      HttpResponse.json(seriesDetail('series-1', [{ type: 'IMAGE' }, { type: 'IMAGE' }]))
    )
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  ;['Antall bilder', 'Antall videoer', 'Mangler bilde', 'Mangler video'].forEach((name) =>
    fireEvent.click(dialog.getByRole('checkbox', { name }))
  )
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows[0]['Antall bilder']).toBe(2)
  expect(rows[0]['Antall videoer']).toBe(0)
  expect(rows[0]['Mangler bilde']).toBe('Nei')
  expect(rows[0]['Mangler video']).toBe('Ja')
})

test('henter koblede produktserier og enkeltprodukter kun når feltene er valgt', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])
  const idsBodies: unknown[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () => HttpResponse.json(seriesDetail('series-1'))),
    http.get('http://localhost:8080/admreg/api/v1/series/linked-series-1', () =>
      HttpResponse.json(seriesDetail('linked-series-1'))
    ),
    http.post('http://localhost:8080/admreg/admin/api/v1/product/registrations/ids', async ({ request }) => {
      idsBodies.push(await request.json())
      return HttpResponse.json([
        { id: 'linked-product-1', hmsArtNr: '111', articleName: 'Rullestol A' },
        { id: 'linked-product-2', hmsArtNr: '222', articleName: 'Rullestol B' },
      ])
    })
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Koblede produktserier' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Koblede enkeltprodukter' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows[0]['Koblede produktserier']).toBe('Serie linked-series-1')
  expect(rows[0]['Koblede enkeltprodukter']).toBe('111 – Rullestol A; 222 – Rullestol B')
  expect(idsBodies).toEqual([['linked-product-1', 'linked-product-2']])
})

test('legger til avtalekolonner per plass når avtaledetaljer er valgt', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([
    dummyPart({
      agreements: [
        { status: 'ACTIVE', rank: 2, postNr: 2, postTitle: 'Post 2', reference: 'ref-2', title: 'Avtale' },
        { status: 'ACTIVE', rank: 1, postNr: 1, postTitle: 'Post 1', reference: 'ref-1', title: 'Avtale' },
        { status: 'INACTIVE', rank: 3, postNr: 3, postTitle: 'Post 3', reference: 'ref-3', title: 'Avtale' },
      ],
    }),
  ])
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () => HttpResponse.json(seriesDetail('series-1')))
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Avtaledetaljer' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows[0]['Avtale']).toBe('Ja')
  expect(rows[0]['Rangering 1']).toBe(1)
  expect(rows[0]['Delkontrakt 1']).toBe('Post 1')
  expect(rows[0]['Rangering 2']).toBe(2)
  expect(Object.keys(rows[0])).not.toContain('Rangering 3')
})

test('«Alle treff» henter alle sider med samme filtre som lista', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  const requested: URL[] = []
  mockParts([dummyPart()], (url) => requested.push(url), 2)
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', () => HttpResponse.json(seriesDetail('series-1')))
  )

  renderTab('/deler?isSparePart=true&inAgreement=false&missingMediaType=IMAGE&q=hjul')
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('radio', { name: 'Alle treff' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const exportRequests = requested.filter((url) => url.searchParams.get('size') === '100')
  expect(exportRequests.map((url) => url.searchParams.get('page'))).toEqual(['0', '1'])
  exportRequests.forEach((url) => {
    expect(url.searchParams.get('isAccessory')).toBe('false')
    expect(url.searchParams.get('inAgreement')).toBe('false')
    expect(url.searchParams.get('missingMediaType')).toBe('IMAGE')
    expect(url.searchParams.get('title')).toBe('hjul')
  })
  const [rows, , fileName] = vi.mocked(exportRows).mock.calls[0]
  expect(rows).toHaveLength(2)
  expect(fileName).toBe(`deler_hjul_reservedel_uten-avtale_mangler-bilde_alle-treff_${todayIso()}`)
})

test('viser fullkatalogvarsel for «Alle treff» uten filtre', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('radio', { name: 'Alle treff' }))

  expect(await dialog.findByText('Ingen filtre er satt – hele katalogen eksporteres.')).toBeInTheDocument()
})

test('sperrer «Alle treff» over 2 000 kall og åpner igjen når detaljfelter fjernes', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()], undefined, 2500)

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('radio', { name: 'Alle treff' }))

  expect(await dialog.findByText(/For stor eksport: ca\. 2[\s\u00a0]525 kall/)).toBeInTheDocument()
  expect(dialog.getByRole('button', { name: 'Eksporter' })).toBeDisabled()

  fireEvent.click(dialog.getByRole('checkbox', { name: 'Leverandør' }))
  fireEvent.click(dialog.getByRole('checkbox', { name: 'ISO-kode' }))

  expect(dialog.queryByText(/For stor eksport/)).not.toBeInTheDocument()
  expect(dialog.getByRole('button', { name: 'Eksporter' })).toBeEnabled()
})

test('avbryter eksporten og laster ikke ned når modalen lukkes', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockParts([dummyPart()])
  let releaseDetail: () => void = () => {}
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series/series-1', async () => {
      await new Promise<void>((resolve) => (releaseDetail = resolve))
      return HttpResponse.json(seriesDetail('series-1'))
    })
  )

  renderTab()
  await screen.findByText('Hjul 10 tommer')
  const dialog = await openExportDialog()
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))
  const cancelButton = dialog.getByRole('button', { name: 'Avbryt' })
  await waitFor(() => expect(cancelButton).toBeEnabled())
  fireEvent.click(cancelButton)
  releaseDetail()

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(exportRows).not.toHaveBeenCalled()
})
