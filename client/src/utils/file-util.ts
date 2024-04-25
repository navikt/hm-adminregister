import { MediaInfoDTO } from "utils/types/response-types";
import { IMAGE_PROXY_URL } from "environments";

export const fileToUri = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result as string);
    };
    reader.onerror = function (error) {
      reject(error);
    };
  });

export const uriForMediaFile = (file: MediaInfoDTO) => {
  return `${IMAGE_PROXY_URL()}/file/${file.uri}`;
};
