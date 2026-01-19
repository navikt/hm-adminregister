import { fetchAPI, fetchAPIModify, fetchPostFiles, getPath } from "api/fetch";
import {
  FileTitleDto,
  MediaSort,
  NewDocumentUrl,
  NewVideo,
  RejectSeriesDTO,
  SeriesDraftResponse,
  SeriesDraftWithDTO,
  SeriesDTO,
  SeriesSearchDTO,
  UpdateSeriesRegistrationDTO,
} from "utils/types/response-types";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { FileUpload } from "felleskomponenter/UploadModal";
import { HM_REGISTER_URL } from "environments";
import { useAuthStore } from "utils/store/useAuthStore";

export const requestApproval = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(getPath(false, `/api/v1/series/request-approval/${seriesUUID}`), "PUT");
};

export const getSeriesBySeriesId = async (seriesUUID: string): Promise<SeriesDTO> => {
  const seriesIdPath = `${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}`;
  return await fetchAPI(seriesIdPath, "GET");
};

export const getSeriesByVariantId = async (variantId: string): Promise<SeriesSearchDTO> => {
  const encodedVariantId = encodeURIComponent(variantId);
  const seriesIdPath = `${HM_REGISTER_URL()}/admreg/api/v1/series/variant-id/${encodedVariantId}`;
  return await fetchAPI(seriesIdPath, "GET");
};

export const setPublishedSeriesToDraft = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/series_to-draft/${seriesUUID}`, "PUT");
};

export const setSeriesToInactive = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/series-to-inactive/${seriesUUID}`, "PUT");
};

export const setSeriesToActive = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/series-to-active/${seriesUUID}`, "PUT");
};

export const approveSeries = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(getPath(true, `/api/v1/series/approve-v2/${seriesUUID}`), "PUT");
};

export const approveMultipleSeries = async (seriesIds: string[]): Promise<void> => {
  return await fetchAPIModify(getPath(true, `/api/v1/series/approve-multiple`), "PUT", seriesIds);
};

export const changeMainProductToPart = async (
  seriesUUID: string,
  accessory: boolean,
  newIsoCode: string,
  resetTechnicalData: boolean,
): Promise<void> => {
  return await fetchAPIModify(getPath(true, `/api/v1/series/toPart/${seriesUUID}`), "PUT", {
    accessory: accessory,
    newIsoCode: newIsoCode,
    resetTechnicalData: resetTechnicalData,
  });
};

export const rejectSeries = async (seriesUUID: string, rejectSeriesDTO: RejectSeriesDTO): Promise<void> => {
  return await fetchAPIModify(getPath(true, `/api/v1/series/reject-v2/${seriesUUID}`), "PUT", rejectSeriesDTO);
};

export const draftNewSeries = async (
  seriesDraftWith: SeriesDraftWithDTO,
  supplierId: string,
): Promise<SeriesDraftResponse> => {
  return await fetchAPI(
    `${HM_REGISTER_URL()}/admreg/api/v1/series/supplier/${supplierId}/draftWith`,
    "POST",
    seriesDraftWith,
  );
};

export const moveProductsToSeries = async (seriesUUID: string, productIds: string[]): Promise<void> => {
  return await fetchAPIModify(getPath(true, `/api/v1/series/series/products/move-to/${seriesUUID}`), "PUT", {
    productIds: productIds,
  });
};

export const updateSeriesMediaPriority = async (seriesUUID: string, media: MediaSort[]): Promise<void> =>
  await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/update-media-priority/${seriesUUID}`, "PUT", media);

export const deleteFileFromSeries = async (seriesUUID: string, fileURI: string): Promise<void> =>
  await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/delete-media/${seriesUUID}`, "DELETE", [fileURI]);

export const saveVideoToSeries = async (seriesUUID: string, newVideo: NewVideo) => {
  await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/add-videos/${seriesUUID}`, "PUT", [newVideo]);
};

export const changeFilenameOnAttachedFile = async (seriesUUID: string, fileTitleDto: FileTitleDto) => {
  await fetchAPIModify(
    `${HM_REGISTER_URL()}/admreg/api/v1/series/change-file-title/${seriesUUID}`,
    "PUT",
    fileTitleDto,
  );
};

export const deleteSeries = async (seriesUUID: string): Promise<void> => {
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}`, "DELETE");
};

export function useSeriesV2(seriesUUID: string) {
  return useSWR<SeriesDTO>(`${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}`, fetcherGET);
}

export function useSeriesV2Conditional(seriesUUID?: string) {
  const loggedInUser = useAuthStore().loggedInUser;
  if (loggedInUser?.isHmsUser) {
    return useSWR<SeriesDTO>(
      seriesUUID ? `${HM_REGISTER_URL()}/admreg/hms/api/v1/series/${seriesUUID}` : null,
      fetcherGET,
    );
  } else {
    return useSWR<SeriesDTO>(seriesUUID ? `${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}` : null, fetcherGET);
  }
}

export const uploadFilesToSeries = async (seriesUUID: string, uploads: FileUpload[]) => {
  const formData = new FormData();
  if (uploads[0].file.type === "application/pdf") {
    renameFiles(uploads).forEach((upload) => formData.append("files", upload.file));
  } else {
    uploads.forEach((upload) => formData.append("files", upload.file));
  }

  return await fetchPostFiles(`${HM_REGISTER_URL()}/admreg/api/v1/series/upload-media/${seriesUUID}`, formData);
};

const renameFiles = (uploads: FileUpload[]) =>
  uploads.map((it) =>
    it.editedFileName && it.editedFileName.length > 0
      ? { ...it, file: new File([it.file], `${it.editedFileName}.pdf`, { type: it.file.type }) }
      : it,
  );

const updateSeries = async (seriesUUID: string, update: UpdateSeriesRegistrationDTO): Promise<void> => {
  const nullUpdate: UpdateSeriesRegistrationDTO = { title: null, text: null, keywords: null, url: null };
  const toUpdate: UpdateSeriesRegistrationDTO = { ...nullUpdate, ...update };
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}`, "PATCH", toUpdate);
};

export const updateProductTitle = async (seriesUUID: string, productTitle: string): Promise<void> =>
  updateSeries(seriesUUID, { title: productTitle });

export const updateProductIsoCategory = async (
  seriesUUID: string,
  isoCategory: string,
  resetTechnicalData: boolean,
): Promise<void> => updateSeries(seriesUUID, { isoCategory: isoCategory, resetTechnicalData: resetTechnicalData });

export const updateProductDescription = async (seriesUUID: string, productDescription: string): Promise<void> =>
  updateSeries(seriesUUID, { text: productDescription });

export const updateSeriesKeywords = async (seriesUUID: string, keywords: string[]): Promise<void> =>
  updateSeries(seriesUUID, { keywords: keywords });

export const saveDocumentUrlToSeries = async (seriesUUID: string, newDocumentUrl: NewDocumentUrl) => {
  await fetchAPIModify(
    `${HM_REGISTER_URL()}/admreg/api/v1/series/add-document-url/${seriesUUID}`,
    "PUT",
    newDocumentUrl,
  );
};

export const deleteDocumentUrlFromSeries = async (seriesUUID: string, documentUrl: string) => {
  await fetchAPIModify(
    `${HM_REGISTER_URL()}/admreg/api/v1/series/add-document-url/${seriesUUID}`,
    "DELETE",
    documentUrl,
  );
};

export const updateSeriesURL = async (seriesUUID: string, url: string): Promise<void> =>
  updateSeries(seriesUUID, { url: url });
