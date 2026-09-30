import { beforeEach, describe, expect, test } from 'vitest'

import {
  ALL_MAPPING_TYPES,
  DEFAULT_ISO_ADMIN_PREFERENCES,
  loadIsoAdminPreferences,
  parseIsoAdminPreferences,
  saveIsoAdminPreferences,
} from './isoAdminPreferences'

beforeEach(() => {
  window.localStorage.clear()
})

describe('isoAdminPreferences', () => {
  test('gir standardverdier når ingenting er lagret', () => {
    expect(loadIsoAdminPreferences('admin')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  test('lagrer og leser inn valg per bruker', () => {
    const prefs = {
      ...DEFAULT_ISO_ADMIN_PREFERENCES,
      showVerifiedIsoCodes: false,
      selectedMappingTypes: ['C Endret kode, samme overskrift'],
      sortDir: 'desc' as const,
      mappingPageSize: 100,
      visibleExtraColumns: ['avtale' as const],
      visibleIsoLevelsV1: [3 as const],
    }
    saveIsoAdminPreferences('admin', prefs)

    expect(loadIsoAdminPreferences('admin')).toEqual(prefs)
    expect(loadIsoAdminPreferences('annen')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  test('bruker egen nøkkel når bruker-id mangler', () => {
    saveIsoAdminPreferences(undefined, { ...DEFAULT_ISO_ADMIN_PREFERENCES, filtersOpen: false })
    expect(window.localStorage.getItem('isoAdmin.prefs.v1.anon')).not.toBeNull()
    expect(loadIsoAdminPreferences(undefined).filtersOpen).toBe(false)
  })

  test('ødelagt JSON gir standardverdier', () => {
    window.localStorage.setItem('isoAdmin.prefs.v1.admin', '{ikke json')
    expect(loadIsoAdminPreferences('admin')).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })

  test('ugyldige og ukjente verdier byttes ut med standardverdier', () => {
    const parsed = parseIsoAdminPreferences({
      showVerifiedIsoCodes: 'nei',
      selectedMappingTypes: [42, ''],
      sortKey: 'finnes-ikke',
      sortDir: 'opp',
      mappingPageSize: 9999,
      variantPageSize: '25',
      visibleOptionalsV1: ['ukjent kolonne', 'v16 søkeord'],
      visibleIsoLevelsV22: [1, 7, 1],
      visibleExtraColumns: 'avtale',
      showMappingTypes: true,
    })

    expect(parsed).toEqual({
      ...DEFAULT_ISO_ADMIN_PREFERENCES,
      visibleOptionalsV1: ['v16 søkeord'],
      visibleIsoLevelsV22: [1],
      showMappingTypes: true,
    })
  })

  test('«Alle endringstyper» sammen med andre typer gir bare «Alle»', () => {
    expect(
      parseIsoAdminPreferences({ selectedMappingTypes: [ALL_MAPPING_TYPES, 'X Slettet'] }).selectedMappingTypes
    ).toEqual([ALL_MAPPING_TYPES])
  })

  test('ikke-objekt gir standardverdier', () => {
    expect(parseIsoAdminPreferences(null)).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
    expect(parseIsoAdminPreferences([1, 2])).toEqual(DEFAULT_ISO_ADMIN_PREFERENCES)
  })
})
