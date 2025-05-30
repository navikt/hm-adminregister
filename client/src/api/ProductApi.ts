import {
  DraftVariantDTO,
  ProductRegistrationDTO,
  ProductRegistrationDTOV2,
  UpdateProductRegistrationDTO,
} from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI, fetchAPIModify, getPath, httpDelete } from "api/fetch";
import { useAuthStore } from "utils/store/useAuthStore";

export const getProductByHmsNr = (hmsArtNr: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, "GET");

export const getProductById = async (productId: string, isAdmin: boolean): Promise<ProductRegistrationDTOV2> =>  {

  return fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/${productId}`), "GET");
}

export const updateProductVariant = async (
  isAdmin: boolean,
  id: string,
  updatedProduct: UpdateProductRegistrationDTO,
): Promise<ProductRegistrationDTOV2> =>
  fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/${id}`), "PUT", updatedProduct);

export const draftProductVariantV2 = async (
  isAdmin: boolean,
  seriesUUID: string,
  newVariant: DraftVariantDTO,
): Promise<ProductRegistrationDTOV2> => {
  return await fetchAPI(
    getPath(isAdmin, `/api/v1/product/registrations/draftWithV3/${seriesUUID}`),
    "POST",
    newVariant,
  );
};

const deleteDraftProducts = async (isAdmin: boolean, productIds: string[]): Promise<any> => {
  return await httpDelete(getPath(isAdmin, `/api/v1/product/registrations/draft/delete`), "DELETE", productIds);
};

const deletePublishedProducts = async (isAdmin: boolean, productIds: string[]): Promise<any> => {
  return await httpDelete(getPath(isAdmin, `/api/v1/product/registrations/delete`), "DELETE", productIds);
};

export const deleteProducts = async (isAdmin: boolean, productIds: string[], isPublished: boolean): Promise<any> => {
  if (isPublished) {
    return deletePublishedProducts(isAdmin, productIds);
  } else {
    return deleteDraftProducts(isAdmin, productIds);
  }
};

export const setVariantToExpired = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v1/product/registrations/to-expired/${id}`), "PUT");
};

export const setVariantToActive = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v1/product/registrations/to-active/${id}`), "PUT");
};
