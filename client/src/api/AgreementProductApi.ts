import {
  DelkontraktRegistrationDTO,
  ProductAgreementRegistrationDTO,
  ProductAgreementRegistrationDTOList,
  ProductRegistrationDTO,
} from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { v4 as uuidv4 } from "uuid";
import { todayTimestamp } from "utils/date-util";
import { getAgreement } from "api/AgreementApi";
import { getDelkontrakt } from "api/DelkontraktApi";
import { fetchAPI } from "api/fetch";
import { EditProductAgreementDatesFormDataDto } from "utils/zodSchema/editProductAgreementDates";

export const deleteProductsFromAgreement = (agreementProductIds: string[]) =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/ids`, "DELETE", agreementProductIds);

export const activateProductsFromAgreement = (agreementProductIds: string[]) =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/ids`, "PUT", agreementProductIds);

export const changeRankOnProductAgreements = async (productAgreementIds: string[], newRank: number) => {
  const productAgreementsToUpdate: ProductAgreementRegistrationDTO[] = await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/get-by-ids`,
    "POST",
    productAgreementIds,
  );

  const updatedProductAgreements: ProductAgreementRegistrationDTO[] = getEditedProductAgreements(
    productAgreementsToUpdate,
    newRank,
  );

  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/batch`,
    "PUT",
    updatedProductAgreements,
  );
};

export const changePublishedExpiredOnProductAgreements = async (
  productAgreementIds: string[],
  editProductAgreementDatesFormDataDto: EditProductAgreementDatesFormDataDto,
) => {
  const productAgreementsToUpdate: ProductAgreementRegistrationDTO[] = await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/get-by-ids`,
    "POST",
    productAgreementIds,
  );

  const updatedProductAgreements: ProductAgreementRegistrationDTO[] = getProductAgreementsWithUpdatedDates(
    productAgreementsToUpdate,
    editProductAgreementDatesFormDataDto,
  );

  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/batch`,
    "PUT",
    updatedProductAgreements,
  );
};

export const addProductsToAgreement = async (
  delkontraktId: string,
  post: number,
  productsToAdd: ProductRegistrationDTO[],
): Promise<ProductAgreementRegistrationDTOList> => {
  const delkontraktToUpdate: DelkontraktRegistrationDTO = await getDelkontrakt(delkontraktId);
  const agreementToUpdate = await getAgreement(delkontraktToUpdate.agreementId);

  const productAgreementsToAdd: ProductAgreementRegistrationDTO[] = productsToAdd.map((product) => ({
    id: uuidv4(),
    productId: product.id,
    seriesUuid: product.seriesUUID,
    title: product.title,
    articleName: product.articleName,
    supplierRef: product.supplierRef,
    supplierId: product.supplierId,
    hmsArtNr: product.hmsArtNr ?? "",
    agreementId: delkontraktToUpdate.agreementId,
    reference: product.supplierRef,
    status: "INACTIVE",
    createdBy: "REGISTER",
    created: agreementToUpdate.created,
    updated: todayTimestamp(),
    rank: 1,
    post: post,
    postId: delkontraktToUpdate.id,
    published: agreementToUpdate.published,
    expired: agreementToUpdate.expired,
    updatedByUser: agreementToUpdate.updatedByUser,
    updatedBy: agreementToUpdate.updatedBy,
    accessory: product.accessory,
    sparePart: product.sparePart,
    mainProduct: product.mainProduct,
  }));

  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/batch`,
    "POST",
    productAgreementsToAdd,
  );
};

const getEditedProductAgreements = (
  productAgreementsToEdit: ProductAgreementRegistrationDTO[],
  newRanking: number,
): ProductAgreementRegistrationDTO[] => {
  return productAgreementsToEdit.map((productAgreement) => {
    return {
      ...productAgreement,
      rank: newRanking,
      updated: todayTimestamp(),
    };
  });
};

const getProductAgreementsWithUpdatedDates = (
  productAgreementsToEdit: ProductAgreementRegistrationDTO[],
  editProductAgreementDatesFormDataDto: EditProductAgreementDatesFormDataDto,
): ProductAgreementRegistrationDTO[] => {
  return productAgreementsToEdit.map((productAgreement) => {
    return {
      ...productAgreement,
      published: editProductAgreementDatesFormDataDto.published,
      expired: editProductAgreementDatesFormDataDto.expired,
      updated: todayTimestamp(),
    };
  });
};
