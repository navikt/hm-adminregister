import {
  IsoCategory22DTO,
  IsoCategoryDTO,
  IsoMapDTO,
  SeriesSearchChunk,
  SeriesSearchDTO,
} from 'utils/types/response-types'

export type SortDir = 'asc' | 'desc'
export type SortKey = 'iso1' | 'iso2' | 'iso3' | 'iso4' | 'agreementRank' | 'agreementPostNr' | 'variantCount'
export type ViewMode = 'product' | 'variant'
export type PageMode = 'mapping' | 'extract'
export type ExtraColumn = 'produkt' | 'variant' | 'avtale'
export type IsoMapEnum = IsoMapDTO['mapEnum'][number]
export type OptionalIsoLevel = 1 | 2 | 3

export type IsoOverviewVariant = {
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

export type IsoOverviewSeries = SeriesSearchDTO & {
  isoCategory?: string
  isoCategory22?: string | null
  variants?: IsoOverviewVariant[]
}

export type IsoOverviewSeriesChunk = Omit<SeriesSearchChunk, 'content'> & {
  content: IsoOverviewSeries[]
}

export const ISO_MAP_LABELS: Record<IsoMapEnum, string> = {
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

export type ExtractedProductVariant = {
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
  // ISO 2016 forklaring (isoText) og søkeord - kun nivå 4 (leaf), som er nivået knyttet til produktet/varianten
  iso4Text: string
  iso4SearchWords: string
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
  // ISO 2022 forklaring (isoText) og søkeord - kun nivå 4
  iso22Lvl4Text: string
  iso22Lvl4SearchWords: string
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
  mappingAvailable: boolean
  mappingIds: string[]
  // Ekte tilknytningsstatus (i motsetning til iso22Lvl3/4, som faller tilbake til anbefalt v22-kode
  // når ingen reell tilknytning finnes) - true kun når produktet faktisk har en lagret isoCategory22
  // som stemmer med mappingtabellens anbefalte v22-kode(r). Brukes til å sperre verifisering.
  iso22Attached: boolean
  // Rå lagret v22-kode (kan være tom, eller en kode som IKKE stemmer med mappingens anbefaling) -
  // i motsetning til iso22Lvl3/4, som alltid har en verdi når mappingen har en anbefaling (selv om
  // produktet ikke er koblet ennå). Brukes til å skille "koblet til feil kode" fra "ikke koblet".
  iso22Stored: string
  // Agreement
  agreementRef: string
  agreementRank: string
  agreementPostNr: string
  agreementRankSort: number | null
  agreementPostNrSort: number | null
}

export type IsoPath = {
  level1?: IsoCategoryDTO
  level2?: IsoCategoryDTO
  level3?: IsoCategoryDTO
  level4?: IsoCategoryDTO
}

export type Iso22Path = {
  level1?: IsoCategory22DTO
  level2?: IsoCategory22DTO
  level3?: IsoCategory22DTO
  level4?: IsoCategory22DTO
}

export type ProductSummaryRow = {
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
  iso4Text: string
  iso4SearchWords: string
  iso22Lvl1: string
  iso22Lvl2: string
  iso22Lvl3: string
  iso22Lvl4: string
  iso22Lvl1Title: string
  iso22Lvl2Title: string
  iso22Lvl3Title: string
  iso22Lvl4Title: string
  iso22Lvl4Text: string
  iso22Lvl4SearchWords: string
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
  mappingAvailable: boolean
  mappingIds: string[]
  iso22Attached: boolean
  variantCount: number
  agreementRef: string
  agreementRank: string
  agreementPostNr: string
  agreementRankSort: number | null
  agreementPostNrSort: number | null
}

export type MappingRow = {
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
  iso4Text: string
  iso4SearchWords: string
  iso22Lvl1: string
  iso22Lvl2: string
  iso22Lvl3: string
  iso22Lvl4: string
  iso22Lvl1Title: string
  iso22Lvl2Title: string
  iso22Lvl3Title: string
  iso22Lvl4Title: string
  iso22Lvl4Text: string
  iso22Lvl4SearchWords: string
  mappingTypes: IsoMapEnum[]
  mappingVerified: boolean | null
  mappingAvailable: boolean
  mappingIds: string[]
}

export const OPTIONAL_TITLE_COLUMNS_V1 = [
  'v16 nivå 1 tittel',
  'v16 nivå 2 tittel',
  'v16 nivå 3 tittel',
  'v16 nivå 4 tittel',
] as const
export const OPTIONAL_TEXT_COLUMNS_V1 = ['v16 forklaring', 'v16 søkeord'] as const
export const OPTIONAL_COLUMNS_V1 = [...OPTIONAL_TITLE_COLUMNS_V1, ...OPTIONAL_TEXT_COLUMNS_V1] as const
export type OptionalColumnV1 = (typeof OPTIONAL_COLUMNS_V1)[number]

export const OPTIONAL_TITLE_COLUMNS_V22 = [
  'v22 nivå 1 tittel',
  'v22 nivå 2 tittel',
  'v22 nivå 3 tittel',
  'v22 nivå 4 tittel',
] as const
export const OPTIONAL_TEXT_COLUMNS_V22 = ['v22 forklaring', 'v22 søkeord'] as const
export const OPTIONAL_COLUMNS_V22 = [...OPTIONAL_TITLE_COLUMNS_V22, ...OPTIONAL_TEXT_COLUMNS_V22] as const
export type OptionalColumnV22 = (typeof OPTIONAL_COLUMNS_V22)[number]

export const OPTIONAL_ISO_LEVELS = [1, 2, 3] as const
