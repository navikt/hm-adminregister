import { MediaDTO, MediaInfo, ProductRegistrationDTO, TechData } from "./types/response-types";
import { Product } from "utils/types/types";
import * as _ from "lodash";

export function getAllUniqueTechDataKeys(products: ProductRegistrationDTO[]): string[] {
  const uniqueKeys = new Set<string>();
  products
    .flatMap((product) => product.productData.techData.map((techData) => techData.key))
    .forEach((key) => uniqueKeys.add(key));

  return Array.from(uniqueKeys);
}

export const mapToMediaInfo = (mediaDTO: MediaDTO[]): MediaInfo[] => {
  return mediaDTO.map((media, i) => ({
    sourceUri: media.sourceUri,
    uri: media.uri,
    //Text-feltet brukes foreløpig til tittelen vi ønsker å vise i GUI. Bør lage et eget felt for alt-text på bilder
    text: media.filename,
    filename: media.filename,
    //La brukeren sette prioritet selv senere
    priority: i + 1,
    type: media.type,
    source: media.source,
    updated: media.updated,
  }));
};

export const mapProductRegistrationDTOToProduct = (productRegistrationDtos: ProductRegistrationDTO[]): Product[] => {
  const groupedBySeries = _.groupBy(productRegistrationDtos, "seriesUUID");

  const mappedProducts: Product[] = [];

  Object.entries(groupedBySeries).forEach(([_, dtos]) => {
    if (dtos.length > 0) {
      const firstProduct = dtos[0];
      const product: Product = {
        id: firstProduct.seriesUUID?.toString(),
        title: firstProduct.title,
        accessory: firstProduct.accessory,
        agreements: [],
        attributes: {
          text: firstProduct.productData.attributes.text ? firstProduct.productData.attributes.text : "",
          series: firstProduct.productData.attributes.series ? firstProduct.productData.attributes.series : "",
          bestillingsordning: firstProduct.productData.attributes.bestillingsordning
            ? firstProduct.productData.attributes.bestillingsordning
            : undefined,
          compatibleWith: firstProduct.productData.attributes.compatibleWidth?.seriesIds
            ? firstProduct.productData.attributes.compatibleWidth.seriesIds
            : [],
          shortdescription: firstProduct.productData.attributes.shortdescription
            ? firstProduct.productData.attributes.shortdescription
            : "",
        },
        compareData: { techDataRange: {}, agreementRank: null },
        isoCategory: firstProduct.isoCategory,
        isoCategoryText: "",
        isoCategoryTitle: "",
        sparepart: firstProduct.sparePart,
        supplierId: firstProduct.supplierId?.toString(),
        variantCount: dtos.length,
        variants: dtos.map((dto) => {
          return {
            id: dto.id,
            hmsArtNr: dto.hmsArtNr ? dto.hmsArtNr : null,
            supplierRef: dto.supplierRef,
            articleName: dto.articleName,
            techData: Object.assign(
              {},
              ...dto.productData.techData
                .filter((data: TechData) => data.key && data.value)
                .map((data: TechData) => ({ [data.key]: { value: data.value, unit: data.unit } })),
            ),
            hasAgreement: false,
            filters: {},
            expired: dto.expired ? dto.expired : "",
            agreements: [],
          };
        }),
      };
      mappedProducts.push(product);
    }
  });

  return mappedProducts;
};
