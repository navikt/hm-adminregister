import {
  CompatibleWith,
  PartDTO,
  ProductChunk,
  ProductRegistrationDTOV2,
  SuitableForBrukerpassbrukerDTO,
  SuitableForKommunalTeknikerDTO,
} from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { fetchAPI } from "api/fetch";

export function usePagedParts({
  page,
  pageSize,
  titleSearchTerm,
}: {
  page: number;
  pageSize: number;
  titleSearchTerm: string;
}) {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : "";

  const path = `${HM_REGISTER_URL()}/admreg/api/v1/part?page=${page}&size=${pageSize}&sort=created,DESC&${titleSearchParam}`;

  return useSWR<ProductChunk>(path, fetcherGET);
}

export function usePartByVariantIdentifier(variantIdentifier: string) {
  const partByVariantIdPath = `${HM_REGISTER_URL()}/admreg/api/v1/part/variant-id/${variantIdentifier}`;

  return useSWR<ProductRegistrationDTOV2>(variantIdentifier.length > 0 ? partByVariantIdPath : null, fetcherGET);
}

export function getProductByHmsArtNr(hmsArtNr: string): Promise<ProductRegistrationDTOV2> {
  return fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/accessory/hmsNr/${hmsArtNr}`, "GET");
}

export function getPartByHmsArtNr(hmsArtNr: string): Promise<ProductRegistrationDTOV2> {
  return fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/accessory/hmsNr/part/${hmsArtNr}`, "GET");
}

export function getVariantsBySeriesUUID(seriesUUID: string) {
  return useSWR<ProductRegistrationDTOV2[]>(
    `${HM_REGISTER_URL()}/admreg/api/v1/accessory/series-variants/${seriesUUID}`,
    fetcherGET,
  );
}

export const getPartsForSeriesId = (seriesId: string) => {
  return useSWR<ProductRegistrationDTOV2[]>(
    `${HM_REGISTER_URL()}/admreg/api/v1/accessory/series/${seriesId}`,
    fetcherGET,
  );
};

export const getPart = async (productId: string): Promise<ProductRegistrationDTOV2> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/part/${productId}`, "GET");

export function usePartByProductId(productId: string) {
  const path = `${HM_REGISTER_URL()}/admreg/api/v1/part/v2/${productId}`;

  const { data: part, error, isLoading, mutate } = useSWR<PartDTO>(path, fetcherGET);

  return {
    part,
    isLoading,
    error,
    mutate,
  };
}

export function useCompatibleProductById(productId: string) {
  const path = `${HM_REGISTER_URL()}/admreg/api/v1/accessory/${productId}`;

  const { data: product, error, isLoading, mutate } = useSWR<ProductRegistrationDTOV2>(path, fetcherGET);

  return {
    product,
    isLoading,
    error,
    mutate,
  };
}

const updatePartCompatability = async (productId: string, updatedCompatibleWith: CompatibleWith): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/accessory/${productId}/compatibleWith`, "PUT", updatedCompatibleWith);

export const removeCompatibleWithSeries = async (productId: string, seriesUUIDToRemove: string[]): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    seriesIds: compatibleWith?.seriesIds.filter((id) => !seriesUUIDToRemove.includes(id)) || [],
    productIds: compatibleWith?.productIds || [],
  };

  return await updatePartCompatability(productId, updatedCompatibleWith);
};

export const removeCompatibleWithSeriesForParts = async (
  seriesUUIDToRemove: string,
  partUUIDs: string[],
): Promise<void> => {
  for (const productId of partUUIDs) {
    const partToUpdate = await getPart(productId);
    const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
    const updatedCompatibleWith = {
      seriesIds: compatibleWith?.seriesIds.filter((id) => seriesUUIDToRemove !== id) || [],
      productIds: compatibleWith?.productIds || [],
    };
    await updatePartCompatability(productId, updatedCompatibleWith);
  }
};

export const addCompatibleWithSeriesForParts = async (seriesUUIDToAdd: string, partUUIDs: string[]): Promise<void> => {
  for (const productId of partUUIDs) {
    const partToUpdate = await getPart(productId);
    const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
    const updatedCompatibleWith = {
      seriesIds: [...(compatibleWith?.seriesIds || []), seriesUUIDToAdd],
      productIds: compatibleWith?.productIds || [],
    };
    await updatePartCompatability(productId, updatedCompatibleWith);
  }
};

export const addCompatibleWithSeries = async (productId: string, seriesUUIDToAdd: string): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    seriesIds: [...(compatibleWith?.seriesIds || []), seriesUUIDToAdd],
    productIds: compatibleWith?.productIds || [],
  };

  return await updatePartCompatability(productId, updatedCompatibleWith);
};

export const removeCompatibleWithVariant = async (productId: string, productIdToRemove: string[]): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    productIds: compatibleWith?.productIds.filter((id) => !productIdToRemove.includes(id)) || [],
    seriesIds: compatibleWith?.seriesIds || [],
  };

  return await updatePartCompatability(productId, updatedCompatibleWith);
};

export const addCompatibleWithVariant = async (productId: string, productIdToAdd: string): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    productIds: [...(compatibleWith?.productIds || []), productIdToAdd],
    seriesIds: compatibleWith?.seriesIds || [],
  };

  return await updatePartCompatability(productId, updatedCompatibleWith);
};

export const addCompatibleWithVariantList = async (productId: string, productIdToAdd: string[]): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    productIds: [...(compatibleWith?.productIds || []), ...productIdToAdd],
    seriesIds: compatibleWith?.seriesIds || [],
  };
  return await updatePartCompatability(productId, updatedCompatibleWith);
};

const updateSuitableForKommunalTekniker = async (
  productId: string,
  suitableForKommunalTeknikerDTO: SuitableForKommunalTeknikerDTO,
): Promise<void> =>
  fetchAPI(
    `${HM_REGISTER_URL()}/admreg/api/v1/accessory/${productId}/suitableForKommunalTekniker`,
    "PUT",
    suitableForKommunalTeknikerDTO,
  );

const updateSuitableForBrukerpassbruker = async (
  productId: string,
  suitableForBrukerpassbrukerDTO: SuitableForBrukerpassbrukerDTO,
): Promise<void> =>
  fetchAPI(
    `${HM_REGISTER_URL()}/admreg/api/v1/accessory/${productId}/suitableForBrukerpassbruker`,
    "PUT",
    suitableForBrukerpassbrukerDTO,
  );

export const updateEgnetForKommunalTekniker = async (
  productId: string,
  egnetForKommunalTekniker: boolean,
): Promise<void> => {
  const updatedSuitableForKommunalTekniker: SuitableForKommunalTeknikerDTO = {
    suitableForKommunalTekniker: egnetForKommunalTekniker,
  };
  return await updateSuitableForKommunalTekniker(productId, updatedSuitableForKommunalTekniker);
};

export const updateEgnetForBrukerpassbruker = async (
  productId: string,
  egnetForBrukerpassbruker: boolean,
): Promise<void> => {
  const updatedSuitableForBrukerpassbruker: SuitableForBrukerpassbrukerDTO = {
    suitableForBrukerpassbruker: egnetForBrukerpassbruker,
  };
  return await updateSuitableForBrukerpassbruker(productId, updatedSuitableForBrukerpassbruker);
};
