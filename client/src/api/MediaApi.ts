import { MediaDTO, MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { fetchAPI, fetchAPIAttachment, getPath } from "api/fetch";
import { mapToMediaInfo } from "utils/product-util";

export const uploadFilesToSeries = async (seriesUUID: string, isAdmin: boolean, formData: FormData) => {
  const mediaDTOs: MediaDTO[] = await fetchAPIAttachment(
    getPath(isAdmin, `/api/v1/media/series/files/${seriesUUID}`),
    "POST",
    formData,
  );

  const seriesToUpdate = await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesUUID}`), "GET");
  const editedSeriesRegistrationDTO = getEditedSeriesDTOAddMedia(seriesToUpdate, mapToMediaInfo(mediaDTOs));
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesToUpdate.id}`), "PUT", editedSeriesRegistrationDTO);
};

export const getEditedSeriesDTOAddMedia = (
  seriesToEdit: SeriesRegistrationDTO,
  media: MediaInfoDTO[],
): SeriesRegistrationDTO => {
  const oldAndNewfiles = seriesToEdit.seriesData.media.concat(media);

  return {
    ...seriesToEdit,
    seriesData: {
      ...seriesToEdit.seriesData,
      media: oldAndNewfiles,
    },
  };
};
