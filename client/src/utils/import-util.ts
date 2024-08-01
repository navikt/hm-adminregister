import { ProductAgreementRegistrationDTO, SeriesRegistrations } from "utils/types/response-types";
import _ from "lodash";

export const groupProductAgreementsBySeries = (
  productAgreements: ProductAgreementRegistrationDTO[],
  newSeriesRegistrations: SeriesRegistrations,
): GroupedProductAgreements => {
  const groupedProductAgreements: ProductAgreementRegistrationDTOGroupedBySeries[] = [];

  const groupedBySeries = _.groupBy(productAgreements, "seriesUuid");

  let newHovedprodukts = 0;
  let newSpareParts = 0;
  let newAccessories = 0;

  Object.entries(groupedBySeries).forEach(([key, variants]) => {
    if (variants.length > 0) {
      const firstProductAgreement = variants[0];
      const newSeries = newSeriesRegistrations.find((series) => series.id === firstProductAgreement.seriesUuid);
      if (newSeries && firstProductAgreement.sparePart) {
        newSpareParts++;
      } else if (newSeries && firstProductAgreement.accessory) {
        newAccessories++;
      } else if (newSeries && !firstProductAgreement.sparePart && !firstProductAgreement.accessory) {
        newHovedprodukts++;
      }
      const productAgreementGroup: ProductAgreementRegistrationDTOGroupedBySeries = {
        seriesUuid: firstProductAgreement.seriesUuid ? firstProductAgreement.seriesUuid : undefined,
        title: newSeries?.title || firstProductAgreement.title,
        accessory: firstProductAgreement.accessory,
        sparePart: firstProductAgreement.sparePart,
        newProduct: newSeries != null,
        variants: [...variants],
      };
      groupedProductAgreements.push(productAgreementGroup);
    }
  });

  return {
    groupedProductAgreements: groupedProductAgreements,
    newHovedprodukts: newHovedprodukts,
    newSpareParts: newSpareParts,
    newAccessories: newAccessories,
  };
};

export interface GroupedProductAgreements {
  newHovedprodukts: number;
  newSpareParts: number;
  newAccessories: number;
  groupedProductAgreements?: ProductAgreementRegistrationDTOGroupedBySeries[];
}

export interface ProductAgreementRegistrationDTOGroupedBySeries {
  seriesUuid?: string;
  title?: string;
  accessory: boolean;
  sparePart: boolean;
  newProduct: boolean;
  variants: ProductAgreementRegistrationDTO[];
}
