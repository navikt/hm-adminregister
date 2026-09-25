import { ExtractedProductVariant, ProductSummaryRow, SortDir, SortKey } from './isoOversiktTypes'

export const compareIsoCodes = (a: string, b: string, dir: SortDir): number => {
  const normalizedA = a.replace(/\s/g, '')
  const normalizedB = b.replace(/\s/g, '')
  if (!normalizedA && !normalizedB) return 0
  if (!normalizedA) return 1
  if (!normalizedB) return -1
  const result = normalizedA.localeCompare(normalizedB)
  return dir === 'asc' ? result : -result
}

export const numericValue = (val: number | null | undefined): number => val ?? Number.MAX_SAFE_INTEGER

export const sortRows = (rows: ExtractedProductVariant[], key: SortKey, dir: SortDir): ExtractedProductVariant[] => {
  return [...rows].sort((a, b) => {
    let av: number
    let bv: number
    if (key === 'variantCount') return 0
    if (key === 'agreementRank') {
      av = numericValue(a.agreementRankSort)
      bv = numericValue(b.agreementRankSort)
    } else if (key === 'agreementPostNr') {
      av = numericValue(a.agreementPostNrSort)
      bv = numericValue(b.agreementPostNrSort)
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

export const sortProductRows = (rows: ProductSummaryRow[], key: SortKey, dir: SortDir): ProductSummaryRow[] => {
  return [...rows].sort((a, b) => {
    let av: number
    let bv: number
    if (key === 'variantCount') {
      av = a.variantCount
      bv = b.variantCount
    } else if (key === 'agreementRank') {
      av = numericValue(a.agreementRankSort)
      bv = numericValue(b.agreementRankSort)
    } else if (key === 'agreementPostNr') {
      av = numericValue(a.agreementPostNrSort)
      bv = numericValue(b.agreementPostNrSort)
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
export const sortByIsoLevel = <T extends { iso1: string; iso2: string; iso3: string; iso4: string }>(
  rows: T[],
  key: SortKey,
  dir: SortDir
): T[] => {
  if (key !== 'iso1' && key !== 'iso2' && key !== 'iso3' && key !== 'iso4') return rows
  return [...rows].sort((a, b) => {
    return compareIsoCodes(a[key], b[key], dir)
  })
}
