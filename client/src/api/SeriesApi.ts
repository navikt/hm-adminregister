import { fetchAPI, fetchAPIModify, fetchPostFiles, getPath } from "api/fetch";
import {
  MediaSort,
  RejectSeriesDTO,
  SeriesDraftWithDTO,
  SeriesRegistrationDTO,
  SeriesRegistrationDTOV2,
  UpdateSeriesRegistrationDTO,
} from "utils/types/response-types";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { FileUpload } from "felleskomponenter/UploadModal";
import { HM_REGISTER_URL } from "environments";

export const requestApproval = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/request-approval/${seriesUUID}`), "PUT");
};

export const getSeriesBySeriesId = async (seriesUUID: string): Promise<SeriesRegistrationDTOV2> => {
  const seriesIdPath = getPath(true, `/api/v1/series/v2/${seriesUUID}`);
  return await fetchAPI(seriesIdPath, "GET");
};

export const setPublishedSeriesToDraft = async (
  isAdmin: boolean,
  seriesUUID: string,
): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/series_to-draft/${seriesUUID}`), "PUT");
};

export const setSeriesToInactive = async (seriesUUID: string, isAdmin: boolean): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/series-to-inactive/${seriesUUID}`), "PUT");
};

export const setSeriesToActive = async (seriesUUID: string, isAdmin: boolean): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/series-to-active/${seriesUUID}`), "PUT");
};

export const approveSeries = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/approve-v2/${seriesUUID}`), "PUT");
};

export const approveMultipleSeries = async (seriesIds: string[]): Promise<SeriesRegistrationDTO[]> => {
  return await fetchAPI(getPath(true, `/api/v1/series/approve-multiple`), "PUT", seriesIds);
};

export const rejectSeries = async (
  seriesUUID: string,
  rejectSeriesDTO: RejectSeriesDTO,
): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/reject-v2/${seriesUUID}`), "PUT", rejectSeriesDTO);
};

export const draftNewSeries = async (seriesDraftWith: SeriesDraftWithDTO): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/draftWith`), "POST", seriesDraftWith);
};

export const draftNewSeriesForAdmin = async (
  seriesDraftWith: SeriesDraftWithDTO,
  supplierId: string,
): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/supplier/${supplierId}/draftWith`), "POST", seriesDraftWith);
};

export const moveProductsToSeries = async (
  seriesUUID: string,
  productIds: string[],
): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/series/products/move-to/${seriesUUID}`), "PUT", {
    productIds: productIds,
  });
};

const updateSeriesData = async (
  seriesUUID: string,
  isAdmin: boolean,
  modifySeriesData: (series: SeriesRegistrationDTO) => SeriesRegistrationDTO,
): Promise<SeriesRegistrationDTO> => {
  const seriesToUpdate = await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesUUID}`), "GET");
  const updatedSeriesData = modifySeriesData(seriesToUpdate);
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesToUpdate.id}`), "PUT", updatedSeriesData);
};

export const updateSeriesMediaPriority = async (
  seriesUUID: string,
  media: MediaSort[],
  isAdmin: boolean,
): Promise<any> =>
  await fetchAPIModify(getPath(isAdmin, `/api/v1/series/update-media-priority/${seriesUUID}`), "PUT", media);

export const deleteFileFromSeries = async (seriesUUID: string, isAdmin: boolean, fileURI: string) => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.seriesData.media = series.seriesData.media.filter((file) => file.uri !== fileURI);
    return series;
  });
};

export const saveVideoToSeries = async (seriesUUID: string, isAdmin: boolean, url: string, title: string) => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.seriesData.media.push({
      sourceUri: "",
      uri: url,
      priority: 0,
      type: "VIDEO",
      text: title,
      source: "EXTERNALURL",
    });
    return series;
  });
};

export const changeFilenameOnAttachedFile = async (
  seriesUUID: string,
  isAdmin: boolean,
  uri: string,
  editedText: string,
) => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    const mediaIndex = series.seriesData.media.findIndex((media) => media.uri === uri);
    if (mediaIndex !== -1) {
      series.seriesData.media[mediaIndex].text = editedText;
    }
    return series;
  });
};

export const deleteSeries = async (isAdmin: boolean, seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesUUID}`), "DELETE");
};

export function useSeriesV2(seriesUUID: string) {
  return useSWR<SeriesRegistrationDTOV2>(`${HM_REGISTER_URL()}/admreg/api/v1/series/${seriesUUID}`, fetcherGET);
}

export const uploadFilesToSeries = async (seriesUUID: string, isAdmin: boolean, uploads: FileUpload[]) => {
  const formData = new FormData();
  if (uploads[0].file.type === "application/pdf") {
    renameFiles(uploads).forEach((upload) => formData.append("files", upload.file));
  } else {
    uploads.forEach((upload) => formData.append("files", upload.file));
  }

  return await fetchPostFiles(getPath(isAdmin, `/api/v1/series/uploadMedia/${seriesUUID}`), formData);
};

const renameFiles = (uploads: FileUpload[]) =>
  uploads.map((it) =>
    it.editedFileName && it.editedFileName.length > 0
      ? { ...it, file: new File([it.file], `${it.editedFileName}.pdf`, { type: it.file.type }) }
      : it,
  );

export const updateSeriesV2 = async (
  seriesUUID: string,
  isAdmin: boolean,
  update: UpdateSeriesRegistrationDTO,
): Promise<SeriesRegistrationDTO> => {
  const nullUpdate: UpdateSeriesRegistrationDTO = { title: null, text: null, keywords: null, url: null };
  const toUpdate: UpdateSeriesRegistrationDTO = { ...nullUpdate, ...update };
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/v2/${seriesUUID}`), "PATCH", toUpdate);
};

export const updateProductTitleV2 = async (
  seriesUUID: string,
  productTitle: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => updateSeriesV2(seriesUUID, isAdmin, { title: productTitle });

export const updateProductDescriptionV2 = async (
  seriesUUID: string,
  productDescription: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => updateSeriesV2(seriesUUID, isAdmin, { text: productDescription });

export const updateSeriesKeywordsV2 = async (
  seriesUUID: string,
  keywords: string[],
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => updateSeriesV2(seriesUUID, isAdmin, { keywords: keywords });

export const updateSeriesURLV2 = async (
  seriesUUID: string,
  url: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => updateSeriesV2(seriesUUID, isAdmin, { url: url });
