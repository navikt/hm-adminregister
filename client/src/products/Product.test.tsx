import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { axe } from 'jest-axe'
import { apiPath } from 'mocks/apiPath'
import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import Product from 'products/Product'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'
import { ProductRegistrationDTOV2 } from 'utils/types/response-types'
import { afterEach, describe, expect, test, vi } from 'vitest'

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

  test('paavirker ikke andre faner enn Egenskaper, selv om wideMode er paa for admin', async () => {
    logIn(true)
    useWideModeStore.getState().setWideMode(true)

    const { container } = render(
      <MemoryRouter initialEntries={['/produkter/test-wide-width-other-tab?tab=about']}>
        <Routes>
          <Route path={'/produkter/:seriesId'} element={<Product />}></Route>
        </Routes>
      </MemoryRouter>
    )

    await screen.findByRole('heading', { level: 1, name: 'defaultTitle' })
    expect(container.innerHTML).toContain('minmax(16rem, 48rem)')
    expect(container.innerHTML).not.toContain('minmax(16rem, 1fr)')
  })

  test('ignorerer wideMode for ikke-admin-brukere paa Egenskaper-fanen', async () => {
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
    expect(container.innerHTML).toContain('minmax(16rem, 48rem)')
  })

  test('viser flere varianter per side i bred visning naar det er nok skjermbredde', async () => {
    logIn(true)

    const manyVariants = Array.from({ length: 12 }, (_, i) => dummyVariant(`v${i + 1}`, `Variant ${i + 1}`))
    server.use(
      http.get(apiPath('api/v1/series/*'), () => {
        return HttpResponse.json({
          ...dummyProduct('test-many-variants', 'defaultTitle', 'EDITABLE'),
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
        <MemoryRouter initialEntries={['/produkter/test-many-variants?tab=variants']}>
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

describe('Forkast teknisk data-endringer ved publisering', () => {
  test('avslutter redigeringsmodus for teknisk data naar admin publiserer produktet', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Rediger teknisk data' }))
    expect(await screen.findByRole('button', { name: 'Avbryt redigering' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'Publiser' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publiser' }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Avbryt redigering' })).not.toBeInTheDocument()
    )
    expect(await screen.findByRole('button', { name: 'Rediger teknisk data' })).toBeInTheDocument()
  })
})

