import { CompatibleWith, ProductChunk, ProductRegistrationDTOV2 } from "utils/types/response-types";
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

export const getPart = (productId: string): Promise<ProductRegistrationDTOV2> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/part/${productId}`, "GET");

export function usePartByProductId(productId: string) {
  const path = `${HM_REGISTER_URL()}/admreg/api/v1/part/${productId}`;

  const { data: part, error, isLoading, mutate } = useSWR<ProductRegistrationDTOV2>(path, fetcherGET);

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

const updatePartCompatability = (productId: string, updatedCompatibleWith: CompatibleWith): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/accessory/${productId}/compatibleWith`, "PUT", updatedCompatibleWith);

export const removeCompatibleWithSeries = async (productId: string, seriesUUIDToRemove: string): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    seriesIds: compatibleWith?.seriesIds.filter((id) => id !== seriesUUIDToRemove) || [],
    productIds: compatibleWith?.productIds || [],
  };

  return await updatePartCompatability(productId, updatedCompatibleWith);
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

export const removeCompatibleWithVariant = async (productId: string, productIdToRemove: string): Promise<void> => {
  const partToUpdate = await getPart(productId);

  const compatibleWith = partToUpdate.productData.attributes.compatibleWith;
  const updatedCompatibleWith = {
    productIds: compatibleWith?.productIds.filter((id) => id !== productIdToRemove) || [],
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
