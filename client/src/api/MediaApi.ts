import { MediaDTO, MediaInfo, MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { fetchAPI, fetchAPIAttachment, getPath } from "api/fetch";
import { FileUpload } from "produkter/tabs/UploadModal";

export const uploadFilesToSeries = async (seriesUUID: string, isAdmin: boolean, uploads: FileUpload[]) => {
  const formData = new FormData();
  for (const upload of uploads) {
    formData.append("files", upload.file);
  }

  const createdMediaDTOs: MediaDTO[] = await fetchAPIAttachment(
    getPath(isAdmin, `/api/v1/media/series/files/${seriesUUID}`),
    "POST",
    formData,
  );

  const seriesToUpdate = await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesUUID}`), "GET");

  const mediaInfos = mapToMediaInfoWithFilename(createdMediaDTOs, uploads);

  const editedSeriesRegistrationDTO = getEditedSeriesDTOAddMedia(seriesToUpdate, mediaInfos);
  return await fetchAPI(getPath(isAdmin, `/api/v1/series/${seriesToUpdate.id}`), "PUT", editedSeriesRegistrationDTO);
};

export const mapToMediaInfoWithFilename = (mediaDTO: MediaDTO[], uploads?: FileUpload[]): MediaInfo[] => {
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
