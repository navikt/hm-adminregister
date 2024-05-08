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
import { Upload } from "produkter/tabs/UploadModal";

export const mapImagesAndPDFfromMedia = (
  products: ProductRegistrationDTO[],
): { images: MediaInfoDTO[]; pdfs: MediaInfoDTO[]; videos: MediaInfoDTO[] } => {
  const seen: { [uri: string]: boolean } = {};
  const pdfs: MediaInfoDTO[] = [];
  const images: MediaInfoDTO[] = [];
  const videos: MediaInfoDTO[] = [];

  products
    .flatMap((product: ProductRegistrationDTO) => product.productData.media)
    .filter((media: MediaInfoDTO | null) => media !== null) // Filter out null media
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

export const removeFileFromProduct = (
  productToEdit: ProductRegistrationDTO,
  uriToRemove: string,
): ProductRegistrationDTO => {
  const filteredMedia = productToEdit.productData.media.filter((file) => file && file.uri && file.uri !== uriToRemove);
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: filteredMedia,
    },
  };
};

export const editFileTextOnProduct = (
  productToEdit: ProductRegistrationDTO,
  editedText: string,
  uri: string,
): ProductRegistrationDTO => {
  const mediaIndex = productToEdit.productData.media.findIndex((media) => media.uri === uri);

  if (mediaIndex !== -1) {
    const updatedMedia = [
      ...productToEdit.productData.media.slice(0, mediaIndex), // Keep media before the updated one
      {
        ...productToEdit.productData.media[mediaIndex],
        text: editedText, // Update the text property
      },
      ...productToEdit.productData.media.slice(mediaIndex + 1), // Keep media after the updated one
    ];

    // Return a new ProductRegistrationDTO object with updated media
    return {
      ...productToEdit,
      productData: {
        ...productToEdit.productData,
        media: updatedMedia,
      },
    };
  } else {
    return productToEdit;
  }
};

export const mapToMediaInfo = (mediaDTO: MediaDTO[], uploads?: Upload[]): MediaInfo[] => {
  return mediaDTO.map((media, i) => {
    //Text is either the original filename, else its the edited filename chose by the user.
    let text = media.filename;

    if (uploads) {
      const matchingUpload = uploads.find((upload) => upload.file.name === media.filename);
      if (matchingUpload && matchingUpload.editedFileName) {
        text = matchingUpload.editedFileName;
      }
    }

    return {
      sourceUri: media.sourceUri,
      uri: media.uri,
      text: text,
      filename: media.filename,
      priority: i + 1,
      type: media.type,
      source: media.source,
      updated: media.updated,
    };
  });
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
