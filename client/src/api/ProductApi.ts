import { fetchAPI, fetchAPIModify, getPath, httpDelete } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import useSWR from 'swr'
import { IsoVersion, useIsoVersion, withIsoVersion } from 'utils/iso-version'
import { useErrorStore } from 'utils/store/useErrorStore'
import {
  BulkTechDataUpdateDTO,
  BulkTechDataUpdateResultDTO,
  DraftVariantDTO,
  ProductRegistrationDTO,
  ProductRegistrationDTOV2,
  UpdateProductRegistrationDTO,
} from 'utils/types/response-types'

export const getProductByHmsNr = (hmsArtNr: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, 'GET')

export const getProductByVariantId = (variantId: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/variant-id/${variantId}`, 'GET')

export const getProductById = async (
  productId: string,
  isAdmin: boolean,
  isoVersion: IsoVersion = 'v16'
): Promise<ProductRegistrationDTOV2> => {
  return fetchAPI(withIsoVersion(getPath(isAdmin, `/api/v1/product/registrations/${productId}`), isoVersion), 'GET')
}

export const updateProductVariant = async (
  isAdmin: boolean,
  id: string,
  updatedProduct: UpdateProductRegistrationDTO,
  isoVersion: IsoVersion = 'v16'
): Promise<ProductRegistrationDTOV2> =>
  fetchAPI(withIsoVersion(getPath(isAdmin, `/api/v1/product/registrations/${id}`), isoVersion), 'PUT', updatedProduct)

export const bulkUpdateTechData = async (
  bulkUpdateDTO: BulkTechDataUpdateDTO,
  isoVersion: IsoVersion = 'v16'
): Promise<BulkTechDataUpdateResultDTO> =>
  fetchAPI(
    withIsoVersion(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/tech-data/bulk`, isoVersion),
    'PUT',
    bulkUpdateDTO
  )

export const draftProductVariantV2 = async (
  isAdmin: boolean,
  seriesUUID: string,
  newVariant: DraftVariantDTO,
  isoVersion: IsoVersion = 'v16'
): Promise<ProductRegistrationDTOV2> => {
  return await fetchAPI(
    withIsoVersion(getPath(isAdmin, `/api/v1/product/registrations/draftWithV3/${seriesUUID}`), isoVersion),
    'POST',
    newVariant
  )
}

const deleteDraftProducts = async (isAdmin: boolean, productIds: string[]): Promise<any> => {
  return await httpDelete(getPath(isAdmin, `/api/v1/product/registrations/draft/delete`), 'DELETE', productIds)
}

const deletePublishedProducts = async (isAdmin: boolean, productIds: string[]): Promise<any> => {
  return await httpDelete(getPath(isAdmin, `/api/v1/product/registrations/delete`), 'DELETE', productIds)
}

export const deleteProducts = async (isAdmin: boolean, productIds: string[], isPublished: boolean): Promise<any> => {
  if (isPublished) {
    return deletePublishedProducts(isAdmin, productIds)
  } else {
    return deleteDraftProducts(isAdmin, productIds)
  }
}

export const setVariantToExpired = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v1/product/registrations/to-expired/${id}`), 'PUT')
}

export const setVariantToActive = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v1/product/registrations/to-active/${id}`), 'PUT')
}

export function useProductVariantsByProductIds(productIds?: string[]) {
  const isoVersion = useIsoVersion()
  const { setGlobalError } = useErrorStore()

  const url = withIsoVersion(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/ids`, isoVersion)
  const shouldFetch = Array.isArray(productIds) && productIds.length > 0

  const {
    data: products,
    error,
    isLoading,
  } = useSWR<ProductRegistrationDTO[]>(shouldFetch ? [url, productIds] : null, ([postUrl, ids]) =>
    fetchAPI(postUrl, 'POST', ids)
  )

  if (error) {
    setGlobalError(error.status, error.message)
    throw error
  }

  return {
    products,
    isLoading,
    error,
  }
}
