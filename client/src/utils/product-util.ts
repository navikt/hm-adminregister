import {
  MediaDTO,
  MediaInfo,
  MediaInfoDTO,
  ProductRegistrationDTO,
  ProductToApproveDto,
  TechData,
} from "./types/response-types";
import { Product, ProductToApprove } from "utils/types/types";
import * as _ from "lodash";
import { DocumentType } from "produkter/DocumentsTab";

export const mapImagesAndPDFfromMedia = (
  products: ProductRegistrationDTO[],
): { images: MediaInfoDTO[]; pdfs: MediaInfoDTO[]; videos: MediaInfoDTO[] } => {
  const seen: { [uri: string]: boolean } = {};
  const pdfs: MediaInfoDTO[] = [];
  const images: MediaInfoDTO[] = [];
  const videos: MediaInfoDTO[] = [];
  products
    .flatMap((product: ProductRegistrationDTO) => product.productData.media)
    .map((media: MediaInfoDTO) => {
      if (media.type === "IMAGE" && media.uri && !seen[media.uri]) {
        images.push(media);
      }
      if (media.type === "PDF" && media.uri && !seen[media.uri]) {
        pdfs.push(media);
      }
      if (media.type === "VIDEO" && media.source === "EXTERNALURL" && media.uri && !seen[media.uri]) {
        videos.push(media);
      }
      seen[media.uri] = true;
    });

  return {
    images: images,
    pdfs: pdfs,
    videos: videos,
  };
};

export function getAllUniqueTechDataKeys(products: ProductRegistrationDTO[]): string[] {
  const uniqueKeys = new Set<string>();
  products
    .flatMap((product) => product.productData.techData.map((techData) => techData.key))
    .forEach((key) => uniqueKeys.add(key));

  return Array.from(uniqueKeys);
}

export const getEditedProductDTOAddMedia = (
  productToEdit: ProductRegistrationDTO,
  media: MediaInfoDTO[],
): ProductRegistrationDTO => {
  const oldAndNewfiles = productToEdit.productData.media.concat(media);

  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: oldAndNewfiles,
    },
  };
};

export const getEditedProductDTORemoveMedia = (
  productToEdit: ProductRegistrationDTO,
  uriToRemove: string,
): ProductRegistrationDTO => {
  const filteredMedia = productToEdit.productData.media.filter((file) => file.uri !== uriToRemove);
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: filteredMedia,
    },
  };
};

export const mapToMediaInfo = (mediaDTO: MediaDTO[], documentType?: DocumentType): MediaInfo[] => {
  return mediaDTO.map((media, i) => ({
    sourceUri: media.sourceUri,
    uri: media.uri,
    //Text-feltet brukes foreløpig til tittelen vi ønsker å vise i GUI. Bør lage et eget felt for alt-text på bilder
    text:
      media.type === "IMAGE" || (media.type === "PDF" && documentType === "other")
        ? media.filename
        : documentType === "brochure"
          ? "Brosjyre"
          : "Bruksanvisning",
    filename: media.filename,
    //La brukeren sette prioritet selv senere
    priority: i + 1,
    type: media.type,
    source: media.source,
    updated: media.updated,
  }));
};

export const mapProductToApproveDtoToProductToApprove = (
  productToApproveDtos: ProductToApproveDto[],
): ProductToApprove[] => {
  const groupedBySeries = _.groupBy(productToApproveDtos, "seriesId");

  const mappedProductsToApprove: ProductToApprove[] = [];

  Object.entries(groupedBySeries).forEach(([key, dtos]) => {
    if (dtos.length > 0) {
      const productToApprove: ProductToApprove = {
        seriesId: key,
        title: dtos[0].title,
        articleName: dtos[0].articleName,
        agreementId: dtos[0].agreementId,
        delkontrakttittel: dtos[0].delkontrakttittel,
        status: dtos[0].status,
        supplierName: dtos[0].supplierName,
        thumbnail: dtos[0].thumbnail,
      };
      mappedProductsToApprove.push(productToApprove);
    }
  });

  return mappedProductsToApprove;
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
        accessory: firstProduct.productData.accessory,
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
        sparepart: firstProduct.productData.sparePart,
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
