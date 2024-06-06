import { EditSeriesInfo } from "produkter/Produkt";
import { SeriesDraftWithDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { fetchAPI, getPath } from "api/fetch";

export const sendSeriesToApproval = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/serie-til-godkjenning/${seriesUUID}`), "PUT");
};

export const setPublishedSeriesToDraft = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(false, `/api/v1/series/series_to-draft/${seriesUUID}`), "PUT");
};

export const approveSeries = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/approve/${seriesUUID}`), "PUT");
};

export const rejectSeries = async (seriesUUID: string): Promise<SeriesRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/reject/${seriesUUID}`), "PUT");
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

export const updateSeries = async (
  seriesUUID: string,
  editSeriesInfo: EditSeriesInfo,
  isAdmin: boolean,
): Promise<SeriesRegistrationDTO> => {
  return updateSeriesData(seriesUUID, isAdmin, (series) => {
    series.title = editSeriesInfo.title ? editSeriesInfo.title : series.title;
    series.isoCategory = editSeriesInfo.isoCode ? editSeriesInfo.isoCode : series.isoCategory;
    series.text = editSeriesInfo.description ? editSeriesInfo.description : series.text;

    if (editSeriesInfo.url?.length === 0) {
      series.seriesData.attributes.url = undefined;
    } else {
      series.seriesData.attributes.url = editSeriesInfo.url ? editSeriesInfo.url : series.seriesData.attributes.url;
    }

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
