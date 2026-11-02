import { MemoryRouter } from 'react-router-dom'

import { draftNewPart } from 'api/PartApi'
import { apiPath } from 'mocks/apiPath'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import CreatePart from 'parts/CreatePart'
import { FlagProvider } from 'toggles/context'
import { useAuthStore } from 'utils/store/useAuthStore'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

vi.mock('api/PartApi', () => ({
  draftNewPart: vi.fn(),
}))

const adminUser = {
  userId: 'admin-id',
  userName: 'Administrator',
  isAdmin: true,
  isHmsUser: false,
  isAdminOrHmsUser: true,
  isSupplier: false,
  exp: '',
  supplierName: '',
  supplierId: '',
}

beforeEach(() => {
  server.use(
    http.get(apiPath('api/v1/isocategories'), () =>
      HttpResponse.json([
        {
          isoCode: '123496',
          isoTitle: 'Testkategori',
          isoText: '',
          isoTextShort: '',
          isoLevel: 4,
          isActive: true,
          showTech: true,
          allowMulti: false,
          created: '2024-01-01T00:00:00',
          updated: '2024-01-01T00:00:00',
          searchWords: [],
        },
      ])
    ),
    http.get(apiPath('admin/api/v1/supplier/registrations'), () =>
      HttpResponse.json({
        content: [
          {
            id: 'supplier-id',
            status: 'ACTIVE',
            name: 'Testleverandør',
            supplierData: {},
            identifier: 'testleverandor',
            created: '2024-01-01T00:00:00',
            updated: '2024-01-01T00:00:00',
            createdBy: 'system',
            updatedBy: 'system',
            updatedByUser: 'system',
            createdByUser: 'system',
          },
        ],
        totalSize: 1,
        totalPages: 1,
      })
    )
  )
  useAuthStore.setState({ loggedInUser: adminUser })
  vi.mocked(draftNewPart).mockReset()
})

afterEach(() => {
  server.resetHandlers()
  useAuthStore.setState({ loggedInUser: undefined })
})

test('admin labels have no asterisks while HMS number and supplier remain required', async () => {
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter>
        <FlagProvider toggles={[{ name: 'finnhjelpemiddel.iso22', enabled: false }]}>
          <CreatePart />
        </FlagProvider>
      </MemoryRouter>
    </SWRConfig>
  )

  const hmsNr = await screen.findByRole('textbox', { name: 'Hms-nr' })
  expect(screen.getByRole('combobox', { name: 'Leverandør' })).toBeInTheDocument()
  expect(screen.queryAllByText('*', { exact: true })).toHaveLength(0)

  fireEvent.change(screen.getByRole('textbox', { name: 'Delens navn' }), { target: { value: 'Testdel' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Lev-artnr' }), { target: { value: 'LEV-1' } })

  const isoCategory = screen.getByRole('combobox', { name: 'ISO-kategori' })
  fireEvent.click(isoCategory)
  fireEvent.pointerUp(await screen.findByRole('option', { name: 'Testkategori - 123496' }))

  fireEvent.click(screen.getByRole('button', { name: 'Opprett' }))
  expect(await screen.findByText('Du må skrive inn HMS-nr')).toBeInTheDocument()
  expect(screen.queryByText('Leverandør-ID kunne ikke bestemmes')).not.toBeInTheDocument()
  expect(draftNewPart).not.toHaveBeenCalled()

  fireEvent.focus(hmsNr)
  fireEvent.change(hmsNr, { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Opprett' }))

  await waitFor(() => expect(screen.getByText('Leverandør-ID kunne ikke bestemmes')).toBeInTheDocument())
  expect(draftNewPart).not.toHaveBeenCalled()
})
