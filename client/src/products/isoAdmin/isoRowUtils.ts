import { ExtractedProductVariant, ProductSummaryRow } from './isoOversiktTypes'
import { numericValue } from './isoSortUtils'

export const mergeCsv = (a: string, b: string): string =>
  Array.from(
    new Set([
      ...a
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      ...b
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    ])
  ).join(', ')

export const groupByProduct = (variantRows: ExtractedProductVariant[]): ProductSummaryRow[] => {
  const map = new Map<string, ProductSummaryRow>()
  for (const row of variantRows) {
    const existing = map.get(row.seriesId)
    if (existing) {
      existing.variantCount++
      existing.agreementRef = mergeCsv(existing.agreementRef, row.agreementRef)
      existing.agreementRank = mergeCsv(existing.agreementRank, row.agreementRank)
      existing.agreementPostNr = mergeCsv(existing.agreementPostNr, row.agreementPostNr)
      existing.agreementRankSort = Math.min(
        numericValue(existing.agreementRankSort),
        numericValue(row.agreementRankSort)
      )
      existing.agreementPostNrSort = Math.min(
        numericValue(existing.agreementPostNrSort),
        numericValue(row.agreementPostNrSort)
      )
      if (existing.agreementRankSort === Number.MAX_SAFE_INTEGER) existing.agreementRankSort = null
      if (existing.agreementPostNrSort === Number.MAX_SAFE_INTEGER) existing.agreementPostNrSort = null
      existing.mappingAvailable = existing.mappingAvailable && row.mappingAvailable
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
        mappingAvailable: row.mappingAvailable,
        variantCount: 1,
        agreementRef: row.agreementRef,
        agreementRank: row.agreementRank,
        agreementPostNr: row.agreementPostNr,
        agreementRankSort: row.agreementRankSort,
        agreementPostNrSort: row.agreementPostNrSort,
      })
    }
  }
  return Array.from(map.values())
}
