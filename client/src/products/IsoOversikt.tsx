import { useCallback, useEffect, useMemo, useState } from 'react'

import { getSeriesBySeriesId } from 'api/SeriesApi'
import { HM_REGISTER_URL } from 'environments'
import { useAuthStore } from 'utils/store/useAuthStore'
import { fetcherGET, useIsoCategories, useIsoCategories22, useIsoMappings } from 'utils/swr-hooks'
import { IsoCategory22DTO, IsoCategoryDTO, IsoMapDTO, SeriesDTO, SeriesSearchChunk } from 'utils/types/response-types'

import {
  Alert,
  BodyShort,
  Box,
  Button,
  Checkbox,
  Chips,
  HStack,
  Heading,
  InfoCard,
  Label,
  Loader,
  Pagination,
  Select,
  Table,
  Tag,
  TextField,
  ToggleGroup,
  VStack,
} from '@navikt/ds-react'

const SERIES_PAGE_SIZE = 10
const SERIES_WARN_THRESHOLD = 200

type SortDir = 'asc' | 'desc'
type SortKey = 'iso1' | 'iso2' | 'iso3' | 'iso4' | 'agreementRank' | 'agreementPostNr' | 'variantCount'
type ViewMode = 'product' | 'variant'
type MappingStatus = 'verified' | 'unverified' | 'missing'

type ExtractedProductVariant = {
  productId: string
  seriesId: string
  productTitle: string
  variantName: string
  supplierRef: string
  hmsArtNr: string
  isoCode: string
  // ISO 2016 numeric codes per level (empty string if level doesn't apply)
  iso1: string
  iso2: string
  iso3: string
  iso4: string
  // ISO 2016 titles per level
  iso1Title: string
  iso2Title: string
  iso3Title: string
  iso4Title: string
  // ISO 2022 codes per level (empty string if not migrated/mapped yet or level doesn't apply)
  iso22Lvl1: string
  iso22Lvl2: string
  iso22Lvl3: string
  iso22Lvl4: string
  // ISO 2022 titles per level
  iso22Lvl1Title: string
  iso22Lvl2Title: string
  iso22Lvl3Title: string
  iso22Lvl4Title: string
  // Status of the 2016 -> 2022 mapping for this series' ISO code
  mappingStatus: MappingStatus
  // Agreement
  agreementRef: string
  agreementRank: number | null
  agreementPostNr: number | null
}

type IsoPath = {
  level1?: IsoCategoryDTO
  level2?: IsoCategoryDTO
  level3?: IsoCategoryDTO
  level4?: IsoCategoryDTO
}

type Iso22Path = {
  level1?: IsoCategory22DTO
  level2?: IsoCategory22DTO
  level3?: IsoCategory22DTO
  level4?: IsoCategory22DTO
}

type ProductSummaryRow = {
  seriesId: string
  productTitle: string
  isoCode: string
  iso1: string
  iso2: string
  iso3: string
  iso4: string
  iso1Title: string
  iso2Title: string
  iso3Title: string
  iso4Title: string
  iso22Lvl1: string
  iso22Lvl2: string
  iso22Lvl3: string
  iso22Lvl4: string
  iso22Lvl1Title: string
  iso22Lvl2Title: string
  iso22Lvl3Title: string
  iso22Lvl4Title: string
  mappingStatus: MappingStatus
  variantCount: number
  agreementRef: string
  agreementRank: number | null
  agreementPostNr: number | null
}

const OPTIONAL_COLUMNS_V1 = [
  'ISO 2016 nivå 1 tittel',
  'ISO 2016 nivå 2 tittel',
  'ISO 2016 nivå 3 tittel',
  'ISO 2016 nivå 4 tittel',
] as const
type OptionalColumnV1 = (typeof OPTIONAL_COLUMNS_V1)[number]

const OPTIONAL_COLUMNS_V22 = [
  'ISO 2022 nivå 1 tittel',
  'ISO 2022 nivå 2 tittel',
  'ISO 2022 nivå 3 tittel',
  'ISO 2022 nivå 4 tittel',
] as const
type OptionalColumnV22 = (typeof OPTIONAL_COLUMNS_V22)[number]

const fetchSeriesPage = async (page: number, pageSize: number): Promise<SeriesSearchChunk> => {
  const path = `${HM_REGISTER_URL()}/admreg/api/v1/series?page=${page}&size=${pageSize}&sort=updated,DESC&excludedStatus=DELETED&excludeExpired=true&editStatus=DONE&mainProduct=true`
  return (await fetcherGET(path)) as SeriesSearchChunk
}

const fetchSeriesDetailsBatched = async (seriesIds: string[], batchSize = 20): Promise<SeriesDTO[]> => {
  const results: SeriesDTO[] = []
  for (let i = 0; i < seriesIds.length; i += batchSize) {
    const batch = seriesIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((id) => getSeriesBySeriesId(id)))
    results.push(...batchResults)
  }
  return results
}

const getParentCategory = (
  child: IsoCategoryDTO,
  categories: IsoCategoryDTO[],
  parentLevel: number
): IsoCategoryDTO | undefined =>
  categories
    .filter((it) => it.isoLevel === parentLevel && child.isoCode.startsWith(it.isoCode))
    .sort((a, b) => b.isoCode.length - a.isoCode.length)[0]

const buildIsoPath = (isoCode: string, categories: IsoCategoryDTO[]): IsoPath => {
  const current = categories.find((it) => it.isoCode === isoCode)
  if (!current) return {}
  if (current.isoLevel === 1) return { level1: current }
  if (current.isoLevel === 2) {
    const level1 = getParentCategory(current, categories, 1)
    return { level1, level2: current }
  }
  if (current.isoLevel === 3) {
    const level2 = getParentCategory(current, categories, 2)
    const level1 = level2 ? getParentCategory(level2, categories, 1) : undefined
    return { level1, level2, level3: current }
  }
  const level3 = getParentCategory(current, categories, 3)
  const level2 = level3 ? getParentCategory(level3, categories, 2) : undefined
  const level1 = level2 ? getParentCategory(level2, categories, 1) : undefined
  return { level1, level2, level3, level4: current }
}

const getParentCategory22 = (
  child: IsoCategory22DTO,
  categories: IsoCategory22DTO[],
  parentLevel: number
): IsoCategory22DTO | undefined =>
  categories
    .filter((it) => it.isoLevel === parentLevel && child.isoCode.startsWith(it.isoCode))
    .sort((a, b) => b.isoCode.length - a.isoCode.length)[0]

// Mirrors buildIsoPath, but for the ISO 2022 category tree. Categories without a
// resolvable ancestor at a given level are simply left undefined - the row will
// then show empty cells for that level, which is expected while the 2016 -> 2022
// migration is still in progress.
const buildIso22Path = (isoCode22: string, categories: IsoCategory22DTO[]): Iso22Path => {
  const current = categories.find((it) => it.isoCode === isoCode22)
  if (!current) return {}
  if (current.isoLevel === 1) return { level1: current }
  if (current.isoLevel === 2) {
    const level1 = getParentCategory22(current, categories, 1)
    return { level1, level2: current }
  }
  if (current.isoLevel === 3) {
    const level2 = getParentCategory22(current, categories, 2)
    const level1 = level2 ? getParentCategory22(level2, categories, 1) : undefined
    return { level1, level2, level3: current }
  }
  const level3 = getParentCategory22(current, categories, 3)
  const level2 = level3 ? getParentCategory22(level3, categories, 2) : undefined
  const level1 = level2 ? getParentCategory22(level2, categories, 1) : undefined
  return { level1, level2, level3, level4: current }
}

// Builds a lookup of 2016 ISO code -> mapping status, based on the iso_map_v22
// mapping table. A code can have several mapping entries (e.g. when it was
// split into several 2022 codes); if any of them is verified, the code counts
// as verified overall.
const buildMappingStatusMap = (mappings: IsoMapDTO[]): Map<string, MappingStatus> => {
  const map = new Map<string, MappingStatus>()
  for (const mapping of mappings) {
    if (!mapping.code16) continue
    const existing = map.get(mapping.code16)
    if (mapping.verified) {
      map.set(mapping.code16, 'verified')
    } else if (existing !== 'verified') {
      map.set(mapping.code16, 'unverified')
    }
  }
  return map
}

const getMappingStatus = (isoCode: string, statusMap: Map<string, MappingStatus>): MappingStatus =>
  statusMap.get(isoCode) ?? 'missing'

const mapToExtractedRows = (
  seriesDetails: SeriesDTO[],
  categories: IsoCategoryDTO[],
  categories22: IsoCategory22DTO[],
  mappingStatusMap: Map<string, MappingStatus>
): ExtractedProductVariant[] => {
  return seriesDetails.flatMap((series) => {
    const isoCode = series.isoCategory?.isoCode || ''
    const path = buildIsoPath(isoCode, categories)
    const isoCode22 = series.isoCategory22?.isoCode || ''
    const path22 = isoCode22 ? buildIso22Path(isoCode22, categories22) : {}
    const mappingStatus = isoCode ? getMappingStatus(isoCode, mappingStatusMap) : 'missing'
    return (series.variants || []).map((variant) => {
      const firstAgreement = variant.agreements?.[0] ?? null
      return {
        productId: variant.id,
        seriesId: series.id,
        productTitle: series.title,
        variantName: variant.articleName,
        supplierRef: variant.supplierRef,
        hmsArtNr: variant.hmsArtNr || '',
        isoCode,
        iso1: path.level1?.isoCode ?? '',
        iso2: path.level2?.isoCode ?? '',
        iso3: path.level3?.isoCode ?? '',
        iso4: path.level4?.isoCode ?? '',
        iso1Title: path.level1?.isoTitle ?? '',
        iso2Title: path.level2?.isoTitle ?? '',
        iso3Title: path.level3?.isoTitle ?? '',
        iso4Title: path.level4?.isoTitle ?? '',
        iso22Lvl1: path22.level1?.isoCode ?? '',
        iso22Lvl2: path22.level2?.isoCode ?? '',
        iso22Lvl3: path22.level3?.isoCode ?? '',
        iso22Lvl4: path22.level4?.isoCode ?? '',
        iso22Lvl1Title: path22.level1?.isoTitle ?? '',
        iso22Lvl2Title: path22.level2?.isoTitle ?? '',
        iso22Lvl3Title: path22.level3?.isoTitle ?? '',
        iso22Lvl4Title: path22.level4?.isoTitle ?? '',
        mappingStatus,
        agreementRef: firstAgreement?.reference ?? '',
        agreementRank: firstAgreement?.rank ?? null,
        agreementPostNr: firstAgreement?.postNr ?? null,
      }
    })
  })
}

const isoCodeToNumber = (code: string): number => {
  if (!code) return 0
  return parseInt(code.replace(/\s/g, ''), 10) || 0
}

const numericValue = (val: number | null | undefined): number => val ?? Number.MAX_SAFE_INTEGER

const sortRows = (rows: ExtractedProductVariant[], key: SortKey, dir: SortDir): ExtractedProductVariant[] => {
  return [...rows].sort((a, b) => {
    let av: number
    let bv: number
    if (key === 'agreementRank' || key === 'agreementPostNr') {
      av = numericValue(a[key])
      bv = numericValue(b[key])
    } else {
      av = isoCodeToNumber(a[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'])
      bv = isoCodeToNumber(b[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'])
    }
    return dir === 'asc' ? av - bv : bv - av
  })
}

const sortProductRows = (rows: ProductSummaryRow[], key: SortKey, dir: SortDir): ProductSummaryRow[] => {
  return [...rows].sort((a, b) => {
    let av: number
    let bv: number
    if (key === 'variantCount') {
      av = a.variantCount
      bv = b.variantCount
    } else if (key === 'agreementRank' || key === 'agreementPostNr') {
      av = numericValue(a[key])
      bv = numericValue(b[key])
    } else {
      av = isoCodeToNumber(a[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'])
      bv = isoCodeToNumber(b[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'])
    }
    return dir === 'asc' ? av - bv : bv - av
  })
}

const groupByProduct = (variantRows: ExtractedProductVariant[]): ProductSummaryRow[] => {
  const map = new Map<string, ProductSummaryRow>()
  for (const row of variantRows) {
    const existing = map.get(row.seriesId)
    if (existing) {
      existing.variantCount++
    } else {
      map.set(row.seriesId, {
        seriesId: row.seriesId,
        productTitle: row.productTitle,
        isoCode: row.isoCode,
        iso1: row.iso1,
        iso2: row.iso2,
        iso3: row.iso3,
        iso4: row.iso4,
        iso1Title: row.iso1Title,
        iso2Title: row.iso2Title,
        iso3Title: row.iso3Title,
        iso4Title: row.iso4Title,
        iso22Lvl1: row.iso22Lvl1,
        iso22Lvl2: row.iso22Lvl2,
        iso22Lvl3: row.iso22Lvl3,
        iso22Lvl4: row.iso22Lvl4,
        iso22Lvl1Title: row.iso22Lvl1Title,
        iso22Lvl2Title: row.iso22Lvl2Title,
        iso22Lvl3Title: row.iso22Lvl3Title,
        iso22Lvl4Title: row.iso22Lvl4Title,
        mappingStatus: row.mappingStatus,
        variantCount: 1,
        agreementRef: row.agreementRef,
        agreementRank: row.agreementRank,
        agreementPostNr: row.agreementPostNr,
      })
    }
  }
  return Array.from(map.values())
}

const SortHeader = ({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) => (
  <Table.HeaderCell scope="col" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'inherit', padding: 0 }}
      aria-label={
        active
          ? `${label}, sortert ${dir === 'asc' ? 'stigende' : 'synkende'}. Aktiver for å snu sorteringen`
          : `${label}, sorter stigende`
      }
    >
      {label}
      <span aria-hidden="true">{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
    </button>
  </Table.HeaderCell>
)

type IsoTitlesV1 = Pick<ExtractedProductVariant, 'iso1Title' | 'iso2Title' | 'iso3Title' | 'iso4Title'>
type IsoTitlesV22 = Pick<
  ExtractedProductVariant,
  'iso22Lvl1Title' | 'iso22Lvl2Title' | 'iso22Lvl3Title' | 'iso22Lvl4Title'
>

const OptionalTitleHeadersV1 = ({ visible }: { visible: Set<OptionalColumnV1> }) => (
  <>
    {visible.has('ISO 2016 nivå 1 tittel') && <Table.HeaderCell scope="col">ISO 2016 - 1 tittel</Table.HeaderCell>}
    {visible.has('ISO 2016 nivå 2 tittel') && <Table.HeaderCell scope="col">ISO 2016 - 2 tittel</Table.HeaderCell>}
    {visible.has('ISO 2016 nivå 3 tittel') && <Table.HeaderCell scope="col">ISO 2016 - 3 tittel</Table.HeaderCell>}
    {visible.has('ISO 2016 nivå 4 tittel') && <Table.HeaderCell scope="col">ISO 2016 - 4 tittel</Table.HeaderCell>}
  </>
)

const OptionalTitleCellsV1 = ({ visible, row }: { visible: Set<OptionalColumnV1>; row: IsoTitlesV1 }) => (
  <>
    {visible.has('ISO 2016 nivå 1 tittel') && <Table.DataCell>{row.iso1Title}</Table.DataCell>}
    {visible.has('ISO 2016 nivå 2 tittel') && <Table.DataCell>{row.iso2Title}</Table.DataCell>}
    {visible.has('ISO 2016 nivå 3 tittel') && <Table.DataCell>{row.iso3Title}</Table.DataCell>}
    {visible.has('ISO 2016 nivå 4 tittel') && <Table.DataCell>{row.iso4Title}</Table.DataCell>}
  </>
)

const OptionalTitleHeadersV22 = ({ visible }: { visible: Set<OptionalColumnV22> }) => (
  <>
    {visible.has('ISO 2022 nivå 1 tittel') && <Table.HeaderCell scope="col">ISO 2022 - 1 tittel</Table.HeaderCell>}
    {visible.has('ISO 2022 nivå 2 tittel') && <Table.HeaderCell scope="col">ISO 2022 - 2 tittel</Table.HeaderCell>}
    {visible.has('ISO 2022 nivå 3 tittel') && <Table.HeaderCell scope="col">ISO 2022 - 3 tittel</Table.HeaderCell>}
    {visible.has('ISO 2022 nivå 4 tittel') && <Table.HeaderCell scope="col">ISO 2022 - 4 tittel</Table.HeaderCell>}
  </>
)

const OptionalTitleCellsV22 = ({ visible, row }: { visible: Set<OptionalColumnV22>; row: IsoTitlesV22 }) => (
  <>
    {visible.has('ISO 2022 nivå 1 tittel') && <Table.DataCell>{row.iso22Lvl1Title}</Table.DataCell>}
    {visible.has('ISO 2022 nivå 2 tittel') && <Table.DataCell>{row.iso22Lvl2Title}</Table.DataCell>}
    {visible.has('ISO 2022 nivå 3 tittel') && <Table.DataCell>{row.iso22Lvl3Title}</Table.DataCell>}
    {visible.has('ISO 2022 nivå 4 tittel') && <Table.DataCell>{row.iso22Lvl4Title}</Table.DataCell>}
  </>
)

const IsoLevelHeaders = ({
  sortKey,
  sortDir,
  onSort,
}: {
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}) => (
  <>
    {(['iso1', 'iso2', 'iso3', 'iso4'] as const).map((k, i) => (
      <SortHeader
        key={k}
        label={`ISO 2016 - nivå ${i + 1}`}
        active={sortKey === k}
        dir={sortDir}
        onClick={() => onSort(k)}
      />
    ))}
  </>
)

const Iso22LevelHeaders = () => (
  <>
    <Table.HeaderCell scope="col">ISO 2022 - nivå 1</Table.HeaderCell>
    <Table.HeaderCell scope="col">ISO 2022 - nivå 2</Table.HeaderCell>
    <Table.HeaderCell scope="col">ISO 2022 - nivå 3</Table.HeaderCell>
    <Table.HeaderCell scope="col">ISO 2022 - nivå 4</Table.HeaderCell>
  </>
)

const MappingStatusTag = ({ status }: { status: MappingStatus }) => {
  if (status === 'verified')
    return (
      <Tag variant="success" size="small">
        Verifisert
      </Tag>
    )
  if (status === 'unverified')
    return (
      <Tag variant="warning" size="small">
        Ikke verifisert
      </Tag>
    )
  return (
    <Tag variant="neutral" size="small">
      Mangler kobling
    </Tag>
  )
}

const IsoOversikt = () => {
  const { loggedInUser } = useAuthStore()
  const { isoCategories, isoError } = useIsoCategories()
  const { isoCategories22, isoError22 } = useIsoCategories22()
  const { isoMappings, isoMappingsError } = useIsoMappings()

  const [rows, setRows] = useState<ExtractedProductVariant[] | null>(null)
  const [totalSeriesCount, setTotalSeriesCount] = useState<number | undefined>(undefined)
  const [pageLoading, setPageLoading] = useState(false)
  const [pendingLargeLoad, setPendingLargeLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')

  const [sortKey, setSortKey] = useState<SortKey>('iso1')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [variantPage, setVariantPage] = useState(1)
  const [variantPageSize, setVariantPageSize] = useState(25)

  const [visibleOptionalsV1, setVisibleOptionalsV1] = useState<Set<OptionalColumnV1>>(new Set())
  const [visibleOptionalsV22, setVisibleOptionalsV22] = useState<Set<OptionalColumnV22>>(new Set())
  const [showMappingStatus, setShowMappingStatus] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('product')
  const [isoInput, setIsoInput] = useState('')
  const [isoInputError, setIsoInputError] = useState<string | null>(null)

  const sortedIsoCategories = useMemo(
    () => (isoCategories || []).filter((it) => it.isActive).sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories]
  )

  const sortedIsoCategories22 = useMemo(
    () => (isoCategories22 || []).slice().sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories22]
  )

  const mappingStatusMap = useMemo(() => buildMappingStatusMap(isoMappings || []), [isoMappings])

  const selectedIsoCode = selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1

  const loadAllRows = useCallback(
    async (skipWarning = false) => {
      if (!loggedInUser?.isAdmin) return
      setPageLoading(true)
      setLoadError(null)
      setPendingLargeLoad(false)
      try {
        const firstChunk = await fetchSeriesPage(0, SERIES_PAGE_SIZE)
        const totalPages = firstChunk.totalPages || 1
        const totalSeries = firstChunk.totalSize ?? 0
        setTotalSeriesCount(totalSeries)

        if (!skipWarning && !selectedIsoCode && totalSeries > SERIES_WARN_THRESHOLD) {
          setPendingLargeLoad(true)
          setPageLoading(false)
          return
        }

        const allIds = (firstChunk.content || []).map((s) => s.id)
        for (let p = 1; p < totalPages; p++) {
          const chunk = await fetchSeriesPage(p, SERIES_PAGE_SIZE)
          allIds.push(...(chunk.content || []).map((s) => s.id))
        }
        const details = await fetchSeriesDetailsBatched(allIds)
        setRows(mapToExtractedRows(details, sortedIsoCategories, sortedIsoCategories22, mappingStatusMap))
        setVariantPage(1)
      } catch (error: any) {
        setLoadError(error?.message || 'Klarte ikke å hente produkter og varianter')
      } finally {
        setPageLoading(false)
      }
    },
    [loggedInUser?.isAdmin, sortedIsoCategories, sortedIsoCategories22, mappingStatusMap, selectedIsoCode]
  )

  const level1Options = useMemo(() => sortedIsoCategories.filter((it) => it.isoLevel === 1), [sortedIsoCategories])
  const level2Options = useMemo(
    () =>
      selectedLevel1
        ? sortedIsoCategories.filter((it) => it.isoLevel === 2 && it.isoCode.startsWith(selectedLevel1))
        : [],
    [selectedLevel1, sortedIsoCategories]
  )
  const level3Options = useMemo(
    () =>
      selectedLevel2
        ? sortedIsoCategories.filter((it) => it.isoLevel === 3 && it.isoCode.startsWith(selectedLevel2))
        : [],
    [selectedLevel2, sortedIsoCategories]
  )
  const level4Options = useMemo(
    () =>
      selectedLevel3
        ? sortedIsoCategories.filter((it) => it.isoLevel === 4 && it.isoCode.startsWith(selectedLevel3))
        : [],
    [selectedLevel3, sortedIsoCategories]
  )

  const filteredRows = useMemo(() => {
    if (!rows) return []
    const base = selectedIsoCode ? rows.filter((row) => row.isoCode.startsWith(selectedIsoCode)) : rows
    return sortRows(base, sortKey, sortDir)
  }, [rows, selectedIsoCode, sortKey, sortDir])

  const productRows = useMemo(
    () => sortProductRows(groupByProduct(filteredRows), sortKey, sortDir),
    [filteredRows, sortKey, sortDir]
  )

  const displayCount = viewMode === 'product' ? productRows.length : filteredRows.length
  const totalPages = Math.max(1, Math.ceil(displayCount / variantPageSize))
  const pagedRows = useMemo(() => {
    const from = (variantPage - 1) * variantPageSize
    return viewMode === 'product'
      ? productRows.slice(from, from + variantPageSize)
      : filteredRows.slice(from, from + variantPageSize)
  }, [viewMode, filteredRows, productRows, variantPage, variantPageSize])

  useEffect(() => {
    if (variantPage > totalPages) setVariantPage(totalPages)
  }, [variantPage, totalPages])

  const applyIsoCodeInput = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      setSelectedLevel1('')
      setSelectedLevel2('')
      setSelectedLevel3('')
      setSelectedLevel4('')
      setIsoInputError(null)
      return
    }
    const stripped = trimmed.replace(/\s/g, '')
    const match = sortedIsoCategories.find((cat) => cat.isoCode.replace(/\s/g, '') === stripped)
    if (match) {
      setIsoInput(match.isoCode)
      const path = buildIsoPath(match.isoCode, sortedIsoCategories)
      setSelectedLevel1(path.level1?.isoCode ?? '')
      setSelectedLevel2(path.level2?.isoCode ?? '')
      setSelectedLevel3(path.level3?.isoCode ?? '')
      setSelectedLevel4(path.level4?.isoCode ?? '')
      setIsoInputError(null)
      setVariantPage(1)
    } else {
      setIsoInputError(`ISO-kode "${trimmed}" ble ikke funnet`)
    }
  }

  const syncDropdownsToInput = (level1: string, level2: string, level3: string, level4: string) => {
    const code = level4 || level3 || level2 || level1
    setIsoInput(code)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setVariantPage(1)
  }

  const toggleOptionalV1 = (col: OptionalColumnV1) => {
    setVisibleOptionalsV1((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const toggleOptionalV22 = (col: OptionalColumnV22) => {
    setVisibleOptionalsV22((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  if (isoError) {
    return (
      <main className="show-menu">
        <Alert variant="error">Klarte ikke å hente ISO 2016-kategorier.</Alert>
      </main>
    )
  }

  if (!loggedInUser?.isAdmin) {
    return (
      <main className="show-menu">
        <Alert variant="warning">Du må være admin for å se denne siden.</Alert>
      </main>
    )
  }

  return (
    <main className="show-menu">
      <VStack gap="space-24" maxWidth="100rem">
        <Heading level="1" size="large">
          ISO oversikt
        </Heading>
        <InfoCard data-color="warning">
          <InfoCard.Header>
            <InfoCard.Title>Obs!</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Dette er fase 1 av ISO-oversikten. Den viser produkter og varianter med både ISO 2016- og
            2022-kategorisering. Uttrekk til fil, revisjonshistorikk og redigering av ISO-kategorier kommer i senere
            faser.
          </InfoCard.Content>
        </InfoCard>
        {isoError22 && <Alert variant="warning">Klarte ikke å hente ISO 2022-kategorier.</Alert>}
        {isoMappingsError && (
          <Alert variant="warning">Klarte ikke å hente mapping-status mellom ISO 2016 og 2022.</Alert>
        )}

        <HStack gap="space-8" align="end">
          <TextField
            label="ISO-kode (2016)"
            description="Skriv eller lim inn 8-sifret ISO-kode, f.eks. 18090301 eller 04010101"
            placeholder="18090301"
            value={isoInput}
            onChange={(e) => {
              setIsoInput(e.target.value)
              setIsoInputError(null)
            }}
            onBlur={(e) => applyIsoCodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyIsoCodeInput(isoInput)
            }}
            error={isoInputError ?? undefined}
            style={{ width: '16rem' }}
          />
          {isoInput && (
            <Button
              variant="tertiary"
              size="small"
              onClick={() => {
                setIsoInput('')
                setIsoInputError(null)
                setSelectedLevel1('')
                setSelectedLevel2('')
                setSelectedLevel3('')
                setSelectedLevel4('')
                setVariantPage(1)
              }}
            >
              Nullstill
            </Button>
          )}
        </HStack>

        {/* ISO 2016 filters */}
        <HStack gap="space-16" style={{ flexWrap: 'wrap' }}>
          <Select
            label="ISO 2016 nivå 1"
            value={selectedLevel1}
            onChange={(e) => {
              setSelectedLevel1(e.target.value)
              setSelectedLevel2('')
              setSelectedLevel3('')
              setSelectedLevel4('')
              setVariantPage(1)
              syncDropdownsToInput(e.target.value, '', '', '')
            }}
          >
            <option value="">Alle</option>
            {level1Options.map((o) => (
              <option key={o.isoCode} value={o.isoCode}>
                {o.isoCode} {o.isoTitle}
              </option>
            ))}
          </Select>

          <Select
            label="ISO 2016 nivå 2"
            value={selectedLevel2}
            disabled={!selectedLevel1}
            onChange={(e) => {
              setSelectedLevel2(e.target.value)
              setSelectedLevel3('')
              setSelectedLevel4('')
              setVariantPage(1)
              syncDropdownsToInput(selectedLevel1, e.target.value, '', '')
            }}
          >
            <option value="">Alle</option>
            {level2Options.map((o) => (
              <option key={o.isoCode} value={o.isoCode}>
                {o.isoCode} {o.isoTitle}
              </option>
            ))}
          </Select>

          <Select
            label="ISO 2016 nivå 3"
            value={selectedLevel3}
            disabled={!selectedLevel2}
            onChange={(e) => {
              setSelectedLevel3(e.target.value)
              setSelectedLevel4('')
              setVariantPage(1)
              syncDropdownsToInput(selectedLevel1, selectedLevel2, e.target.value, '')
            }}
          >
            <option value="">Alle</option>
            {level3Options.map((o) => (
              <option key={o.isoCode} value={o.isoCode}>
                {o.isoCode} {o.isoTitle}
              </option>
            ))}
          </Select>

          <Select
            label="ISO 2016 nivå 4"
            value={selectedLevel4}
            disabled={!selectedLevel3}
            onChange={(e) => {
              setSelectedLevel4(e.target.value)
              setVariantPage(1)
              syncDropdownsToInput(selectedLevel1, selectedLevel2, selectedLevel3, e.target.value)
            }}
          >
            <option value="">Alle</option>
            {level4Options.map((o) => (
              <option key={o.isoCode} value={o.isoCode}>
                {o.isoCode} {o.isoTitle}
              </option>
            ))}
          </Select>
        </HStack>

        {/* View mode + optional columns */}
        <HStack gap="space-24" align="start" style={{ flexWrap: 'wrap' }}>
          <ToggleGroup
            label="Visning"
            value={viewMode}
            onChange={(val) => {
              setViewMode(val as ViewMode)
              setVariantPage(1)
            }}
            size="small"
          >
            <ToggleGroup.Item value="product">Produkter</ToggleGroup.Item>
            <ToggleGroup.Item value="variant">Varianter</ToggleGroup.Item>
          </ToggleGroup>

          <VStack gap="space-4">
            <Label id="optional-columns-v1-label">Valgfrie kolonner - ISO 2016 titler</Label>
            <div id="optional-columns-v1-group" role="group" aria-labelledby="optional-columns-v1-label">
              <Chips>
                {OPTIONAL_COLUMNS_V1.map((col) => (
                  <Chips.Toggle key={col} selected={visibleOptionalsV1.has(col)} onClick={() => toggleOptionalV1(col)}>
                    {col}
                  </Chips.Toggle>
                ))}
              </Chips>
            </div>
          </VStack>

          <VStack gap="space-4">
            <Label id="optional-columns-v22-label">Valgfrie kolonner - ISO 2022 titler</Label>
            <div id="optional-columns-v22-group" role="group" aria-labelledby="optional-columns-v22-label">
              <Chips>
                {OPTIONAL_COLUMNS_V22.map((col) => (
                  <Chips.Toggle
                    key={col}
                    selected={visibleOptionalsV22.has(col)}
                    onClick={() => toggleOptionalV22(col)}
                  >
                    {col}
                  </Chips.Toggle>
                ))}
              </Chips>
            </div>
          </VStack>

          <VStack gap="space-4">
            <Label>Mapping-status</Label>
            <Checkbox checked={showMappingStatus} onChange={(e) => setShowMappingStatus(e.target.checked)}>
              Vis mapping-status (2016 → 2022)
            </Checkbox>
          </VStack>
        </HStack>

        {/* Fetch trigger + summary */}
        {pendingLargeLoad && (
          <Alert variant="warning">
            Systemet inneholder <strong>{totalSeriesCount}</strong> aktive produktserier på tvers av alle
            ISO-kategorier. Uten ISO-filter vil alle hentes, noe som kan ta lang tid eller feile. Velg ISO-filter
            ovenfor for å begrense uttrekket, eller fortsett likevel.
            <HStack gap="space-8" style={{ marginTop: '0.75rem' }}>
              <Button size="small" variant="secondary" onClick={() => loadAllRows(true)}>
                Fortsett likevel
              </Button>
              <Button size="small" variant="tertiary" onClick={() => setPendingLargeLoad(false)}>
                Avbryt
              </Button>
            </HStack>
          </Alert>
        )}

        {loadError && <Alert variant="error">{loadError}</Alert>}

        {rows === null && !pageLoading && !pendingLargeLoad && (
          <HStack gap="space-12" align="center">
            <Button onClick={() => loadAllRows(false)} disabled={!sortedIsoCategories.length}>
              Hent liste
            </Button>
            <BodyShort size="small">
              {selectedIsoCode
                ? `Henter aktive produktserier filtrert på ISO ${selectedIsoCode}`
                : 'Anbefaler å velge ISO-filter ovenfor — uten filter hentes alle aktive produktserier'}
            </BodyShort>
          </HStack>
        )}

        {pageLoading && (
          <HStack gap="space-8" align="center" role="status">
            <Loader size="small" title="Henter data" />
            <BodyShort>Henter data...</BodyShort>
          </HStack>
        )}

        {rows !== null && !pageLoading && (
          <>
            {/* Summary */}
            <HStack justify="space-between" align="end" style={{ flexWrap: 'wrap' }} gap="space-16">
              <HStack gap="space-12" align="center">
                <BodyShort role="status" aria-live="polite">
                  {viewMode === 'product'
                    ? `${productRows.length} produkter (${filteredRows.length} varianter)`
                    : `${filteredRows.length} varianter (${productRows.length} produkter)`}
                  {selectedIsoCode
                    ? ` for ISO ${selectedIsoCode}`
                    : totalSeriesCount !== undefined
                      ? ` (${totalSeriesCount} aktive produktserier i systemet)`
                      : ''}
                </BodyShort>
                <Button
                  size="small"
                  variant="tertiary"
                  onClick={() => {
                    setRows(null)
                    setPendingLargeLoad(false)
                  }}
                >
                  Tilbakestill
                </Button>
              </HStack>
            </HStack>

            {/* Table */}
            <Box style={{ overflowX: 'auto' }}>
              {pagedRows.length === 0 ? (
                <Alert variant="info">Ingen treff for valgt ISO-filter.</Alert>
              ) : viewMode === 'product' ? (
                <Table size="small">
                  <caption className="aksel-sr-only">
                    Produktserier{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert kolonnevis. Side{' '}
                    {variantPage} av {totalPages}.
                  </caption>
                  <Table.Header>
                    <Table.Row>
                      <IsoLevelHeaders sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                      <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                      <Iso22LevelHeaders />
                      <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                      {showMappingStatus && <Table.HeaderCell scope="col">Mapping-status</Table.HeaderCell>}
                      <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                      <SortHeader
                        label="Ant. varianter"
                        active={sortKey === 'variantCount'}
                        dir={sortDir}
                        onClick={() => toggleSort('variantCount')}
                      />
                      <Table.HeaderCell scope="col">Avtale</Table.HeaderCell>
                      <SortHeader
                        label="Rangering"
                        active={sortKey === 'agreementRank'}
                        dir={sortDir}
                        onClick={() => toggleSort('agreementRank')}
                      />
                      <SortHeader
                        label="Delkontraktnr."
                        active={sortKey === 'agreementPostNr'}
                        dir={sortDir}
                        onClick={() => toggleSort('agreementPostNr')}
                      />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(pagedRows as ProductSummaryRow[]).map((row) => (
                      <Table.Row key={row.seriesId}>
                        <Table.DataCell>{row.iso1}</Table.DataCell>
                        <Table.DataCell>{row.iso2}</Table.DataCell>
                        <Table.DataCell>{row.iso3}</Table.DataCell>
                        <Table.DataCell>{row.iso4}</Table.DataCell>
                        <OptionalTitleCellsV1 visible={visibleOptionalsV1} row={row} />
                        <Table.DataCell>{row.iso22Lvl1}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl2}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl3}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl4}</Table.DataCell>
                        <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                        {showMappingStatus && (
                          <Table.DataCell>
                            <MappingStatusTag status={row.mappingStatus} />
                          </Table.DataCell>
                        )}
                        <Table.DataCell>{row.productTitle}</Table.DataCell>
                        <Table.DataCell>{row.variantCount}</Table.DataCell>
                        <Table.DataCell>{row.agreementRef}</Table.DataCell>
                        <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                        <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <Table size="small">
                  <caption className="aksel-sr-only">
                    Produktvarianter{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert kolonnevis. Side{' '}
                    {variantPage} av {totalPages}.
                  </caption>
                  <Table.Header>
                    <Table.Row>
                      <IsoLevelHeaders sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                      <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                      <Iso22LevelHeaders />
                      <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                      {showMappingStatus && <Table.HeaderCell scope="col">Mapping-status</Table.HeaderCell>}
                      <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Variantnavn</Table.HeaderCell>
                      <Table.HeaderCell scope="col">HMS-nr.</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Leverandørref.</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Avtale</Table.HeaderCell>
                      <SortHeader
                        label="Rangering"
                        active={sortKey === 'agreementRank'}
                        dir={sortDir}
                        onClick={() => toggleSort('agreementRank')}
                      />
                      <SortHeader
                        label="Delkontraktnr."
                        active={sortKey === 'agreementPostNr'}
                        dir={sortDir}
                        onClick={() => toggleSort('agreementPostNr')}
                      />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {(pagedRows as ExtractedProductVariant[]).map((row) => (
                      <Table.Row key={row.productId}>
                        <Table.DataCell>{row.iso1}</Table.DataCell>
                        <Table.DataCell>{row.iso2}</Table.DataCell>
                        <Table.DataCell>{row.iso3}</Table.DataCell>
                        <Table.DataCell>{row.iso4}</Table.DataCell>
                        <OptionalTitleCellsV1 visible={visibleOptionalsV1} row={row} />
                        <Table.DataCell>{row.iso22Lvl1}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl2}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl3}</Table.DataCell>
                        <Table.DataCell>{row.iso22Lvl4}</Table.DataCell>
                        <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                        {showMappingStatus && (
                          <Table.DataCell>
                            <MappingStatusTag status={row.mappingStatus} />
                          </Table.DataCell>
                        )}
                        <Table.DataCell>{row.productTitle}</Table.DataCell>
                        <Table.DataCell>{row.variantName}</Table.DataCell>
                        <Table.DataCell>{row.hmsArtNr}</Table.DataCell>
                        <Table.DataCell>{row.supplierRef}</Table.DataCell>
                        <Table.DataCell>{row.agreementRef}</Table.DataCell>
                        <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                        <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </Box>

            {/* Pagination */}
            <HStack gap="space-16" align="end">
              <Select
                label="Rader per side"
                size="small"
                value={variantPageSize}
                onChange={(e) => {
                  setVariantPageSize(Number(e.target.value))
                  setVariantPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={100}>100</option>
              </Select>
              <Pagination page={variantPage} count={totalPages} onPageChange={setVariantPage} size="small" />
            </HStack>
          </>
        )}
      </VStack>
    </main>
  )
}

export default IsoOversikt
