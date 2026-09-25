import { MemoryRouter } from 'react-router-dom'

import { server } from 'mocks/server'
import { HttpResponse, delay, http } from 'msw'
import { SWRConfig } from 'swr'
import { useAuthStore } from 'utils/store/useAuthStore'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import IsoOversikt from './IsoOversikt'

const renderPage = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter>
        <IsoOversikt />
      </MemoryRouter>
    </SWRConfig>
  )

const openExtractView = () => {
  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
}

const loadExtractRows = async () => {
  openExtractView()
  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)
  await waitFor(() => expect(screen.getAllByText('18090301')).toHaveLength(2))
}

const isoCategoryV1 = (
  isoCode: string,
  isoLevel: number,
  isoTitle: string,
  extra: { isoText?: string; searchWords?: string[] } = {}
) => ({
  isoCode,
  isoLevel,
  isoTitle,
  isoTitleShort: null,
  isoText: extra.isoText ?? '',
  isoTextShort: '',
  isoTranslations: {},
  isActive: true,
  showTech: false,
  allowMulti: false,
  searchWords: extra.searchWords ?? [],
  created: '2026-01-01T00:00:00',
  updated: '2026-01-01T00:00:00',
})

const isoCategoriesV1 = [
  isoCategoryV1('04', 1, 'Personlig medisinsk behandling'),
  isoCategoryV1('0401', 2, 'Respirasjonsbehandling'),
  isoCategoryV1('040101', 3, 'Utstyr for respirasjonsbehandling'),
  isoCategoryV1('04010101', 4, 'Utgått kategori'),
  isoCategoryV1('040102', 3, 'Utstyr for oksygenbehandling'),
  isoCategoryV1('04010201', 4, 'Oksygenutstyr'),
  isoCategoryV1('05', 1, 'Hjelpemidler for trening'),
  isoCategoryV1('0503', 2, 'Kommunikasjon'),
  isoCategoryV1('050303', 3, 'Kommunikasjonshjelpemidler'),
  isoCategoryV1('05030301', 4, 'Kommunikasjonshjelpemiddel'),
  isoCategoryV1('18', 1, 'Utstyr for bevegelse'),
  isoCategoryV1('1809', 2, 'Ganghjelpemidler'),
  isoCategoryV1('180903', 3, 'Rollatorer'),
  isoCategoryV1('18090301', 4, 'Rollatorer med fire hjul', {
    isoText: 'Rollator med fire hjul og bremser',
    searchWords: ['rollator', 'gange'],
  }),
  isoCategoryV1('22030301', 4, 'Annen kategori'),
  isoCategoryV1('24', 1, 'Hjelpemidler for håndtering'),
  isoCategoryV1('2406', 2, 'Hjelpemidler for håndtering av gjenstander'),
  isoCategoryV1('240603', 3, 'Gripehjelpemidler'),
  isoCategoryV1('24060301', 4, 'Gripehjelpemiddel'),
]

const isoCategoryV22 = (
  isoCode: string,
  isoLevel: number,
  isoTitle: string,
  extra: { isoText?: string; searchWords?: string[] } = {}
) => ({
  isoCode,
  isoLevel,
  isoTitle,
  isoText: extra.isoText ?? '',
  isoTranslations: null,
  searchWords: extra.searchWords ?? [],
  created: '2026-01-01T00:00:00',
  updated: '2026-01-01T00:00:00',
})

const isoCategoriesV22 = [
  isoCategoryV22('18', 1, 'Utstyr for bevegelse (2022)'),
  isoCategoryV22('04', 1, 'Personlig medisinsk behandling (2022)'),
  isoCategoryV22('0401', 2, 'Respirasjonsbehandling (2022)'),
  isoCategoryV22('040102', 3, 'Utstyr for oksygenbehandling (2022)'),
  isoCategoryV22('04010201', 4, 'Oksygenutstyr (2022)'),
  isoCategoryV22('1809', 2, 'Ganghjelpemidler (2022)'),
  isoCategoryV22('180903', 3, 'Rollatorer (2022)'),
  isoCategoryV22('18090301', 4, 'Rollator med fire hjul (2022)', {
    isoText: 'Rullator med fire hjul, oppdatert forklaring',
    searchWords: ['rullator', 'gange', 'ny'],
  }),
  isoCategoryV22('22', 1, 'Kommunikasjon og informasjon (2022)'),
  isoCategoryV22('2209', 2, 'Kommunikasjon (2022)'),
  isoCategoryV22('220912', 3, 'Kommunikasjonshjelpemidler (2022)'),
  isoCategoryV22('24', 1, 'Hjelpemidler for håndtering (2022)'),
  isoCategoryV22('2406', 2, 'Hjelpemidler for håndtering av gjenstander (2022)'),
  isoCategoryV22('240603', 3, 'Gripehjelpemidler (2022)'),
  isoCategoryV22('24060302', 4, 'Nytt gripehjelpemiddel'),
  isoCategoryV22('30', 1, 'Nytt hovedområde'),
  isoCategoryV22('3001', 2, 'Ny klasse'),
  isoCategoryV22('300101', 3, 'Ny underklasse'),
  isoCategoryV22('30010101', 4, 'Ny inndeling'),
]

const isoMappings = [
  {
    id: 'map-0',
    code16: '04',
    code22: '04',
    mapEnum: ['SAME'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 1,
  },
  {
    id: 'map-1',
    code16: '18090301',
    code22: '99999999',
    mapEnum: ['SAME'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 4,
  },
  {
    id: 'map-2',
    code16: '24060301',
    code22: '24060302',
    mapEnum: ['CHANGED_CODE_SAME_HEADER', 'CHANGED_EXPLANATION'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 4,
  },
  {
    id: 'map-3',
    code16: '04010101',
    code22: '',
    mapEnum: ['DELETED_CLASS_OR_SUBCLASS_OR_SECTION'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 0,
  },
  {
    id: 'map-4',
    code16: null,
    code22: '30010101',
    mapEnum: ['NEW_CLASS_OR_SUBCLASS_OR_SECTION'],
    created: '2026-01-01T00:00:00',
    verified: true,
    level22: 4,
  },
  {
    id: 'map-5',
    code16: '05',
    code22: '',
    mapEnum: ['DELETED_CLASS_OR_SUBCLASS_OR_SECTION'],
    created: '2026-01-01T00:00:00',
    verified: false,
    level22: 0,
  },
  {
    id: 'map-6',
    code16: '0503',
    code22: '',
    mapEnum: ['DELETED_CLASS_OR_SUBCLASS_OR_SECTION'],
    created: '2026-01-01T00:00:00',
    verified: false,
    level22: 0,
  },
  {
    id: 'map-7',
    code16: '050303',
    code22: '220912',
    mapEnum: ['CHANGED_CODE_CHANGED_HEADER'],
    created: '2026-01-01T00:00:00',
    verified: false,
    level22: 3,
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
  isoCategory: isoCategoriesV1.find((category) => category.isoCode === '18090301'),
  isoCategory22: null,
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
  isoCategory: isoCategoriesV1.find((category) => category.isoCode === '22030301'),
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

const toIsoOverviewSeries = (series: typeof seriesWithBothIsoVersions | typeof seriesMissingIso22) => ({
  id: series.id,
  title: series.title,
  isoCategory: series.isoCategory?.isoCode ?? '',
  isoCategory22: null,
  variants: series.variants.map((variant) => ({
    id: variant.id,
    articleName: variant.articleName,
    supplierRef: variant.supplierRef,
    hmsArtNr: variant.hmsArtNr,
    agreements: variant.agreements,
  })),
})

let seriesDetailRequests = 0
let seriesListRequests = 0

beforeEach(() => {
  seriesDetailRequests = 0
  seriesListRequests = 0
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
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () => HttpResponse.json(isoMappings)),
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      seriesListRequests++
      const requestUrl = new URL(request.url)
      expect(requestUrl.searchParams.get('includeIsoOverview')).toBe('true')
      return HttpResponse.json({
        content: [toIsoOverviewSeries(seriesWithBothIsoVersions), toIsoOverviewSeries(seriesMissingIso22)],
        totalPages: 1,
        totalSize: 2,
      })
    }),
    http.get('http://localhost:8080/admreg/api/v1/series/s1', () => {
      seriesDetailRequests++
      return HttpResponse.json(seriesWithBothIsoVersions)
    }),
    http.get('http://localhost:8080/admreg/api/v1/series/s2', () => {
      seriesDetailRequests++
      return HttpResponse.json(seriesMissingIso22)
    })
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

test('viser mappet v22-kode når serien bare har v16-kode, og tom celle når kobling mangler', async () => {
  renderPage()

  await loadExtractRows()

  expect(screen.getByText('22030301')).toBeInTheDocument()

  const table = screen.getByRole('table')

  const rowAlfa = within(table).getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(rowAlfa).getAllByText('18090301')).toHaveLength(2)

  const rowAnnen = within(table).getByText('22030301').closest('tr') as HTMLElement
  expect(within(rowAnnen).getByText('22030301')).toBeInTheDocument()
  expect(within(rowAnnen).queryByText('18090301')).not.toBeInTheDocument()
  // 2 kall til liste-endepunktet er forventet: ett fra bakgrunns-prefetchen som starter automatisk
  // når admin-siden lastes (se IsoOversikt.tsx), og ett fra det eksplisitte "Hent liste"-klikket i
  // loadExtractRows() - ingen ekstra per-serie-detaljkall skal likevel utløses (includeIsoOverview).
  expect(seriesListRequests).toBe(2)
  expect(seriesDetailRequests).toBe(0)
})

test('kan veksle til variant-visning', async () => {
  renderPage()
  await loadExtractRows()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Variantnavn' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))

  await waitFor(() => expect(screen.getByText('Rollator Alfa variant')).toBeInTheDocument())
  expect(screen.getByText('Annen serie variant')).toBeInTheDocument()
})

test('sortering på antall varianter krasjer ikke ved bytte til variantvisning', async () => {
  renderPage()
  await loadExtractRows()

  fireEvent.click(screen.getByRole('button', { name: /Ant\. varianter, sorter stigende/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Variantnavn' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))

  await waitFor(() => expect(screen.getByText('Rollator Alfa variant')).toBeInTheDocument())
})

test('kan avbryte henting av produkt- og variantlisten', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', async () => {
      await delay(10_000)
      return HttpResponse.json({ content: [], totalPages: 1, totalSize: 0 })
    })
  )
  renderPage()
  openExtractView()

  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)

  const cancelButton = await screen.findByRole('button', { name: 'Avbryt' })
  fireEvent.click(cancelButton)

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Avbryt' })).not.toBeInTheDocument())
  expect(loadButton).toBeEnabled()
  expect(screen.queryByText('Klarte ikke å hente produkter og varianter')).not.toBeInTheDocument()
})

test('kan vise valgfrie v16- og v22-tittelkolonner via chips', async () => {
  renderPage()
  await loadExtractRows()

  expect(screen.queryByText('Rollatorer med fire hjul')).not.toBeInTheDocument()
  expect(screen.queryByText('Rollator med fire hjul (2022)')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v16 nivå 4 tittel' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v22 nivå 4 tittel' }))

  expect(screen.getByText('Rollatorer med fire hjul')).toBeInTheDocument()
  expect(screen.getByText('Rollator med fire hjul (2022)')).toBeInTheDocument()
})

test('kan vise valgfri v16- og v22-forklaring og søkeord', async () => {
  renderPage()
  await loadExtractRows()

  expect(screen.queryByText('Rollator med fire hjul og bremser')).not.toBeInTheDocument()
  expect(screen.queryByText('Rullator med fire hjul, oppdatert forklaring')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v16 forklaring' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v16 søkeord' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v22 forklaring' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v22 søkeord' }))

  expect(screen.getByText('Rollator med fire hjul og bremser')).toBeInTheDocument()
  expect(screen.getByText('rollator, gange')).toBeInTheDocument()
  expect(screen.getByText('Rullator med fire hjul, oppdatert forklaring')).toBeInTheDocument()
  expect(screen.getByText('rullator, gange, ny')).toBeInTheDocument()
})

test('kan skjule ISO-kodenivå 1 til 3 og beholder nivå 4 i begge visninger', async () => {
  renderPage()

  await waitFor(() => expect(screen.getAllByText('05').length).toBeGreaterThan(0))
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))

  for (const version of ['v16', 'v22']) {
    for (const level of [1, 2, 3]) {
      fireEvent.click(screen.getByRole('menuitemcheckbox', { name: `${version} nivå ${level} kode` }))
    }
  }

  expect(screen.queryByRole('columnheader', { name: /v16 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: /v22 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: /v16 - nivå 4/ })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'v22 - nivå 4' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitemcheckbox', { name: 'v16 nivå 4 kode' })).not.toBeInTheDocument()
  expect(screen.queryByRole('menuitemcheckbox', { name: 'v22 nivå 4 kode' })).not.toBeInTheDocument()

  await loadExtractRows()

  expect(screen.queryByRole('columnheader', { name: /v16 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: /v22 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: /v16 - nivå 4/ })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'v22 - nivå 4' })).toBeInTheDocument()
})

test('kan vise endringstype mellom v16 og v22', async () => {
  renderPage()
  await loadExtractRows()

  expect(screen.queryByText('= Ingenting er endret')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Endringstype og verifisering' }))

  const table = screen.getByRole('table')
  const rowAlfa = within(table).getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(rowAlfa).getByText('= Ingenting er endret')).toBeInTheDocument()
  expect(within(rowAlfa).getByText('Verifisert')).toBeInTheDocument()

  const rowAnnen = within(table).getByText('22030301').closest('tr') as HTMLElement
  expect(within(rowAnnen).getByText('Mangler kobling')).toBeInTheDocument()
})

test('viser ren ISO-mapping som standardvisning', async () => {
  renderPage()

  await waitFor(() => expect(screen.getAllByText('05').length).toBeGreaterThan(0))

  const table = screen.getByRole('table')
  const firstRow = table.querySelector('tbody tr') as HTMLElement
  expect(within(firstRow).getByText('04')).toBeInTheDocument()

  const sameRow = within(table).getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(sameRow).getAllByText('18090301')).toHaveLength(2)
  expect(within(sameRow).queryByText('99999999')).not.toBeInTheDocument()

  const inheritedSameRow = within(table).getAllByText('04010201')[0].closest('tr') as HTMLElement
  expect(within(inheritedSameRow).getAllByText('04010201')).toHaveLength(2)
  expect(within(inheritedSameRow).getByText('= Ingenting er endret')).toBeInTheDocument()

  const changedRow = screen.getByText('C Endret kode, samme overskrift').closest('tr') as HTMLElement
  expect(within(changedRow).getByText('24060301')).toBeInTheDocument()
  expect(within(changedRow).getByText('24060302')).toBeInTheDocument()
  expect(within(changedRow).getByText('* Endret forklaring')).toBeInTheDocument()
  expect(within(changedRow).getByText('Verifisert')).toBeInTheDocument()

  const unmappedRow = within(table).getByText('22030301').closest('tr') as HTMLElement
  expect(within(unmappedRow).getByText('Mangler kobling')).toBeInTheDocument()

  const deletedRow = within(table).getByText('04010101').closest('tr') as HTMLElement
  expect(within(deletedRow).getByText('X Slettet klasse, underklasse eller inndeling')).toBeInTheDocument()
  expect(within(deletedRow).getByText('04010101')).toBeInTheDocument()
  expect(within(deletedRow).queryByText('24060302')).not.toBeInTheDocument()

  const newRow = screen.getByText('! Ny klasse, underklasse eller inndeling').closest('tr') as HTMLElement
  expect(within(newRow).getByText('30010101')).toBeInTheDocument()

  const deleted05Row = Array.from(table.querySelectorAll('tbody tr')).find(
    (row) =>
      row.querySelector('td')?.textContent === '05' &&
      Array.from(row.querySelectorAll('td'))
        .slice(1, 4)
        .every((cell) => cell.textContent === '')
  ) as HTMLElement
  expect(within(deleted05Row).getByText('X Slettet klasse, underklasse eller inndeling')).toBeInTheDocument()
  expect(within(deleted05Row).getByText('Ikke verifisert')).toBeInTheDocument()

  expect(screen.queryByRole('button', { name: 'Hent liste' })).not.toBeInTheDocument()
})

test('viser valgt ISO-nivå først og undernivåene etterpå', async () => {
  renderPage()

  await waitFor(() => expect(screen.getAllByText('05').length).toBeGreaterThan(0))
  fireEvent.change(screen.getByLabelText('v16 nivå 1'), { target: { value: '05' } })

  const table = screen.getByRole('table')
  const rows = table.querySelectorAll('tbody tr')
  expect(within(rows[0] as HTMLElement).getByText('05')).toBeInTheDocument()
  expect(within(rows[0] as HTMLElement).getByText('X Slettet klasse, underklasse eller inndeling')).toBeInTheDocument()
  expect(within(rows[1] as HTMLElement).getByText('0503')).toBeInTheDocument()
  expect(within(rows[2] as HTMLElement).getByText('050303')).toBeInTheDocument()
  expect(within(rows[2] as HTMLElement).getByText('220912')).toBeInTheDocument()
  expect(within(rows[3] as HTMLElement).getByText('05030301')).toBeInTheDocument()
  expect(within(rows[3] as HTMLElement).getByText('220912')).toBeInTheDocument()
})

test('viser alle v16-kategorier når mappinglisten er tom', async () => {
  server.use(http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () => HttpResponse.json([])))

  renderPage()

  await waitFor(() => expect(screen.getByText('6 mapping-rader')).toBeInTheDocument())
  expect(screen.getByText('04010101')).toBeInTheDocument()
  expect(screen.getByText('04010201')).toBeInTheDocument()
  expect(screen.getByText('05030301')).toBeInTheDocument()
  expect(screen.getAllByText('18090301')).toHaveLength(1)
  expect(screen.getByText('22030301')).toBeInTheDocument()
  expect(screen.getByText('24060301')).toBeInTheDocument()
  expect(screen.getAllByText('Mangler kobling')).toHaveLength(6)
  expect(screen.getByLabelText('Rader per side')).toBeInTheDocument()
})

test('skiller mellom manglende mapping og feil ved henting av mappinger', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json({ message: 'boom' }, { status: 500 })
    )
  )

  renderPage()
  await screen.findByText('Klarte ikke å hente mapping-status mellom v16 og v22.')

  const table = screen.getByRole('table')
  const row = within(table).getByText('04010101').closest('tr') as HTMLElement
  expect(within(row).getAllByText('Ikke tilgjengelig')).toHaveLength(2)
})

test('skjuler UUID-leverandorreferanser og viser alle aktive avtaler i variantvisning', async () => {
  const supplierRefUuid = '11111111-2222-3333-4444-555555555555'
  const agreements = [
    { id: 'agr-2', reference: 'A2', rank: 2, postNr: 20, status: 'ACTIVE' },
    { id: 'agr-1', reference: 'A1', rank: 1, postNr: 10, status: 'ACTIVE' },
    { id: 'agr-3', reference: 'A3', rank: 3, postNr: 30, status: 'INACTIVE' },
  ]

  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', () =>
      HttpResponse.json({
        content: [
          {
            id: 's-special',
            title: 'Spesiell serie',
            isoCategory: '18090301',
            isoCategory22: null,
            variants: [
              {
                id: 'v-special',
                articleName: 'Spesiell variant',
                supplierRef: supplierRefUuid,
                hmsArtNr: '333333',
                agreements,
              },
            ],
          },
        ],
        totalPages: 1,
        totalSize: 1,
      })
    )
  )

  renderPage()
  openExtractView()

  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)

  await waitFor(() => expect(screen.getAllByText('18090301').length).toBeGreaterThan(0))

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Variantnavn' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Avtaleinfo' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))

  await waitFor(() => expect(screen.getByText('Spesiell variant')).toBeInTheDocument())
  expect(screen.getByText('A1, A2')).toBeInTheDocument()
  expect(screen.queryByText('A3')).not.toBeInTheDocument()
  expect(screen.queryByText(supplierRefUuid)).not.toBeInTheDocument()
})

// Regression-test for backend-cachen i Iso22Service.retrieveAll() (hm-grunndata-register), som kun
// lastes inn på nytt ved appstart - GET /admreg/api/v22/isocategories vil derfor IKKE inneholde den
// nyopprettede nivå 4-kategorien rett etter opprettelse. Testen simulerer nettopp dette ved å la
// mocken for det endepunktet fortsatt returnere den GAMLE listen (uten den nye kategorien) etter at
// opprettelses-kallet er utført, og verifiserer at hovedtabellen likevel viser den nye v22-koden med
// en gang - dvs. at IsoOversikt.tsx sin lokale cache-sammenslåing (mutateIsoCategories22 med
// revalidate: false) fungerer som forventet.
test('viser ny ISO v22 nivå 4-kategori i tabellen umiddelbart etter opprettelse, selv om backend-cachen er utdatert', async () => {
  let createdCategoryPayload: { isoCode: string; isoTitle: string } | null = null
  let updatedMapPayload: { code22?: string; level22?: number } | null = null

  server.use(
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', async ({ request }) => {
      const body = (await request.json()) as { isoCode: string; isoTitle: string }
      createdCategoryPayload = body
      return HttpResponse.json(body, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/map-7', async ({ request }) => {
      const body = (await request.json()) as { isoMap: { code22?: string; level22?: number } }
      updatedMapPayload = body.isoMap
      return HttpResponse.json({ ...isoMappings[7], ...body.isoMap })
    })
  )

  renderPage()

  await waitFor(() => expect(screen.getAllByText('05').length).toBeGreaterThan(0))

  // Bytt til "Endre"-modus for å få frem Aksjon-kolonnen.
  fireEvent.click(screen.getByRole('checkbox'))

  // Mapping-raden for v16-kode 050303 -> v22-kode 220912 (nivå 3, ikke verifisert) mangler nivå
  // 4 under v22 og kvalifiserer derfor for "Opprett ny ISO v22-kategori".
  const targetRow = screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement
  fireEvent.click(within(targetRow).getByRole('button', { name: 'Rad-meny' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Opprett ny ISO v22-kategori (nivå 4)' }))

  const suffixField = screen.getByLabelText('Siste 2 siffer')
  fireEvent.change(suffixField, { target: { value: '01' } })
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Ny nasjonal kategori' } })

  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' }))

  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Opprett kategori og koble til mapping' })).not.toBeInTheDocument()
  )

  expect(createdCategoryPayload).toEqual(
    expect.objectContaining({ isoCode: '22091201', isoTitle: 'Ny nasjonal kategori' })
  )
  expect(updatedMapPayload).toEqual(expect.objectContaining({ code22: '22091201', level22: 4 }))

  // Selv om GET /admreg/api/v22/isocategories fortsatt (via beforeEach-mocken) returnerer den GAMLE
  // listen uten "22091201", skal hovedtabellen likevel vise den nye koden - bevis på at
  // handleCreateIso22Category sin lokale SWR-cache-sammenslåing (revalidate: false) fungerer.
  expect(screen.getAllByText('22091201').length).toBeGreaterThan(0)
})
