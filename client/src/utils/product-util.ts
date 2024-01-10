import { MediaDTO, MediaInfo, ProductRegistrationDTO } from './response-types'

export const mapImagesAndPDFfromMedia = (
  products: ProductRegistrationDTO[],
): { images: MediaInfo[]; pdfs: MediaInfo[] } => {
  const seen: { [uri: string]: boolean } = {}
  const pdfs: MediaInfo[] = []
  const images: MediaInfo[] = []
  products
    .flatMap((product: ProductRegistrationDTO) => product.productData.media)
    .map((media: MediaInfo) => {
      if (media.type == 'IMAGE' && media.uri && !seen[media.uri]) {
        images.push(media)
      }
      if (media.type == 'PDF' && media.uri && !seen[media.uri]) {
        pdfs.push(media)
      }
      seen[media.uri] = true
    })

  return {
    images: images,
    pdfs: pdfs,
  }
}

export function getAllUniqueTechDataKeys(products: ProductRegistrationDTO[]): string[] {
  const uniqueKeys = new Set<string>()
  products
    .flatMap((product) => product.productData.techData.map((techData) => techData.key))
    .forEach((key) => uniqueKeys.add(key))

  return Array.from(uniqueKeys)
}

export const getEditedProductDTOAddFiles = (
  productToEdit: ProductRegistrationDTO,
  files: MediaInfo[],
): ProductRegistrationDTO => {
  const oldAndNewfiles = productToEdit.productData.media.concat(files)
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: oldAndNewfiles,
    },
  }
}

export const getEditedProductDTORemoveFiles = (
  productToEdit: ProductRegistrationDTO,
  fileToRemoveUri: string,
): ProductRegistrationDTO => {
  const filteredFiles = productToEdit.productData.media.filter((file) => file.uri !== fileToRemoveUri)
  return {
    ...productToEdit,
    productData: {
      ...productToEdit.productData,
      media: filteredFiles,
    },
  }
}

export const mapToMediaInfo = (mediaDTO: MediaDTO[], files: File[]): MediaInfo[] => {
  return mediaDTO.map((media, i) => ({
    sourceUri: media.sourceUri,
    uri: media.uri,
    //La brukeren sette prioritet selv senere
    //Legge til text også når brukeren kan skrive inn bildebeskrivelse
    text: media.filename,
    priority: i + 1,
    type: media.type,
    source: media.source,
    updated: media.updated,
  }))
}
