import { HM_REGISTER_URL } from 'environments'
import { statusFilterProductsURL } from 'utils/swr-hooks'

export type SeriesSearchParams = {
  page: number
  pageSize: number
  titleSearchTerm: string
  filters: string[]
  supplierFilter?: string
  sortUrl?: string | null
  agreementFilter?: string | null
  missingMediaType?: string | null
}

// Builds the same /admreg/api/v1/series URL that usePagedProducts uses, but as a plain
// function so it can be called outside a React hook (e.g. paging through all matches for export).
export function buildSeriesSearchPath({
  page,
  pageSize,
  titleSearchTerm,
  filters,
  supplierFilter,
  sortUrl,
  agreementFilter,
  missingMediaType,
}: SeriesSearchParams) {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : ''
  const filterUrl = statusFilterProductsURL(filters)
  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : ''
  const mainProductParam = `&mainProduct=true`
  const sortBy = sortUrl?.split(',')[0] || 'updated'
  const sortDirection = sortUrl?.split(',')[1] || 'DESC'
  const sortParam = `&sort=${sortBy},${sortDirection}`
  const agreementParam = agreementFilter ? `&inAgreement=${agreementFilter}` : ''
  const missingMediaParam = missingMediaType ? `&missingMediaType=${missingMediaType}` : ''
  return `${HM_REGISTER_URL()}/admreg/api/v1/series?page=${page}&size=${pageSize}${sortParam}&${filterUrl.toString()}&excludedStatus=DELETED${titleSearchParam}${supplierParam}${mainProductParam}${agreementParam}${missingMediaParam}`
}
