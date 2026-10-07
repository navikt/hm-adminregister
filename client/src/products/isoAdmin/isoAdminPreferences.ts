import {
  ExtraColumn,
  ISO_MAP_LABELS,
  IsoMapEnum,
  OPTIONAL_COLUMNS_V1,
  OPTIONAL_COLUMNS_V22,
  OPTIONAL_ISO_LEVELS,
  OptionalColumnV1,
  OptionalColumnV22,
  OptionalIsoLevel,
  SortDir,
  SortKey,
} from './isoOversiktTypes'

const STORAGE_KEY_PREFIX = 'isoAdmin.prefs.v2'
const SORT_KEYS: readonly SortKey[] = [
  'iso1',
  'iso2',
  'iso3',
  'iso4',
  'agreementRank',
  'agreementPostNr',
  'variantCount',
]
const SORT_DIRS: readonly SortDir[] = ['asc', 'desc']
const EXTRA_COLUMNS: readonly ExtraColumn[] = ['produkt', 'variant', 'avtale']
const MAPPING_TYPES = Object.keys(ISO_MAP_LABELS) as IsoMapEnum[]
const PAGE_SIZES = [10, 25, 100] as const

export type IsoAdminPreferences = {
  sortKey: SortKey
  sortDir: SortDir
  manualSort: boolean
  mappingPageSize: number
  variantPageSize: number
  visibleOptionalsV1: OptionalColumnV1[]
  visibleOptionalsV22: OptionalColumnV22[]
  visibleIsoLevelsV1: OptionalIsoLevel[]
  mappingVisibleIsoLevelsV1: OptionalIsoLevel[]
  visibleIsoLevelsV22: OptionalIsoLevel[]
  visibleExtraColumns: ExtraColumn[]
  showMappingTypes: boolean
  showCounts: boolean
  showVerifiedIsoCodes: boolean
  selectedMappingTypes: IsoMapEnum[]
  filtersOpen: boolean
  showHierarchy: boolean
  showVerificationStatus: boolean
}

export const DEFAULT_ISO_ADMIN_PREFERENCES: IsoAdminPreferences = {
  sortKey: 'iso4',
  sortDir: 'asc',
  manualSort: false,
  mappingPageSize: 25,
  variantPageSize: 25,
  visibleOptionalsV1: [],
  visibleOptionalsV22: [],
  visibleIsoLevelsV1: [...OPTIONAL_ISO_LEVELS],
  mappingVisibleIsoLevelsV1: [],
  visibleIsoLevelsV22: [...OPTIONAL_ISO_LEVELS],
  visibleExtraColumns: [],
  showMappingTypes: false,
  showCounts: false,
  showVerifiedIsoCodes: true,
  selectedMappingTypes: [],
  filtersOpen: true,
  showHierarchy: false,
  showVerificationStatus: false,
}

const storageKey = (userId: string | undefined): string => `${STORAGE_KEY_PREFIX}.${userId || 'anon'}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const pickBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const pickOneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

const pickSubset = <T>(value: unknown, allowed: readonly T[], fallback: readonly T[]): T[] =>
  Array.isArray(value) ? [...new Set(value.filter((item): item is T => allowed.includes(item as T)))] : [...fallback]

export const parseIsoAdminPreferences = (raw: unknown): IsoAdminPreferences => {
  const p = isRecord(raw) ? raw : {}
  const d = DEFAULT_ISO_ADMIN_PREFERENCES
  return {
    sortKey: pickOneOf(p.sortKey, SORT_KEYS, d.sortKey),
    sortDir: pickOneOf(p.sortDir, SORT_DIRS, d.sortDir),
    manualSort: pickBoolean(p.manualSort, d.manualSort),
    mappingPageSize: pickOneOf<number>(p.mappingPageSize, PAGE_SIZES, d.mappingPageSize),
    variantPageSize: pickOneOf<number>(p.variantPageSize, PAGE_SIZES, d.variantPageSize),
    visibleOptionalsV1: pickSubset(p.visibleOptionalsV1, OPTIONAL_COLUMNS_V1, d.visibleOptionalsV1),
    visibleOptionalsV22: pickSubset(p.visibleOptionalsV22, OPTIONAL_COLUMNS_V22, d.visibleOptionalsV22),
    visibleIsoLevelsV1: pickSubset(p.visibleIsoLevelsV1, OPTIONAL_ISO_LEVELS, d.visibleIsoLevelsV1),
    mappingVisibleIsoLevelsV1: pickSubset(
      p.mappingVisibleIsoLevelsV1,
      OPTIONAL_ISO_LEVELS,
      d.mappingVisibleIsoLevelsV1
    ),
    visibleIsoLevelsV22: pickSubset(p.visibleIsoLevelsV22, OPTIONAL_ISO_LEVELS, d.visibleIsoLevelsV22),
    visibleExtraColumns: pickSubset(p.visibleExtraColumns, EXTRA_COLUMNS, d.visibleExtraColumns),
    showMappingTypes: pickBoolean(p.showMappingTypes, d.showMappingTypes),
    showCounts: pickBoolean(p.showCounts, d.showCounts),
    showVerifiedIsoCodes: pickBoolean(p.showVerifiedIsoCodes, d.showVerifiedIsoCodes),
    selectedMappingTypes: pickSubset(p.selectedMappingTypes, MAPPING_TYPES, d.selectedMappingTypes),
    filtersOpen: pickBoolean(p.filtersOpen, d.filtersOpen),
    showHierarchy: pickBoolean(p.showHierarchy, d.showHierarchy),
    showVerificationStatus: pickBoolean(p.showVerificationStatus, d.showVerificationStatus),
  }
}

export const loadIsoAdminPreferences = (userId?: string): IsoAdminPreferences => {
  try {
    const stored = window.localStorage.getItem(storageKey(userId))
    if (stored === null) return parseIsoAdminPreferences(undefined)
    const raw: unknown = JSON.parse(stored)
    if (!isRecord(raw)) {
      console.warn('Invalid ISO admin preferences; using defaults.')
    }
    return parseIsoAdminPreferences(raw)
  } catch {
    console.warn('Unable to load ISO admin preferences; using defaults.')
    return parseIsoAdminPreferences(undefined)
  }
}

export const saveIsoAdminPreferences = (userId: string | undefined, preferences: IsoAdminPreferences): void => {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(parseIsoAdminPreferences(preferences)))
  } catch {
    console.warn('Unable to save ISO admin preferences.')
  }
}
