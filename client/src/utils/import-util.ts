import { ProductAgreementRegistrationDTO } from "utils/types/response-types";
import _ from "lodash";

export const generateImportData = (productAgreements: ProductAgreementRegistrationDTO[]): ImportData => {
  let groupedProductAgreements: ProductAgreementRegistrationDTOGroupedBySeries[] = [];
  let productAgreementsWithNoSeries: ProductAgreementRegistrationDTO[] = [];

  const groupedBySeries = _.groupBy(productAgreements, "seriesUuid");

  const uniqueAgreements = _.uniqBy(productAgreements, "agreementId");

  // let agreementDict: Map<string, AgreementRegistrationDTO> = new Map<string, AgreementRegistrationDTO>();
  // uniqueAgreements.forEach((value) => {
  //   getAgreement(value.agreementId).then((agreement) => {
  //     agreementDict.set(value.agreementId, agreement);
  //   });
  // });

  let numberOfProductAgreementsWithoutSeriesUUID = 0;
  let numberOfProductAgreementsWithoutProductId = 0;

  Object.entries(groupedBySeries).forEach(([key, variants]) => {
    if (key === "undefined" || !key) {
      productAgreementsWithNoSeries = productAgreementsWithNoSeries.concat(variants);
    } else if (variants.length > 0) {
      const firstProductAgreement = variants[0];
      const productAgreementGroup: ProductAgreementRegistrationDTOGroupedBySeries = {
        seriesUuid: firstProductAgreement.seriesUuid ? firstProductAgreement.seriesUuid : undefined,
        title: firstProductAgreement.title ? firstProductAgreement.title : undefined,
        variants: [...variants],
      };
      groupedProductAgreements.push(productAgreementGroup);
    }

    variants.forEach((variant) => {
      if (!variant.seriesUuid) {
        numberOfProductAgreementsWithoutSeriesUUID += 1;
      }
      if (!variant.productId) {
        numberOfProductAgreementsWithoutProductId += 1;
      }
    });
  });

  return {
    numberOfProductAgreements: productAgreements.length,
    numberOfProductAgreementsWithoutSeriesUUID: numberOfProductAgreementsWithoutSeriesUUID,
    numberOfProductAgreementsWithoutProductId: numberOfProductAgreementsWithoutProductId,
    groupedProductAgreements: groupedProductAgreements,
    productAgreementsWithNoSeries: productAgreementsWithNoSeries,
  };
};

export interface ImportData {
  numberOfProductAgreements: number;
  numberOfProductAgreementsWithoutSeriesUUID: number;
  numberOfProductAgreementsWithoutProductId: number;
  groupedProductAgreements?: ProductAgreementRegistrationDTOGroupedBySeries[];
  productAgreementsWithNoSeries?: ProductAgreementRegistrationDTO[];
}

export interface ProductAgreementRegistrationDTOGroupedBySeries {
  seriesUuid?: string;
  title?: string;
  agreementName?: string;
  variants: ProductAgreementRegistrationDTO[];
}
