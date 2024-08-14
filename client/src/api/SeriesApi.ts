import { fetchAPI, getPath } from "api/fetch";
import { MediaInfoDTO, RejectSeriesDTO, SeriesDraftWithDTO, SeriesRegistrationDTO } from "utils/types/response-types";

export const sendSeriesToApproval = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/serie-til-godkjenning/${seriesUUID}`), "PUT");
};

export const setPublishedSeriesToDraft = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/series_to-draft/${seriesUUID}`), "PUT");
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
  return await fetchAPI(getPath(true, `/api/v1/series/reject/${seriesUUID}`), "PUT", rejectSeriesDTO);
};

export const draftNewSeries = async (seriesDraftWith: SeriesDraftWithDTO): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/draftWith`), "POST", seriesDraftWith);
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

export const updateProductTitle = async (
  seriesUUID: string,
  productTitle: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.title = productTitle;
    return series;
  });
};

export const updateProductDescription = async (
  seriesUUID: string,
  productDescription: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.text = productDescription;
    return series;
  });
};

export const updateSeriesMedia = async (
  seriesUUID: string,
  mediaInfoBody: MediaInfoDTO[],
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.seriesData.media = mediaInfoBody;
    return series;
  });
};

export const updateSeriesKeywords = async (
  seriesUUID: string,
  keywords: string[],
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.seriesData.attributes.keywords = keywords;
    return series;
  });
};

export const updateSeriesURL = async (
  seriesUUID: string,
  url: string,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.seriesData.attributes.url = url;
    return series;
  });
};

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
