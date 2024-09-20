import { MediaDTO, MediaInfo } from "utils/types/response-types";
import { FileUpload } from "felleskomponenter/UploadModal";

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
