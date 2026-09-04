import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import ErrorAlert from 'error/ErrorAlert'
import ExportModal, { ExportField, ExportScope } from 'felleskomponenter/export/ExportModal'
import { buildDefaultFileName } from 'utils/export/exportUtils'
import { getSeriesBySeriesId } from 'api/SeriesApi'
import { toReadableDateTimeString } from 'utils/date-util'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useUrlSyncedSearchParam } from 'utils/common-hooks'
import {
  buildSeriesSearchPath,
  fetcherGET,
  usePagedProducts,
  useSeriesByVariantIdentifier,
  useSuppliers,
} from 'utils/swr-hooks'
import { SeriesDTO, SeriesSearchChunk, SeriesSearchDTO } from 'utils/types/response-types'

import { FileExportIcon, PlusIcon } from '@navikt/aksel-icons'
import {
  Alert,
  Box,
  Button,
  Chips,
  HGrid,
  HStack,
  Heading,
  Label,
  Pagination,
  Search,
  Select,
  Show,
  UNSAFE_Combobox,
  VStack,
} from '@navikt/ds-react'

import { ProductList } from './ProductList'

const ProductListWrapper = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pageState, setPageState] = useState(Number(searchParams.get('page')) || 1)
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get('supplier') || '')
  const { loggedInUser } = useAuthStore()
  const [searchTerm, setSearchTerm] = useUrlSyncedSearchParam('q')
  const statusFilters = searchParams.get('filters')?.split(',') || []
  const { pathname, search } = useLocation()
  const { suppliers } = useSuppliers(loggedInUser?.isAdmin || false)

  const initialPageSize = Number(localStorage.getItem('pageSizeState')) || 10
  const [pageSizeState, setPageSizeState] = useState(initialPageSize)

  // Sort is persisted in search params under the key "sort"; default is updated,DESC
  const sortParam = searchParams.get('sort') || 'updated,DESC'
  const [sortUrl, setSortUrl] = useState<string | null>(sortParam)

  // Agreement filter state - null means "all", "true" means "on agreement", "false" means "not on agreement"
  const [agreementFilter, setAgreementFilter] = useState<string | null>(() => {
    return searchParams.get('inAgreement')
  })

  // Missing media type filter - toggle state
  const [missingMediaType, setMissingMediaType] = useState<string | null>(() => {
    return searchParams.get('missingMediaType')
  })

  // Helper to derive current sort direction for updated
  const isUpdatedDesc = !sortUrl || sortUrl === 'updated,DESC' || !sortUrl.startsWith('updated,')

  useEffect(() => {
    localStorage.setItem('pageSizeState', pageSizeState.toString())
  }, [pageSizeState])

  useEffect(() => {
    // Keep search params in sync when sortUrl changes
    if (sortUrl) {
      searchParams.set('sort', sortUrl)
    } else {
      searchParams.delete('sort')
    }
    setSearchParams(searchParams)
  }, [sortUrl])

  useEffect(() => {
    // Keep search params in sync when agreementFilter changes
    if (agreementFilter !== null) {
      searchParams.set('inAgreement', agreementFilter)
    } else {
      searchParams.delete('inAgreement')
    }
    setSearchParams(searchParams)
  }, [agreementFilter])

  useEffect(() => {
    // Keep search params in sync when missingMediaType changes
    if (missingMediaType !== null) {
      searchParams.set('missingMediaType', missingMediaType)
    } else {
      searchParams.delete('missingMediaType')
    }
    setSearchParams(searchParams)
  }, [missingMediaType])

  const productQueryParams = {
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
    filters: [...statusFilters],
    supplierFilter: supplierFilter,
    sortUrl,
    agreementFilter,
    missingMediaType,
  }

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedProducts(productQueryParams)

  const navigate = useNavigate()

  const { data: seriesByVariantIdentifier } = useSeriesByVariantIdentifier(searchTerm)

  const [exportOpen, setExportOpen] = useState(false)

  const productLevelFields: ExportField[] = [
    { key: 'title', label: 'Produktnavn' },
    { key: 'status', label: 'Status' },
    { key: 'variantCount', label: 'Antall varianter' },
    { key: 'updated', label: 'Sist endret' },
    { key: 'updatedByUser', label: 'Endret av' },
    { key: 'isPublished', label: 'Publisert' },
    { key: 'isExpired', label: 'Utgått' },
    { key: 'mainProduct', label: 'Hovedprodukt' },
    { key: 'id', label: 'Id' },
  ]
  const productLevelDefaults = ['title', 'status', 'variantCount', 'updated', 'updatedByUser']

  const variantLevelFields: ExportField[] = [
    { key: 'productTitle', label: 'Produktnavn' },
    { key: 'articleName', label: 'Variantnavn' },
    { key: 'hmsArtNr', label: 'HMS-nr.' },
    { key: 'supplierRef', label: 'Lev-artnr' },
    { key: 'isPublished', label: 'Publisert' },
    { key: 'isExpired', label: 'Utgått' },
    { key: 'avtale', label: 'Avtale' },
    { key: 'rangering', label: 'Rangering' },
    { key: 'delkontraktNr', label: 'Delkontraktnr.' },
  ]
  const variantLevelDefaults = [
    'productTitle',
    'articleName',
    'hmsArtNr',
    'supplierRef',
    'isPublished',
    'isExpired',
    'avtale',
  ]

  const exportLevels = [
    { key: 'product', label: 'Produkt', availableFields: productLevelFields, defaultFieldKeys: productLevelDefaults },
    { key: 'variant', label: 'Variant', availableFields: variantLevelFields, defaultFieldKeys: variantLevelDefaults },
  ]

  const seriesToProductRow = (series: SeriesSearchDTO): Record<string, unknown> => ({
    title: series.title,
    status: series.status,
    variantCount: series.variantCount,
    updated: toReadableDateTimeString(series.updated).replace(',', ''),
    updatedByUser: series.updatedByUser,
    isPublished: series.isPublished ? 'Ja' : 'Nei',
    isExpired: series.isExpired ? 'Ja' : 'Nei',
    mainProduct: series.mainProduct ? 'Ja' : 'Nei',
    id: series.id,
  })

  const seriesDetailToVariantRows = (series: SeriesDTO): Record<string, unknown>[] =>
    (series.variants || []).map((variant) => {
      const firstAgreement = variant.agreements?.[0]
      return {
        productTitle: series.title,
        articleName: variant.articleName,
        hmsArtNr: variant.hmsArtNr ?? '',
        supplierRef: variant.supplierRef,
        isPublished: variant.isPublished ? 'Ja' : 'Nei',
        isExpired: variant.isExpired ? 'Ja' : 'Nei',
        avtale: (variant.agreements?.length ?? 0) > 0 ? 'Ja' : 'Nei',
        rangering: firstAgreement?.rank ?? '',
        delkontraktNr: firstAgreement?.postNr ?? '',
      }
    })

  const fetchAllMatchingSeries = async (): Promise<SeriesSearchDTO[]> => {
    const size = 100
    const first = (await fetcherGET(
      buildSeriesSearchPath({ ...productQueryParams, page: 0, pageSize: size })
    )) as SeriesSearchChunk
    const totalPages = first.totalPages ?? 1
    const all = [...(first.content || [])]
    for (let page = 1; page < totalPages; page++) {
      const chunk = (await fetcherGET(
        buildSeriesSearchPath({ ...productQueryParams, page, pageSize: size })
      )) as SeriesSearchChunk
      all.push(...(chunk.content || []))
    }
    return all
  }

  const fetchSeriesDetailsBatched = async (ids: string[]): Promise<SeriesDTO[]> => {
    const results: SeriesDTO[] = []
    const batchSize = 20
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize)
      // allSettled so a single failing series does not abort the whole export.
      const settled = await Promise.allSettled(batch.map((id) => getSeriesBySeriesId(id)))
      settled.forEach((result) => {
        if (result.status === 'fulfilled') results.push(result.value)
      })
    }
    return results
  }

  const getExportRows = async (scope: ExportScope, level?: string): Promise<Record<string, unknown>[]> => {
    const currentPageSeries = seriesByVariantIdentifier ? [seriesByVariantIdentifier] : pagedData?.content || []

    const seriesInScope: SeriesSearchDTO[] =
      scope === 'all'
        ? seriesByVariantIdentifier
          ? [seriesByVariantIdentifier]
          : await fetchAllMatchingSeries()
        : currentPageSeries

    if (level === 'variant') {
      const details = await fetchSeriesDetailsBatched(seriesInScope.map((series) => series.id))
      return details.flatMap(seriesDetailToVariantRows)
    }

    return seriesInScope.map(seriesToProductRow)
  }

  // Instant magnitude estimate (no extra fetch): product count from totalSize, variants via current-page average.
  const currentPageContent = pagedData?.content || []
  const avgVariantsPerProduct =
    currentPageContent.length > 0
      ? currentPageContent.reduce((sum, series) => sum + (series.variantCount ?? 0), 0) / currentPageContent.length
      : 1

  const estimateExport = (scope: ExportScope, level?: string) => {
    const products = seriesByVariantIdentifier
      ? 1
      : scope === 'all'
        ? pagedData?.totalSize ?? 0
        : currentPageContent.length
    const variants = Math.round(products * avgVariantsPerProduct)
    const rows = level === 'variant' ? variants : products
    const summaryPages = scope === 'all' && !seriesByVariantIdentifier ? Math.ceil(products / 100) : 0
    const detailBatches = level === 'variant' ? Math.ceil(products / 20) : 0
    return { rows, products, requests: summaryPages + detailBatches, approximate: level === 'variant' }
  }

  const exportSupplierName = suppliers?.find((supplier) => supplier.id === supplierFilter)?.name
  const productExportFileName = buildDefaultFileName('produkter', [
    searchTerm,
    exportSupplierName,
    statusFilters.length ? statusFilters.join('-') : undefined,
  ])

  const isUnfilteredExport =
    statusFilters.length === 0 &&
    !supplierFilter &&
    searchTerm === '' &&
    !missingMediaType &&
    !agreementFilter

  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set('page', String(pagedData.totalPages))
      setSearchParams(searchParams)
      setPageState(pagedData.totalPages)
    }
  }, [pagedData])

  const showPageNavigator = pagedData && pagedData.totalPages !== undefined && pagedData.totalPages > 1

  if (errorPaged) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    )
  }

  const visningStatusfilter = ['Under endring', 'Venter på godkjenning', 'Avslått', 'Publisert']

  const onToggleSelected = (option: string, isSelected: boolean) => {
    const uuid = suppliers?.find((supplier) => supplier.name === option)?.id

    if (uuid) {
      if (isSelected) {
        if (!searchParams.getAll('supplier').includes(uuid)) {
          searchParams.set('supplier', uuid)
        }
      } else {
        if (searchParams.getAll('supplier').includes(uuid)) {
          const updated = searchParams.getAll('supplier').filter((supplier) => supplier !== uuid)
          searchParams.delete('supplier')
          updated.forEach((supplier) => searchParams.set('supplier', supplier))
        }
      }
      setSearchParams(searchParams)
      setSupplierFilter(searchParams.get('supplier') || '')
    }
  }

  const onFilterChange = (filterName: string) => {
    if (statusFilters.includes(filterName)) {
      searchParams.set('filters', statusFilters.filter((x) => x !== filterName).join(','))
      setSearchParams(searchParams)
    } else {
      searchParams.set('filters', [...statusFilters, filterName].join(','))
      setSearchParams(searchParams)
    }
  }

  const toggleMissingMediaType = () => {
    setMissingMediaType(missingMediaType === 'IMAGE' ? null : 'IMAGE')
  }

  const toggleMissingVideoType = () => {
    setMissingMediaType(missingMediaType === 'VIDEO' ? null : 'VIDEO')
  }

  const hasActiveFilters = statusFilters.length > 0 || missingMediaType !== null || agreementFilter !== null

  const resetAllFilters = () => {
    searchParams.delete('filters')
    setSearchParams(searchParams)
    setMissingMediaType(null)
    setAgreementFilter(null)
  }

  return (
    <main className="show-menu">
      <VStack
        gap={{ xs: 'space-16', md: 'space-24' }}
        maxWidth={loggedInUser && loggedInUser.isAdmin ? '80rem' : '64rem'}
      >
        <Heading level="1" size="large" spacing>
          Produkter
        </Heading>

        <VStack gap={{ xs: 'space-16', md: 'space-32' }}>
          <HGrid
            columns={{ xs: 'space-8', md: loggedInUser && !loggedInUser.isAdmin ? '1fr 230px' : '1fr ' }}
            gap="space-16"
            align={'center'}
          >
            <HGrid
              columns={{
                xs: 'space-16',
                md: loggedInUser && loggedInUser.isAdmin && suppliers ? '3fr 2fr' : '2fr',
              }}
              gap="space-16"
              align="start"
            >
              <Box role="search" style={{ maxWidth: '475px' }}>
                <Search
                  className="search-button"
                  label="Søk"
                  variant="simple"
                  clearButton={true}
                  placeholder="Søk etter produktnavn"
                  size="medium"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  hideLabel={false}
                />
              </Box>

              {loggedInUser && loggedInUser.isAdmin && suppliers && (
                <Box asChild style={{ maxWidth: '475px' }}>
                  <UNSAFE_Combobox
                    label="Leverandører"
                    selectedOptions={searchParams
                      .getAll('supplier')
                      .map((uuid) => suppliers.find((supplier) => supplier.id === uuid)?.name || '')}
                    onToggleSelected={onToggleSelected}
                    options={suppliers?.map((supplier) => supplier.name) || []}
                  />
                </Box>
              )}
            </HGrid>

            {loggedInUser && (
              <HGrid columns={2} gap="space-8" align="center">
                <Button
                  variant="secondary"
                  icon={<PlusIcon aria-hidden />}
                  iconPosition="left"
                  onClick={() => navigate('/produkter/opprett')}
                  style={{ maxHeight: '3rem', width: '100%' }}
                >
                  Opprett nytt produkt
                </Button>
                <Button
                  variant="secondary"
                  icon={<FileExportIcon aria-hidden />}
                  iconPosition="left"
                  onClick={() => setExportOpen(true)}
                  style={{ maxHeight: '3rem', width: '100%' }}
                >
                  Eksporter
                </Button>
              </HGrid>
            )}
          </HGrid>
          <VStack gap="space-16">
            <Label>Filter</Label>
            <Chips>
              {visningStatusfilter.map((filterName) => (
                <Chips.Toggle
                  key={filterName}
                  selected={statusFilters.includes(filterName)}
                  onClick={() => onFilterChange(filterName)}
                >
                  {filterName}
                </Chips.Toggle>
              ))}
              <Chips.Toggle
                selected={statusFilters.includes('Vis utgåtte')}
                onClick={() => onFilterChange('Vis utgåtte')}
              >
                Vis utgåtte
              </Chips.Toggle>
              <Chips.Toggle selected={missingMediaType === 'IMAGE'} onClick={toggleMissingMediaType}>
                Mangler bilder
              </Chips.Toggle>
              <Chips.Toggle selected={missingMediaType === 'VIDEO'} onClick={toggleMissingVideoType}>
                Mangler video
              </Chips.Toggle>
            </Chips>
          </VStack>
          <HGrid columns={hasActiveFilters ? '250px auto' : '250px'} gap="space-16" align="end">
            <Box>
              <Select
                label="Avtalefilter"
                size="medium"
                value={agreementFilter === null ? 'all' : agreementFilter}
                onChange={(e) => {
                  const value = e.target.value
                  setAgreementFilter(value === 'all' ? null : value)
                }}
              >
                <option value="all">Alle produkter</option>
                <option value="true">Kun produkter på avtale</option>
                <option value="false">Kun produkter ikke på avtale</option>
              </Select>
            </Box>
            {hasActiveFilters && (
              <Box>
                <Button variant="secondary" size="medium" onClick={resetAllFilters}>
                  Nullstill filtre
                </Button>
              </Box>
            )}
          </HGrid>
        </VStack>

        <VStack gap="space-16">
          <VStack gap="space-8">
            {seriesByVariantIdentifier && <Heading size="medium">Treff på Variant</Heading>}
            <HGrid
              columns={{
                xs: '.7fr 3.6fr 2.1fr .8fr',
                md: '.7fr 3.6fr 2.1fr .9fr 0.4fr',
                lg:
                  loggedInUser && loggedInUser.isAdmin
                    ? '.7fr 3.5fr 2.5fr .8fr 1fr 3fr 0.4fr'
                    : '.7fr 3.5fr 2fr .8fr 0.4fr',
              }}
              paddingBlock="space-4"
              gap="space-8"
            >
              <span></span>
              <b>Produktnavn</b>
              <b>Status</b>
              <b>Varianter</b>
              {loggedInUser && loggedInUser.isAdmin && (
                <>
                  <Show above="lg">
                    <Button
                      variant="tertiary"
                      size="xsmall"
                      onClick={() => {
                        setSortUrl((prev) => {
                          const current = prev || sortParam
                          if (!current.startsWith('updated')) {
                            return 'updated,DESC'
                          }
                          return current === 'updated,DESC' ? 'updated,ASC' : 'updated,DESC'
                        })
                      }}
                      iconPosition="right"
                      icon={<span aria-hidden>{isUpdatedDesc ? '↓' : '↑'}</span>}
                    >
                      Sist endret
                    </Button>
                  </Show>
                  <Show above="lg">
                    <b>Endret av</b>
                  </Show>
                </>
              )}
            </HGrid>
            {seriesByVariantIdentifier ? (
              <ProductList seriesList={[seriesByVariantIdentifier]} oversiktPath={pathname + search} />
            ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
              <ProductList seriesList={pagedData.content} oversiktPath={pathname + search} />
            ) : (
              !isLoadingPagedData && (
                <Alert variant="info">
                  {searchTerm !== '' ? `Ingen produkter funnet med søket: "${searchTerm}"` : 'Ingen produkter funnet.'}
                </Alert>
              )
            )}
          </VStack>

          <HStack
            justify={{ xs: 'center', md: 'space-between' }}
            align="center"
            gap="space-16"
            style={{ flexWrap: 'wrap-reverse' }}
          >
            <Select
              label="Ant produkter per side"
              size="small"
              defaultValue={pageSizeState}
              onChange={(e) => {
                setPageSizeState(parseInt(e.target.value))
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </Select>
            {showPageNavigator && (
              <Pagination
                page={pageState}
                onPageChange={(x) => {
                  searchParams.set('page', x.toString())
                  setSearchParams(searchParams)
                  setPageState(x)
                }}
                count={pagedData.totalPages!}
                size="small"
              />
            )}
          </HStack>
        </VStack>
      </VStack>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        fileBaseName={productExportFileName}
        levels={exportLevels}
        getRows={getExportRows}
        estimate={estimateExport}
        isUnfiltered={isUnfilteredExport}
      />
    </main>
  )
}

export default ProductListWrapper
