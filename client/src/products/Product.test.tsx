import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { axe } from 'jest-axe'
import { apiPath } from 'mocks/apiPath'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import Product from 'products/Product'
import { useAuthStore } from 'utils/store/useAuthStore'
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

    fireEvent.click(await screen.findByRole('tab', { name: /Egenskaper/ }))
    expect(await screen.findByRole('button', { name: addVariantButton })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Bilder/ }))
    expect(await screen.findByRole('button', { name: addImagesButton })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Dokumenter/ }))
    expect(await screen.findByRole('button', { name: addDocumentsButton })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()

    fireEvent.click(await screen.findByRole('tab', { name: /Videolenker/ }))
    expect(await screen.findByRole('button', { name: addVideoButton })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
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

    fireEvent.click(await screen.findByRole('tab', { name: /Egenskaper/ }))
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

  test('bruker bredere kolonnebredde paa Egenskaper-fanen naar wideMode er skrudd paa for admin', async () => {
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

  test.each([true, false])('paavirker ikke andre faner enn Egenskaper, admin=%s', async (isAdmin) => {
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

  test('bruker bredere kolonnebredde for leverandører paa Egenskaper-fanen', async () => {
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

  test('bruker riktig antall varianter i bred visning ogsaa naar Egenskaper-fanen aapnes etter foerste rendering', async () => {
    // Regresjonstest: "Egenskaper"-fanen (VariantsTab) er ikke fanen som vises som standard ved
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
    // og klikk deretter på Egenskaper-fanen.
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
      fireEvent.click(await screen.findByRole('tab', { name: /Egenskaper/ }))

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
            productData: { ...original.productData, techData: update.techData },
          }
          return variants[index]
        })
        return HttpResponse.json({ updated, failed: [] })
      })
    )
    const { container } = renderVariants(seriesId, variants)

    fireEvent.click(await screen.findByRole('button', { name: 'Rediger varianter' }))
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
    expect(await screen.findByRole('cell', { name: 'Nytt variantnavn' })).toBeInTheDocument()
    expect(await screen.findAllByText('15 kg')).toHaveLength(3)
  })

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
