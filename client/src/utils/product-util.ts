import { MediaDTO, MediaInfo, ProductRegistrationDTO, ProductToApproveDto, TechData } from "./types/response-types";
import { Product, ProductToApprove } from "utils/types/types";
import * as _ from "lodash";

export const mapImagesAndPDFfromMedia = (
  products: ProductRegistrationDTO[],
): { images: MediaInfo[]; pdfs: MediaInfo[] } => {
  const seen: { [uri: string]: boolean } = {};
  const pdfs: MediaInfo[] = [];
  const images: MediaInfo[] = [];
  products
    .flatMap((product: ProductRegistrationDTO) => product.productData.media)
    .map((media: MediaInfo) => {
      if (media.type == "IMAGE" && media.uri && !seen[media.uri]) {
        images.push(media);
      }
      if (media.type == "PDF" && media.uri && !seen[media.uri]) {
        pdfs.push(media);
      }
      seen[media.uri] = true;
    });

  return {
    images: images,
    pdfs: pdfs,
  };
};

export function getAllUniqueTechDataKeys(products: ProductRegistrationDTO[]): string[] {
  const uniqueKeys = new Set<string>();
  products
    .flatMap((product) => product.productData.techData.map((techData) => techData.key))
    .forEach((key) => uniqueKeys.add(key));

  return Array.from(uniqueKeys);
}

export const getEditedProductDTOAddFiles = (
  productToEdit: ProductRegistrationDTO,
  files: MediaInfo[],
): ProductRegistrationDTO => {
  const oldAndNewfiles = productToEdit.productData.media.concat(files);
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: oldAndNewfiles,
    },
  };
};

export const getEditedProductDTORemoveFiles = (
  productToEdit: ProductRegistrationDTO,
  fileToRemoveUri: string,
): ProductRegistrationDTO => {
  const filteredFiles = productToEdit.productData.media.filter((file) => file.uri !== fileToRemoveUri);
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: filteredFiles,
    },
  };
};

export const mapToMediaInfo = (mediaDTO: MediaDTO[], files: File[]): MediaInfo[] => {
  return mediaDTO.map((media, i) => ({
    sourceUri: media.sourceUri,
    uri: media.uri,
    //La brukeren sette prioritet selv senere
    //Legge til text også når brukeren kan skrive inn bildebeskrivelse
    text: media.filename,
    filename: media.filename,
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

  Object.entries(groupedBySeries).forEach(([key, dtos]) => {
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
