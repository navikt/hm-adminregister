import { MemoryRouter } from 'react-router-dom'

import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { useAuthStore } from 'utils/store/useAuthStore'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import IsoOversikt from './IsoOversikt'

const renderPage = () =>
  render(
    <MemoryRouter>
      <IsoOversikt />
    </MemoryRouter>
  )

const isoCategoryV1 = (isoCode: string, isoLevel: number, isoTitle: string) => ({
  isoCode,
  isoLevel,
  isoTitle,
  isoTitleShort: null,
  isoText: '',
  isoTextShort: '',
  isoTranslations: {},
  isActive: true,
  showTech: false,
  allowMulti: false,
  searchWords: [],
  created: '2026-01-01T00:00:00',
  updated: '2026-01-01T00:00:00',
})

const isoCategoriesV1 = [
  isoCategoryV1('18', 1, 'Utstyr for bevegelse'),
  isoCategoryV1('1809', 2, 'Ganghjelpemidler'),
  isoCategoryV1('180903', 3, 'Rollatorer'),
  isoCategoryV1('18090301', 4, 'Rollatorer med fire hjul'),
  isoCategoryV1('22030301', 4, 'Annen kategori'),
]

const isoCategoryV22 = (isoCode: string, isoLevel: number, isoTitle: string) => ({
  isoCode,
  isoLevel,
  isoTitle,
  isoText: '',
  isoTranslations: null,
  searchWords: [],
  created: '2026-01-01T00:00:00',
  updated: '2026-01-01T00:00:00',
})

const isoCategoriesV22 = [
  isoCategoryV22('A', 1, 'Bevegelse (2022)'),
  isoCategoryV22('A1', 2, 'Gange (2022)'),
  isoCategoryV22('A12', 3, 'Rollatorer (2022)'),
  isoCategoryV22('A123', 4, 'Rollator med fire hjul (2022)'),
]

const isoMappings = [
  {
    id: 'map-1',
    code16: '18090301',
    code22: 'A123',
    mapEnum: ['SAME'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 4,
  },
]

const seriesBase = {
  supplierName: 'Leverandør A',
  text: '',
  message: null,
  status: 'DONE',
  seriesData: { media: [], attributes: {} },
  created: '2026-01-01T00:00:00',
  updated: '2026-01-01T00:00:00',
  published: '2026-01-01T00:00:00',
  expired: '2030-01-01T00:00:00',
  updatedByUser: 'admin',
  createdByUser: 'admin',
  version: 1,
  isExpired: false,
  isPublished: true,
  inAgreement: false,
  agreements: [],
  hmdbId: null,
}

const seriesWithBothIsoVersions = {
  ...seriesBase,
  id: 's1',
  title: 'Rollator Alfa',
  isoCategory: isoCategoriesV1[3],
  isoCategory22: isoCategoriesV22[3],
  variants: [
    {
      id: 'v1',
      supplierRef: 'REF1',
      articleName: 'Rollator Alfa variant',
      accessory: false,
      sparePart: false,
      created: '2026-01-01T00:00:00',
      hmsArtNr: '111111',
      productData: { techData: [], media: [] },
      agreements: [],
      isExpired: false,
      isPublished: true,
    },
  ],
}

const seriesMissingIso22 = {
  ...seriesBase,
  id: 's2',
  title: 'Annen serie',
  isoCategory: isoCategoriesV1[4],
  isoCategory22: null,
  variants: [
    {
      id: 'v2',
      supplierRef: 'REF2',
      articleName: 'Annen serie variant',
      accessory: false,
      sparePart: false,
      created: '2026-01-01T00:00:00',
      hmsArtNr: '222222',
      productData: { techData: [], media: [] },
      agreements: [],
      isExpired: false,
      isPublished: true,
    },
  ],
}

beforeEach(() => {
  useAuthStore.getState().setLoggedInUser({
    isAdmin: true,
    isHmsUser: false,
    isAdminOrHmsUser: true,
    isSupplier: false,
    userId: 'admin',
    supplierId: undefined,
    userName: 'Admin',
    supplierName: undefined,
    exp: undefined,
  })

  server.use(
    http.get('http://localhost:8080/admreg/api/v1/isocategories', () => HttpResponse.json(isoCategoriesV1)),
    http.get('http://localhost:8080/admreg/api/v22/isocategories', () => HttpResponse.json(isoCategoriesV22)),
    http.get('http://localhost:8080/admreg/api/v22/isomap', () => HttpResponse.json(isoMappings)),
    http.get('http://localhost:8080/admreg/api/v1/series', () =>
      HttpResponse.json({
        content: [{ id: 's1' }, { id: 's2' }],
        totalPages: 1,
        totalSize: 2,
      })
    ),
    http.get('http://localhost:8080/admreg/api/v1/series/s1', () => HttpResponse.json(seriesWithBothIsoVersions)),
    http.get('http://localhost:8080/admreg/api/v1/series/s2', () => HttpResponse.json(seriesMissingIso22))
  )
})

afterEach(() => {
  useAuthStore.getState().clearLoggedInState()
})

test('viser advarsel når bruker ikke er admin', () => {
  useAuthStore.getState().clearLoggedInState()
  renderPage()
  expect(screen.getByText('Du må være admin for å se denne siden.')).toBeInTheDocument()
})

test('viser produkter med både ISO 2016- og 2022-kolonner, tom celle når 2022-kobling mangler', async () => {
  renderPage()

  fireEvent.click(screen.getByRole('button', { name: 'Hent liste' }))

  await waitFor(() => expect(screen.getByText('Rollator Alfa')).toBeInTheDocument())
  expect(screen.getByText('Annen serie')).toBeInTheDocument()

  const table = screen.getByRole('table')

  const rowAlfa = within(table).getByText('Rollator Alfa').closest('tr') as HTMLElement
  // ISO 2016 leaf code and ISO 2022 leaf code are both shown for a fully-migrated row.
  expect(within(rowAlfa).getByText('18090301')).toBeInTheDocument()
  expect(within(rowAlfa).getByText('A123')).toBeInTheDocument()

  const rowAnnen = within(table).getByText('Annen serie').closest('tr') as HTMLElement
  // ISO 2016 leaf code is present, but ISO 2022 columns stay empty since isoCategory22 is null.
  expect(within(rowAnnen).getByText('22030301')).toBeInTheDocument()
  expect(within(rowAnnen).queryByText('A123')).not.toBeInTheDocument()
})

test('kan veksle til variant-visning', async () => {
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: 'Hent liste' }))
  await waitFor(() => expect(screen.getByText('Rollator Alfa')).toBeInTheDocument())

  fireEvent.click(screen.getByRole('radio', { name: 'Varianter' }))

  await waitFor(() => expect(screen.getByText('Rollator Alfa variant')).toBeInTheDocument())
  expect(screen.getByText('Annen serie variant')).toBeInTheDocument()
})

test('kan vise valgfrie ISO 2016- og 2022-tittelkolonner via chips', async () => {
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: 'Hent liste' }))
  await waitFor(() => expect(screen.getByText('Rollator Alfa')).toBeInTheDocument())

  expect(screen.queryByText('Rollatorer med fire hjul')).not.toBeInTheDocument()
  expect(screen.queryByText('Rollator med fire hjul (2022)')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'ISO 2016 nivå 4 tittel' }))
  fireEvent.click(screen.getByRole('button', { name: 'ISO 2022 nivå 4 tittel' }))

  expect(screen.getByText('Rollatorer med fire hjul')).toBeInTheDocument()
  expect(screen.getByText('Rollator med fire hjul (2022)')).toBeInTheDocument()
})

test('kan vise mapping-status mellom ISO 2016 og 2022', async () => {
  renderPage()
  fireEvent.click(screen.getByRole('button', { name: 'Hent liste' }))
  await waitFor(() => expect(screen.getByText('Rollator Alfa')).toBeInTheDocument())

  expect(screen.queryByText('Verifisert')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis mapping-status (2016 → 2022)' }))

  const table = screen.getByRole('table')
  const rowAlfa = within(table).getByText('Rollator Alfa').closest('tr') as HTMLElement
  expect(within(rowAlfa).getByText('Verifisert')).toBeInTheDocument()

  const rowAnnen = within(table).getByText('Annen serie').closest('tr') as HTMLElement
  expect(within(rowAnnen).getByText('Mangler kobling')).toBeInTheDocument()
})
