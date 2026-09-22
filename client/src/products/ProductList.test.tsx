import { MemoryRouter } from 'react-router-dom'

import { axe } from 'jest-axe'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, expect, test, vi } from 'vitest'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { todayIso } from 'utils/export/exportUtils'
import { useAuthStore } from 'utils/store/useAuthStore'

import ProductListWrapper from './ProductListWrapper'

vi.mock('utils/export/exportUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/export/exportUtils')>()
  return { ...actual, exportRows: vi.fn() }
})
import { exportRows } from 'utils/export/exportUtils'

const dummyProduct = (title: string, editStatus: string = 'EDITABLE', id: string = uuidv4()) => {
  return {
    id,
    title: title,
    status: editStatus,
    isExpired: false,
    isPublished: false,
    variantCount: 23,
    updated: '2024-05-24T09:54:25.595163',
    updatedByUser: 'system',
  }
}

const supplierLoggedInUser = {
  isAdmin: false,
  isHmsUser: true,
  isAdminOrHmsUser: true,
  isSupplier: true,
  userId: 'user-id',
  supplierId: 'supplier-id',
  userName: 'Testbruker',
  supplierName: 'Leverandøren AS',
  exp: undefined,
}

const hmsLoggedInUser = {
  isAdmin: false,
  isHmsUser: true,
  isAdminOrHmsUser: true,
  isSupplier: false,
  userId: 'hms-user-id',
  supplierId: undefined,
  userName: 'HMS-bruker',
  supplierName: undefined,
  exp: undefined,
}

const adminLoggedInUser = {
  isAdmin: true,
  isHmsUser: false,
  isAdminOrHmsUser: true,
  isSupplier: false,
  userId: 'admin-id',
  supplierId: undefined,
  userName: 'Adminbruker',
  supplierName: undefined,
  exp: undefined,
}

afterEach(() => {
  useAuthStore.setState({ loggedInUser: undefined })
  vi.mocked(exportRows).mockClear()
})

const mockProductSearch = (content: ReturnType<typeof dummyProduct>[]) => {
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, () =>
      HttpResponse.json({
        content,
        totalSize: content.length,
        totalPages: 1,
      })
    )
  )
}

const dummyVariant = (
  hmsArtNr: string,
  agreements: { status: string; rank?: number; postNr?: number; postTitle?: string; reference?: string; title?: string }[] = []
) => ({
  id: uuidv4(),
  hmsArtNr,
  supplierRef: 'supplier-ref',
  articleName: `Variant ${hmsArtNr}`,
  isExpired: false,
  isPublished: true,
  agreements,
})

test('Flere produkter', async () => {
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, (info) => {
      return HttpResponse.json({
        content: [
          dummyProduct('p1', 'EDITABLE'),
          dummyProduct('p2', 'PENDING_APPROVAL'),
          dummyProduct('p3', 'REJECTED'),
          dummyProduct('p4', 'DONE'),
        ],
        pageable: {
          number: 0,
          sort: {
            orderBy: [
              {
                property: 'created',
                direction: 'DESC',
                ignoreCase: false,
                ascending: false,
              },
            ],
          },
          size: 10,
        },
        totalSize: 3,
        totalPages: 1,
        empty: false,
        size: 10,
        offset: 0,
        pageNumber: 0,
        numberOfElements: 3,
      })
    })
  )

  const { container } = render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  )

  expect(await screen.findAllByRole('listitem')).toHaveLength(7)

  expect(await screen.findByRole('link', { name: /p1/ })).toHaveTextContent(/23/) //antall varianter
  expect(await screen.findByRole('link', { name: /Under endring/ }))
  expect(await screen.findByRole('link', { name: /Avslått/ }))
  expect(await screen.findByRole('link', { name: /Venter på godkjenning/ }))
  expect(await screen.findByRole('link', { name: /Publisert/ }))

  expect(await axe(container)).toHaveNoViolations()
})

test('viser eksporterknappen kun for admin, ikke leverandør eller HMS-bruker', async () => {
  mockProductSearch([dummyProduct('p1')])

  useAuthStore.setState({ loggedInUser: supplierLoggedInUser })
  const { unmount: unmountSupplier } = render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  )
  await screen.findByText('p1')
  expect(screen.queryByRole('button', { name: 'Eksporter' })).not.toBeInTheDocument()
  unmountSupplier()

  useAuthStore.setState({ loggedInUser: hmsLoggedInUser })
  const { unmount: unmountHms } = render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  )
  await screen.findByText('p1')
  expect(screen.queryByRole('button', { name: 'Eksporter' })).not.toBeInTheDocument()
  unmountHms()

  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  render(
    <MemoryRouter>
      <ProductListWrapper />
    </MemoryRouter>
  )
  await screen.findByText('p1')
  expect(await screen.findByRole('button', { name: 'Eksporter' })).toBeInTheDocument()
})

test('viser fullkatalogvarsel for "Alle treff" når filters-parameteret er tomt', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  mockProductSearch([dummyProduct('p1')])

  render(
    <MemoryRouter initialEntries={['/produkter?filters=']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Alle treff' }))

  expect(await screen.findByText('Ingen filtre er satt – hele katalogen eksporteres.')).toBeInTheDocument()
})

test('viser ikke fullkatalogvarsel når et statusfilter er aktivt', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  mockProductSearch([dummyProduct('p1')])

  render(
    <MemoryRouter initialEntries={['/produkter?filters=EDITABLE']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Alle treff' }))

  await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  expect(screen.queryByText('Ingen filtre er satt – hele katalogen eksporteres.')).not.toBeInTheDocument()
})

test('henter leverandørnavn på produktnivå fra batchet detaljkall (SeriesDTO)', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () =>
      HttpResponse.json({
        id: productId,
        title: 'p1',
        supplierName: 'Leverandør fra detaljkall AS',
        updated: '2024-05-24T09:54:25.595163',
        updatedByUser: 'system',
        variants: [],
      })
    )
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-produktniva-leverandornavn']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Leverandørnavn' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows[0]['Leverandørnavn']).toBe('Leverandør fra detaljkall AS')
})

test('hopper over detaljkall på produktnivå når leverandørnavn ikke er valgt', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  const detailCallSpy = vi.fn()
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () => {
      detailCallSpy()
      return HttpResponse.json({
        id: productId,
        title: 'p1',
        supplierName: 'Leverandør fra detaljkall AS',
        updated: '2024-05-24T09:54:25.595163',
        updatedByUser: 'system',
        variants: [],
      })
    })
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-uten-leverandornavn']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  // Leverandørnavn is not part of the product-level default field selection, so leave it unchecked.
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows[0]['Produktnavn']).toBe('p1')
  expect(Object.keys(rows[0])).not.toContain('Leverandørnavn')
  expect(detailCallSpy).not.toHaveBeenCalled()
})

test('stopper eksporten og viser feil hvis et detaljkall for produkter feiler', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () => new HttpResponse(null, { status: 500 }))
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-feilet-produktdetaljkall']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  // Select Leverandørnavn so the (now conditional) detail fetch is exercised at product level.
  fireEvent.click(dialog.getByRole('checkbox', { name: 'Leverandørnavn' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  expect(await dialog.findByText('Eksport feilet')).toBeInTheDocument()
  expect(exportRows).not.toHaveBeenCalled()
})

test('stopper eksporten og viser feil hvis et detaljkall for varianter feiler', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () => new HttpResponse(null, { status: 500 }))
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-feilet-detaljkall']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('radio', { name: 'Variant' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  expect(await dialog.findByText('Eksport feilet')).toBeInTheDocument()
  expect(exportRows).not.toHaveBeenCalled()
})

test('eksporterer én aktiv avtale kun i kolonnesett 1', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () =>
      HttpResponse.json({
        id: productId,
        title: 'p1',
        supplierName: 'Leverandør AS',
        updated: '2024-05-24T09:54:25.595163',
        updatedByUser: 'system',
        variants: [
          dummyVariant('hms-1', [
            { status: 'ACTIVE', rank: 5, postNr: 10, postTitle: 'Post A', reference: 'ref-A', title: 'Avtale A' },
          ]),
        ],
      })
    )
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-enkelt-avtale']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('radio', { name: 'Variant' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows).toHaveLength(1)
  expect(rows[0]['Rangering 1']).toBe(5)
  expect(rows[0]['Delkontrakt 1']).toBe('Post A')
  expect(rows[0]['Delkontraktnr 1']).toBe(10)
  expect(rows[0]['Anbudsnr 1']).toBe('ref-A')
  expect(rows[0]['Avtaletittel 1']).toBe('Avtale A')
  expect(Object.keys(rows[0])).not.toContain('Rangering 2')
})

test('sorterer flere aktive avtaler etter rangering og fyller ubrukte kolonnesett med tomme verdier', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () =>
      HttpResponse.json({
        id: productId,
        title: 'p1',
        supplierName: 'Leverandør AS',
        updated: '2024-05-24T09:54:25.595163',
        updatedByUser: 'system',
        variants: [
          dummyVariant('hms-1', [
            { status: 'ACTIVE', rank: 5, postNr: 5, postTitle: 'Post 5', reference: 'ref-5', title: 'Avtale 5' },
            { status: 'ACTIVE', rank: 1, postNr: 1, postTitle: 'Post 1', reference: 'ref-1', title: 'Avtale 1' },
            { status: 'INACTIVE', rank: 3, postNr: 3, postTitle: 'Post 3', reference: 'ref-3', title: 'Avtale 3' },
          ]),
          dummyVariant('hms-2', [
            { status: 'ACTIVE', rank: 9, postNr: 9, postTitle: 'Post 9', reference: 'ref-9', title: 'Avtale 9' },
          ]),
        ],
      })
    )
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-sortering-avtaler']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('radio', { name: 'Variant' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]
  expect(rows).toHaveLength(2)

  // variant "hms-1" has two active agreements (rank 5 and 1) sorted ascending into slot 1 / slot 2
  expect(rows[0]['Rangering 1']).toBe(1)
  expect(rows[0]['Delkontrakt 1']).toBe('Post 1')
  expect(rows[0]['Rangering 2']).toBe(5)
  expect(rows[0]['Delkontrakt 2']).toBe('Post 5')

  // variant "hms-2" has a single active agreement, so slot 2 is blank rather than duplicated/dropped
  expect(rows[1]['Rangering 1']).toBe(9)
  expect(rows[1]['Rangering 2']).toBe('')
  expect(rows[1]['Delkontrakt 2']).toBe('')
})

test('beregner maxAgreementCount som høyeste antall aktive avtaler i eksportbatchen', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  const productId = uuidv4()
  mockProductSearch([dummyProduct('p1', 'EDITABLE', productId)])
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series/${productId}`, () =>
      HttpResponse.json({
        id: productId,
        title: 'p1',
        supplierName: 'Leverandør AS',
        updated: '2024-05-24T09:54:25.595163',
        updatedByUser: 'system',
        variants: [
          dummyVariant('hms-1', [
            { status: 'ACTIVE', rank: 1, postNr: 1, postTitle: 'Post 1', reference: 'ref-1', title: 'Avtale 1' },
            { status: 'ACTIVE', rank: 2, postNr: 2, postTitle: 'Post 2', reference: 'ref-2', title: 'Avtale 2' },
          ]),
          dummyVariant('hms-2', [
            { status: 'ACTIVE', rank: 1, postNr: 1, postTitle: 'Post 1', reference: 'ref-1', title: 'Avtale 1' },
          ]),
        ],
      })
    )
  )

  render(
    <MemoryRouter initialEntries={['/produkter?supplier=cache-key-maxagreementcount']}>
      <ProductListWrapper />
    </MemoryRouter>
  )

  await screen.findByText('p1')

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))
  const dialog = within(await screen.findByRole('dialog'))
  fireEvent.click(dialog.getByRole('radio', { name: 'Variant' }))
  fireEvent.click(dialog.getByRole('button', { name: 'Eksporter' }))

  await waitFor(() => expect(exportRows).toHaveBeenCalledTimes(1))
  const [rows] = vi.mocked(exportRows).mock.calls[0]

  // Batch-wide max is 2 (from "hms-1"), so both rows get slot-1/slot-2 columns but no slot-3 columns.
  rows.forEach((row) => {
    expect(Object.keys(row)).toContain('Rangering 1')
    expect(Object.keys(row)).toContain('Rangering 2')
    expect(Object.keys(row)).not.toContain('Rangering 3')
  })
})

test('oppdaterer standardfilnavnet fra filtre og valg i eksportmodalen', async () => {
  useAuthStore.setState({ loggedInUser: adminLoggedInUser })
  server.use(
    http.get(`http://localhost:8080/admreg/api/v1/series`, () =>
      HttpResponse.json({
        content: [dummyProduct('p1')],
        totalSize: 1,
        totalPages: 1,
      })
    )
  )

  render(
    <MemoryRouter
      initialEntries={[
        '/produkter?q=rullestol&sort=updated%2CDESC&filters=&inAgreement=false&missingMediaType=VIDEO',
      ]}
    >
      <ProductListWrapper />
    </MemoryRouter>
  )

  fireEvent.click(await screen.findByRole('button', { name: 'Eksporter' }))

  const fileName = await screen.findByRole('textbox', { name: 'Filnavn' })
  expect(fileName).toHaveValue(`produkter_rullestol_uten-avtale_mangler-video_side-1_${todayIso()}`)

  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))
  expect(fileName).toHaveValue(`varianter_rullestol_uten-avtale_mangler-video_side-1_${todayIso()}`)

  fireEvent.click(screen.getByRole('radio', { name: 'Alle treff' }))
  expect(fileName).toHaveValue(`varianter_rullestol_uten-avtale_mangler-video_alle-treff_${todayIso()}`)

  fireEvent.change(fileName, { target: { value: 'mitt filnavn' } })
  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
  expect(fileName).toHaveValue('mitt filnavn')
})
