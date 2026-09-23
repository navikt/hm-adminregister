import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getSeriesBySeriesId } from 'api/SeriesApi'
import { HM_REGISTER_URL } from 'environments'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useIsoCategories, useIsoCategories22, useIsoMappings } from 'utils/swr-hooks'
import {
  IsoCategory22DTO,
  IsoCategoryDTO,
  IsoMapDTO,
  SeriesDTO,
  SeriesSearchChunk,
  SeriesSearchDTO,
} from 'utils/types/response-types'

import {
  ActionMenu,
  Alert,
  BodyShort,
  Box,
  Button,
  ExpansionCard,
  HStack,
  Heading,
  InfoCard,
  Loader,
  Pagination,
  Select,
  Table,
  Tag,
  TextField,
  ToggleGroup,
  VStack,
} from '@navikt/ds-react'

const SERIES_PAGE_SIZE = 200
const SERIES_WARN_THRESHOLD = 200
const DETAIL_FETCH_CONCURRENCY = 20

type SortDir = 'asc' | 'desc'
type SortKey = 'iso1' | 'iso2' | 'iso3' | 'iso4' | 'agreementRank' | 'agreementPostNr' | 'variantCount'
type ViewMode = 'product' | 'variant'
type PageMode = 'mapping' | 'extract'
type ExtraColumn = 'produkt' | 'variant' | 'avtale'
type IsoMapEnum = IsoMapDTO['mapEnum'][number]

type IsoOverviewVariant = {
  id: string
  articleName: string
  supplierRef: string
  hmsArtNr?: string | null
  agreements: {
    reference: string
    rank: number
    postNr: number
  }[]
}

type IsoOverviewSeries = SeriesSearchDTO & {
  isoCategory?: string
  isoCategory22?: string | null
  variants?: IsoOverviewVariant[]
}

type IsoOverviewSeriesChunk = Omit<SeriesSearchChunk, 'content'> & {
  content: IsoOverviewSeries[]
}

const ISO_MAP_LABELS: Record<IsoMapEnum, string> = {
  SAME: '= Ingenting er endret',
  CHANGED_CODE_SAME_HEADER: 'C Endret kode, samme overskrift',
  CHANGED_CODE_CHANGED_HEADER: '~ Endret kode og overskrift',
  SAME_CODE_CHANGED_HEADER: '# Samme kode, endret overskrift',
  NEW_CODE_NEW_HEADER_MERGED: '> Ny kode og overskrift, slått sammen',
  SAME_OR_CHANGED_CODE_SAME_HEADER_MERGED: '≥ Samme eller endret kode, slått sammen',
  CHANGED_EXPLANATION: '* Endret forklaring',
  ADDED_EXPLANATION: '+ Tilføyd forklaring',
  NEW_CODE_NEW_HEADER_SPLIT: '< Ny kode og overskrift, delt opp',
  NEW_CODE_SAME_HEADER_SPLIT: '≤ Ny kode, samme overskrift, delt opp',
  DELETED_CLASS_OR_SUBCLASS_OR_SECTION: 'X Slettet klasse, underklasse eller inndeling',
  NEW_CLASS_OR_SUBCLASS_OR_SECTION: '! Ny klasse, underklasse eller inndeling',
  SAME_CODE_NEW_HEADER_AND_EXPLANATION: '± Samme kode, ny overskrift og forklaring',
  UNKNOWN: '? Ukjent endring',
}

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
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
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
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
  variantCount: number
  agreementRef: string
  agreementRank: number | null
  agreementPostNr: number | null
}

type MappingRow = {
  key: string
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
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
}

const OPTIONAL_COLUMNS_V1 = [
  'v16 nivå 1 tittel',
  'v16 nivå 2 tittel',
  'v16 nivå 3 tittel',
  'v16 nivå 4 tittel',
] as const
type OptionalColumnV1 = (typeof OPTIONAL_COLUMNS_V1)[number]

const OPTIONAL_COLUMNS_V22 = [
  'v22 nivå 1 tittel',
  'v22 nivå 2 tittel',
  'v22 nivå 3 tittel',
  'v22 nivå 4 tittel',
] as const
type OptionalColumnV22 = (typeof OPTIONAL_COLUMNS_V22)[number]

const fetchSeriesPage = async (
  page: number,
  pageSize: number,
  isoCode?: string,
  signal?: AbortSignal
): Promise<IsoOverviewSeriesChunk> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: pageSize.toString(),
    sort: 'updated,DESC',
    excludedStatus: 'DELETED',
    excludeExpired: 'true',
    editStatus: 'DONE',
    mainProduct: 'true',
    includeIsoOverview: 'true',
  })
  if (isoCode) params.set('isoCode', isoCode)
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/api/v1/series?${params}`, {
    credentials: 'include',
    signal,
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(response.statusText || 'Klarte ikke å hente produktserier')
  return (await response.json()) as IsoOverviewSeriesChunk
}

const fetchSeriesDetailsConcurrent = async (
  seriesIds: string[],
  onProgress: (loaded: number, total: number) => void,
  signal: AbortSignal,
  concurrency = DETAIL_FETCH_CONCURRENCY
): Promise<SeriesDTO[]> => {
  const total = seriesIds.length
  const results: SeriesDTO[] = new Array(total)
  let nextIndex = 0
  let loaded = 0

  const worker = async () => {
    while (nextIndex < total && !signal.aborted) {
      const current = nextIndex++
      results[current] = await getSeriesBySeriesId(seriesIds[current], signal)
      loaded++
      onProgress(loaded, total)
    }
  }

  const workerCount = Math.min(concurrency, total)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

const getParentCategory = (
  child: IsoCategoryDTO,
  categories: IsoCategoryDTO[],
  parentLevel: number
): IsoCategoryDTO | undefined => {
  const childCode = child.isoCode.replace(/\s/g, '')
  const prefix = childCode.slice(0, parentLevel * 2)
  const category = categories.find((it) => it.isoLevel === parentLevel && it.isoCode.replace(/\s/g, '') === prefix)

  // The category endpoint can contain a level-2/3/4 entry without its parent
  // entry. Keep the hierarchy usable by deriving the parent code; its title
  // remains empty until the backend provides the parent category.
  return (
    category ??
    (prefix
      ? {
          ...child,
          isoCode: prefix,
          isoLevel: parentLevel,
          isoTitle: '',
          isoTitleShort: '',
        }
      : undefined)
  )
}

const buildIsoPath = (isoCode: string, categories: IsoCategoryDTO[]): IsoPath => {
  const normalizedCode = isoCode.replace(/\s/g, '')
  const current = categories.find((it) => it.isoCode.replace(/\s/g, '') === normalizedCode)
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
): IsoCategory22DTO | undefined => {
  const childCode = child.isoCode.replace(/\s/g, '')
  const category = categories
    .filter((it) => it.isoLevel === parentLevel && childCode.startsWith(it.isoCode.replace(/\s/g, '')))
    .sort((a, b) => b.isoCode.length - a.isoCode.length)[0]
  return (
    category ??
    (childCode
      ? {
          ...child,
          isoCode: childCode,
          isoLevel: parentLevel,
          isoTitle: '',
        }
      : undefined)
  )
}

// Mirrors buildIsoPath, but for the ISO 2022 category tree. Categories without a
// resolvable ancestor at a given level are simply left undefined - the row will
// then show empty cells for that level, which is expected while the 2016 -> 2022
// migration is still in progress.
const buildIso22Path = (isoCode22: string, categories: IsoCategory22DTO[]): Iso22Path => {
  const normalizedCode = isoCode22.replace(/\s/g, '')
  const current =
    categories.find((it) => it.isoCode.replace(/\s/g, '') === normalizedCode) ??
    ({
      isoCode: normalizedCode,
      isoLevel: Math.min(4, Math.max(1, normalizedCode.length / 2)),
      isoTitle: '',
    } as IsoCategory22DTO)
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

const findMappingsForCode = (isoCode: string, mappingsByCode16: Map<string, IsoMapDTO[]>): IsoMapDTO[] => {
  let codePrefix = isoCode.replace(/\s/g, '')
  while (codePrefix.length >= 2) {
    const mappings = mappingsByCode16.get(codePrefix)
    if (mappings?.length) return mappings
    codePrefix = codePrefix.slice(0, -2)
  }
  return []
}

const buildMappingsByCode16 = (mappings: IsoMapDTO[]): Map<string, IsoMapDTO[]> => {
  const mappingsByCode16 = new Map<string, IsoMapDTO[]>()
  for (const mapping of mappings) {
    const code16 = mapping.code16?.replace(/\s/g, '') ?? ''
    if (!code16) continue
    const entries = mappingsByCode16.get(code16) ?? []
    entries.push(mapping)
    mappingsByCode16.set(code16, entries)
  }
  return mappingsByCode16
}

const mapToExtractedRows = (
  seriesDetails: (SeriesDTO | IsoOverviewSeries)[],
  categories: IsoCategoryDTO[],
  categories22: IsoCategory22DTO[],
  mappingsByCode16: Map<string, IsoMapDTO[]>
): ExtractedProductVariant[] => {
  return seriesDetails.flatMap((series) => {
    const isoCode = typeof series.isoCategory === 'string' ? series.isoCategory : (series.isoCategory?.isoCode ?? '')
    const path = buildIsoPath(isoCode, categories)
    const matchingMappings = findMappingsForCode(isoCode, mappingsByCode16)
    const mappedIsoCodes22 = matchingMappings
      .map((mapping) => (mapping.mapEnum.includes('SAME') ? isoCode : (mapping.code22?.replace(/\s/g, '') ?? '')))
      .filter(Boolean)
    const storedIsoCode22 =
      typeof series.isoCategory22 === 'string' ? series.isoCategory22 : series.isoCategory22?.isoCode
    const isoCodes22 = storedIsoCode22 ? [storedIsoCode22] : Array.from(new Set(mappedIsoCodes22))
    const paths22 = isoCodes22.map((code) => buildIso22Path(code, categories22))
    const path22Value = (level: keyof Iso22Path, field: 'isoCode' | 'isoTitle') =>
      Array.from(
        new Set(paths22.map((path22) => path22[level]?.[field]).filter((value): value is string => !!value))
      ).join(', ')
    const mappingTypes = Array.from(new Set(matchingMappings.flatMap((mapping) => mapping.mapEnum)))
    const mappingVerified = matchingMappings.length === 0 ? null : matchingMappings.every((mapping) => mapping.verified)
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
        iso22Lvl1: path22Value('level1', 'isoCode'),
        iso22Lvl2: path22Value('level2', 'isoCode'),
        iso22Lvl3: path22Value('level3', 'isoCode'),
        iso22Lvl4: path22Value('level4', 'isoCode'),
        iso22Lvl1Title: path22Value('level1', 'isoTitle'),
        iso22Lvl2Title: path22Value('level2', 'isoTitle'),
        iso22Lvl3Title: path22Value('level3', 'isoTitle'),
        iso22Lvl4Title: path22Value('level4', 'isoTitle'),
        mappingTypes,
        mappingVerified,
        agreementRef: firstAgreement?.reference ?? '',
        agreementRank: firstAgreement?.rank ?? null,
        agreementPostNr: firstAgreement?.postNr ?? null,
      }
    })
  })
}

const buildMappingRows = (
  categories: IsoCategoryDTO[],
  categories22: IsoCategory22DTO[],
  mappings: IsoMapDTO[]
): MappingRow[] => {
  const mappingsByCode16 = buildMappingsByCode16(mappings)

  const toRow = (mapping: IsoMapDTO | undefined, code16: string, key: string): MappingRow => {
    const mappingTypes = mapping?.mapEnum ?? []
    const code22 = mappingTypes.includes('SAME') ? code16 : (mapping?.code22?.replace(/\s/g, '') ?? '')
    const path = code16 ? buildIsoPath(code16, categories) : {}
    const path22 = code22 ? buildIso22Path(code22, categories22) : {}
    return {
      key,
      isoCode: code16,
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
      mappingTypes,
      mappingVerified: mapping?.verified ?? null,
    }
  }

  const relevantCategories = categories.filter(
    (category) =>
      category.isoLevel === 4 ||
      (category.isoLevel === 3 && category.isoCode.replace(/\s/g, '').length === 6 && category.isoCode[4] === '9')
  )
  const representedCodes = new Set(relevantCategories.map((category) => category.isoCode.replace(/\s/g, '')))
  const rows = relevantCategories.flatMap((category) => {
    const code16 = category.isoCode.replace(/\s/g, '')
    const entries = findMappingsForCode(code16, mappingsByCode16)
    return entries.length > 0
      ? entries.map((mapping) => toRow(mapping, code16, `${code16}-${mapping.id}`))
      : [toRow(undefined, code16, `unmapped-${code16}`)]
  })

  const additionalMappings = mappings.filter((mapping) => {
    const code16 = mapping.code16?.replace(/\s/g, '') ?? ''
    return !code16 || !representedCodes.has(code16)
  })

  return [
    ...rows,
    ...additionalMappings.map((mapping) => toRow(mapping, mapping.code16?.replace(/\s/g, '') ?? '', mapping.id)),
  ]
}

const compareIsoCodes = (a: string, b: string, dir: SortDir): number => {
  const normalizedA = a.replace(/\s/g, '')
  const normalizedB = b.replace(/\s/g, '')
  if (!normalizedA && !normalizedB) return 0
  if (!normalizedA) return 1
  if (!normalizedB) return -1
  const result = normalizedA.localeCompare(normalizedB)
  return dir === 'asc' ? result : -result
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
      return compareIsoCodes(
        a[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'],
        b[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'],
        dir
      )
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
      return compareIsoCodes(
        a[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'],
        b[key as 'iso1' | 'iso2' | 'iso3' | 'iso4'],
        dir
      )
    }
    return dir === 'asc' ? av - bv : bv - av
  })
}

// Generic ISO-level sort used by the "Ren ISO-mapping" view, which only ever sorts on the
// iso1-4 code columns (there is no agreement/variantCount data in this view).
const sortByIsoLevel = <T extends { iso1: string; iso2: string; iso3: string; iso4: string }>(
  rows: T[],
  key: SortKey,
  dir: SortDir
): T[] => {
  if (key !== 'iso1' && key !== 'iso2' && key !== 'iso3' && key !== 'iso4') return rows
  return [...rows].sort((a, b) => {
    return compareIsoCodes(a[key], b[key], dir)
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
        mappingTypes: row.mappingTypes,
        mappingVerified: row.mappingVerified,
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
    {visible.has('v16 nivå 1 tittel') && <Table.HeaderCell scope="col">v16 - 1 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 2 tittel') && <Table.HeaderCell scope="col">v16 - 2 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 3 tittel') && <Table.HeaderCell scope="col">v16 - 3 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 4 tittel') && <Table.HeaderCell scope="col">v16 - 4 tittel</Table.HeaderCell>}
  </>
)

const OptionalTitleCellsV1 = ({ visible, row }: { visible: Set<OptionalColumnV1>; row: IsoTitlesV1 }) => (
  <>
    {visible.has('v16 nivå 1 tittel') && <Table.DataCell>{row.iso1Title}</Table.DataCell>}
    {visible.has('v16 nivå 2 tittel') && <Table.DataCell>{row.iso2Title}</Table.DataCell>}
    {visible.has('v16 nivå 3 tittel') && <Table.DataCell>{row.iso3Title}</Table.DataCell>}
    {visible.has('v16 nivå 4 tittel') && <Table.DataCell>{row.iso4Title}</Table.DataCell>}
  </>
)

const OptionalTitleHeadersV22 = ({ visible }: { visible: Set<OptionalColumnV22> }) => (
  <>
    {visible.has('v22 nivå 1 tittel') && <Table.HeaderCell scope="col">v22 - 1 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 2 tittel') && <Table.HeaderCell scope="col">v22 - 2 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 3 tittel') && <Table.HeaderCell scope="col">v22 - 3 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 4 tittel') && <Table.HeaderCell scope="col">v22 - 4 tittel</Table.HeaderCell>}
  </>
)

const OptionalTitleCellsV22 = ({ visible, row }: { visible: Set<OptionalColumnV22>; row: IsoTitlesV22 }) => (
  <>
    {visible.has('v22 nivå 1 tittel') && <Table.DataCell>{row.iso22Lvl1Title}</Table.DataCell>}
    {visible.has('v22 nivå 2 tittel') && <Table.DataCell>{row.iso22Lvl2Title}</Table.DataCell>}
    {visible.has('v22 nivå 3 tittel') && <Table.DataCell>{row.iso22Lvl3Title}</Table.DataCell>}
    {visible.has('v22 nivå 4 tittel') && <Table.DataCell>{row.iso22Lvl4Title}</Table.DataCell>}
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
        label={`v16 - nivå ${i + 1}`}
        active={sortKey === k}
        dir={sortDir}
        onClick={() => onSort(k)}
      />
    ))}
  </>
)

const Iso22LevelHeaders = () => (
  <>
    <Table.HeaderCell scope="col">v22 - nivå 1</Table.HeaderCell>
    <Table.HeaderCell scope="col">v22 - nivå 2</Table.HeaderCell>
    <Table.HeaderCell scope="col">v22 - nivå 3</Table.HeaderCell>
    <Table.HeaderCell scope="col">v22 - nivå 4</Table.HeaderCell>
  </>
)

const MappingTypes = ({ types }: { types: IsoMapEnum[] }) => (
  <HStack gap="space-4" wrap>
    {types.length > 0 ? (
      types.map((type) => (
        <Tag key={type} variant={type === 'SAME' ? 'success' : 'neutral'} size="small">
          {ISO_MAP_LABELS[type]}
        </Tag>
      ))
    ) : (
      <Tag variant="neutral" size="small">
        Mangler kobling
      </Tag>
    )}
  </HStack>
)

const MappingVerification = ({ verified }: { verified: boolean | null }) => {
  if (verified === null) {
    return (
      <Tag variant="neutral" size="small">
        Ikke tilgjengelig
      </Tag>
    )
  }
  return (
    <Tag variant={verified ? 'success' : 'warning'} size="small">
      {verified ? 'Verifisert' : 'Ikke verifisert'}
    </Tag>
  )
}

const IsoOversikt = () => {
  const { loggedInUser } = useAuthStore()
  const { isoCategories, isoLoading, isoError } = useIsoCategories()
  const { isoCategories22, isoLoading22, isoError22 } = useIsoCategories22()
  const { isoMappings, isoMappingsLoading, isoMappingsError } = useIsoMappings(loggedInUser?.isAdmin === true)

  const [rows, setRows] = useState<ExtractedProductVariant[] | null>(null)
  const [totalSeriesCount, setTotalSeriesCount] = useState<number | undefined>(undefined)
  const [pageLoading, setPageLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null)
  const [pendingLargeLoad, setPendingLargeLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const loadAbortControllerRef = useRef<AbortController | null>(null)

  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')

  const [sortKey, setSortKey] = useState<SortKey>('iso1')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [variantPage, setVariantPage] = useState(1)
  const [variantPageSize, setVariantPageSize] = useState(25)

  const [mappingPage, setMappingPage] = useState(1)
  const [mappingPageSize, setMappingPageSize] = useState(25)

  const [visibleOptionalsV1, setVisibleOptionalsV1] = useState<Set<OptionalColumnV1>>(new Set())
  const [visibleOptionalsV22, setVisibleOptionalsV22] = useState<Set<OptionalColumnV22>>(new Set())
  const [visibleExtraColumns, setVisibleExtraColumns] = useState<Set<ExtraColumn>>(new Set())
  const [showMappingTypes, setShowMappingTypes] = useState(false)
  const [pageMode, setPageMode] = useState<PageMode>('mapping')
  const [viewMode, setViewMode] = useState<ViewMode>('product')
  const [isoInput, setIsoInput] = useState('')
  const [isoInputError, setIsoInputError] = useState<string | null>(null)

  const resetPaging = () => {
    setVariantPage(1)
    setMappingPage(1)
  }

  const sortedIsoCategories = useMemo(
    () => (isoCategories || []).filter((it) => it.isActive).sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories]
  )

  const sortedIsoCategories22 = useMemo(
    () => (isoCategories22 || []).slice().sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories22]
  )

  const mappingsByCode16 = useMemo(() => buildMappingsByCode16(isoMappings || []), [isoMappings])

  const selectedIsoCode = selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1

  const mappingRows = useMemo(
    () => buildMappingRows(sortedIsoCategories, sortedIsoCategories22, isoMappings || []),
    [sortedIsoCategories, sortedIsoCategories22, isoMappings]
  )

  const filteredMappingRows = useMemo(() => {
    const base = selectedIsoCode ? mappingRows.filter((row) => row.isoCode.startsWith(selectedIsoCode)) : mappingRows
    if (selectedIsoCode) return [...base].sort((a, b) => compareIsoCodes(a.isoCode, b.isoCode, 'asc'))
    return sortByIsoLevel(base, sortKey, sortDir)
  }, [mappingRows, selectedIsoCode, sortKey, sortDir])

  const mappingTotalPages = Math.max(1, Math.ceil(filteredMappingRows.length / mappingPageSize))
  const pagedMappingRows = useMemo(() => {
    const from = (mappingPage - 1) * mappingPageSize
    return filteredMappingRows.slice(from, from + mappingPageSize)
  }, [filteredMappingRows, mappingPage, mappingPageSize])

  useEffect(() => {
    if (mappingPage > mappingTotalPages) setMappingPage(mappingTotalPages)
  }, [mappingPage, mappingTotalPages])

  useEffect(() => () => loadAbortControllerRef.current?.abort(), [])

  const categoriesLoading = isoLoading || isoLoading22 || isoMappingsLoading

  const loadAllRows = useCallback(
    async (skipWarning = false) => {
      if (!loggedInUser?.isAdmin) return
      loadAbortControllerRef.current?.abort()
      const abortController = new AbortController()
      loadAbortControllerRef.current = abortController
      setPageLoading(true)
      setLoadError(null)
      setPendingLargeLoad(false)
      setLoadProgress(null)
      try {
        const firstChunk = await fetchSeriesPage(0, SERIES_PAGE_SIZE, selectedIsoCode, abortController.signal)
        const totalPages = firstChunk.totalPages || 1
        const totalSeries = firstChunk.totalSize ?? 0
        setTotalSeriesCount(totalSeries)

        if (!skipWarning && !selectedIsoCode && totalSeries > SERIES_WARN_THRESHOLD) {
          setPendingLargeLoad(true)
          setPageLoading(false)
          return
        }

        const series = [...(firstChunk.content || [])]
        for (let p = 1; p < totalPages; p++) {
          const chunk = await fetchSeriesPage(p, SERIES_PAGE_SIZE, selectedIsoCode, abortController.signal)
          series.push(...(chunk.content || []))
        }
        const hasIsoOverview = series.every(
          (seriesItem) => typeof seriesItem.isoCategory === 'string' && Array.isArray(seriesItem.variants)
        )
        if (!hasIsoOverview) setLoadProgress({ loaded: 0, total: series.length })
        const details = hasIsoOverview
          ? series
          : await fetchSeriesDetailsConcurrent(
              series.map((seriesItem) => seriesItem.id),
              (loaded, total) => setLoadProgress({ loaded, total }),
              abortController.signal
            )
        abortController.signal.throwIfAborted()
        setRows(mapToExtractedRows(details, sortedIsoCategories, sortedIsoCategories22, mappingsByCode16))
        setVariantPage(1)
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setLoadError(error instanceof Error ? error.message : 'Klarte ikke å hente produkter og varianter')
        }
      } finally {
        if (loadAbortControllerRef.current === abortController) {
          loadAbortControllerRef.current = null
          setPageLoading(false)
          setLoadProgress(null)
        }
      }
    },
    [loggedInUser?.isAdmin, sortedIsoCategories, sortedIsoCategories22, mappingsByCode16, selectedIsoCode]
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
      resetPaging()
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
    resetPaging()
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

  const toggleExtraColumn = (col: ExtraColumn) => {
    setVisibleExtraColumns((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const resetFilters = () => {
    setIsoInput('')
    setIsoInputError(null)
    setSelectedLevel1('')
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
    resetPaging()
  }

  const cancelLoad = () => {
    loadAbortControllerRef.current?.abort()
    loadAbortControllerRef.current = null
    setPageLoading(false)
    setLoadProgress(null)
  }

  if (isoError) {
    return (
      <main className="show-menu">
        <Alert variant="error">Klarte ikke å hente v16-kategorier.</Alert>
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
      <VStack gap="space-12" maxWidth="100rem">
        <HStack gap="space-12" align="center">
          <img src="/ISO9999-01.png" alt="" aria-hidden width={48} height={48} />
          <Heading level="1" size="large">
            ISO Admin
          </Heading>
        </HStack>
        <InfoCard data-color="warning">
          <InfoCard.Header>
            <InfoCard.Title>Obs!</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Dette er fase 1 av ISO Admin. Den viser produkter og varianter med både v16- og v22-kategorisering. Uttrekk
            til fil, revisjonshistorikk og redigering av ISO-kategorier kommer i senere faser.
          </InfoCard.Content>
        </InfoCard>
        {isoError22 && <Alert variant="warning">Klarte ikke å hente v22-kategorier.</Alert>}
        {isoMappingsError && <Alert variant="warning">Klarte ikke å hente mapping-status mellom v16 og v22.</Alert>}

        <ExpansionCard defaultOpen size="small" aria-label="Filtre og visningsvalg">
          <ExpansionCard.Header>
            <ExpansionCard.Title size="small">Filtre og visningsvalg</ExpansionCard.Title>
          </ExpansionCard.Header>
          <ExpansionCard.Content>
            <VStack gap="space-12">
              <HStack gap="space-12" align="end" wrap>
                <ToggleGroup
                  label="Visningsmodus"
                  value={pageMode}
                  onChange={(val) => {
                    setPageMode(val as PageMode)
                    resetPaging()
                  }}
                  size="small"
                >
                  <ToggleGroup.Item value="mapping">Ren ISO-mapping</ToggleGroup.Item>
                  <ToggleGroup.Item value="extract">Produkt/variant</ToggleGroup.Item>
                </ToggleGroup>
                {pageMode === 'extract' && (
                  <ToggleGroup
                    label="Visning"
                    value={viewMode}
                    onChange={(val) => {
                      setViewMode(val as ViewMode)
                      resetPaging()
                    }}
                    size="small"
                  >
                    <ToggleGroup.Item value="product">Produkter</ToggleGroup.Item>
                    <ToggleGroup.Item value="variant">Varianter</ToggleGroup.Item>
                  </ToggleGroup>
                )}
                <ActionMenu>
                  <ActionMenu.Trigger>
                    <Button variant="secondary" size="small">
                      Andre valg
                    </Button>
                  </ActionMenu.Trigger>
                  <ActionMenu.Content>
                    <ActionMenu.Group label="v16-titler">
                      {OPTIONAL_COLUMNS_V1.map((col) => (
                        <ActionMenu.CheckboxItem
                          key={col}
                          checked={visibleOptionalsV1.has(col)}
                          onCheckedChange={() => toggleOptionalV1(col)}
                        >
                          {col}
                        </ActionMenu.CheckboxItem>
                      ))}
                    </ActionMenu.Group>
                    <ActionMenu.Group label="v22-titler">
                      {OPTIONAL_COLUMNS_V22.map((col) => (
                        <ActionMenu.CheckboxItem
                          key={col}
                          checked={visibleOptionalsV22.has(col)}
                          onCheckedChange={() => toggleOptionalV22(col)}
                        >
                          {col}
                        </ActionMenu.CheckboxItem>
                      ))}
                    </ActionMenu.Group>
                    {pageMode === 'extract' && (
                      <>
                        <ActionMenu.Group label="Mapping">
                          <ActionMenu.CheckboxItem
                            checked={showMappingTypes}
                            onCheckedChange={() => setShowMappingTypes((current) => !current)}
                          >
                            Endringstype og verifisering
                          </ActionMenu.CheckboxItem>
                        </ActionMenu.Group>
                        <ActionMenu.Group label="Flere kolonner">
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('produkt')}
                            onCheckedChange={() => toggleExtraColumn('produkt')}
                          >
                            Produktnavn
                          </ActionMenu.CheckboxItem>
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('variant')}
                            onCheckedChange={() => toggleExtraColumn('variant')}
                          >
                            Variantnavn
                          </ActionMenu.CheckboxItem>
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('avtale')}
                            onCheckedChange={() => toggleExtraColumn('avtale')}
                          >
                            Avtaleinfo
                          </ActionMenu.CheckboxItem>
                        </ActionMenu.Group>
                      </>
                    )}
                  </ActionMenu.Content>
                </ActionMenu>
                <Box marginInline="space-12 space-0">
                  <TextField
                    label="ISO-kode (v16)"
                    description="2 til 8 siffer"
                    placeholder="18090301"
                    size="small"
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
                    style={{ width: '16.5rem' }}
                  />
                </Box>
                {selectedIsoCode && <BodyShort size="small">Valgt v16-kode: {selectedIsoCode}</BodyShort>}
              </HStack>

              <HStack gap="space-8" align="end" wrap>
                <Select
                  label="v16 nivå 1"
                  size="small"
                  value={selectedLevel1}
                  onChange={(e) => {
                    setSelectedLevel1(e.target.value)
                    setSelectedLevel2('')
                    setSelectedLevel3('')
                    setSelectedLevel4('')
                    resetPaging()
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
                  label="v16 nivå 2"
                  size="small"
                  value={selectedLevel2}
                  disabled={!selectedLevel1}
                  onChange={(e) => {
                    setSelectedLevel2(e.target.value)
                    setSelectedLevel3('')
                    setSelectedLevel4('')
                    resetPaging()
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
                  label="v16 nivå 3"
                  size="small"
                  value={selectedLevel3}
                  disabled={!selectedLevel2}
                  onChange={(e) => {
                    setSelectedLevel3(e.target.value)
                    setSelectedLevel4('')
                    resetPaging()
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
                  label="v16 nivå 4"
                  size="small"
                  value={selectedLevel4}
                  disabled={!selectedLevel3}
                  onChange={(e) => {
                    setSelectedLevel4(e.target.value)
                    resetPaging()
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

                <Button variant="secondary" size="small" onClick={resetFilters}>
                  Nullstill
                </Button>
                {pageMode === 'extract' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => loadAllRows(false)}
                      disabled={!sortedIsoCategories.length || pageLoading || categoriesLoading}
                    >
                      Hent liste
                    </Button>
                    {pageLoading && (
                      <Button size="small" variant="secondary" onClick={cancelLoad}>
                        Avbryt
                      </Button>
                    )}
                  </>
                )}
              </HStack>
            </VStack>
          </ExpansionCard.Content>
        </ExpansionCard>

        {pageMode === 'mapping' && (
          <>
            {categoriesLoading && (
              <HStack gap="space-8" align="center" role="status">
                <Loader size="small" title="Henter data" />
                <BodyShort>Henter ISO-kategorier...</BodyShort>
              </HStack>
            )}

            {!categoriesLoading && (
              <>
                <HStack justify="space-between" align="end" style={{ flexWrap: 'wrap' }} gap="space-16">
                  <BodyShort role="status" aria-live="polite">
                    {filteredMappingRows.length} mapping-rader{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}
                  </BodyShort>
                </HStack>

                <Box style={{ overflowX: 'auto' }}>
                  {pagedMappingRows.length === 0 ? (
                    <Alert variant="info">Ingen treff for valgt ISO-filter.</Alert>
                  ) : (
                    <Table size="small">
                      <caption className="aksel-sr-only">
                        v16 til v22 ISO-mapping{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert
                        kolonnevis. Side {mappingPage} av {mappingTotalPages}.
                      </caption>
                      <Table.Header>
                        <Table.Row>
                          <IsoLevelHeaders sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                          <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                          <Iso22LevelHeaders />
                          <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                          <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {pagedMappingRows.map((row) => (
                          <Table.Row key={row.key}>
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
                            <Table.DataCell>
                              <MappingTypes types={row.mappingTypes} />
                            </Table.DataCell>
                            <Table.DataCell>
                              <MappingVerification verified={row.mappingVerified} />
                            </Table.DataCell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  )}
                </Box>

                <HStack gap="space-16" align="end">
                  <Select
                    label="Rader per side"
                    size="small"
                    value={mappingPageSize}
                    onChange={(e) => {
                      setMappingPageSize(Number(e.target.value))
                      setMappingPage(1)
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </Select>
                  <Pagination page={mappingPage} count={mappingTotalPages} onPageChange={setMappingPage} size="small" />
                </HStack>
              </>
            )}
          </>
        )}

        {pageMode === 'extract' && (
          <>
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

            {pageLoading && (
              <HStack gap="space-8" align="center" role="status">
                <Loader size="small" title="Henter data" />
                <BodyShort>
                  {loadProgress && loadProgress.total > 0
                    ? `Henter ${loadProgress.loaded} av ${loadProgress.total} produkter...`
                    : 'Henter data...'}
                </BodyShort>
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
                          {showMappingTypes && (
                            <>
                              <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                              <Table.HeaderCell scope="col">Verifisering</Table.HeaderCell>
                            </>
                          )}
                          {visibleExtraColumns.has('produkt') && (
                            <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                          )}
                          <SortHeader
                            label="Ant. varianter"
                            active={sortKey === 'variantCount'}
                            dir={sortDir}
                            onClick={() => toggleSort('variantCount')}
                          />
                          {visibleExtraColumns.has('avtale') && (
                            <>
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
                            </>
                          )}
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
                            {showMappingTypes && (
                              <>
                                <Table.DataCell>
                                  <MappingTypes types={row.mappingTypes} />
                                </Table.DataCell>
                                <Table.DataCell>
                                  <MappingVerification verified={row.mappingVerified} />
                                </Table.DataCell>
                              </>
                            )}
                            {visibleExtraColumns.has('produkt') && <Table.DataCell>{row.productTitle}</Table.DataCell>}
                            <Table.DataCell>{row.variantCount}</Table.DataCell>
                            {visibleExtraColumns.has('avtale') && (
                              <>
                                <Table.DataCell>{row.agreementRef}</Table.DataCell>
                                <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                                <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                              </>
                            )}
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
                          {showMappingTypes && (
                            <>
                              <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                              <Table.HeaderCell scope="col">Verifisering</Table.HeaderCell>
                            </>
                          )}
                          {visibleExtraColumns.has('produkt') && (
                            <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                          )}
                          {visibleExtraColumns.has('variant') && (
                            <Table.HeaderCell scope="col">Variantnavn</Table.HeaderCell>
                          )}
                          <Table.HeaderCell scope="col">HMS-nr.</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Leverandørref.</Table.HeaderCell>
                          {visibleExtraColumns.has('avtale') && (
                            <>
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
                            </>
                          )}
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
                            {showMappingTypes && (
                              <>
                                <Table.DataCell>
                                  <MappingTypes types={row.mappingTypes} />
                                </Table.DataCell>
                                <Table.DataCell>
                                  <MappingVerification verified={row.mappingVerified} />
                                </Table.DataCell>
                              </>
                            )}
                            {visibleExtraColumns.has('produkt') && <Table.DataCell>{row.productTitle}</Table.DataCell>}
                            {visibleExtraColumns.has('variant') && <Table.DataCell>{row.variantName}</Table.DataCell>}
                            <Table.DataCell>{row.hmsArtNr}</Table.DataCell>
                            <Table.DataCell>{row.supplierRef}</Table.DataCell>
                            {visibleExtraColumns.has('avtale') && (
                              <>
                                <Table.DataCell>{row.agreementRef}</Table.DataCell>
                                <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                                <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                              </>
                            )}
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
          </>
        )}
      </VStack>
    </main>
  )
}

export default IsoOversikt
