import { isUUID } from "utils/string-util";
import { ProductRegistrationDTO } from "utils/types/response-types";

export const numberOfImages = (products: ProductRegistrationDTO[]) => {
  return products[0].productData.media.filter((media) => media.type == "IMAGE").length;
};

export const numberOfDocuments = (products: ProductRegistrationDTO[]) => {
  return products[0].productData.media.filter((media) => media.type == "PDF").length;
};

export const numberOfVideos = (products: ProductRegistrationDTO[]) => {
  return products[0].productData.media.filter((media) => media.type == "VIDEO" && media.source === "EXTERNALURL").length;
};

export const numberOfVariants = (products: ProductRegistrationDTO[]) => {
  if (isUUID(products[0].supplierRef)) {
    return 0;
  }
  return products.length;
};