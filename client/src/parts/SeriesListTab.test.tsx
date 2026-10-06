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

const series = (id: string, title: string) => ({
  id,
  title,
  status: 'DONE',
  isExpired: false,
  isPublished: true,
  variantCount: 1,
  updated: '2024-05-24T09:54:25.595163',
  updatedByUser: 'system',
})

const part = (id: string, articleName: string, accessory = false) => ({
  id,
  seriesUUID: `${id}-series`,
  hmsArtNr: `hms-${id}`,
  supplierRef: `lev-${id}`,
  articleName,
  accessory,
  sparePart: !accessory,
  created: '2024-05-24T09:54:25.595163',
  isExpired: false,
  isPublished: true,
  agreements: [],
  productData: { techData: [], attributes: {} },
})

const renderTab = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={['/deler?tab=serier']}>
        <Parts />
      </MemoryRouter>
    </SWRConfig>
  )

afterEach(() => {
  useAuthStore.setState({ loggedInUser: undefined })
  vi.mocked(exportRows).mockClear()
})

const mockSeriesSearch = () =>
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', () =>
      HttpResponse.json({
        content: [series('s1', 'Rullestol A'), series('s2', 'Rullestol B')],
        totalSize: 2,
        totalPages: 1,
      })
    )
  )

test('viser eksporterknappen kun for admin', async () => {
  mockSeriesSearch()

  useAuthStore.setState({ loggedInUser: hmsUser })
  const { unmount } = renderTab()
  await screen.findByText('Rullestol A')
  expect(screen.queryByRole('button', { name: 'Eksporter' })).not.toBeInTheDocument()
  unmount()

  useAuthStore.setState({ loggedInUser: adminUser })
  renderTab()
  await screen.findByText('Rullestol A')
  expect(await screen.findByRole('button', { name: 'Eksporter' })).toBeInTheDocument()
})

test('eksporterer én rad per produktserie og del', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  mockSeriesSearch()
  server.use(
    http.get('http://localhost:8080/admreg/common/api/v1/part/series/s1', () =>
      HttpResponse.json([part('p1', 'Hjul'), part('p2', 'Armlene', true)])
    ),
    http.get('http://localhost:8080/admreg/common/api/v1/part/series/s2', () =>
      HttpResponse.json([part('p3', 'Brems')])
    )
  )

  renderTab()
  await screen.findByText('Rullestol A')
  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows, , fileName] = vi.mocked(exportRows).mock.calls[0]
  expect(fileName).toBe(`deler-per-serie_side-1_${todayIso()}`)
  expect(rows).toEqual([
    { Produktserie: 'Rullestol A', Del: 'Hjul', 'Lev-artnr': 'lev-p1', 'HMS-nr.': 'hms-p1', Type: 'Reservedel' },
    { Produktserie: 'Rullestol A', Del: 'Armlene', 'Lev-artnr': 'lev-p2', 'HMS-nr.': 'hms-p2', Type: 'Tilbehør' },
    { Produktserie: 'Rullestol B', Del: 'Brems', 'Lev-artnr': 'lev-p3', 'HMS-nr.': 'hms-p3', Type: 'Reservedel' },
  ])
})

test('sperrer «Alle treff» når antall produktserier gir over 3 000 kall', async () => {
  useAuthStore.setState({ loggedInUser: adminUser })
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', () =>
      HttpResponse.json({ content: [series('s1', 'Rullestol A')], totalSize: 3500, totalPages: 3500 })
    )
  )

  renderTab()
  await screen.findByText('Rullestol A')
  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  expect(dialog.getByRole('button', { name: 'Eksporter' })).toBeEnabled()
  fireEvent.click(dialog.getByRole('radio', { name: 'Alle treff' }))

  expect(await dialog.findByText(/For stor eksport/)).toBeInTheDocument()
  expect(dialog.getByRole('button', { name: 'Eksporter' })).toBeDisabled()
})
