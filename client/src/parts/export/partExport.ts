import { getSeriesBySeriesId } from 'api/SeriesApi'
import { ExportEstimate, ExportField } from 'felleskomponenter/export/ExportModal'
import { getPartsBySeriesId, getProductsByIds } from 'parts/export/partExportApi'
import { numberOfImages, numberOfVideos } from 'products/seriesUtils'
import { toReadableDateTimeString } from 'utils/date-util'
import {
  RowWithAgreements,
  activeAgreementsSortedByRank,
  widenRowsWithAgreementSlots,
} from 'utils/export/agreementSlots'
import { formatNumber } from 'utils/export/exportUtils'
import {
  EXPORT_DETAIL_BATCH_SIZE,
  EXPORT_PAGE_SIZE,
  MAX_EXPORT_REQUESTS,
  SECONDS_PER_ROUND,
  chunk,
  fetchInBatches,
  uniqueIds,
} from 'utils/export/fetchAllPages'
import { isUUID } from 'utils/string-util'
import { ProductRegistrationDTOV2, SeriesDTO, SeriesSearchDTO } from 'utils/types/response-types'

export const LINKED_PRODUCTS_BATCH_SIZE = 100

type PartFieldSource = 'list' | 'seriesDetail' | 'linkedSeries' | 'linkedProducts'
type PartExportField = ExportField & { source: PartFieldSource }

const PART = 'Del'
const CLASSIFICATION = 'Klassifisering'
const AGREEMENT = 'Avtale'
const LINKS = 'Koblinger'
const MEDIA = 'Bilder og video'
const STATUS = 'Status og datoer'
const IDS = 'Id-er'

// Order here is both the order in the modal and the column order in the exported file.
export const partExportFields: PartExportField[] = [
  { key: 'articleName', label: 'Navn', group: PART, source: 'list' },
  { key: 'supplierRef', label: 'Lev-artnr', group: PART, source: 'list' },
  { key: 'hmsArtNr', label: 'HMS-nr.', group: PART, source: 'list' },
  { key: 'type', label: 'Type', group: PART, source: 'list' },
  { key: 'supplierName', label: 'Leverandør', group: PART, source: 'seriesDetail' },
  { key: 'isoCode', label: 'ISO-kode', group: CLASSIFICATION, source: 'seriesDetail' },
  { key: 'isoCategory', label: 'ISO-kategori', group: CLASSIFICATION, source: 'seriesDetail' },
  { key: 'egnetForKommunalTekniker', label: 'Egnet for kommunal tekniker', group: CLASSIFICATION, source: 'list' },
  { key: 'egnetForBrukerpass', label: 'Egnet for brukerpassbruker', group: CLASSIFICATION, source: 'list' },
  { key: 'avtale', label: 'Avtale', group: AGREEMENT, source: 'list' },
  { key: 'agreementDetails', label: 'Avtaledetaljer', group: AGREEMENT, source: 'list' },
  { key: 'linkedSeriesCount', label: 'Antall koblinger til produktserier', group: LINKS, source: 'list' },
  { key: 'linkedProductsCount', label: 'Antall koblinger til enkeltprodukter', group: LINKS, source: 'list' },
  { key: 'linkedSeries', label: 'Koblede produktserier', group: LINKS, source: 'linkedSeries' },
  { key: 'linkedProducts', label: 'Koblede enkeltprodukter', group: LINKS, source: 'linkedProducts' },
  { key: 'imageCount', label: 'Antall bilder', group: MEDIA, source: 'seriesDetail' },
  { key: 'videoCount', label: 'Antall videoer', group: MEDIA, source: 'seriesDetail' },
  { key: 'missingImage', label: 'Mangler bilde', group: MEDIA, source: 'seriesDetail' },
  { key: 'missingVideo', label: 'Mangler video', group: MEDIA, source: 'seriesDetail' },
  { key: 'isPublished', label: 'Publisert', group: STATUS, source: 'list' },
  { key: 'isExpired', label: 'Utgått', group: STATUS, source: 'list' },
  { key: 'status', label: 'Status', group: STATUS, source: 'seriesDetail' },
  { key: 'published', label: 'Publisert dato', group: STATUS, source: 'seriesDetail' },
  { key: 'created', label: 'Opprettet', group: STATUS, source: 'list' },
  { key: 'updated', label: 'Sist endret', group: STATUS, source: 'seriesDetail' },
  { key: 'id', label: 'Id', group: IDS, source: 'list' },
  { key: 'seriesUUID', label: 'Produktserie-id', group: IDS, source: 'list' },
]

export const partExportDefaultKeys = [
  'articleName',
  'supplierRef',
  'hmsArtNr',
  'type',
  'supplierName',
  'isoCode',
  'avtale',
  'isPublished',
  'isExpired',
  'linkedSeriesCount',
  'linkedProductsCount',
]

const needsSource = (source: PartFieldSource, selectedKeys: string[] = []) =>
  partExportFields.some((field) => field.source === source && selectedKeys.includes(field.key))

const yesNo = (value: boolean | null | undefined) => (value ? 'Ja' : 'Nei')
const readableDate = (value: string | null | undefined) =>
  value ? toReadableDateTimeString(value).replace(',', '') : ''
const typeOf = (part: ProductRegistrationDTOV2) => (part.accessory ? 'Tilbehør' : 'Reservedel')
const supplierRefOf = (part: ProductRegistrationDTOV2) => (isUUID(part.supplierRef) ? '' : part.supplierRef)
// ISO codes are two digits per level; level 4 is the first eight digits.
const ISO_LEVEL_4_LENGTH = 8
const isoLevel4CodeOf = (isoCode: string | undefined) => (isoCode ?? '').replace(/\s/g, '').slice(0, ISO_LEVEL_4_LENGTH)
const compatibleWithOf = (part: ProductRegistrationDTOV2) => part.productData?.attributes?.compatibleWith

const fetchLinkedProductLabels = async (ids: string[], signal?: AbortSignal): Promise<Map<string, string>> => {
  const labels = new Map<string, string>()
  for (const idChunk of chunk(ids, LINKED_PRODUCTS_BATCH_SIZE)) {
    signal?.throwIfAborted()
    const products = await getProductsByIds(idChunk, signal)
    products.forEach((product) =>
      labels.set(product.id, [product.hmsArtNr, product.articleName].filter(Boolean).join(' – '))
    )
  }
  return labels
}

// A linked series may have been deleted since the link was made; fall back to the id instead of failing the export.
const fetchSeriesTitles = async (
  ids: string[],
  known: Map<string, SeriesDTO>,
  signal?: AbortSignal
): Promise<Map<string, string>> => {
  const missing = ids.filter((id) => !known.has(id))
  const fetched = await fetchInBatches(
    missing,
    (id) => getSeriesBySeriesId(id, signal).catch((): SeriesDTO | undefined => undefined),
    EXPORT_DETAIL_BATCH_SIZE,
    signal
  )
  signal?.throwIfAborted()
  const titles = new Map<string, string>()
  known.forEach((series, id) => titles.set(id, series.title))
  fetched.forEach((series) => series && titles.set(series.id, series.title))
  return titles
}

export const getPartExportRows = async (
  parts: ProductRegistrationDTOV2[],
  selectedKeys: string[] = [],
  signal?: AbortSignal
): Promise<Record<string, unknown>[]> => {
  const seriesById = new Map<string, SeriesDTO>()
  if (needsSource('seriesDetail', selectedKeys)) {
    const seriesIds = uniqueIds(parts.map((part) => part.seriesUUID))
    const details = await fetchInBatches(
      seriesIds,
      (id) => getSeriesBySeriesId(id, signal),
      EXPORT_DETAIL_BATCH_SIZE,
      signal
    )
    details.forEach((series) => seriesById.set(series.id, series))
  }

  const linkedSeriesTitles = needsSource('linkedSeries', selectedKeys)
    ? await fetchSeriesTitles(
        uniqueIds(parts.flatMap((part) => compatibleWithOf(part)?.seriesIds ?? [])),
        seriesById,
        signal
      )
    : new Map<string, string>()

  const linkedProductLabels = needsSource('linkedProducts', selectedKeys)
    ? await fetchLinkedProductLabels(
        uniqueIds(parts.flatMap((part) => compatibleWithOf(part)?.productIds ?? [])),
        signal
      )
    : new Map<string, string>()

  const rows: RowWithAgreements[] = parts.map((part) => {
    const series = part.seriesUUID ? seriesById.get(part.seriesUUID) : undefined
    const attributes = part.productData?.attributes
    const linkedSeriesIds = compatibleWithOf(part)?.seriesIds ?? []
    const linkedProductIds = compatibleWithOf(part)?.productIds ?? []
    const activeAgreements = activeAgreementsSortedByRank(part.agreements)
    const imageCount = series ? numberOfImages(series) : undefined
    const videoCount = series ? numberOfVideos(series) : undefined

    return {
      base: {
        articleName: part.articleName,
        supplierRef: supplierRefOf(part),
        hmsArtNr: part.hmsArtNr ?? '',
        type: typeOf(part),
        supplierName: series?.supplierName ?? '',
        isoCategory: series?.isoCategory?.isoTitle ?? '',
        isoCode: isoLevel4CodeOf(series?.isoCategory?.isoCode),
        avtale: yesNo(activeAgreements.length > 0),
        agreementDetails: activeAgreements
          .map((agreement) => [agreement.title, agreement.postTitle].filter(Boolean).join(' – '))
          .join('; '),
        isPublished: yesNo(part.isPublished),
        isExpired: yesNo(part.isExpired),
        linkedSeriesCount: linkedSeriesIds.length,
        linkedProductsCount: linkedProductIds.length,
        linkedSeries: linkedSeriesIds.map((id) => linkedSeriesTitles.get(id) ?? id).join('; '),
        linkedProducts: linkedProductIds.map((id) => linkedProductLabels.get(id) || id).join('; '),
        imageCount: imageCount ?? '',
        videoCount: videoCount ?? '',
        missingImage: imageCount === undefined ? '' : yesNo(imageCount === 0),
        missingVideo: videoCount === undefined ? '' : yesNo(videoCount === 0),
        egnetForKommunalTekniker: yesNo(attributes?.egnetForKommunalTekniker),
        egnetForBrukerpass: yesNo(attributes?.egnetForBrukerpass),
        status: series?.status ?? '',
        created: readableDate(part.created),
        updated: readableDate(series?.updated),
        published: readableDate(series?.published),
        id: part.id,
        seriesUUID: part.seriesUUID ?? '',
      },
      activeAgreements,
    }
  })

  // "Avtaledetaljer" is a toggle, not a column: when selected, rows are widened with per-slot agreement columns.
  return selectedKeys.includes('agreementDetails') ? widenRowsWithAgreementSlots(rows) : rows.map((row) => row.base)
}

const rounds = (requests: number, batchSize: number) => Math.ceil(requests / batchSize)

const blockedReasonFor = (requests: number, advice: string) =>
  requests > MAX_EXPORT_REQUESTS
    ? `For stor eksport: ca. ${formatNumber(requests)} kall mot baksystemet (maks ${formatNumber(MAX_EXPORT_REQUESTS)}). ${advice}`
    : undefined

// Unique linked ids on the current page, scaled to all rows. The share of unique ids only falls as more
// parts are included, so for "Alle treff" this is an upper bound, which is the safe side for the limit.
const estimateUniqueLinks = (
  rows: number,
  currentPage: ProductRegistrationDTOV2[],
  idsOf: (part: ProductRegistrationDTOV2) => string[]
) => {
  if (currentPage.length === 0) return 0
  const uniqueOnPage = uniqueIds(currentPage.flatMap(idsOf)).length
  return Math.round((uniqueOnPage / currentPage.length) * rows)
}

/** Counts HTTP requests (not batches), since that is the load on the backend. */
export const estimatePartExport = ({
  rows,
  fetchesAllPages,
  currentPage,
  selectedKeys = [],
}: {
  rows: number
  fetchesAllPages: boolean
  currentPage: ProductRegistrationDTOV2[]
  selectedKeys?: string[]
}): ExportEstimate => {
  const pageRequests = fetchesAllPages ? Math.ceil(rows / EXPORT_PAGE_SIZE) : 0
  // Each part has its own series, so one detail request per part.
  const seriesDetailRequests = needsSource('seriesDetail', selectedKeys) ? rows : 0
  const linkedSeriesRequests = needsSource('linkedSeries', selectedKeys)
    ? estimateUniqueLinks(rows, currentPage, (part) => compatibleWithOf(part)?.seriesIds ?? [])
    : 0
  const linkedProductRequests = needsSource('linkedProducts', selectedKeys)
    ? Math.ceil(
        estimateUniqueLinks(rows, currentPage, (part) => compatibleWithOf(part)?.productIds ?? []) /
          LINKED_PRODUCTS_BATCH_SIZE
      )
    : 0

  const requests = pageRequests + seriesDetailRequests + linkedSeriesRequests + linkedProductRequests
  const sequentialRounds =
    pageRequests +
    rounds(seriesDetailRequests, EXPORT_DETAIL_BATCH_SIZE) +
    rounds(linkedSeriesRequests, EXPORT_DETAIL_BATCH_SIZE) +
    linkedProductRequests

  return {
    rows,
    requests,
    seconds: sequentialRounds * SECONDS_PER_ROUND,
    blockedReason: blockedReasonFor(
      requests,
      'Bruk filter eller fjern felter som krever detaljer (leverandør, ISO, status, datoer, bilder og video, koblede serier og produkter).'
    ),
  }
}

export const partsPerSeriesExportFields: ExportField[] = [
  { key: 'seriesTitle', label: 'Produktserie', group: 'Produktserie' },
  { key: 'seriesId', label: 'Produktserie-id', group: 'Produktserie' },
  { key: 'articleName', label: 'Del', group: PART },
  { key: 'supplierRef', label: 'Lev-artnr', group: PART },
  { key: 'hmsArtNr', label: 'HMS-nr.', group: PART },
  { key: 'type', label: 'Type', group: PART },
  { key: 'id', label: 'Del-id', group: PART },
  { key: 'egnetForKommunalTekniker', label: 'Egnet for kommunal tekniker', group: CLASSIFICATION },
  { key: 'egnetForBrukerpass', label: 'Egnet for brukerpassbruker', group: CLASSIFICATION },
  { key: 'avtale', label: 'Avtale', group: 'Avtale og status' },
  { key: 'isExpired', label: 'Utgått', group: 'Avtale og status' },
]

export const partsPerSeriesDefaultKeys = ['seriesTitle', 'articleName', 'supplierRef', 'hmsArtNr', 'type']

export const getPartsPerSeriesExportRows = async (
  series: SeriesSearchDTO[],
  signal?: AbortSignal
): Promise<Record<string, unknown>[]> => {
  const partsPerSeries = await fetchInBatches(
    series,
    (s) => getPartsBySeriesId(s.id, signal),
    EXPORT_DETAIL_BATCH_SIZE,
    signal
  )
  return series.flatMap((s, index) =>
    (partsPerSeries[index] ?? []).map((part) => ({
      seriesTitle: s.title,
      articleName: part.articleName,
      supplierRef: supplierRefOf(part),
      hmsArtNr: part.hmsArtNr ?? '',
      type: typeOf(part),
      avtale: yesNo(activeAgreementsSortedByRank(part.agreements).length > 0),
      isExpired: yesNo(part.isExpired),
      egnetForKommunalTekniker: yesNo(part.productData?.attributes?.egnetForKommunalTekniker),
      egnetForBrukerpass: yesNo(part.productData?.attributes?.egnetForBrukerpass),
      seriesId: s.id,
      id: part.id,
    }))
  )
}

export const estimatePartsPerSeriesExport = ({
  seriesCount,
  fetchesAllPages,
}: {
  seriesCount: number
  fetchesAllPages: boolean
}): ExportEstimate => {
  const pageRequests = fetchesAllPages ? Math.ceil(seriesCount / EXPORT_PAGE_SIZE) : 0
  const requests = pageRequests + seriesCount
  return {
    rows: seriesCount,
    requests,
    seconds: (pageRequests + rounds(seriesCount, EXPORT_DETAIL_BATCH_SIZE)) * SECONDS_PER_ROUND,
    blockedReason: blockedReasonFor(requests, 'Bruk søk eller leverandørfilter for å få færre produktserier.'),
  }
}
