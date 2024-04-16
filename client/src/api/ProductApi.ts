import { EditCommonInfoProduct } from "produkter/Produkt";
import { DraftVariantDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI, getPath } from "api/fetch";

export const registrationsPath = (isAdmin: boolean, productId: string) =>
  getPath(isAdmin, `/api/v1/product/registrations/${productId}`);

export const getProductByHmsNr = (hmsArtNr: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, "GET");

export const updateProduct = async (
  productId: string,
  commonInfoProduct: EditCommonInfoProduct,
  isAdmin: boolean,
): Promise<ProductRegistrationDTO> => {
  const productToUpdate = await fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/${productId}`), "GET");

  const isoCode = commonInfoProduct.isoCode ? commonInfoProduct.isoCode : productToUpdate.isoCategory;
  const description = commonInfoProduct.description
    ? commonInfoProduct.description
    : productToUpdate.productData.attributes.text
      ? productToUpdate.productData.attributes.text
      : "";

  const editedProductDTO = getEditedProductDTO(productToUpdate, isoCode, description);

  return await fetchAPI(
    getPath(isAdmin, `/api/v1/product/registrations/${productToUpdate.id}`),
    "PUT",
    editedProductDTO,
  );
};

export const updateProductVariant = async (
  isAdmin: boolean,
  updatedProduct: ProductRegistrationDTO,
): Promise<ProductRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/${updatedProduct.id}`), "PUT", updatedProduct);

export const draftProductVariant = async (
  isAdmin: boolean,
  productId: string,
  newVariant: DraftVariantDTO,
): Promise<ProductRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/draft/variant/${productId}`), "POST", newVariant);

const getEditedProductDTO = (
  productToEdit: ProductRegistrationDTO,
  newIsoCategory: string,
  newDescription: string,
): ProductRegistrationDTO => {
  return {
    ...productToEdit,
    isoCategory: newIsoCategory,
    productData: {
      ...productToEdit.productData,
      attributes: {
        ...productToEdit.productData.attributes,
        text: newDescription,
      },
    },
  };
};

export const sendTilGodkjenning = async (productId: string): Promise<ProductRegistrationDTO> => {
  const productToEdit = await fetchAPI(getPath(false, `/api/v1/product/registrations/${productId}`), "GET");

  const editedProductDTO: ProductRegistrationDTO = {
    ...productToEdit,
    draftStatus: "DONE",
  };

  return await fetchAPI(getPath(false, `/api/v1/product/registrations/${productId}`), "PUT", editedProductDTO);
};

export const publishProduct = async (productId: string): Promise<ProductRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/product/registrations/approve/${productId}`), "PUT");
};

export const sendFlereTilGodkjenning = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(false, `/api/v1/product/registrations/til-godkjenning`), "PUT", productIds);
};

export const rejectProducts = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(true, `/api/v1/product/registrations/reject`), "PUT", productIds);
};

export const publishProducts = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(true, `/api/v1/product/registrations/approve`), "PUT", productIds);
};
