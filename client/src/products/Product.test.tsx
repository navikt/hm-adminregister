import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { axe } from 'jest-axe'
import { apiPath } from 'mocks/apiPath'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import Product from 'products/Product'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useErrorStore } from 'utils/store/useErrorStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'
import { BulkVariantUpdateDTO, ProductRegistrationDTOV2 } from 'utils/types/response-types'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'

const dummyProduct = (id: string, title: string, status: string) => {
  return {
    id: id,
    supplierName: 'defaultSupplier',
    title: title,
    text: 'defaultText',
    isoCategory: {
      isoCode: '10101010',
      isoTitle: 'DefaultIsoTitle',
      isoText: 'DefaultIsoText',
      isoTextShort: 'DefaultIsoTextShort',
      isoTranslations: {
        titleEn: '',
        textEn: '',
      },
      isoLevel: 4,
      isActive: true,
      showTech: true,
      allowMulti: true,
      created: '2024-07-17T12:41:35.676752966',
      updated: '2024-07-17T12:41:35.676759257',
    },
    status: status,
    seriesData: {
      media: [],
      attributes: {
        keywords: ['defaultKeyword'],
        url: 'https://nav.no',
      },
    },
    created: '2024-05-24T09:54:25.595126',
    updated: '2024-05-24T09:54:25.595163',
    expired: '2039-05-24T13:00:52.664454747',
    updatedByUser: 'system',
    createdByUser: 'system',
    variants: [],
    version: 0,
    isExpired: false,
    isPublished: false,
    inAgreement: false,
  }
}

const dummyVariant = (id: string, articleName: string): ProductRegistrationDTOV2 =>
  ({
    id,
    articleName,
    hmsArtNr: `HMS-${id}`,
    supplierRef: `REF-${id}`,
    isPublished: true,
    isExpired: false,
    agreements: [],
    productData: {
      techData: [],
      attributes: {},
    },
  }) as unknown as ProductRegistrationDTOV2

const logIn = (isAdmin: boolean) => {
  const { result } = renderHook(() => useAuthStore())
  result.current.setLoggedInUser({
    isAdminOrHmsUser: isAdmin,
    isAdmin: isAdmin,
    isHmsUser: false,
    isSupplier: !isAdmin,
    userId: '',
    userName: '',
    exp: '',
    supplierName: '',
    supplierId: '',
  })
}

const approvalButton = 'Send til godkjenning'
const changeDescriptionButton = 'Endre beskrivelse'
const changeKeywordButton = 'Endre nøkkelord'

const addVariantButton = 'Legg til ny variant'
const addImagesButton = 'Legg til bilder'
const addDocumentsButton = 'Legg til dokumenter'
const addVideoButton = 'Legg til videolenke'

beforeEach(() => {
  server.use(
    http.get(apiPath('api/v1/isocategories'), () => HttpResponse.json([])),
    http.get(apiPath('vendor/api/v1/product/registrations/series/*'), () => HttpResponse.json([]))
  )
})

describe('Produktside', () => {
  test('Tom beskrivelse kan ikke lagres uten at brukeren skriver noe', async () => {
    logIn(false)
    server.use(
      http.get(apiPath('api/v1/series/*'), () =>
        HttpResponse.json({ ...dummyProduct('empty-description', 'Testprodukt', 'EDITABLE'), text: '' })
      )
    )
    render(
      <MemoryRouter initialEntries={['/produkter/empty-description']}>
        <Routes>
          <Route path="/produkter/:seriesId" element={<Product />} />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Legg til beskrivelse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lagre' }))
    expect(screen.getByText(/Beskrivelsen må være minst 100 tegn/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lagre' })).toBeInTheDocument()
  })

  test('Redigerbart produkt', async () => {
    logIn(false)
    const { container } = render(
      <MemoryRouter initialEntries={['/produkter/e7ef234a-fc0c-4538-a8b2-63a361ad3529']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })).toBeInTheDocument()
    // about
    expect(await screen.findByText('defaultText')).toBeInTheDocument()
    expect(await screen.findByText('defaultKeyword')).toBeInTheDocument()
    //expect(await screen.findByText("https://nav.no")).toBeInTheDocument();
    // sidebar
    expect(await screen.findByText('Under endring')).toBeInTheDocument()
    expect(await screen.findByText('defaultSupplier')).toBeInTheDocument()

    expect(await axe(container)).toHaveNoViolations()

    //Redigeringsknapper vises
    expect(await screen.findByRole('button', { name: approvalButton })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: changeDescriptionButton })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: changeKeywordButton })).toBeInTheDocument()
    expect(
      screen.getByText('Nøkkelord gjør det enklere å få treff i søkefunksjonen på FinnHjelpemiddel')
    ).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Varianter/ }))
    expect(await screen.findByRole('button', { name: addVariantButton })).toBeInTheDocument()
    const variantGuidance = screen.getByRole('tabpanel')
    expect(within(variantGuidance).getAllByRole('listitem')).toHaveLength(6)
    expect(within(variantGuidance).getAllByRole('list')).toHaveLength(2)
    expect(within(variantGuidance).getByText('Størrelse')).toBeInTheDocument()
    expect(within(variantGuidance).getByText('Farge')).toBeInTheDocument()
    expect(
      within(variantGuidance).getByText('Andre egenskaper som ikke påvirker produktets funksjon')
    ).toBeInTheDocument()
    expect(
      within(variantGuidance).getByText(
        'Hvis produktet kun har én variant, skal variantnavnet være identisk med produktnavnet.'
      )
    ).toBeInTheDocument()
    expect(
      within(variantGuidance).getByText(
        'Hvis produktet har flere varianter, skal variantnavnet tydelig beskrive det som skiller variantene fra hverandre.'
      )
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Bilder/ }))
    expect(await screen.findByRole('button', { name: addImagesButton })).toBeInTheDocument()
    expect(within(screen.getByRole('tabpanel')).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'vise produkter slik de leveres',
      'være høyoppløselige',
      'ha produktet i fokus',
      'ikke ha svart bakgrunn',
    ])
    expect(screen.queryByText(/Dra i bildene eller trykk på pilene/)).not.toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Dokumenter/ }))
    expect(await screen.findByRole('button', { name: addDocumentsButton })).toBeInTheDocument()
    expect(
      screen.getByText('Legg til nødvendige dokumenter til produktet, f.eks. brosjyre, bruksanvisning eller sprengskisse.')
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Videolenker/ }))
    expect(await screen.findByRole('button', { name: addVideoButton })).toBeInTheDocument()
    expect(
      screen.queryByText('Videoene vises på FinnHjelpemiddel og vil sorteres alfabetisk.')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Krav til video' })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('button', { name: approvalButton }))
    const approvalDialog = await screen.findByRole('dialog')
    expect(within(approvalDialog).getByText('Før du sender til godkjenning, sjekk at:')).toBeInTheDocument()
    const approvalChecklist = within(approvalDialog).getAllByRole('list')[0]
    expect(within(approvalChecklist).getAllByRole('listitem')).toHaveLength(5)
  }, 15000)

  test('Ikke-redigerbart produkt', async () => {
    logIn(false)

    server.use(
      http.get(apiPath('api/v1/series/*'), (info) => {
        return HttpResponse.json(dummyProduct('test2', 'title', 'PENDING_APPROVAL'))
      })
    )

    render(
      <MemoryRouter initialEntries={['/produkter/test2']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findAllByText('Venter på godkjenning')).toHaveLength(2)

    //Redigeringsknapper vises ikke
    expect(screen.queryByRole('button', { name: approvalButton })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: changeDescriptionButton })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: changeKeywordButton })).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Varianter/ }))
    expect(screen.queryByRole('button', { name: addVariantButton })).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Bilder/ }))
    expect(screen.queryByRole('button', { name: addImagesButton })).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Dokumenter/ }))
    expect(screen.queryByRole('button', { name: addDocumentsButton })).not.toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Videolenker/ }))
    expect(screen.queryByRole('button', { name: addVideoButton })).not.toBeInTheDocument()
  })
})

describe('Tilbake til oversikt – oversiktPath fallback', () => {
  const backLinkName = /Tilbake til oversikt/

  afterEach(() => {
    sessionStorage.clear()
  })

  test('Bruker location.state naar den finnes', async () => {
    logIn(false)
    sessionStorage.setItem('approvalListPath', '/til-godkjenning?q=fraStorage')

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/produkter/test-state', state: '/til-godkjenning?q=fraState&supplier=abc' }]}
      >
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    const link = await screen.findByRole('link', { name: backLinkName })
    expect(link).toHaveAttribute('href', '/til-godkjenning?q=fraState&supplier=abc')
  })

  test('Faller tilbake til sessionStorage naar state mangler', async () => {
    logIn(false)
    sessionStorage.setItem('approvalListPath', '/til-godkjenning?q=fraStorage&supplier=abc')

    render(
      <MemoryRouter initialEntries={['/produkter/test-storage']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    const link = await screen.findByRole('link', { name: backLinkName })
    expect(link).toHaveAttribute('href', '/til-godkjenning?q=fraStorage&supplier=abc')
  })

  test('Faller tilbake til /produkter naar bade state og sessionStorage mangler', async () => {
    logIn(false)

    render(
      <MemoryRouter initialEntries={['/produkter/test-default']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    const link = await screen.findByRole('link', { name: backLinkName })
    expect(link).toHaveAttribute('href', '/produkter')
  })
})

describe('Bred visning', () => {
  afterEach(() => {
    localStorage.clear()
    useWideModeStore.getState().setWideMode(false)
  })

  test('bruker normal kolonnebredde som standard', async () => {
    logIn(true)

    const { container } = render(
      <MemoryRouter initialEntries={['/produkter/test-normal-width?tab=variants']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(container.innerHTML).toContain('minmax(16rem, 48rem)')
    expect(container.innerHTML).not.toContain('minmax(16rem, 1fr)')
  })

  test('bruker bredere kolonnebredde paa Varianter-fanen naar wideMode er skrudd paa for admin', async () => {
    logIn(true)
    useWideModeStore.getState().setWideMode(true)

    const { container } = render(
      <MemoryRouter initialEntries={['/produkter/test-wide-width?tab=variants']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(container.innerHTML).toContain('minmax(16rem, 1fr)')
    expect(container.innerHTML).not.toContain('minmax(16rem, 48rem)')
  })

  test.each([true, false])('paavirker ikke andre faner enn Varianter, admin=%s', async (isAdmin) => {
    logIn(isAdmin)
    useWideModeStore.getState().setWideMode(true)

    const { container } = render(
      <MemoryRouter initialEntries={[`/produkter/test-wide-width-other-tab-${isAdmin}?tab=about`]}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(container.innerHTML).toContain('minmax(16rem, 48rem)')
    expect(container.innerHTML).not.toContain('minmax(16rem, 1fr)')
  })

  test('bruker bredere kolonnebredde for leverandører paa Varianter-fanen', async () => {
    logIn(false)
    useWideModeStore.getState().setWideMode(true)

    const { container } = render(
      <MemoryRouter initialEntries={['/produkter/test-wide-width-supplier?tab=variants']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(container.innerHTML).toContain('minmax(16rem, 1fr)')
    expect(container.innerHTML).not.toContain('minmax(16rem, 48rem)')
  })

  test.each([true, false])('viser flere varianter per side i bred visning, admin=%s', async (isAdmin) => {
    logIn(isAdmin)

    const manyVariants = Array.from({ length: 12 }, (_, i) => dummyVariant(`v${i + 1}`, `Variant ${i + 1}`))
    server.use(
      http.get(apiPath('api/v1/series/*'), () => {
        return HttpResponse.json({
          ...dummyProduct(`test-many-variants-${isAdmin}`, 'defaultTitle', 'EDITABLE'),
          variants: manyVariants,
        })
      })
    )

    // jsdom rapporterer alltid clientWidth 0 - simuler en bred skjerm/container ved å
    // overstyre clientWidth slik komponentens ResizeObserver-baserte bredde-måling faktisk
    // ser en stor verdi, tilsvarende en admin med et bredt vindu i bred visning.
    const clientWidthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(2500)

    // "Kopier verdi til varianter"-modalen holder alltid alle andre varianter mounted i en
    // egen tabell (selv når lukket), så vi må se bort fra treff inni <dialog>-elementer for å
    // kun telle varianter som faktisk vises i selve sammenligningstabellen.
    const visibleVariantNames = () =>
      within(document.body)
        .queryAllByText(/^Variant \d+$/)
        .filter((el) => !el.closest('dialog'))
        .map((el) => el.textContent)

    try {
      render(
        <MemoryRouter initialEntries={[`/produkter/test-many-variants-${isAdmin}?tab=variants`]}>
          <Routes>
            <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
          </Routes>
        </MemoryRouter>
      )

      await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
      await waitFor(() => expect(visibleVariantNames()).toContain('Variant 1'))

      // Normal bredde: kun 5 varianter per side
      expect(visibleVariantNames()).not.toContain('Variant 6')

      useWideModeStore.getState().setWideMode(true)

      // Med bred visning skal flere varianter (mer enn 5) vises på siden, gitt tilstrekkelig
      // tilgjengelig bredde (floor((2500 - 250) / 220) = 10 kolonner).
      await waitFor(() => expect(visibleVariantNames()).toContain('Variant 6'))
      expect(visibleVariantNames()).toContain('Variant 10')
      expect(visibleVariantNames()).not.toContain('Variant 11')
    } finally {
      clientWidthSpy.mockRestore()
    }
  })

  test('bruker riktig antall varianter i bred visning ogsaa naar Varianter-fanen aapnes etter foerste rendering', async () => {
    // Regresjonstest: "Varianter"-fanen (VariantsTab) er ikke fanen som vises som standard ved
    // navigering (default er "Om produktet"), og selve variant-tabellen ligger i en Tabs.Panel
    // som kun monterer innholdet sitt når fanen faktisk er aktiv (Aksel sin lazy-oppførsel).
    // Det betyr at tabellens DOM-element ikke finnes i det hele tatt før brukeren klikker seg
    // inn på fanen - lenge etter at VariantsTab-komponenten (og bredde-hooken i den) først ble
    // montert. Den forrige bredde-hooken målte kun bredde ved sitt eget mount (tom
    // avhengighetsliste på en vanlig ref), og fanget derfor aldri opp elementet som dukket opp
    // senere, noe som ga fast 5 varianter per side helt til siden ble lastet på nytt (der fanen
    // for øvrig fortsatt ville vært skjult som standard - selve refresh-fiksen kom av at brukeren
    // da gjerne landet direkte på et vindu der elementet alt fantes, f.eks. via en lenke med
    // ?tab=variants). Simulerer den faktiske brukerflyten: naviger inn (uten ?tab=variants),
    // og klikk deretter på Varianter-fanen.
    logIn(true)
    useWideModeStore.getState().setWideMode(true)

    const manyVariants = Array.from({ length: 12 }, (_, i) => dummyVariant(`v${i + 1}`, `Variant ${i + 1}`))
    server.use(
      http.get(apiPath('api/v1/series/*'), () => {
        return HttpResponse.json({
          ...dummyProduct('test-tab-switch-variants', 'defaultTitle', 'EDITABLE'),
          variants: manyVariants,
        })
      })
    )

    const clientWidthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(2500)

    const visibleVariantNames = () =>
      within(document.body)
        .queryAllByText(/^Variant \d+$/)
        .filter((el) => !el.closest('dialog'))
        .map((el) => el.textContent)

    try {
      render(
        <MemoryRouter initialEntries={['/produkter/test-tab-switch-variants']}>
          <Routes>
            <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
          </Routes>
        </MemoryRouter>
      )

      await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
      fireEvent.click(await screen.findByRole('tab', { name: /Varianter/ }))

      await waitFor(() => expect(visibleVariantNames()).toContain('Variant 6'))
      expect(visibleVariantNames()).toContain('Variant 10')
      expect(visibleVariantNames()).not.toContain('Variant 11')
    } finally {
      clientWidthSpy.mockRestore()
    }
  })
})

describe('Forkast variantendringer ved publisering', () => {
  test('avslutter redigering av varianter naar admin publiserer produktet', async () => {
    logIn(true)

    const variantWithTechData: ProductRegistrationDTOV2 = {
      ...dummyVariant('v1', 'Variant 1'),
      productData: {
        techData: [{ key: 'Vekt', unit: 'kg', value: '10' }],
        attributes: {},
      },
    } as unknown as ProductRegistrationDTOV2

    server.use(
      http.get(apiPath('api/v1/series/*'), () => {
        return HttpResponse.json({
          ...dummyProduct('test-discard-on-publish', 'defaultTitle', 'EDITABLE'),
          variants: [variantWithTechData],
        })
      }),
      http.put(apiPath('admin/api/v1/series/approve-v2/*'), () => {
        return HttpResponse.json({})
      })
    )

    render(
      <MemoryRouter initialEntries={['/produkter/test-discard-on-publish?tab=variants']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })

    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    expect(await screen.findByRole('button', { name: 'Avbryt redigering' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'Publiser' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Før du publiserer, sjekk at:')).toBeInTheDocument()
    const checklist = within(dialog).getAllByRole('list')[0]
    expect(
      within(checklist)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual([
      'produktbeskrivelsen har en nøytral språkstil uten markedsføringsuttrykk',
      'spesifikasjonene er korrekte',
      'alle relevante spesifikasjoner er utfylt',
      'produktet har minst to unike bilder',
      'produktet har minst ett dokument, f. eks. brosjyre eller bruksanvisning',
    ])
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publiser' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Avbryt redigering' })).not.toBeInTheDocument())
    expect(await screen.findByRole('button', { name: 'Rediger varianter' })).toBeInTheDocument()
  })

  test('beholder redigeringsmodus og ulagrede endringer naar publisering feiler', async () => {
    logIn(true)

    const variantWithTechData: ProductRegistrationDTOV2 = {
      ...dummyVariant('v1', 'Variant 1'),
      productData: {
        techData: [{ key: 'Vekt', unit: 'kg', value: '10' }],
        attributes: {},
      },
    } as unknown as ProductRegistrationDTOV2

    server.use(
      http.get(apiPath('api/v1/series/*'), () => {
        return HttpResponse.json({
          ...dummyProduct('test-discard-on-publish-failure', 'defaultTitle', 'EDITABLE'),
          variants: [variantWithTechData],
        })
      }),
      http.put(apiPath('admin/api/v1/series/approve-v2/*'), () => {
        return HttpResponse.json({ message: 'Publisering feilet' }, { status: 500 })
      })
    )

    render(
      <MemoryRouter initialEntries={['/produkter/test-discard-on-publish-failure?tab=variants']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })

    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    expect(await screen.findByRole('button', { name: 'Avbryt redigering' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'Publiser' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publiser' }))

    // Publishing failed - edit mode (and the admin's unsaved changes) must NOT be discarded, so
    // they don't have to redo their edits after a transient publish failure.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Avbryt redigering' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rediger varianter' })).not.toBeInTheDocument()
  })
})

describe('Masseredigering av varianter', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1500)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const variantWithWeight = (id: string, value: string): ProductRegistrationDTOV2 => ({
    ...dummyVariant(id, `Variant ${id}`),
    productData: {
      attributes: {},
      techData: [{ key: 'Vekt', value, unit: 'kg', type: 'NUMBER', required: false, options: [] }],
    },
  })

  const renderVariants = (id: string, variants: ProductRegistrationDTOV2[], status = 'EDITABLE') => {
    server.use(
      http.get(apiPath('api/v1/series/*'), () =>
        HttpResponse.json({ ...dummyProduct(id, 'defaultTitle', status), variants })
      ),
      http.get(apiPath('admin/api/v1/product/registrations/series/*'), () => HttpResponse.json(variants)),
      http.get(apiPath('vendor/api/v1/product/registrations/series/*'), () => HttpResponse.json(variants))
    )
    return render(
      <MemoryRouter initialEntries={[`/produkter/${id}?tab=variants`]}>
        <Routes>
          <Route path="/produkter/:seriesId" element={<Product />} />
        </Routes>
      </MemoryRouter>
    )
  }

  test.each([false, true])('redigerer og kopierer før lagring med riktig API-rute, admin=%s', async (isAdmin) => {
    logIn(isAdmin)
    const seriesId = `bulk-copy-${isAdmin}`
    const variants = [
      variantWithWeight('1', '10'),
      variantWithWeight('2', '20'),
      variantWithWeight('3', '30'),
      dummyVariant('4', 'Uten egenskap'),
    ]
    const requests: BulkVariantUpdateDTO[] = []
    const path = isAdmin
      ? 'admin/api/v1/product/registrations/tech-data/bulk'
      : `vendor/api/v1/product/registrations/series/${seriesId}/tech-data/bulk`
    server.use(
      http.put(apiPath(path), async ({ request }) => {
        expect(new URL(request.url).searchParams.get('isoVersion')).toBe('v16')
        const body = (await request.json()) as BulkVariantUpdateDTO
        requests.push(body)
        const updated = body.updates.map((update) => {
          const index = variants.findIndex((variant) => variant.id === update.productId)
          const original = variants[index]
          variants[index] = {
            ...original,
            articleName: update.articleName ?? original.articleName,
            hmsArtNr: update.hmsArtNr !== undefined ? update.hmsArtNr || null : original.hmsArtNr,
            productData: { ...original.productData, techData: update.techData },
          }
          return variants[index]
        })
        return HttpResponse.json({ updated, failed: [] })
      })
    )
    const { container } = renderVariants(seriesId, variants)

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(screen.getByRole('rowheader', { name: 'Lev.art.nr:' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Hms.nr:' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    if (isAdmin) {
      fireEvent.change(screen.getByRole('textbox', { name: 'HMS-nr. for Variant 1' }), {
        target: { value: ' 001234 ' },
      })
    } else {
      expect(screen.queryByRole('textbox', { name: /HMS-nr\./ })).not.toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'HMS-1' })).toBeInTheDocument()
    }
    fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' }), {
      target: { value: '  Nytt variantnavn  ' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 1' }), { target: { value: '15' } })
    fireEvent.click(screen.getAllByTitle('Kopier verdi til andre varianter')[0])

    const dialog = await screen.findByRole('dialog', { name: 'Kopier verdi for "Vekt" til flere varianter' })
    expect(within(dialog).queryByRole('checkbox', { name: 'Velg Variant 1' })).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Uten egenskap')).not.toBeInTheDocument()
    expect(within(dialog).getByRole('checkbox', { name: 'Velg Variant 2' })).toBeChecked()
    expect(within(dialog).getByRole('checkbox', { name: 'Velg Variant 3' })).toBeChecked()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kopier til 2 varianter' }))

    expect(screen.getByRole('textbox', { name: 'Vekt for Variant 2' })).toHaveValue('15')
    expect(screen.getByRole('textbox', { name: 'Vekt for Variant 3' })).toHaveValue('15')
    expect(requests).toHaveLength(0)
    if (!isAdmin) {
      expect(await axe(container)).toHaveNoViolations()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))

    await screen.findByRole('button', { name: 'Rediger varianter' })
    expect(requests).toHaveLength(1)
    expect(requests[0].updates.map((update) => update.productId)).toEqual(['1', '2', '3'])
    expect(requests[0].updates.every((update) => update.techData[0].value === '15')).toBe(true)
    expect(requests[0].updates[0].articleName).toBe('Nytt variantnavn')
    expect(requests[0].updates[1]).not.toHaveProperty('articleName')
    if (isAdmin) {
      expect(requests[0].updates[0].hmsArtNr).toBe('001234')
      expect(await screen.findByRole('cell', { name: '001234' })).toBeInTheDocument()
    } else {
      requests[0].updates.forEach((update) => expect(update).not.toHaveProperty('hmsArtNr'))
    }
    expect(requests[0].updates[1]).not.toHaveProperty('hmsArtNr')
    expect(await screen.findByRole('cell', { name: 'Nytt variantnavn' })).toBeInTheDocument()
    expect(await screen.findAllByText('15 kg')).toHaveLength(3)
  })

  test.each([false, true])('edits supplier references with single-edit permissions, admin=%s', async (isAdmin) => {
    logIn(isAdmin)
    const seriesId = `supplier-ref-${isAdmin}`
    const variants = [{ ...variantWithWeight('1', '10'), isPublished: false }, variantWithWeight('2', '20')]
    const requests: BulkVariantUpdateDTO[] = []
    const path = isAdmin
      ? 'admin/api/v1/product/registrations/tech-data/bulk'
      : `vendor/api/v1/product/registrations/series/${seriesId}/tech-data/bulk`
    server.use(
      http.put(apiPath(path), async ({ request }) => {
        const body = (await request.json()) as BulkVariantUpdateDTO
        requests.push(body)
        const updated = body.updates.flatMap((update) => {
          if (requests.length === 1 && update.productId === '1') return []
          const index = variants.findIndex((variant) => variant.id === update.productId)
          variants[index] = {
            ...variants[index],
            supplierRef: update.supplierRef ?? variants[index].supplierRef,
            productData: { ...variants[index].productData, techData: update.techData },
          }
          return [variants[index]]
        })
        return HttpResponse.json({
          updated,
          failed: requests.length === 1 ? [{ productId: '1', message: 'Save failed' }] : [],
        })
      })
    )
    renderVariants(seriesId, variants)
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    const name = 'Leverandørens artikkelnummer for Variant 1'
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: '' } })
    expect(screen.getByText('Artikkelnummer er påkrevd')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: '  New ref  ' } })
    const publishedName = 'Leverandørens artikkelnummer for Variant 2'
    if (isAdmin) {
      fireEvent.change(screen.getByRole('textbox', { name: publishedName }), {
        target: { value: 'Admin ref' },
      })
    } else {
      expect(screen.queryByRole('textbox', { name: publishedName })).not.toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'REF-2' })).toBeInTheDocument()
    }
    fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 2' }), { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))
    await screen.findByText(/Noen endringer kunne ikke lagres/)
    expect(screen.getByRole('textbox', { name })).toHaveValue('  New ref  ')
    expect(requests[0].updates.find((update) => update.productId === '1')).toMatchObject({
      supplierRef: 'New ref',
    })
    if (isAdmin) {
      expect(requests[0].updates.find((update) => update.productId === '2')).toHaveProperty('supplierRef', 'Admin ref')
    } else {
      expect(requests[0].updates.find((update) => update.productId === '2')).not.toHaveProperty('supplierRef')
    }
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))
    await screen.findByRole('button', { name: 'Rediger varianter' })
    expect(requests[1].updates).toHaveLength(1)
    expect(requests[1].updates[0]).toMatchObject({ productId: '1', supplierRef: 'New ref' })
    expect(await screen.findByRole('cell', { name: 'New ref' })).toBeInTheDocument()
  })

  test.each([' 001234 ', '   '])('admin can retry, discard and save an HMS-only edit (%#)', async (hmsArtNr) => {
    logIn(true)
    const seriesId = `hms-only-${hmsArtNr.trim() || 'clear'}`
    const variants = [dummyVariant('1', 'Variant 1')]
    const requests: BulkVariantUpdateDTO[] = []
    server.use(
      http.put(apiPath('admin/api/v1/product/registrations/tech-data/bulk'), async ({ request }) => {
        const body = (await request.json()) as BulkVariantUpdateDTO
        requests.push(body)
        if (requests.length === 1) {
          return HttpResponse.json({
            updated: [],
            failed: [{ productId: '1', message: 'Save failed' }],
          })
        }
        variants[0] = { ...variants[0], hmsArtNr: body.updates[0].hmsArtNr || null }
        return HttpResponse.json({ updated: variants, failed: [] })
      })
    )
    renderVariants(seriesId, variants)
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    const name = 'HMS-nr. for Variant 1'
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: hmsArtNr } })
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))

    await screen.findByText(/Noen endringer kunne ikke lagres/)
    expect(screen.getByRole('textbox', { name })).toHaveValue(hmsArtNr)
    expect(requests[0].updates).toHaveLength(1)
    expect(requests[0].updates[0]).toMatchObject({ productId: '1', hmsArtNr: hmsArtNr.trim(), techData: [] })
    expect(requests[0].updates[0]).not.toHaveProperty('articleName')

    fireEvent.click(screen.getByRole('button', { name: 'Avbryt redigering' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Forkast endringer' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    expect(screen.getByRole('textbox', { name })).toHaveValue('HMS-1')
    expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: hmsArtNr } })
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))
    await screen.findByRole('button', { name: 'Rediger varianter' })
    expect(requests).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Rediger varianter' }))
    expect(screen.getByRole('textbox', { name })).toHaveValue(hmsArtNr.trim())
    expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()
  })

  test.each([true, false])(
    'clears pending changes only after successful variant deletion, success=%s',
    async (success) => {
      logIn(true)
      const seriesId = `bulk-delete-${success}`
      const variants = [variantWithWeight('1', '10'), variantWithWeight('2', '20')]
      const requests: BulkVariantUpdateDTO[] = []
      const setGlobalError = vi.spyOn(useErrorStore.getState(), 'setGlobalError').mockImplementation(() => {})
      server.use(
        http.delete(apiPath('admin/api/v1/product/registrations/delete'), async ({ request }) => {
          expect(await request.json()).toEqual(['1'])
          if (!success) {
            return HttpResponse.json({ message: 'Deletion failed' }, { status: 500 })
          }
          variants.splice(0, 1)
          return HttpResponse.json({})
        }),
        http.put(apiPath('admin/api/v1/product/registrations/tech-data/bulk'), async ({ request }) => {
          const body = (await request.json()) as BulkVariantUpdateDTO
          requests.push(body)
          variants[0] = {
            ...variants[0],
            articleName: body.updates[0].articleName!,
            productData: { ...variants[0].productData, techData: body.updates[0].techData },
          }
          return HttpResponse.json({ updated: variants, failed: [] })
        })
      )
      renderVariants(seriesId, variants)
      fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' }), {
        target: { value: '   ' },
      })
      fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 1' }), {
        target: { value: '15' },
      })
      fireEvent.change(screen.getByRole('textbox', { name: 'HMS-nr. for Variant 1' }), {
        target: { value: '123456' },
      })
      fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 2' }), {
        target: { value: 'Remaining variant' },
      })
      fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 2' }), {
        target: { value: '25' },
      })
      expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()

      fireEvent.click(screen.getAllByRole('button', { name: 'Meny' })[0])
      fireEvent.click((await screen.findAllByRole('button', { name: 'Slett' }))[0])
      const dialog = await screen.findByRole('dialog', { name: 'Er du sikker på at du vil slette varianten?' })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Slett' }))

      if (!success) {
        await waitFor(() => expect(setGlobalError).toHaveBeenCalled())
        expect(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' })).toHaveValue('   ')
        expect(screen.getByRole('textbox', { name: 'Vekt for Variant 1' })).toHaveValue('15')
        expect(screen.getByText('Variantnavn er påkrevd')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'HMS-nr. for Variant 1' })).toHaveValue('123456')
        expect(screen.getByText('5 ulagrede endringer')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()
        expect(requests).toHaveLength(0)
        return
      }

      await waitFor(() =>
        expect(screen.queryByRole('textbox', { name: 'Variantnavn for Variant 1' })).not.toBeInTheDocument()
      )
      expect(screen.queryByText('Variantnavn er påkrevd')).not.toBeInTheDocument()
      expect(screen.getByText('2 ulagrede endringer')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Variantnavn for Variant 2' })).toHaveValue('Remaining variant')
      expect(screen.getByRole('textbox', { name: 'Vekt for Variant 2' })).toHaveValue('25')
      expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeEnabled()
      fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))

      await screen.findByRole('button', { name: 'Rediger varianter' })
      expect(requests).toHaveLength(1)
      expect(requests[0].updates).toHaveLength(1)
      expect(requests[0].updates[0]).toMatchObject({
        productId: '2',
        articleName: 'Remaining variant',
        techData: [{ key: 'Vekt', value: '25' }],
      })
    }
  )

  test.each(['PENDING_APPROVAL', 'DONE', 'REJECTED'])('skjuler leverandørens editor for status %s', async (status) => {
    logIn(false)
    renderVariants(`bulk-hidden-${status}`, [variantWithWeight('1', '10')], status)

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(screen.queryByRole('button', { name: 'Rediger varianter' })).not.toBeInTheDocument()
  })

  test('skjuler editoren for HMS-bruker uten admin- eller leverandørrolle', async () => {
    logIn(false)
    const loggedInUser = useAuthStore.getState().loggedInUser!
    useAuthStore.getState().setLoggedInUser({
      ...loggedInUser,
      isSupplier: false,
      isHmsUser: true,
      isAdminOrHmsUser: true,
    })
    renderVariants('bulk-hidden-hms', [variantWithWeight('1', '10')])

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(screen.queryByRole('button', { name: 'Rediger varianter' })).not.toBeInTheDocument()
  })

  test('leverandør kan forkaste endringer uten å lagre', async () => {
    logIn(false)
    renderVariants('bulk-cancel', [variantWithWeight('1', '10')])
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' }), {
      target: { value: 'Forkast dette navnet' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 1' }), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Avbryt redigering' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Forkast endringer' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))

    expect(screen.getByRole('textbox', { name: 'Vekt for Variant 1' })).toHaveValue('10')
    expect(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' })).toHaveValue('Variant 1')
    expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()
  })

  test('beholder bare mislykkede leverandørendringer for nytt forsøk', async () => {
    logIn(false)
    const variants = [variantWithWeight('1', '10'), variantWithWeight('2', '20')]
    const requests: BulkVariantUpdateDTO[] = []
    server.use(
      http.put(
        apiPath('vendor/api/v1/product/registrations/series/bulk-partial/tech-data/bulk'),
        async ({ request }) => {
          const body = (await request.json()) as BulkVariantUpdateDTO
          requests.push(body)
          if (requests.length === 1) {
            variants[0] = {
              ...variants[0],
              articleName: body.updates[0].articleName!,
              productData: { ...variants[0].productData, techData: body.updates[0].techData },
            }
            return HttpResponse.json({
              updated: [variants[0]],
              failed: [{ productId: '2', message: 'Kunne ikke lagre endringen' }],
            })
          }
          variants[1] = {
            ...variants[1],
            articleName: body.updates[0].articleName!,
            productData: { ...variants[1].productData, techData: body.updates[0].techData },
          }
          return HttpResponse.json({ updated: [variants[1]], failed: [] })
        }
      )
    )
    renderVariants('bulk-partial', variants)
    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 1' }), {
      target: { value: 'Nytt navn 1' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Variantnavn for Variant 2' }), {
      target: { value: 'Nytt navn 2' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 1' }), { target: { value: '15' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Vekt for Variant 2' }), { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))

    expect(await screen.findByText(/Noen endringer kunne ikke lagres/)).toBeInTheDocument()
    expect(screen.getByText('2 ulagrede endringer')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Vekt for Variant 2' })).toHaveValue('25')
    expect(screen.getByRole('textbox', { name: 'Variantnavn for Variant 2' })).toHaveValue('Nytt navn 2')
    expect(await screen.findByRole('textbox', { name: 'Variantnavn for Nytt navn 1' })).toHaveValue('Nytt navn 1')
    fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))

    await screen.findByRole('button', { name: 'Rediger varianter' })
    expect(requests[1].updates.map((update) => update.productId)).toEqual(['2'])
    expect(requests[1].updates[0].articleName).toBe('Nytt navn 2')
    expect(await screen.findByRole('cell', { name: 'Nytt navn 2' })).toBeInTheDocument()
    expect(screen.queryByText(/Noen endringer kunne ikke lagres/)).not.toBeInTheDocument()
  })

  test.each([false, true])(
    'avviser ugyldige navn og tillater navneendring uten egenskaper, admin=%s',
    async (isAdmin) => {
      logIn(isAdmin)
      const seriesId = `name-only-${isAdmin}`
      const variants = [dummyVariant('1', 'Uten egenskaper')]
      const requests: BulkVariantUpdateDTO[] = []
      const path = isAdmin
        ? 'admin/api/v1/product/registrations/tech-data/bulk'
        : `vendor/api/v1/product/registrations/series/${seriesId}/tech-data/bulk`
      server.use(
        http.put(apiPath(path), async ({ request }) => {
          const body = (await request.json()) as BulkVariantUpdateDTO
          requests.push(body)
          variants[0] = { ...variants[0], articleName: body.updates[0].articleName! }
          return HttpResponse.json({ updated: variants, failed: [] })
        })
      )
      renderVariants(seriesId, variants)
      fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
      const input = screen.getByRole('textbox', { name: 'Variantnavn for Uten egenskaper' })
      for (const value of ['', '   ', 'x'.repeat(1025)]) {
        fireEvent.change(input, { target: { value } })
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeDisabled()
        expect(requests).toHaveLength(0)
      }
      fireEvent.change(input, { target: { value: '  Bare nytt navn  ' } })
      fireEvent.click(screen.getByRole('button', { name: 'Lagre endringer' }))
      await screen.findByRole('button', { name: 'Rediger varianter' })
      expect(requests).toHaveLength(1)
      expect(requests[0].updates[0]).toMatchObject({ productId: '1', articleName: 'Bare nytt navn', techData: [] })
      expect(await screen.findByRole('cell', { name: 'Bare nytt navn' })).toBeInTheDocument()
    }
  )
})
