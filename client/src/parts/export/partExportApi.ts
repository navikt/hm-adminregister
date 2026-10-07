import { fetchAPI } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import { ProductRegistrationDTOV2 } from 'utils/types/response-types'

// Paths mirror usePagedParts (api/PartApi.ts) and usePagedProductsForTechnician (utils/swr-hooks.ts)
// so the export returns the same hits as the list. Keep them in sync until a shared builder is extracted.

export type PartSearchParams = {
  page: number
  pageSize: number
  titleSearchTerm: string
  supplierFilter?: string
  agreementFilter?: string | null
  missingMediaType?: string | null
  isAccessory?: boolean | null
}

export const buildPartSearchPath = ({
  page,
  pageSize,
  titleSearchTerm,
  supplierFilter,
  agreementFilter,
  missingMediaType,
  isAccessory,
}: PartSearchParams) => {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : ''
  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : ''
  const agreementParam =
    agreementFilter !== null && agreementFilter !== undefined ? `&inAgreement=${agreementFilter}` : ''
  const missingMediaParam = missingMediaType ? `&missingMediaType=${missingMediaType}` : ''
  const isAccessoryParam = isAccessory !== null && isAccessory !== undefined ? `&isAccessory=${isAccessory}` : ''

  return `${HM_REGISTER_URL()}/admreg/common/api/v1/part?page=${page}&size=${pageSize}&excludedStatus=DELETED&sort=created,DESC${titleSearchParam}${supplierParam}${agreementParam}${missingMediaParam}${isAccessoryParam}`
}

export type TechnicianSeriesSearchParams = {
  page: number
  pageSize: number
  titleSearchTerm: string
  supplierFilter?: string
}

export const buildTechnicianSeriesSearchPath = ({
  page,
  pageSize,
  titleSearchTerm,
  supplierFilter,
}: TechnicianSeriesSearchParams) => {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : ''
  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : ''

  return `${HM_REGISTER_URL()}/admreg/api/v1/series?page=${page}&size=${pageSize}&sort=created,DESC&excludedStatus=DELETED${titleSearchParam}&mainProduct=true${supplierParam}`
}

export const getPartsBySeriesId = (seriesId: string, signal?: AbortSignal): Promise<ProductRegistrationDTOV2[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/series/${seriesId}`, 'GET', undefined, signal)

export const getProductsByIds = (ids: string[], signal?: AbortSignal): Promise<ProductRegistrationDTOV2[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/ids`, 'POST', ids, signal)
