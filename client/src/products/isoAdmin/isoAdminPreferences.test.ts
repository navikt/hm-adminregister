import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_ISO_ADMIN_PREFERENCES,
  IsoAdminPreferences,
  loadIsoAdminPreferences,
  parseIsoAdminPreferences,
  saveIsoAdminPreferences,
} from './isoAdminPreferences'
import { ISO_MAP_LABELS, IsoMapEnum, OPTIONAL_COLUMNS_V1, OPTIONAL_COLUMNS_V22 } from './isoOversiktTypes'

const key = 'isoAdmin.prefs.v2.opaque-user'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseIsoAdminPreferences', () => {
  it('uses the requested defaults for missing fields', () => {
    expect(parseIsoAdminPreferences({})).toEqual({
      sortKey: 'iso4',
      sortDir: 'asc',
      manualSort: false,
      mappingPageSize: 25,
      variantPageSize: 25,
      visibleOptionalsV1: [],
      visibleOptionalsV22: [],
      visibleIsoLevelsV1: [1, 2, 3],
      mappingVisibleIsoLevelsV1: [],
      visibleIsoLevelsV22: [1, 2, 3],
      visibleExtraColumns: [],
      showMappingTypes: false,
      showCounts: false,
      showVerifiedIsoCodes: true,
      selectedMappingTypes: [],
      filtersOpen: true,
      showHierarchy: false,
      showVerificationStatus: false,
    })
  })

  it.each([undefined, null, [], 'invalid', 123, true])('defaults invalid root input %j', (raw) => {
    expect(parseIsoAdminPreferences(raw)).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  it('returns independent default arrays', () => {
    const preferences = parseIsoAdminPreferences(undefined)
    preferences.visibleIsoLevelsV1.pop()
    preferences.selectedMappingTypes.push('SAME')
    expect(parseIsoAdminPreferences(undefined)).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
    expect(DEFAULT_ISO_ADMIN_PREFERENCES.visibleIsoLevelsV1).toEqual([1, 2, 3])
    expect(DEFAULT_ISO_ADMIN_PREFERENCES.selectedMappingTypes).toEqual([])
  })

  it('defaults outdated enums, invalid scalars and non-array values independently', () => {
    expect(
      parseIsoAdminPreferences({
        sortKey: 'removed',
        sortDir: 'up',
        manualSort: 'true',
        mappingPageSize: 50,
        variantPageSize: '25',
        visibleOptionalsV1: {},
        visibleOptionalsV22: null,
        visibleIsoLevelsV1: '1,2,3',
        mappingVisibleIsoLevelsV1: true,
        visibleIsoLevelsV22: 4,
        visibleExtraColumns: 'produkt',
        showMappingTypes: 1,
        showCounts: null,
        showVerifiedIsoCodes: 'false',
        selectedMappingTypes: 'SAME',
        filtersOpen: 0,
        showHierarchy: [],
        showVerificationStatus: {},
      })
    ).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  it('filters unknown array entries and removes duplicates without translating mapping labels', () => {
    const preferences = parseIsoAdminPreferences({
      visibleOptionalsV1: [OPTIONAL_COLUMNS_V1[0], OPTIONAL_COLUMNS_V1[0], 'removed', 1],
      visibleOptionalsV22: [OPTIONAL_COLUMNS_V22[1], 'removed', null],
      visibleIsoLevelsV1: [1, 1, 2, 4, '3'],
      mappingVisibleIsoLevelsV1: [3, 3, 4],
      visibleIsoLevelsV22: [2, false, 4],
      visibleExtraColumns: ['produkt', 'produkt', 'obsolete'],
      selectedMappingTypes: ['SAME', 'SAME', 'removed', ISO_MAP_LABELS.SAME, 'Alle endringstyper', {}],
    })
    expect(preferences.visibleOptionalsV1).toEqual([OPTIONAL_COLUMNS_V1[0]])
    expect(preferences.visibleOptionalsV22).toEqual([OPTIONAL_COLUMNS_V22[1]])
    expect(preferences.visibleIsoLevelsV1).toEqual([1, 2])
    expect(preferences.mappingVisibleIsoLevelsV1).toEqual([3])
    expect(preferences.visibleIsoLevelsV22).toEqual([2])
    expect(preferences.visibleExtraColumns).toEqual(['produkt'])
    expect(preferences.selectedMappingTypes).toEqual(['SAME'])
    expect(parseIsoAdminPreferences({ selectedMappingTypes: ['removed'] }).selectedMappingTypes).toEqual([])
  })

  it('accepts every current mapping enum key', () => {
    const selectedMappingTypes = Object.keys(ISO_MAP_LABELS) as IsoMapEnum[]
    expect(parseIsoAdminPreferences({ selectedMappingTypes }).selectedMappingTypes).toEqual(selectedMappingTypes)
  })

  it.each([10, 25, 100])('accepts supported page size %i for both tables', (size) => {
    const preferences = parseIsoAdminPreferences({ mappingPageSize: size, variantPageSize: size })
    expect(preferences.mappingPageSize).toBe(size)
    expect(preferences.variantPageSize).toBe(size)
  })

  it('preserves intentionally empty arrays', () => {
    const preferences = parseIsoAdminPreferences({ visibleIsoLevelsV1: [], visibleIsoLevelsV22: [] })
    expect(preferences.visibleIsoLevelsV1).toEqual([])
    expect(preferences.visibleIsoLevelsV22).toEqual([])
  })
})

describe('preference storage', () => {
  it('roundtrips all non-default preferences under the per-user v2 key', () => {
    const preferences: IsoAdminPreferences = {
      sortKey: 'agreementRank',
      sortDir: 'desc',
      manualSort: true,
      mappingPageSize: 100,
      variantPageSize: 10,
      visibleOptionalsV1: [...OPTIONAL_COLUMNS_V1],
      visibleOptionalsV22: [...OPTIONAL_COLUMNS_V22],
      visibleIsoLevelsV1: [1],
      mappingVisibleIsoLevelsV1: [2],
      visibleIsoLevelsV22: [3],
      visibleExtraColumns: ['produkt', 'variant', 'avtale'],
      showMappingTypes: true,
      showCounts: true,
      showVerifiedIsoCodes: false,
      selectedMappingTypes: ['SAME', 'UNKNOWN'],
      filtersOpen: false,
      showHierarchy: true,
      showVerificationStatus: true,
    }
    saveIsoAdminPreferences('opaque-user', preferences)
    expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(preferences)
    expect(loadIsoAdminPreferences('opaque-user')).toEqual(preferences)
    expect(loadIsoAdminPreferences('another-user')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  it('uses the anonymous key when no user identifier is provided', () => {
    saveIsoAdminPreferences(undefined, parseIsoAdminPreferences({ sortDir: 'desc' }))
    expect(window.localStorage.getItem('isoAdmin.prefs.v2.anon')).not.toBeNull()
    expect(loadIsoAdminPreferences().sortDir).toBe('desc')
  })

  it('ignores legacy version storage and defaults missing storage without warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem('isoAdmin.prefs.v1.opaque-user', JSON.stringify({ sortKey: 'iso1' }))
    expect(loadIsoAdminPreferences('opaque-user')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
    expect(warn).not.toHaveBeenCalled()
  })

  it.each(['{malformed', '', 'null', '[]', '"invalid"'])(
    'warns without exposing stored contents for malformed storage %j',
    (stored) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      window.localStorage.setItem(key, stored)
      expect(loadIsoAdminPreferences('opaque-user')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0]).toHaveLength(1)
      expect(warn.mock.calls[0][0]).not.toContain('opaque-user')
      expect(warn.mock.calls[0][0]).not.toContain('malformed')
    }
  )

  it('sanitizes saved input and never persists unrelated or sensitive fields', () => {
    saveIsoAdminPreferences('opaque-user', {
      ...DEFAULT_ISO_ADMIN_PREFERENCES,
      selectedIsoCode: '18090301',
      editMode: true,
      productData: { id: 'product-id' },
      personalData: 'private-value',
      selectedMappingTypes: ['SAME', 'outdated'],
    } as unknown as IsoAdminPreferences)
    const stored = JSON.parse(window.localStorage.getItem(key)!)
    expect(stored).toEqual({ ...DEFAULT_ISO_ADMIN_PREFERENCES, selectedMappingTypes: ['SAME'] })
    expect(Object.keys(stored)).toEqual(Object.keys(DEFAULT_ISO_ADMIN_PREFERENCES))
  })

  it('handles blocked localStorage access with a sanitized warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('private-value opaque-user')
    })
    expect(loadIsoAdminPreferences('opaque-user')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
    expect(() => saveIsoAdminPreferences('opaque-user', DEFAULT_ISO_ADMIN_PREFERENCES)).not.toThrow()
    expect(warn.mock.calls).toEqual([
      ['Unable to load ISO admin preferences; using defaults.'],
      ['Unable to save ISO admin preferences.'],
    ])
  })

  it.each(['getItem', 'setItem'] as const)('handles %s storage failures without throwing', (method) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new Error('private-value opaque-user')
    })
    if (method === 'getItem') {
      expect(loadIsoAdminPreferences('opaque-user')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
    } else {
      expect(() => saveIsoAdminPreferences('opaque-user', DEFAULT_ISO_ADMIN_PREFERENCES)).not.toThrow()
    }
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0].join(' ')).not.toMatch(/private-value|opaque-user/)
  })
})
