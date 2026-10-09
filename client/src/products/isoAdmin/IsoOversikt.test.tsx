import { MemoryRouter } from 'react-router-dom'

import { server } from 'mocks/server'
import { HttpResponse, delay, http } from 'msw'
import { SWRConfig, useSWRConfig } from 'swr'
import { useAuthStore } from 'utils/store/useAuthStore'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import IsoOversikt from './IsoOversikt'

const RevalidateCategories = () => {
  const { mutate } = useSWRConfig()
  return (
    <button onClick={() => void mutate('http://localhost:8080/admreg/api/v22/isocategories')}>
      Refresh categories
    </button>
  )
}

const renderPage = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter>
        <IsoOversikt />
        <RevalidateCategories />
      </MemoryRouter>
    </SWRConfig>
  )

const openExtractView = () => {
  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
}

const showMappingParentColumns = () => {
  const toggle = screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }) as HTMLInputElement
  if (!toggle.checked) fireEvent.click(toggle)
}

const findIsoRowMenu = async (code: string) => {
  if (code.length < 8) {
    const toggle = screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }) as HTMLInputElement
    if (!toggle.checked) fireEvent.click(toggle)
  }
  return screen.findByRole('button', { name: `Rad-meny for ISO ${code}` })
}
test('alle visningsmoduser beholder restore-branchens kolonner og valgfrie tittelkolonner', async () => {
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  const isoHeaders = [
    'v16 - nivå 1',
    'v16 - nivå 2',
    'v16 - nivå 3',
    'v16 - nivå 4',
    'v22 - nivå 1',
    'v22 - nivå 2',
    'v22 - nivå 3',
    'v22 - nivå 4',
  ]
  const headers = () =>
    screen.getAllByRole('columnheader').map((header) => (header.textContent ?? '').replace(/[↑↓]/g, '').trim())
  const mappingHeaders = isoHeaders.slice(3)
  expect(headers()).toEqual([...mappingHeaders, 'Endringstype', 'Status'])
  expect(screen.getByRole('button', { name: /v16 - nivå 4, sortert stigende/ })).toBeInTheDocument()
  await loadExtractRows()
  const mappingInfo = ['Endringstype', 'Verifisering']
  const agreementInfo = ['Avtale', 'Rangering', 'Delkontraktnr.']
  expect(headers()).toEqual([
    'v16 - nivå 4',
    'v22 - nivå 4',
    ...mappingInfo,
    'Produktnavn',
    'Ant. varianter',
    ...agreementInfo,
  ])
  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))
  expect(headers()).toEqual([
    'v16 - nivå 4',
    'v22 - nivå 4',
    ...mappingInfo,
    'Variantnavn',
    'HMS-nr.',
    'Leverandørref.',
    ...agreementInfo,
  ])
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v16 nivå 4 tittel' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v22 nivå 4 tittel' }))
  const withTitles = ['v16 - nivå 4', 'v16 - 4 tittel', 'v22 - nivå 4', 'v22 - 4 tittel']
  expect(headers()).toEqual([
    ...withTitles,
    ...mappingInfo,
    'Variantnavn',
    'HMS-nr.',
    'Leverandørref.',
    ...agreementInfo,
  ])
  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
  expect(headers()).toEqual([...withTitles, ...mappingInfo, 'Produktnavn', 'Ant. varianter', ...agreementInfo])
  fireEvent.click(screen.getByRole('radio', { name: 'ISO-mapping' }))
  expect(headers()).toEqual([
    'v16 - nivå 4',
    'v16 - 4 tittel',
    ...isoHeaders.slice(4),
    'v22 - 4 tittel',
    'Endringstype',
    'Status',
  ])
})

test('endringstype filtrerer mappinger og Nullstill gjenoppretter alle filtre', async () => {
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  const originalCount = screen.getByText(/^\d+ mapping-rader$/).textContent
  fireEvent.click(screen.getByRole('button', { name: 'Endringstype: Alle' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '* Endret forklaring' }))
  fireEvent.keyDown(screen.getByRole('menuitemcheckbox', { name: '* Endret forklaring' }), { key: 'Escape' })
  expect(screen.getByText('1 mapping-rader')).toBeInTheDocument()
  expect(screen.getByText('24060301')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' }))
  expect(screen.getByText('0 mapping-rader')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Nullstill' }))
  expect(screen.getByRole('button', { name: 'Endringstype: Alle' })).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' })).toBeChecked()
  expect(screen.getByText(originalCount!)).toBeInTheDocument()
})

test('Vis detaljer viser verifisering per nivå og varsler om ikke-verifiserte mappinger skjult over nivå 4', async () => {
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  const details = screen.getByRole('region', { name: 'Verifiseringsstatus' })
  expect(within(details).getByText('v16 nivå 4: 3 av 3 verifisert (100 %)')).toBeInTheDocument()
  expect(within(details).getByText('v16 nivå 3: 0 av 1 verifisert (0 %)')).toBeInTheDocument()
  expect(within(details).getByText('v16 nivå 2: 0 av 1 verifisert (0 %)')).toBeInTheDocument()
  expect(within(details).getByText('v16 nivå 1: 1 av 2 verifisert (50 %)')).toBeInTheDocument()
  expect(within(details).getByText('Uten v16-kode (ny v22-kode): 1 av 1 verifisert (100 %)')).toBeInTheDocument()
  expect(within(details).getByText(/3 ikke-verifiserte mappinger ligger over nivå 4/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }))
  expect(within(details).queryByText(/ikke-verifiserte mappinger ligger over nivå 4/)).not.toBeInTheDocument()
})

test('statusdetaljer vises ved toppen etter valg og verified-filter virker i produktvisningen', async () => {
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  expect(screen.queryByRole('region', { name: 'Verifiseringsstatus' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  expect(screen.getByRole('region', { name: 'Verifiseringsstatus' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  expect(screen.queryByRole('region', { name: 'Verifiseringsstatus' })).not.toBeInTheDocument()
  await loadExtractRows()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' }))
  expect(screen.getByText('1 produkter (1 varianter) (2 aktive produktserier i systemet)')).toBeInTheDocument()
})

test('kopieringshandlingen i Aksjon åpner forhåndsutfylt skjema uten å åpne oversikten', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 05030301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Kopier v16 til v22 (nivå 4)' }))
  expect(screen.getByText(/Feltene er fylt ut med data fra v16-kategorien/)).toHaveTextContent('05030301')
  expect(screen.getByText(/Mappingen oppdateres til den nye kategorien/)).toBeInTheDocument()
  expect(screen.getByLabelText('Tittel')).toHaveValue('Kommunikasjonshjelpemiddel')
  expect(screen.getByLabelText('Forklaring (valgfritt)')).toHaveValue('Kommunikasjon via tale og skrift')
  expect(screen.queryByRole('dialog', { name: 'Oversikt over ISO 05030301' })).not.toBeInTheDocument()
})

test('endrer nivå 4-kategori med full DTO og viser lagringsfeil før vellykket nytt forsøk', async () => {
  const stored = {
    id: 'category-id',
    isoCode: '18090301',
    level: 4,
    isoType: 'NAT',
    isoTitle: 'Lagret tittel',
    isoText: 'Lagret forklaring',
    searchWords: ['hjul'],
    isoTranslations: { titleEn: 'Walker', textEn: 'Four wheels' },
    created: '2026-01-01T00:00:00',
    updated: '2026-01-01T00:00:00',
    createdBy: 'REGISTER',
    updatedBy: 'REGISTER',
    createdByUser: 'admin',
    updatedByUser: 'admin',
  }
  let saved: typeof stored | null = null
  let fail = true
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        isoMappings.map((mapping) => (mapping.id === 'map-1' ? { ...mapping, verified: false } : mapping))
      )
    ),
    http.get('http://localhost:8080/admreg/admin/api/v22/isocategory/18090301', () => HttpResponse.json(stored)),
    http.put('http://localhost:8080/admreg/admin/api/v22/isocategory/18090301', async ({ request }) => {
      if (fail) return HttpResponse.json({ message: 'Kategorien er låst' }, { status: 409 })
      saved = (await request.json()) as typeof stored
      return HttpResponse.json(saved)
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Endre ISO v22-kategori 18090301' }))
  const dialog = await screen.findByRole('dialog', { name: 'Endre ISO v22-kategori 18090301' })
  const title = await within(dialog).findByLabelText('Tittel')
  expect(title).toHaveValue('Lagret tittel')
  expect(within(dialog).getByLabelText('Siste 2 siffer')).toHaveAttribute('readonly')
  fireEvent.change(title, { target: { value: 'Ny tittel' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Lagre endringer' }))
  await within(dialog).findByText('Kategorien er låst')
  expect(saved).toBeNull()
  fail = false
  fireEvent.click(within(dialog).getByRole('button', { name: 'Lagre endringer' }))
  await waitFor(() => expect(saved).toEqual({ ...stored, isoTitle: 'Ny tittel' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Endre ISO v22-kategori 18090301' })).not.toBeInTheDocument()
  )
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  expect(await screen.findByText('Ny tittel')).toBeInTheDocument()
})

test('redigering sperres når en annen verifisert mapping bruker samme kategori', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json([
        ...isoMappings.map((mapping) => (mapping.id === 'map-1' ? { ...mapping, verified: false } : mapping)),
        { ...isoMappings[2], id: 'shared-map', code16: '24060301', code22: '18090301', verified: true },
      ])
    )
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  expect(
    await screen.findByRole('menuitem', { name: 'Endre ISO v22-kategori 18090301 (fjern verifisering først)' })
  ).toHaveAttribute('aria-disabled', 'true')
})

test('splittmapping viser en redigeringshandling for hvert eksisterende nivå 4-mål', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json([
        ...isoMappings.map((mapping) =>
          mapping.id === 'map-1' || mapping.id === 'map-2' ? { ...mapping, verified: false } : mapping
        ),
        { ...isoMappings[2], id: 'split-edit', code16: '18090301', verified: false },
      ])
    )
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  await loadExtractRows()
  enableEditMode()
  fireEvent.click(screen.getByRole('button', { name: /^Rad-meny for Rollator Alfa/ }))
  expect(await screen.findByRole('menuitem', { name: 'Endre ISO v22-kategori 18090301' })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Endre ISO v22-kategori 24060302' })).toBeInTheDocument()
})

test.each(['18090301', '24060302'])(
  'redigering av splittmål %s oppdaterer lastede produkt- og variantrader uten å miste det andre målet',
  async (code) => {
    const categories = isoCategoriesV22.map((category) =>
      category.isoCode === '24060302'
        ? { ...category, isoText: 'Gripeforklaring', searchWords: ['gange', 'grep'] }
        : category
    )
    const category = categories.find((item) => item.isoCode === code)!
    const stored = { ...category, id: `category-${code}`, level: 4, isoType: 'NAT' }
    server.use(
      http.get('http://localhost:8080/admreg/api/v22/isocategories', () => HttpResponse.json(categories)),
      http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
        HttpResponse.json([
          ...isoMappings.map((mapping) =>
            mapping.id === 'map-1' || mapping.id === 'map-2' ? { ...mapping, verified: false } : mapping
          ),
          { ...isoMappings[2], id: 'split-edit', code16: '18090301', verified: false },
        ])
      ),
      http.get(`http://localhost:8080/admreg/admin/api/v22/isocategory/${code}`, () => HttpResponse.json(stored)),
      http.put(`http://localhost:8080/admreg/admin/api/v22/isocategory/${code}`, async ({ request }) =>
        HttpResponse.json(await request.json())
      )
    )
    renderPage()
    await loadExtractRows()
    fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
    for (const name of ['v22 nivå 4 tittel', 'v22 forklaring', 'v22 søkeord']) {
      fireEvent.click(screen.getByRole('menuitemcheckbox', { name }))
    }
    fireEvent.keyDown(screen.getByRole('menuitemcheckbox', { name: 'v22 søkeord' }), { key: 'Escape' })
    enableEditMode()
    fireEvent.click(screen.getByRole('button', { name: /^Rad-meny for Rollator Alfa/ }))
    fireEvent.click(await screen.findByRole('menuitem', { name: `Endre ISO v22-kategori ${code}` }))
    const dialog = await screen.findByRole('dialog', { name: `Endre ISO v22-kategori ${code}` })
    fireEvent.change(await within(dialog).findByLabelText('Tittel'), { target: { value: 'Ny tittel' } })
    fireEvent.change(within(dialog).getByLabelText('Forklaring (valgfritt)'), {
      target: { value: 'Ny forklaring' },
    })
    fireEvent.change(within(dialog).getByLabelText('Søkeord (kommaseparert, valgfritt)'), {
      target: { value: 'gange, endret' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lagre endringer' }))
    await waitFor(() => expect(dialog).not.toBeInTheDocument())

    const expected =
      code === '18090301'
        ? ['Ny tittel, Nytt gripehjelpemiddel', 'Ny forklaring, Gripeforklaring', 'gange, endret, grep']
        : [
            'Rollator med fire hjul (2022), Ny tittel',
            'Rullator med fire hjul, oppdatert forklaring, Ny forklaring',
            'rullator, gange, ny, endret',
          ]
    for (const view of ['Produkt', 'Variant']) {
      fireEvent.click(screen.getByRole('radio', { name: view }))
      const row = screen.getByText(view === 'Produkt' ? 'Rollator Alfa' : 'Rollator Alfa variant').closest('tr')!
      for (const value of expected) expect(within(row).getByText(value)).toBeInTheDocument()
      expect(within(row).getAllByText('18090301')).toHaveLength(2)
      expect(within(row).getByText('24060302')).toBeInTheDocument()
    }
  }
)

test('viser manglende nivå 4 og kopierer v16-verdier uten å åpne detaljer', async () => {
  let created: { isoCode: string; isoTitle: string; isoText: string; searchWords: string[] } | null = null
  server.use(
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', async ({ request }) => {
      created = (await request.json()) as typeof created
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', async ({ request }) =>
      HttpResponse.json(((await request.json()) as { isoMap: (typeof isoMappings)[number] }).isoMap)
    )
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  const row = screen.getAllByText('05030301')[0].closest('tr') as HTMLElement
  expect(within(row).getByText('Kategori mangler')).toBeInTheDocument()
  enableEditMode()
  const level3 = (await findIsoRowMenu('050303')).closest('tr') as HTMLElement
  expect(within(level3).queryByText('Kategori mangler')).not.toBeInTheDocument()
  openRowMenu(row)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: 'Oversikt over ISO 05030301' })
  expect(within(overview).getByRole('button', { name: 'Vis detaljer' })).toBeInTheDocument()
  expect(within(overview).getByText(/tilsvarende v22-kategori på nivå 4 mangler/)).toBeInTheDocument()
  expect(within(overview).getByRole('button', { name: 'Verifiser mappinger' })).toBeEnabled()
  fireEvent.click(within(overview).getByRole('button', { name: 'Kopier v16 til v22 (nivå 4)' }))
  expect(screen.getByLabelText('Siste 2 siffer')).toHaveValue('01')
  expect(screen.getByLabelText('Tittel')).toHaveValue('Kommunikasjonshjelpemiddel')
  expect(screen.getByLabelText('Forklaring (valgfritt)')).toHaveValue('Kommunikasjon via tale og skrift')
  expect(screen.getByLabelText('Søkeord (kommaseparert, valgfritt)')).toHaveValue('tale, skrift')
  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' }))
  await waitFor(() =>
    expect(created).toEqual(
      expect.objectContaining({
        isoCode: '22091201',
        isoTitle: 'Kommunikasjonshjelpemiddel',
        isoText: 'Kommunikasjon via tale og skrift',
        searchWords: ['tale', 'skrift'],
      })
    )
  )
})

test('automatisk oversiktslasting viser feil og lar brukeren prøve igjen', async () => {
  let requests = 0
  let fail = true
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const code = new URL(request.url).searchParams.get('isoCode')
      if (!code) return HttpResponse.json({ content: [], totalPages: 1, totalSize: 4758 })
      requests++
      if (fail) return new HttpResponse(null, { status: 503, statusText: 'Tjenesten er utilgjengelig' })
      return HttpResponse.json({ content: [], totalPages: 1, totalSize: 0 })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 05030301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: 'Oversikt over ISO 05030301' })
  await within(overview).findByText('Tjenesten er utilgjengelig')
  expect(requests).toBe(1)
  fail = false
  fireEvent.click(within(overview).getByRole('button', { name: 'Last inn produkter' }))
  await within(overview).findByText('Ingen produkter er registrert med denne ISO-kategorien.')
  expect(requests).toBe(2)
  fireEvent.click(within(overview).getAllByRole('button', { name: 'Lukk' })[0])
  fireEvent.click(screen.getByRole('button', { name: 'Rad-meny for ISO 05030301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  await screen.findByRole('dialog', { name: 'Oversikt over ISO 05030301' })
  expect(requests).toBe(2)
})

test('viser avrundet andel fra mappinglisten og oppdaterer etter verifisering uten prosentkall', async () => {
  let percentageRequests = 0
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap/verified-percentage', () => {
      percentageRequests++
      return HttpResponse.json(0)
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', async ({ request }) => {
      const body = (await request.json()) as { isoMap: (typeof isoMappings)[number] }
      expect(body.isoMap).toEqual({ ...isoMappings[7], verified: true })
      return HttpResponse.json(body.isoMap)
    })
  )
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  expect(screen.getByRole('progressbar', { name: 'Verifiserte ISO-mappinger' })).toHaveAttribute('aria-valuenow', '62')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  expect(screen.getByRole('progressbar', { name: 'Verifiserte ISO-mappinger' })).toHaveAttribute('aria-valuenow', '62')
  enableEditMode()
  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Verifiser' }))
  await confirmVerification()
  await screen.findByText('6 av 8 verifisert (75 %)')
  expect(percentageRequests).toBe(0)
  expect(screen.getByRole('button', { name: 'Rad-meny for ISO 050303' })).toBeInTheDocument()
})

test('tom mappingliste viser Ingen mappinger og ingen prosentlinje', async () => {
  server.use(http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () => HttpResponse.json([])))
  renderPage()
  await screen.findByText('Ingen mappinger')
  expect(screen.queryByRole('progressbar', { name: 'Verifiserte ISO-mappinger' })).not.toBeInTheDocument()
})

test('viser ikke 100 prosent før alle mappinger er verifisert', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        Array.from({ length: 500 }, (_, index) => ({
          ...isoMappings[7],
          id: `mapping-${index}`,
          verified: index < 499,
        }))
      )
    )
  )
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 99 %')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  expect(screen.getByText('499 av 500 verifisert (99 %)')).toBeInTheDocument()
  expect(screen.getByRole('progressbar', { name: 'Verifiserte ISO-mappinger' })).toHaveAttribute('aria-valuenow', '99')
})

test('fjerning av verifisering oppdaterer andelen og feil endrer ikke andelen', async () => {
  let fail = true
  server.use(
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', async ({ request }) => {
      if (fail) return HttpResponse.json({ message: 'Lagring feilet' }, { status: 500 })
      return HttpResponse.json(((await request.json()) as { isoMap: (typeof isoMappings)[number] }).isoMap)
    })
  )
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  enableEditMode()
  openRowMenu((await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' })).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Fjern verifisering' }))
  const dialog = await screen.findByRole('dialog', { name: 'Bekreft fjerning av verifisering' })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fjern verifisering' }))
  await within(dialog).findByText(/Lagring feilet/)
  expect(screen.getByText('5 av 8 verifisert (62 %)')).toBeInTheDocument()
  fail = false
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fjern verifisering' }))
  await screen.findByText('4 av 8 verifisert (50 %)')
})

test('statusfilter endrer ikke samlet prosent og gjenoppretter verifiserte rader', async () => {
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  expect(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' })).toBeChecked()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' }))
  expect(screen.queryByText('Verifisert')).not.toBeInTheDocument()
  expect(screen.getByText('Verifiserte ISO-mappinger: 62 %')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis verifiserte ISO-koder' }))
  expect(screen.getAllByText('Verifisert').length).toBeGreaterThan(0)
  expect(screen.queryByRole('checkbox', { name: 'Ikke verifiserte først' })).not.toBeInTheDocument()
})

test('viser verifisering per nivå 1 og fremhever flere mappinger med samme v16-kode', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json([...isoMappings, { ...isoMappings[7], id: 'split-extra', code22: '24060302' }])
    )
  )
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 55 %')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  expect(screen.getAllByText('Splitt: krever manuell kontroll')).toHaveLength(2)
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Verifisering per v16 nivå 1' })).getByRole('button', { name: 'Vis mer' })
  )
  expect(await screen.findByText('ISO 05: 0 av 4 verifisert (0 %)')).toBeInTheDocument()
  expect(screen.getByRole('progressbar', { name: 'Verifiserte mappinger for ISO 05' })).toHaveAttribute(
    'aria-valuenow',
    '0'
  )
  expect(screen.getByText('Uten v16-kode: 1 av 1 verifisert (100 %)')).toBeInTheDocument()
})

test('ISO-mapping søker mappingens v22-mål når Søk v22-koder er valgt', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Søk v22-koder' }))
  const input = screen.getByLabelText('ISO-kode (v22)')
  fireEvent.change(input, { target: { value: '24060302' } })
  fireEvent.blur(input)
  await screen.findByText('1 mapping-rader for ISO 24060302')
  expect(screen.getByText('24060301')).toBeInTheDocument()
})

test('v22-søk sender isoCode22 og viser lagret v22-kode uten å begrense til samme v16-kode', async () => {
  const requestedFilters: { v16: string | null; v22: string | null }[] = []
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(isoMappings.map((mapping) => ({ ...mapping, verified: false })))
    ),
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const params = new URL(request.url).searchParams
      requestedFilters.push({ v16: params.get('isoCode'), v22: params.get('isoCode22') })
      return HttpResponse.json({
        content: [overviewSeries('s1', 'Rollator Alfa', '24060302')],
        totalPages: 1,
        totalSize: 1,
      })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  openExtractView()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Søk v22-koder' }))
  const input = screen.getByLabelText('ISO-kode (v22)')
  fireEvent.change(input, { target: { value: '24 06 03 02' } })
  fireEvent.blur(input)
  expect(screen.getByLabelText('v22 nivå 4')).toHaveValue('24060302')
  const load = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(load).toBeEnabled())
  fireEvent.click(load)
  await screen.findByText('1 produkter (1 varianter) for ISO 24060302')
  expect(requestedFilters.at(-1)).toEqual({ v16: null, v22: '24060302' })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Endremodus' }))
  fireEvent.click(await screen.findByRole('button', { name: /^Rad-meny for Rollator Alfa/ }))
  const verify = await screen.findByRole('menuitem', { name: 'Verifiser' })
  expect(verify).not.toHaveAttribute('aria-disabled', 'true')
  fireEvent.keyDown(verify, { key: 'Escape' })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Søk v22-koder' }))
  const v16Input = screen.getByLabelText('ISO-kode (v16)')
  fireEvent.change(v16Input, { target: { value: '18' } })
  fireEvent.blur(v16Input)
  await waitFor(() => expect(load).toBeEnabled())
  fireEvent.click(load)
  await screen.findByText('1 produkter (1 varianter) for ISO 18')
  expect(requestedFilters.at(-1)).toEqual({ v16: '18', v22: null })
})

const loadExtractRows = async () => {
  openExtractView()
  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)
  await waitFor(() => expect(screen.getAllByText('18090301')).toHaveLength(2))
}

test('ISO-søk på 05 beholder nivå 4 til Vis ISO-struktur aktiveres', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  const input = screen.getByLabelText('ISO-kode (v16)')
  fireEvent.change(input, { target: { value: '05' } })
  fireEvent.blur(input)
  expect(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' })).not.toBeChecked()
  expect(screen.getByText('1 mapping-rader for ISO 05')).toBeInTheDocument()
  expect(screen.getByRole('table').querySelector('tbody tr td')).toHaveTextContent('05030301')
  expect(screen.queryByRole('columnheader', { name: /v16 - nivå 1/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }))
  expect(screen.getByText('4 mapping-rader for ISO 05')).toBeInTheDocument()
  expect(screen.getByRole('table').querySelector('tbody tr td')).toHaveTextContent('05')
})

test('husker ISO-struktur, kolonner og filterpanel uten å lagre ISO-søk eller endremodus', async () => {
  const first = renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis detaljer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'v16 nivå 4 tittel' }))
  fireEvent.keyDown(screen.getByRole('menuitemcheckbox', { name: 'v16 nivå 4 tittel' }), { key: 'Escape' })
  enableEditMode()
  const input = screen.getByLabelText('ISO-kode (v16)')
  fireEvent.change(input, { target: { value: '05' } })
  fireEvent.blur(input)
  const filters = screen.getByRole('region', { name: 'Filtre og visningsvalg' })
  fireEvent.click(within(filters).getByRole('button', { name: 'Vis mer' }))
  first.unmount()
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  expect(screen.getByRole('checkbox', { name: 'Vis detaljer' })).toBeChecked()
  expect(screen.getByRole('columnheader', { name: 'v16 - 4 tittel' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: /v16 - nivå 1/ })).toBeInTheDocument()
  const reopened = screen.getByRole('region', { name: 'Filtre og visningsvalg' })
  expect(within(reopened).getByRole('button', { name: 'Vis mer' })).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(within(reopened).getByRole('button', { name: 'Vis mer' }))
  expect(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' })).toBeChecked()
  expect(screen.getByLabelText('ISO-kode (v16)')).toHaveValue('')
  expect(screen.getByRole('checkbox', { name: 'Endremodus' })).not.toBeChecked()
})

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
  isoCategoryV1('050303', 3, 'Kommunikasjonshjelpemidler', {
    isoText: 'Hjelpemidler for kommunikasjon',
    searchWords: ['tale', 'skrift'],
  }),
  isoCategoryV1('05030301', 4, 'Kommunikasjonshjelpemiddel', {
    isoText: 'Kommunikasjon via tale og skrift',
    searchWords: ['tale', 'skrift'],
  }),
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
  window.localStorage.clear()
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
  window.localStorage.clear()
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

  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))

  await waitFor(() => expect(screen.getByText('Rollator Alfa variant')).toBeInTheDocument())
  expect(screen.getByText('Annen serie variant')).toBeInTheDocument()
})

test('sortering på antall varianter krasjer ikke ved bytte til variantvisning', async () => {
  renderPage()
  await loadExtractRows()

  fireEvent.click(screen.getByRole('button', { name: /Ant\. varianter, sorter stigende/ }))
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

test('henter og viser antall for valgt ISO-filter i stedet for totalen for hele systemet', async () => {
  const filteredSeries = Array.from({ length: 117 }, (_, index) => ({
    id: `s-05-${index}`,
    title: `Produkt ${index}`,
    isoCategory: '05030301',
    isoCategory22: null,
    variants: Array.from({ length: index < 61 ? 2 : 1 }, (_, variantIndex) => ({
      id: `v-05-${index}-${variantIndex}`,
      articleName: `Variant ${index}-${variantIndex}`,
      supplierRef: `REF-${index}-${variantIndex}`,
      hmsArtNr: `${index}${variantIndex}`,
      agreements: [],
    })),
  }))
  const requestedIsoCodes: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const isoCode = new URL(request.url).searchParams.get('isoCode')
      requestedIsoCodes.push(isoCode ?? '')
      return HttpResponse.json(
        isoCode
          ? { content: filteredSeries, totalPages: 1, totalSize: 117 }
          : { content: [], totalPages: 1, totalSize: 4758 }
      )
    })
  )

  renderPage()
  openExtractView()
  await screen.findByText(/Systemet inneholder/)

  fireEvent.change(screen.getByLabelText('v16 nivå 1'), { target: { value: '05' } })

  expect(await screen.findByText('117 produkter (178 varianter) for ISO 05')).toBeInTheDocument()
  expect(requestedIsoCodes).toContain('05')
  expect(screen.queryByText(/Systemet inneholder/)).not.toBeInTheDocument()
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

test('produkt- og variantvisning viser bare nivå 4 som standard, og nivå 1 til 3 kan slås av og på', async () => {
  renderPage()
  openExtractView()

  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  expect(screen.queryByRole('columnheader', { name: /v16 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: /v22 - nivå 1/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  for (const version of ['v16', 'v22']) {
    for (const level of [1, 2, 3]) {
      fireEvent.click(screen.getByRole('menuitemcheckbox', { name: `${version} nivå ${level} kode` }))
    }
  }
  expect(screen.getByRole('columnheader', { name: /v16 - nivå 1/ })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'v22 - nivå 3' })).toBeInTheDocument()

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

test('viser endringstype mellom v16 og v22 som standard og kan skjule den', async () => {
  renderPage()
  await loadExtractRows()

  const table = screen.getByRole('table')
  const rowAlfa = within(table).getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(rowAlfa).getByText('= Ingenting er endret')).toBeInTheDocument()
  expect(within(rowAlfa).getByText('Verifisert')).toBeInTheDocument()

  const rowAnnen = within(table).getByText('22030301').closest('tr') as HTMLElement
  expect(within(rowAnnen).getByText('Mangler kobling')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Endringstype og verifisering' }))
  expect(screen.queryByText('= Ingenting er endret')).not.toBeInTheDocument()
})

test('viser ren ISO-mapping som standardvisning', async () => {
  renderPage()

  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })

  const table = screen.getByRole('table')
  const firstRow = table.querySelector('tbody tr') as HTMLElement
  expect(firstRow.querySelector('td')).toHaveTextContent('04010101')

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

  showMappingParentColumns()
  const deleted05Row = Array.from(table.querySelectorAll('tbody tr')).find(
    (row) =>
      row.querySelector('td')?.textContent === '05' &&
      row.textContent?.includes('X Slettet klasse, underklasse eller inndeling')
  ) as HTMLElement
  expect(within(deleted05Row).getByText('X Slettet klasse, underklasse eller inndeling')).toBeInTheDocument()
  expect(within(deleted05Row).getByText('Ikke verifisert')).toBeInTheDocument()

  expect(screen.queryByRole('button', { name: 'Hent liste' })).not.toBeInTheDocument()
})

test('viser valgt ISO-nivå først og undernivåene etterpå', async () => {
  renderPage()

  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  showMappingParentColumns()
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

test('Vis ISO-struktur viser foreldre før barn og kan slås av for restore-standard', async () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () => HttpResponse.json([...isoMappings].reverse()))
  )
  renderPage()
  await screen.findByText('Verifiserte ISO-mappinger: 62 %')
  expect(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' })).not.toBeChecked()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }))
  const codes = Array.from(screen.getByRole('table').querySelectorAll('tbody tr')).map(
    (row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 4)
        .map((cell) => cell.textContent ?? '')
        .reverse()
        .find(Boolean) ?? ''
  )
  const branch05 = codes.filter((code) => code.startsWith('05'))
  expect(branch05).toEqual(['05', '0503', '050303', '05030301'])
  const nonEmpty = codes.filter(Boolean)
  expect(nonEmpty).toEqual([...nonEmpty].sort((a, b) => a.localeCompare(b)))
  expect(codes.at(-1)).toBe('')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vis ISO-struktur' }))
  expect(screen.queryByRole('columnheader', { name: /v16 - nivå 1/ })).not.toBeInTheDocument()
  expect(screen.getByRole('table').querySelector('tbody tr td')).toHaveTextContent('04010101')
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

test('skjuler UUID-leverandorreferanser, viser aktive avtaler og filtrerer på avtale', async () => {
  const supplierRefUuid = '11111111-2222-3333-4444-555555555555'
  const agreements = [
    {
      id: 'agr-2',
      reference: 'A2',
      rank: 2,
      postNr: 20,
      status: 'ACTIVE',
      title: 'Ganghjelpemidler',
      postTitle: 'Rullatorer, innendørs',
    },
    {
      id: 'agr-1',
      reference: 'A1',
      rank: 1,
      postNr: 10,
      status: 'ACTIVE',
      title: 'Ganghjelpemidler',
      postTitle: 'Rullatorer, utendørs',
    },
    {
      id: 'agr-3',
      reference: 'A3',
      rank: 3,
      postNr: 30,
      status: 'INACTIVE',
      title: 'Utgått avtale',
      postTitle: 'Utgått delkontrakt',
    },
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
          {
            id: 's-no-agreement',
            title: 'Serie uten avtale',
            isoCategory: '18090301',
            isoCategory22: null,
            variants: [
              {
                id: 'v-no-agreement',
                articleName: 'Variant uten avtale',
                supplierRef: 'REF-NA',
                hmsArtNr: '444444',
                agreements: [{ id: 'agr-old', reference: 'A9', rank: 1, postNr: 1, status: 'INACTIVE' }],
              },
            ],
          },
        ],
        totalPages: 1,
        totalSize: 2,
      })
    )
  )

  renderPage()
  openExtractView()

  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)

  await waitFor(() => expect(screen.getAllByText('18090301').length).toBeGreaterThan(0))

  fireEvent.click(screen.getByRole('radio', { name: 'Variant' }))

  await waitFor(() => expect(screen.getByText('Spesiell variant')).toBeInTheDocument())
  expect(screen.getByText('A1, A2')).toBeInTheDocument()
  expect(screen.queryByText('A3')).not.toBeInTheDocument()
  expect(screen.queryByText(supplierRefUuid)).not.toBeInTheDocument()

  expect(screen.getByText('Variant uten avtale')).toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: 'Avtalenavn' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Avtalenavn' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Delkontraktnavn' }))
  expect(screen.getByRole('columnheader', { name: 'Avtalenavn' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Delkontraktnavn' })).toBeInTheDocument()
  expect(screen.getByText('Ganghjelpemidler')).toBeInTheDocument()
  expect(screen.getByText('Rullatorer, utendørs; Rullatorer, innendørs')).toBeInTheDocument()
  expect(screen.queryByText('Utgått avtale')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('checkbox', { name: 'Bare på avtale' }))
  expect(screen.getByText('Spesiell variant')).toBeInTheDocument()
  expect(screen.queryByText('Variant uten avtale')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('radio', { name: 'Produkt' }))
  expect(screen.getByText('Spesiell serie')).toBeInTheDocument()
  expect(screen.queryByText('Serie uten avtale')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Nullstill' }))
  expect(screen.getByRole('checkbox', { name: 'Bare på avtale' })).not.toBeChecked()
  expect(screen.getByText('Serie uten avtale')).toBeInTheDocument()
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
  let updatedMapPayload: { code22?: string; level22?: number; verified?: boolean } | null = null
  const patchedSeriesIds: string[] = []
  let categoryReads = 0

  server.use(
    http.get('http://localhost:8080/admreg/api/v22/isocategories', () => {
      categoryReads++
      return HttpResponse.json(isoCategoriesV22)
    }),
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', async ({ request }) => {
      const body = (await request.json()) as { isoCode: string; isoTitle: string }
      createdCategoryPayload = body
      return HttpResponse.json(body, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/map-7', async ({ request }) => {
      const body = (await request.json()) as { isoMap: { code22?: string; level22?: number; verified?: boolean } }
      updatedMapPayload = body.isoMap
      return HttpResponse.json({ ...isoMappings[7], ...body.isoMap })
    }),
    http.patch('http://localhost:8080/admreg/api/v1/series/:id', ({ params }) => {
      patchedSeriesIds.push(params.id as string)
      return new HttpResponse(null, { status: 200 })
    })
  )

  renderPage()

  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })

  // Bytt til "Endre"-modus for å få frem Aksjon-kolonnen.
  fireEvent.click(screen.getByRole('checkbox', { name: 'Endremodus' }))

  // Mapping-raden for v16-kode 050303 -> v22-kode 220912 (nivå 3, ikke verifisert) mangler nivå
  // 4 under v22 og kvalifiserer derfor for "Opprett ny ISO v22-kategori".
  const targetRow = screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement
  fireEvent.click(within(targetRow).getByRole('button', { name: /^Rad-meny/ }))
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
  const readsBefore = categoryReads
  fireEvent.click(screen.getByRole('button', { name: 'Refresh categories' }))
  await waitFor(() => expect(categoryReads).toBeGreaterThan(readsBefore))
  await waitFor(() => expect(screen.getAllByText('22091201').length).toBeGreaterThan(0))
  expect(screen.queryByTitle('ISO 22091201 finnes ikke som v22-kategori og må opprettes.')).not.toBeInTheDocument()

  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Verifiser' }))
  await confirmVerification()

  await waitFor(() =>
    expect(updatedMapPayload).toEqual(expect.objectContaining({ code22: '22091201', level22: 4, verified: true }))
  )
  expect(patchedSeriesIds).toEqual([])
})

test('oppretter manglende v22-nivå 3 med målkoden fra mappingen og verifiserer etterpå', async () => {
  let createdCategoryPayload: { isoCode: string; isoTitle: string } | null = null
  const mappingUpdates: { code22?: string; level22?: number; verified?: boolean }[] = []
  const patchedSeriesIds: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        isoMappings.map((mapping) =>
          mapping.id === 'map-7' ? { ...mapping, code22: '220913', level22: 3, verified: false } : mapping
        )
      )
    ),
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', async ({ request }) => {
      createdCategoryPayload = (await request.json()) as { isoCode: string; isoTitle: string }
      return HttpResponse.json(createdCategoryPayload, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/map-7', async ({ request }) => {
      const body = (await request.json()) as {
        isoMap: { code22?: string; level22?: number; verified?: boolean }
      }
      mappingUpdates.push(body.isoMap)
      return HttpResponse.json({ ...isoMappings[7], ...body.isoMap })
    }),
    http.patch('http://localhost:8080/admreg/api/v1/series/:id', ({ params }) => {
      patchedSeriesIds.push(params.id as string)
      return new HttpResponse(null, { status: 200 })
    })
  )

  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  const missingRow = screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement
  expect(within(missingRow).getByText('220913')).toBeInTheDocument()
  expect(within(missingRow).getByTitle('ISO 220913 finnes ikke som v22-kategori og må opprettes.')).toHaveTextContent(
    'Kategori mangler'
  )
  expect(within(missingRow).getByText('2209')).toBeInTheDocument()
  openRowMenu(missingRow)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Kopier v16 til v22 (nivå 3)' }))

  const suffixField = screen.getByLabelText('Siste 2 siffer')
  expect(suffixField).toHaveValue('13')
  expect(suffixField).toHaveAttribute('readonly')
  expect(screen.getByLabelText('Tittel')).toHaveValue('Kommunikasjonshjelpemidler')
  expect(screen.getByLabelText('Forklaring (valgfritt)')).toHaveValue('Hjelpemidler for kommunikasjon')
  expect(screen.getByLabelText('Søkeord (kommaseparert, valgfritt)')).toHaveValue('tale, skrift')
  expect(screen.getByText(/Kontroller og juster feltene/)).toHaveTextContent('050303')
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Ny underklasse' } })
  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori' }))

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Opprett kategori' })).not.toBeInTheDocument())
  expect(createdCategoryPayload).toEqual(expect.objectContaining({ isoCode: '220913', isoTitle: 'Ny underklasse' }))
  expect(screen.queryByTitle('ISO 220913 finnes ikke som v22-kategori og må opprettes.')).not.toBeInTheDocument()
  expect(mappingUpdates).toEqual([])

  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Verifiser' }))
  await confirmVerification()

  await waitFor(() =>
    expect(mappingUpdates).toContainEqual(expect.objectContaining({ code22: '220913', level22: 3, verified: true }))
  )
  expect(patchedSeriesIds).toEqual([])
})

test('oppretter manglende nivå 3 før nivå 4 uten å endre mappingmålet', async () => {
  const createdCategories: { isoCode: string; level: number; isoType: string }[] = []
  const mappingUpdates: { code22?: string; level22?: number; verified?: boolean }[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v22/isocategories', () =>
      HttpResponse.json(isoCategoriesV22.filter((category) => category.isoCode !== '220912'))
    ),
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        isoMappings.map((mapping) =>
          mapping.id === 'map-7' ? { ...mapping, code22: '22091201', level22: 4, verified: false } : mapping
        )
      )
    ),
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', async ({ request }) => {
      const body = (await request.json()) as {
        isoCode: string
        level: number
        isoType: string
        isoTitle: string
      }
      createdCategories.push({
        isoCode: body.isoCode,
        level: body.level,
        isoType: body.isoType,
      })
      return HttpResponse.json(body, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/map-7', async ({ request }) => {
      const body = (await request.json()) as {
        isoMap: { code22?: string; level22?: number; verified?: boolean }
      }
      mappingUpdates.push(body.isoMap)
      return HttpResponse.json({ ...isoMappings[7], ...body.isoMap })
    })
  )

  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  const mappingRow = screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement
  openRowMenu(mappingRow)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Opprett ny ISO v22-kategori (nivå 3)' }))
  expect(screen.getByLabelText('Siste 2 siffer')).toHaveValue('12')
  expect(screen.getByLabelText('Siste 2 siffer')).toHaveAttribute('readonly')
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Ny mellomkategori' } })
  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' }))

  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Opprett kategori og koble til mapping' })).not.toBeInTheDocument()
  )
  expect(createdCategories).toEqual([{ isoCode: '220912', level: 3, isoType: 'ISO' }])
  expect(mappingUpdates).toEqual([])

  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  expect(await screen.findByRole('menuitem', { name: 'Verifiser (opprett v22-kategori først)' })).toHaveAttribute(
    'aria-disabled',
    'true'
  )
  fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Verifiser (opprett v22-kategori først)' }), {
    key: 'Escape',
  })
  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Opprett ny ISO v22-kategori (nivå 4)' }))
  expect(screen.getByLabelText('Siste 2 siffer')).toHaveValue('01')
  expect(screen.getByLabelText('Siste 2 siffer')).toHaveAttribute('readonly')
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Ny målkategori' } })
  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' }))

  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Opprett kategori og koble til mapping' })).not.toBeInTheDocument()
  )
  expect(createdCategories).toEqual([
    { isoCode: '220912', level: 3, isoType: 'ISO' },
    { isoCode: '22091201', level: 4, isoType: 'NAT' },
  ])
  expect(mappingUpdates).toEqual([])

  openRowMenu((await findIsoRowMenu('050303')).closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Verifiser' }))
  await confirmVerification()

  await waitFor(() =>
    expect(mappingUpdates).toContainEqual(expect.objectContaining({ code22: '22091201', level22: 4, verified: true }))
  )
})

// Produktene viser både lagrede v22-koder og rader uten lagret v22-kode.
const overviewSeries = (id: string, title: string, isoCategory22: string | null) => ({
  id,
  title,
  isoCategory: '18090301',
  isoCategory22,
  variants: [
    { id: `${id}-v`, articleName: `${title} variant`, supplierRef: `REF-${id}`, hmsArtNr: `${id}00`, agreements: [] },
  ],
})

const useUnverifiedRollatorMapping = () => {
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        isoMappings.map((mapping) => (mapping.id === 'map-1' ? { ...mapping, verified: false } : mapping))
      )
    ),
    http.get('http://localhost:8080/admreg/api/v1/series', () =>
      HttpResponse.json({
        content: [
          overviewSeries('s1', 'Rollator Alfa', '18090301'),
          overviewSeries('s3', 'Rollator Beta', null),
          overviewSeries('s4', 'Rollator Gamma', null),
        ],
        totalPages: 1,
        totalSize: 3,
      })
    ),
    ...[
      { id: 's1', title: 'Rollator Alfa', attached: true },
      { id: 's3', title: 'Rollator Beta', attached: false },
      { id: 's4', title: 'Rollator Gamma', attached: false },
    ].map(({ id, title, attached }) =>
      http.get(`http://localhost:8080/admreg/api/v1/series/${id}`, () =>
        HttpResponse.json({
          ...seriesWithBothIsoVersions,
          id,
          title,
          isoCategory22: attached ? isoCategoriesV22.find((category) => category.isoCode === '18090301') : null,
          variants: seriesWithBothIsoVersions.variants.map((variant) => ({ ...variant, id: `${id}-v` })),
        })
      )
    )
  )
}

const enableEditMode = () => fireEvent.click(screen.getByRole('checkbox', { name: 'Endremodus' }))

const openRowMenu = (row: HTMLElement) => fireEvent.click(within(row).getByRole('button', { name: /^Rad-meny/ }))

const confirmVerification = async () => {
  const dialog = await screen.findByRole('dialog', { name: 'Bekreft verifisering' })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Verifiser' }))
}

test('verifiserer eksisterende v22-nivå 3-mål uten å laste produktlisten', async () => {
  const verifiedMappings: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', async () => {
      await delay('infinite')
      return HttpResponse.json({ content: [], totalPages: 1, totalSize: 0 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', ({ params }) => {
      verifiedMappings.push(params.id as string)
      return HttpResponse.json({ ...isoMappings[7], verified: true })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await findIsoRowMenu('050303'))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Verifiser' }))
  await confirmVerification()

  await waitFor(() => expect(verifiedMappings).toEqual(['map-7']))
})

test('verifiserer eksisterende v22-nivå 4 selv om et produkt ikke er koblet', async () => {
  useUnverifiedRollatorMapping()
  const verifiedMappings: string[] = []
  const patchedSeriesIds: string[] = []
  server.use(
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', ({ params }) => {
      verifiedMappings.push(params.id as string)
      return HttpResponse.json({ ...isoMappings[1], verified: true })
    }),
    http.patch('http://localhost:8080/admreg/api/v1/series/:id', ({ params }) => {
      patchedSeriesIds.push(params.id as string)
      return new HttpResponse(null, { status: 200 })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  openExtractView()
  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)
  enableEditMode()
  const productMenu = await screen.findByRole('button', { name: /^Rad-meny for Rollator Beta/ })

  fireEvent.click(productMenu)
  expect(screen.queryByRole('menuitem', { name: /Koble/ })).not.toBeInTheDocument()
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: 'Oversikt over ISO 18090301' })
  const productTable = await within(overview).findByRole('table')
  expect(within(productTable).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
    'Produkt',
    'Ant. varianter',
    'HMS-nr.',
    'v16-kode',
  ])
  const productRows = within(productTable).getAllByRole('row').slice(1)
  expect(productRows).toHaveLength(3)
  for (const row of productRows) {
    expect(within(row).getAllByRole('cell')).toHaveLength(4)
  }
  expect(within(productTable).queryByText('Ikke koblet')).not.toBeInTheDocument()
  expect(within(overview).queryByRole('button', { name: /Koble/ })).not.toBeInTheDocument()
  expect(within(overview).queryByText(/Koble alle produkter/)).not.toBeInTheDocument()
  expect(within(overview).queryByRole('dialog', { name: /Koble/ })).not.toBeInTheDocument()
  const verifyButton = within(overview).getByRole('button', { name: 'Verifiser mappinger' })
  expect(verifyButton).toBeEnabled()
  fireEvent.click(verifyButton)
  await confirmVerification()

  await waitFor(() => expect(verifiedMappings).toEqual(['map-1']))
  expect(patchedSeriesIds).toEqual([])
})

test('blokkerer verifisering når det eksakte v22-nivå 4-målet mangler, selv om nivå 3 finnes', async () => {
  const verificationRequests: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json(
        isoMappings.map((mapping) =>
          mapping.id === 'map-1'
            ? { ...mapping, code22: '18090302', mapEnum: ['CHANGED_CODE_SAME_HEADER'], verified: false, level22: 4 }
            : mapping
        )
      )
    ),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', ({ params }) => {
      verificationRequests.push(params.id as string)
      return HttpResponse.json({ ...isoMappings[1], verified: true })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  const verifyItem = await screen.findByRole('menuitem', { name: 'Verifiser (opprett v22-kategori først)' })
  expect(verifyItem).toHaveAttribute('aria-disabled', 'true')
  expect(screen.getAllByText('180903').length).toBeGreaterThan(0)
  expect(verificationRequests).toEqual([])
})

test('krever at alle mål i en splittmapping finnes før verifisering', async () => {
  useUnverifiedRollatorMapping()
  const verificationRequests: string[] = []
  server.use(
    http.get('http://localhost:8080/admreg/admin/api/v22/isomap', () =>
      HttpResponse.json([
        ...isoMappings.map((mapping) => (mapping.id === 'map-1' ? { ...mapping, verified: false } : mapping)),
        {
          ...isoMappings[1],
          id: 'map-split',
          code22: '18090302',
          mapEnum: ['CHANGED_CODE_SAME_HEADER'],
          verified: false,
          level22: 4,
        },
      ])
    ),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', ({ params }) => {
      verificationRequests.push(params.id as string)
      return HttpResponse.json({ ...isoMappings[1], verified: true })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  openExtractView()
  const loadButton = screen.getByRole('button', { name: 'Hent liste' })
  await waitFor(() => expect(loadButton).toBeEnabled())
  fireEvent.click(loadButton)
  enableEditMode()

  fireEvent.click(await screen.findByRole('button', { name: /^Rad-meny for Rollator Beta/ }))
  const verifyItem = await screen.findByRole('menuitem', { name: 'Verifiser (opprett v22-kategori først)' })
  expect(verifyItem).toHaveAttribute('aria-disabled', 'true')
  expect(verificationRequests).toEqual([])
})

test('rader uten v16-kode har ingen verifiseringshandling', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  const newRow = screen.getByText('! Ny klasse, underklasse eller inndeling').closest('tr') as HTMLElement
  openRowMenu(newRow)
  expect(screen.queryByRole('menuitem', { name: /^Verifiser|^Fjern verifisering/ })).not.toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: /Endre ISO v22-kategori 30010101/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  )
})

test('Vis detaljer viser tittel, forklaring og søkeord for en v16-kode på nivå 3', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await findIsoRowMenu('050303'))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: /ISO 050303/ })
  fireEvent.click(within(overview).getByRole('button', { name: 'Vis detaljer' }))

  expect(within(overview).getAllByText('Kommunikasjonshjelpemidler').length).toBeGreaterThan(0)
  expect(within(overview).getByText('Hjelpemidler for kommunikasjon')).toBeInTheDocument()
  expect(within(overview).getByText('tale, skrift')).toBeInTheDocument()
  expect(within(overview).getAllByText('Kommunikasjonshjelpemidler (2022)').length).toBeGreaterThan(0)
  expect(within(overview).queryByText('Ingen tittel')).not.toBeInTheDocument()
  expect(within(overview).getAllByText('Tittel')).toHaveLength(2)
})

test('oversikten laster automatisk kun sin egen v16-kode, ikke hele sidefilteret', async () => {
  useUnverifiedRollatorMapping()
  const requestedIsoCodes: (string | null)[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const isoCode = new URL(request.url).searchParams.get('isoCode')
      requestedIsoCodes.push(isoCode)
      if (!isoCode) return HttpResponse.json({ content: [], totalPages: 1, totalSize: 4758 })
      return HttpResponse.json({
        content: [overviewSeries('s1', 'Rollator Alfa', '18090301'), overviewSeries('s3', 'Rollator Beta', null)],
        totalPages: 1,
        totalSize: 2,
      })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  await waitFor(() => expect(requestedIsoCodes).toEqual([null]))
  enableEditMode()

  fireEvent.click(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: /ISO 18090301/ })

  expect(await within(overview).findByText('Rollator Beta')).toBeInTheDocument()
  expect(requestedIsoCodes).toEqual([null, '18090301'])
  expect(within(overview).queryByRole('button', { name: /Koble/ })).not.toBeInTheDocument()

  fireEvent.click(within(overview).getAllByRole('button', { name: 'Lukk' }).at(-1)!)
  openExtractView()
  expect(screen.queryByText('Rollator Beta')).not.toBeInTheDocument()
  expect(screen.getByText(/Systemet inneholder/)).toBeInTheDocument()
})

const showCountColumn = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Vise/skjule kolonner' }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Antall produkter / varianter' }))
}

test('ISO-mapping viser antall produkter / varianter fra lastede rader, og – når koden ikke er lastet', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  expect(screen.queryByRole('columnheader', { name: /^Antall/ })).not.toBeInTheDocument()
  showCountColumn()
  expect(screen.getByRole('columnheader', { name: /^Antall/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hva betyr Antall?' })).toBeInTheDocument()

  const row18 = () => screen.getAllByText('18090301')[0].closest('tr') as HTMLElement
  await waitFor(() => expect(within(row18()).getByText('1 / 1')).toBeInTheDocument())
  const row05 = screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement
  expect(within(row05).getByText('0 / 0')).toBeInTheDocument()
})

test('antall vises som – til oversikten har lastet koden, og oppdateres etterpå', async () => {
  useUnverifiedRollatorMapping()
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const isoCode = new URL(request.url).searchParams.get('isoCode')
      if (!isoCode) return HttpResponse.json({ content: [], totalPages: 1, totalSize: 4758 })
      return HttpResponse.json({
        content: [overviewSeries('s1', 'Rollator Alfa', '18090301'), overviewSeries('s3', 'Rollator Beta', null)],
        totalPages: 1,
        totalSize: 2,
      })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  showCountColumn()
  const row18 = () => screen.getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(row18()).getByText('–')).toBeInTheDocument()

  enableEditMode()
  fireEvent.click(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Vis oversikt' }))
  const overview = await screen.findByRole('dialog', { name: /ISO 18090301/ })
  await within(overview).findByText('Rollator Beta')
  fireEvent.click(within(overview).getAllByRole('button', { name: 'Lukk' }).at(-1)!)

  await waitFor(() => expect(within(row18()).getByText('2 / 2')).toBeInTheDocument())
})

const useLargeSystemWithRollators = () => {
  useUnverifiedRollatorMapping()
  const requestedIsoCodes: (string | null)[] = []
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', ({ request }) => {
      const isoCode = new URL(request.url).searchParams.get('isoCode')
      requestedIsoCodes.push(isoCode)
      return HttpResponse.json({
        content: [overviewSeries('s1', 'Rollator Alfa', '18090301'), overviewSeries('s3', 'Rollator Beta', null)],
        totalPages: 1,
        totalSize: isoCode ? 2 : 4758,
      })
    })
  )
  return requestedIsoCodes
}

test('antall-kolonnen henter produktene automatisk for valgt ISO-filter i ISO-mapping', async () => {
  const requestedIsoCodes = useLargeSystemWithRollators()
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  await waitFor(() => expect(requestedIsoCodes).toEqual([null]))
  fireEvent.change(screen.getByLabelText('v16 nivå 1'), { target: { value: '18' } })

  showCountColumn()

  const row18 = () => screen.getAllByText('18090301')[0].closest('tr') as HTMLElement
  await waitFor(() => expect(within(row18()).getByText('2 / 2')).toBeInTheDocument())
  expect(requestedIsoCodes).toEqual([null, '18'])
  expect(screen.queryByRole('button', { name: 'Hent liste' })).not.toBeInTheDocument()
})

test('antall-kolonnen uten ISO-filter viser advarsel om stort uttrekk før alt hentes', async () => {
  const requestedIsoCodes = useLargeSystemWithRollators()
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  await waitFor(() => expect(requestedIsoCodes).toEqual([null]))

  showCountColumn()
  expect(await screen.findByText(/Systemet inneholder/)).toBeInTheDocument()
  const row18 = () => screen.getAllByText('18090301')[0].closest('tr') as HTMLElement
  expect(within(row18()).getByText('–')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Fortsett likevel' }))
  await waitFor(() => expect(within(row18()).getByText('2 / 2')).toBeInTheDocument())
  expect(screen.queryByText(/Systemet inneholder/)).not.toBeInTheDocument()
})

test('F6: oppretting av en v22-kode som allerede finnes stoppes før kallet sendes', async () => {
  let createCalls = 0
  server.use(
    http.get('http://localhost:8080/admreg/api/v22/isocategories', () =>
      HttpResponse.json([...isoCategoriesV22, isoCategoryV22('22091299', 4, 'Finnes allerede')])
    ),
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', () => {
      createCalls++
      return HttpResponse.json({}, { status: 201 })
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  openRowMenu(screen.getAllByText('~ Endret kode og overskrift')[0].closest('tr') as HTMLElement)
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Opprett ny ISO v22-kategori (nivå 4)' }))
  fireEvent.change(screen.getByLabelText('Siste 2 siffer'), { target: { value: '99' } })
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Duplikat' } })
  fireEvent.click(screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' }))

  expect(await screen.findByText('ISO 22091299 finnes allerede. Velg andre sifre.')).toBeInTheDocument()
  expect(createCalls).toBe(0)
})

test('F7: endremodus-bryteren har fast navn og hver radmeny har sitt eget navn', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })

  const toggle = screen.getByRole('checkbox', { name: 'Endremodus' })
  fireEvent.click(toggle)
  expect(screen.getByRole('checkbox', { name: 'Endremodus' })).toBeChecked()

  expect(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' })).toBeInTheDocument()
  const menuNames = screen
    .getAllByRole('button', { name: /^Rad-meny/ })
    .map((button) => button.getAttribute('aria-label'))
  expect(new Set(menuNames).size).toBe(menuNames.length)
})

test('F9: feil ved verifisering vises i dialogen, som holdes åpen', async () => {
  server.use(
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', () =>
      HttpResponse.json({ message: 'Mapping er låst' }, { status: 500 })
    )
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Fjern verifisering' }))
  const dialog = await screen.findByRole('dialog', { name: 'Bekreft fjerning av verifisering' })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fjern verifisering' }))

  expect(await within(dialog).findByRole('alert')).toHaveTextContent('Mapping er låst')
  expect(screen.getByRole('dialog', { name: 'Bekreft fjerning av verifisering' })).toBeInTheDocument()
})

test('F10: oversikten for en verifisert mapping lover ikke tilkobling', async () => {
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await screen.findByRole('button', { name: 'Rad-meny for ISO 18090301' }))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Fjern verifisering' }))
  const dialog = await screen.findByRole('dialog', { name: 'Bekreft fjerning av verifisering' })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Vis oversikt' }))

  const overview = await screen.findByRole('dialog', { name: 'Oversikt over ISO 18090301' })
  await waitFor(() => expect(within(overview).getByText(/er registrert med ISO 18090301/)).toBeInTheDocument())
  expect(within(overview).queryByText(/blir koblet til/)).not.toBeInTheDocument()
  expect(within(overview).queryByText(/vil bli koblet/)).not.toBeInTheDocument()
})

test('nytt forsøk etter feilet mappingoppdatering hopper over opprettingen og fullfører koblingen', async () => {
  let createCalls = 0
  let mappingUpdates = 0
  server.use(
    http.post('http://localhost:8080/admreg/admin/api/v22/isocategory', () => {
      createCalls++
      return HttpResponse.json({}, { status: 201 })
    }),
    http.put('http://localhost:8080/admreg/admin/api/v22/isomap/:id', async ({ request }) => {
      mappingUpdates++
      if (mappingUpdates === 1) return HttpResponse.json({ message: 'Midlertidig feil' }, { status: 500 })
      const body = (await request.json()) as { isoMap: Record<string, string | number | boolean | null | string[]> }
      return HttpResponse.json(body.isoMap)
    })
  )
  renderPage()
  await screen.findByRole('option', { name: '05 Hjelpemidler for trening' })
  enableEditMode()

  fireEvent.click(await findIsoRowMenu('050303'))
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Opprett ny ISO v22-kategori (nivå 4)' }))
  fireEvent.change(screen.getByLabelText('Siste 2 siffer'), { target: { value: '01' } })
  fireEvent.change(screen.getByLabelText('Tittel'), { target: { value: 'Ny kommunikasjon' } })
  const submit = screen.getByRole('button', { name: 'Opprett kategori og koble til mapping' })
  fireEvent.click(submit)

  expect(
    await screen.findByText(/ISO 22091201 er opprettet, men 1 av 1 mapping ble ikke koblet til/)
  ).toBeInTheDocument()
  expect(createCalls).toBe(1)

  fireEvent.click(submit)
  await waitFor(() => expect(mappingUpdates).toBe(2))
  expect(createCalls).toBe(1)
  expect(screen.queryByText(/finnes allerede/)).not.toBeInTheDocument()
})
