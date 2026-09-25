import { isUUID } from 'utils/string-util'
import { IsoCategory22DTO, IsoCategoryDTO, IsoMapDTO, SeriesDTO } from 'utils/types/response-types'

import { ExtractedProductVariant, Iso22Path, IsoOverviewSeries, MappingRow } from './isoOversiktTypes'
import { buildIso22Path, buildIsoPath } from './isoPathUtils'

export const findMappingsForCode = (isoCode: string, mappingsByCode16: Map<string, IsoMapDTO[]>): IsoMapDTO[] => {
  let codePrefix = isoCode.replace(/\s/g, '')
  while (codePrefix.length >= 2) {
    const mappings = mappingsByCode16.get(codePrefix)
    if (mappings?.length) return mappings
    codePrefix = codePrefix.slice(0, -2)
  }
  return []
}

export const buildMappingsByCode16 = (mappings: IsoMapDTO[]): Map<string, IsoMapDTO[]> => {
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

export const mapToExtractedRows = (
  seriesDetails: (SeriesDTO | IsoOverviewSeries)[],
  categories: IsoCategoryDTO[],
  categories22: IsoCategory22DTO[],
  mappingsByCode16: Map<string, IsoMapDTO[]>,
  mappingAvailable: boolean
): ExtractedProductVariant[] => {
  return seriesDetails.flatMap((series) => {
    const isoCode = typeof series.isoCategory === 'string' ? series.isoCategory : (series.isoCategory?.isoCode ?? '')
    const path = buildIsoPath(isoCode, categories)
    const matchingMappings = mappingAvailable ? findMappingsForCode(isoCode, mappingsByCode16) : []
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
      const activeAgreements = (variant.agreements || [])
        .filter((agreement) => ('status' in agreement ? agreement.status === 'ACTIVE' : true))
        .sort((a, b) => a.rank - b.rank || a.postNr - b.postNr)
      const agreementRefs = Array.from(
        new Set(activeAgreements.map((agreement) => agreement.reference).filter(Boolean))
      ).join(', ')
      const agreementRanks = Array.from(new Set(activeAgreements.map((agreement) => agreement.rank)))
        .sort((a, b) => a - b)
        .join(', ')
      const agreementPostNrs = Array.from(new Set(activeAgreements.map((agreement) => agreement.postNr)))
        .sort((a, b) => a - b)
        .join(', ')
      const firstAgreement = activeAgreements[0] ?? null
      return {
        productId: variant.id,
        seriesId: series.id,
        productTitle: series.title,
        variantName: variant.articleName,
        supplierRef: isUUID(variant.supplierRef) ? '' : variant.supplierRef,
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
        mappingAvailable,
        agreementRef: agreementRefs,
        agreementRank: agreementRanks,
        agreementPostNr: agreementPostNrs,
        agreementRankSort: firstAgreement?.rank ?? null,
        agreementPostNrSort: firstAgreement?.postNr ?? null,
      }
    })
  })
}

export const buildMappingRows = (
  categories: IsoCategoryDTO[],
  categories22: IsoCategory22DTO[],
  mappings: IsoMapDTO[],
  mappingAvailable: boolean
): MappingRow[] => {
  const mappingsByCode16 = buildMappingsByCode16(mappings)

  const toRow = (mapping: IsoMapDTO | undefined, code16: string, key: string): MappingRow => {
    const mappingTypes = mappingAvailable ? (mapping?.mapEnum ?? []) : []
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
      mappingVerified: mappingAvailable ? (mapping?.verified ?? null) : null,
      mappingAvailable,
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
