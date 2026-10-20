import { getProductById } from 'api/ProductApi'
import { fetchAPI, getPath } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import useSWR from 'swr'
import { IsoVersion, useIsoVersion, withIsoVersion } from 'utils/iso-version'
import { fetcherGET } from 'utils/swr-hooks'
import {
  CompatibleWithDTO,
  HiddenPart,
  PartDTO,
  PartDraftResponse,
  PartDraftWithDTO,
  ProductChunk,
  ProductRegistrationDTOV2,
  SuitableForBrukerpassbrukerDTO,
  SuitableForKommunalTeknikerDTO,
  UpdatePartDTO,
} from 'utils/types/response-types'

export function usePagedParts({
  page,
  pageSize,
  titleSearchTerm,
  supplierFilter,
  agreementFilter,
  missingMediaType,
  isAccessory,
}: {
  page: number
  pageSize: number
  titleSearchTerm: string
  supplierFilter?: string
  agreementFilter?: string | null
  missingMediaType?: string | null
  isAccessory?: boolean | null
}) {
  const isoVersion = useIsoVersion()
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : ''
  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : ''
  const agreementParam =
    agreementFilter !== null && agreementFilter !== undefined ? `&inAgreement=${agreementFilter}` : ''
  const missingMediaParam = missingMediaType ? `&missingMediaType=${missingMediaType}` : ''
  const isAccessoryParam = isAccessory !== null && isAccessory !== undefined ? `&isAccessory=${isAccessory}` : ''

  const path = `${HM_REGISTER_URL()}/admreg/common/api/v1/part?page=${page}&size=${pageSize}&excludedStatus=DELETED&sort=created,DESC${titleSearchParam}${supplierParam}${agreementParam}${missingMediaParam}${isAccessoryParam}`

  return useSWR<ProductChunk>(withIsoVersion(path, isoVersion), fetcherGET)
}

export const draftNewPart = async (partDraftWith: PartDraftWithDTO, supplierId: string): Promise<PartDraftResponse> => {
  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/common/api/v1/part/supplier/${supplierId}/draftWith`,
    'POST',
    partDraftWith
  )
}

export const draftAndPublishNewPart = async (
  partDraftWith: PartDraftWithDTO,
  supplierId: string
): Promise<PartDraftResponse> => {
  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/common/api/v1/part/supplier/${supplierId}/draftWithAndPublish`,
    'POST',
    partDraftWith
  )
}

export const approvePart = async (seriesUUID: string): Promise<void> => {
  return await fetchAPI(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/approve/${seriesUUID}`, 'PUT')
}

export const changePartToMainProduct = async (
  seriesUUID: string,
  newIsoCode: string,
  isoVersion: IsoVersion = 'v16'
): Promise<void> => {
  return await fetchAPI(
    withIsoVersion(`${HM_REGISTER_URL()}/admreg/admin/api/v1/part/mainProduct/${seriesUUID}`, isoVersion),
    'PUT',
    {
      newIsoCode: newIsoCode,
    }
  )
}

export function usePartByVariantIdentifier(variantIdentifier: string) {
  const isoVersion = useIsoVersion()
  const partByVariantIdPath = `${HM_REGISTER_URL()}/admreg/common/api/v1/part/variant-id/${variantIdentifier}`

  return useSWR<ProductRegistrationDTOV2>(
    variantIdentifier.length > 0 ? withIsoVersion(partByVariantIdPath, isoVersion) : null,
    fetcherGET
  )
}

export function getProductByHmsArtNr(
  hmsArtNr: string,
  isoVersion: IsoVersion = 'v16'
): Promise<ProductRegistrationDTOV2> {
  return fetchAPI(withIsoVersion(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/hmsNr/${hmsArtNr}`, isoVersion), 'GET')
}

export function getVariantsBySeriesUUID(seriesUUID?: string) {
  const isoVersion = useIsoVersion()
  return useSWR<ProductRegistrationDTOV2[]>(
    seriesUUID
      ? withIsoVersion(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/series-variants/${seriesUUID}`, isoVersion)
      : null,
    fetcherGET
  )
}

export const getPartsForSeriesId = (seriesId: string) => {
  const isoVersion = useIsoVersion()
  return useSWR<ProductRegistrationDTOV2[]>(
    withIsoVersion(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/series/${seriesId}`, isoVersion),
    fetcherGET,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
}

export function usePartByProductId(productId: string) {
  const isoVersion = useIsoVersion()
  const path = `${HM_REGISTER_URL()}/admreg/common/api/v1/part/${productId}`

  const {
    data: part,
    error,
    isLoading,
    mutate: mutatePart,
  } = useSWR<PartDTO>(withIsoVersion(path, isoVersion), fetcherGET)

  return {
    part,
    isLoading,
    error,
    mutatePart,
  }
}

export function useCompatibleProductById(productId: string, isAdmin: boolean) {
  const isoVersion = useIsoVersion()
  const path = getPath(isAdmin, `/api/v1/product/registrations/${productId}`)

  const {
    data: product,
    error,
    isLoading,
    mutate,
  } = useSWR<ProductRegistrationDTOV2>(withIsoVersion(path, isoVersion), fetcherGET)

  return {
    product,
    isLoading,
    error,
    mutate,
  }
}

const updatePartCompatability = async (productId: string, updatedCompatibleWith: CompatibleWithDTO): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/${productId}/compatibleWith`, 'PUT', updatedCompatibleWith)

export const updatePart = async (seriesId: string, updatePartDto: UpdatePartDTO): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/common/api/v1/part/${seriesId}`, 'PUT', updatePartDto)

export const removeCompatibleWithSeries = async (
  productId: string,
  seriesUUIDToRemove: string[],
  isAdmin: boolean
): Promise<void> => {
  const partToUpdate = await getProductById(productId, isAdmin)

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith
  const updatedCompatibleWith: CompatibleWithDTO = {
    seriesIds: compatibleWith?.seriesIds.filter((id) => !seriesUUIDToRemove.includes(id)) || [],
    productIds: compatibleWith?.productIds || [],
  }

  return await updatePartCompatability(productId, updatedCompatibleWith)
}

export const removeCompatibleWithSeriesForParts = async (
  seriesUUIDToRemove: string,
  partUUIDs: string[],
  isAdmin: boolean
): Promise<void> => {
  for (const productId of partUUIDs) {
    const partToUpdate = await getProductById(productId, isAdmin)
    const compatibleWith = partToUpdate.productData.attributes.compatibleWith
    const updatedCompatibleWith = {
      seriesIds: compatibleWith?.seriesIds.filter((id) => seriesUUIDToRemove !== id) || [],
      productIds: compatibleWith?.productIds || [],
    }
    await updatePartCompatability(productId, updatedCompatibleWith)
  }
}

export const addCompatibleWithSeriesForParts = async (
  seriesUUIDToAdd: string,
  partUUIDs: string[],
  isAdmin: boolean
): Promise<void> => {
  for (const productId of partUUIDs) {
    const partToUpdate = await getProductById(productId, isAdmin)
    const compatibleWith = partToUpdate.productData.attributes.compatibleWith
    const updatedCompatibleWith = {
      seriesIds: [...(compatibleWith?.seriesIds || []), seriesUUIDToAdd],
      productIds: compatibleWith?.productIds || [],
    }
    await updatePartCompatability(productId, updatedCompatibleWith)
  }
}

export const addCompatibleWithSeries = async (
  productId: string,
  seriesUUIDToAdd: string,
  isAdmin: boolean
): Promise<void> => {
  const partToUpdate = await getProductById(productId, isAdmin)

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith
  const updatedCompatibleWith = {
    seriesIds: [...(compatibleWith?.seriesIds || []), seriesUUIDToAdd],
    productIds: compatibleWith?.productIds || [],
  }

  return await updatePartCompatability(productId, updatedCompatibleWith)
}

export const removeCompatibleWithVariant = async (
  productId: string,
  productIdToRemove: string[],
  isAdmin: boolean
): Promise<void> => {
  const partToUpdate = await getProductById(productId, isAdmin)

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith
  const updatedCompatibleWith = {
    productIds: compatibleWith?.productIds.filter((id) => !productIdToRemove.includes(id)) || [],
    seriesIds: compatibleWith?.seriesIds || [],
  }

  return await updatePartCompatability(productId, updatedCompatibleWith)
}

export const addCompatibleWithVariantList = async (
  productId: string,
  productIdToAdd: string[],
  isAdmin: boolean
): Promise<void> => {
  const partToUpdate = await getProductById(productId, isAdmin)

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith
  const updatedCompatibleWith = {
    productIds: [...(compatibleWith?.productIds || []), ...productIdToAdd],
    seriesIds: compatibleWith?.seriesIds || [],
  }
  return await updatePartCompatability(productId, updatedCompatibleWith)
}

const updateSuitableForKommunalTekniker = async (
  productId: string,
  suitableForKommunalTeknikerDTO: SuitableForKommunalTeknikerDTO
): Promise<void> =>
  fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/${productId}/suitableForKommunalTekniker`,
    'PUT',
    suitableForKommunalTeknikerDTO
  )

const updateSuitableForBrukerpassbruker = async (
  productId: string,
  suitableForBrukerpassbrukerDTO: SuitableForBrukerpassbrukerDTO
): Promise<void> =>
  fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/${productId}/suitableForBrukerpassbruker`,
    'PUT',
    suitableForBrukerpassbrukerDTO
  )

export const updateEgnetForKommunalTekniker = async (
  productId: string,
  egnetForKommunalTekniker: boolean
): Promise<void> => {
  const updatedSuitableForKommunalTekniker: SuitableForKommunalTeknikerDTO = {
    suitableForKommunalTekniker: egnetForKommunalTekniker,
  }
  return await updateSuitableForKommunalTekniker(productId, updatedSuitableForKommunalTekniker)
}

export const updateEgnetForBrukerpassbruker = async (
  productId: string,
  egnetForBrukerpassbruker: boolean
): Promise<void> => {
  const updatedSuitableForBrukerpassbruker: SuitableForBrukerpassbrukerDTO = {
    suitableForBrukerpassbruker: egnetForBrukerpassbruker,
  }
  return await updateSuitableForBrukerpassbruker(productId, updatedSuitableForBrukerpassbruker)
}

const hidePartById = async (id: string): Promise<void> => {
  const url = `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/${id}/hide`
  const res = await fetch(url, { method: 'POST', credentials: 'include' })
  if (!res.ok) {
    throw new Error('Kunne ikke skjule del')
  }
}

export const hidePart = async (id: string): Promise<void> => {
  // New symmetrical name; keep hidePartById exported below for backwards compatibility.
  return hidePartById(id)
}

export const unhidePart = async (id: string): Promise<void> => {
  const url = `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/${id}/hide`
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) {
    throw new Error('Kunne ikke vise del i listen igjen')
  }
}

export const fetchHiddenParts = async (): Promise<HiddenPart[]> => {
  const url = `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/hidden`
  const res = await fetch(url, { method: 'GET', credentials: 'include' })
  if (!res.ok) {
    throw new Error('Kunne ikke hente skjulte deler')
  }
  return (await res.json()) as HiddenPart[]
}
