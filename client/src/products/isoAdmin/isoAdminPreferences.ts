import {
  ExtraColumn,
  OPTIONAL_COLUMNS_V1,
  OPTIONAL_COLUMNS_V22,
  OPTIONAL_ISO_LEVELS,
  OptionalColumnV1,
  OptionalColumnV22,
  OptionalIsoLevel,
  SortDir,
  SortKey,
} from './isoOversiktTypes'

export const ALL_MAPPING_TYPES = 'Alle endringstyper'

const STORAGE_KEY_PREFIX = 'isoAdmin.prefs.v1'
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
export const PAGE_SIZES = [10, 25, 100] as const

export type IsoAdminPreferences = {
  showVerifiedIsoCodes: boolean
  selectedMappingTypes: string[]
  sortKey: SortKey
  sortDir: SortDir
  mappingPageSize: number
  variantPageSize: number
  visibleOptionalsV1: OptionalColumnV1[]
  visibleOptionalsV22: OptionalColumnV22[]
  visibleIsoLevelsV1: OptionalIsoLevel[]
  visibleIsoLevelsV22: OptionalIsoLevel[]
  visibleExtraColumns: ExtraColumn[]
  showMappingTypes: boolean
  filtersOpen: boolean
}

export const DEFAULT_ISO_ADMIN_PREFERENCES: IsoAdminPreferences = {
  showVerifiedIsoCodes: true,
  selectedMappingTypes: [ALL_MAPPING_TYPES],
  sortKey: 'iso1',
  sortDir: 'asc',
  mappingPageSize: 25,
  variantPageSize: 25,
  visibleOptionalsV1: [],
  visibleOptionalsV22: [],
  visibleIsoLevelsV1: [...OPTIONAL_ISO_LEVELS],
  visibleIsoLevelsV22: [...OPTIONAL_ISO_LEVELS],
  visibleExtraColumns: [],
  showMappingTypes: false,
  filtersOpen: true,
}

const storageKey = (userId: string | undefined) => `${STORAGE_KEY_PREFIX}.${userId || 'anon'}`

const pickBoolean = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback)

const pickOneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

const pickSubset = <T>(value: unknown, allowed: readonly T[], fallback: T[]): T[] =>
  Array.isArray(value) ? [...new Set(value.filter((item): item is T => allowed.includes(item as T)))] : fallback

const pickMappingTypes = (value: unknown): string[] => {
  if (!Array.isArray(value)) return DEFAULT_ISO_ADMIN_PREFERENCES.selectedMappingTypes
  const types = [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
  if (types.length === 0 || types.includes(ALL_MAPPING_TYPES)) return [ALL_MAPPING_TYPES]
  return types
}

// Lagrede verdier kan være manipulert eller fra en eldre versjon, så hvert felt valideres for seg.
export const parseIsoAdminPreferences = (raw: unknown): IsoAdminPreferences => {
  const d = DEFAULT_ISO_ADMIN_PREFERENCES
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d
  const p = raw as Record<string, unknown>
  return {
    showVerifiedIsoCodes: pickBoolean(p.showVerifiedIsoCodes, d.showVerifiedIsoCodes),
    selectedMappingTypes: pickMappingTypes(p.selectedMappingTypes),
    sortKey: pickOneOf(p.sortKey, SORT_KEYS, d.sortKey),
    sortDir: pickOneOf(p.sortDir, SORT_DIRS, d.sortDir),
    mappingPageSize: pickOneOf<number>(p.mappingPageSize, PAGE_SIZES, d.mappingPageSize),
    variantPageSize: pickOneOf<number>(p.variantPageSize, PAGE_SIZES, d.variantPageSize),
    visibleOptionalsV1: pickSubset(p.visibleOptionalsV1, OPTIONAL_COLUMNS_V1, d.visibleOptionalsV1),
    visibleOptionalsV22: pickSubset(p.visibleOptionalsV22, OPTIONAL_COLUMNS_V22, d.visibleOptionalsV22),
    visibleIsoLevelsV1: pickSubset(p.visibleIsoLevelsV1, OPTIONAL_ISO_LEVELS, d.visibleIsoLevelsV1),
    visibleIsoLevelsV22: pickSubset(p.visibleIsoLevelsV22, OPTIONAL_ISO_LEVELS, d.visibleIsoLevelsV22),
    visibleExtraColumns: pickSubset(p.visibleExtraColumns, EXTRA_COLUMNS, d.visibleExtraColumns),
    showMappingTypes: pickBoolean(p.showMappingTypes, d.showMappingTypes),
    filtersOpen: pickBoolean(p.filtersOpen, d.filtersOpen),
  }
}

export const loadIsoAdminPreferences = (userId: string | undefined): IsoAdminPreferences => {
  try {
    const stored = window.localStorage.getItem(storageKey(userId))
    return stored ? parseIsoAdminPreferences(JSON.parse(stored)) : DEFAULT_ISO_ADMIN_PREFERENCES
  } catch {
    return DEFAULT_ISO_ADMIN_PREFERENCES
  }
}

export const saveIsoAdminPreferences = (userId: string | undefined, preferences: IsoAdminPreferences) => {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(preferences))
  } catch {
    // Lagring er bare en bekvemmelighet – full kvote eller blokkert lagring skal ikke stoppe siden.
  }
}
