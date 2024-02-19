import { EditCommonInfoProduct } from "produkter/Produkt";
import { DraftVariantDTO, ProductRegistrationDTO } from "utils/response-types";
import { HM_REGISTER_URL } from "environments";
import { CustomError } from "utils/swr-hooks";

const registrationsDraftPath = (isAdmin: boolean, productId: string): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/draft/variant/${productId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/draft/variant/${productId}`;

export const registrationsPath = (isAdmin: boolean, productId: string) =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/${productId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${productId}`;

export const getProductByHmsNr = async (hmsArtNr: string): Promise<ProductRegistrationDTO> => {
  return await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status);
      });
    }
    return res.json();
  });
};

export const updateProduct = async (
  productId: string,
  commonInfoProduct: EditCommonInfoProduct,
): Promise<ProductRegistrationDTO> => {
  const productToUpdate: ProductRegistrationDTO = await fetch(
    `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${productId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status);
      });
    }
    return res.json();
  });

  //Iso can be undefined when not chosen from the combobox
  const isoCode = commonInfoProduct.isoCode ? commonInfoProduct.isoCode : productToUpdate.isoCategory;
  const description = commonInfoProduct.description
    ? commonInfoProduct.description
    : productToUpdate.productData.attributes.text
      ? productToUpdate.productData.attributes.text
      : "";

  const editedProductDTO = getEditedProductDTO(productToUpdate, isoCode, description);

  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${productToUpdate.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(editedProductDTO),
    },
  );

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const updateProductVariant = async (
  isAdmin: boolean,
  updatedProduct: ProductRegistrationDTO,
): Promise<ProductRegistrationDTO> => {
  const response = await fetch(registrationsPath(isAdmin, updatedProduct.id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updatedProduct),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const draftProductVariant = async (
  isAdmin: boolean,
  productId: string,
  newVariant: DraftVariantDTO,
): Promise<ProductRegistrationDTO> => {
  const response = await fetch(registrationsDraftPath(isAdmin, productId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newVariant),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

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
  const productToEdit: ProductRegistrationDTO = await fetch(registrationsPath(false, productId), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status);
      });
    }
    return res.json();
  });

  const editedProductDTO: ProductRegistrationDTO = {
    ...productToEdit,
    draftStatus: "DONE",
  };

  const response = await fetch(registrationsPath(false, productId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(editedProductDTO),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};
