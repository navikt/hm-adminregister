import { HM_REGISTER_URL } from 'environments'

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

// Shared with usePagedProducts (utils/swr-hooks.ts) so the visible product list and the "Alle treff"
// export path always send the exact same query — including URL-encoding of free-text search terms.
export const statusFilterProductsURL = (statusFilters: string[]) => {
  // const editStatus = ["EDITABLE", "PENDING_APPROVAL", "REJECTED", "DONE"];
  // const otherStatuses = ["includeInactive", "onlyUnpublished"];
  const editStatus: string[] = []
  let excludeExpired = true

  const uri = new URLSearchParams()

  statusFilters.forEach((status) => {
    if (status === 'Under endring') {
      editStatus.push('EDITABLE')
    } else if (status === 'Venter på godkjenning') {
      editStatus.push('PENDING_APPROVAL')
    } else if (status === 'Avslått') {
      editStatus.push('REJECTED')
    } else if (status === 'Publisert') {
      editStatus.push('DONE')
      // } else if (status === "Ikke publisert") {
      //   otherStatuses.push("unpublished");
    } else if (status === 'Vis utgåtte') {
      excludeExpired = false
    }
  })

  if (excludeExpired) {
    uri.append('excludeExpired', 'true')
  }

  if (editStatus.length > 0) {
    uri.append('editStatus', editStatus.join(','))
  }

  return uri
}

// Builds the /admreg/api/v1/series URL. Shared by usePagedProducts (the visible product list) and
// the "Alle treff" export path (paging through all matches) so both always query with the exact
// same, correctly-encoded parameters.
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
  const titleSearchParam = titleSearchTerm ? `&title=${encodeURIComponent(titleSearchTerm)}` : ''
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
