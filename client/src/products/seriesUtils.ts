import { MediaInfoDTO, SeriesDTO } from "utils/types/response-types";
import { SeriesStatus } from "utils/types/types";

export const numberOfImages = (series: SeriesDTO) => {
  return series.seriesData.media.filter((media) => media.type == "IMAGE").length;
};

export const numberOfDocuments = (series: SeriesDTO) => {
  return series.seriesData.media.filter((media) => media.type == "PDF").length;
};

export const numberOfVideos = (series: SeriesDTO) => {
  return series.seriesData.media.filter((media) => media.type == "VIDEO" && media.source === "EXTERNALURL").length;
};

export const mapImagesAndPDFfromMedia = (
  series: SeriesDTO,
): { images: MediaInfoDTO[]; pdfs: MediaInfoDTO[]; videos: MediaInfoDTO[] } => {
  const seen: { [uri: string]: boolean } = {};
  const pdfs: MediaInfoDTO[] = [];
  const images: MediaInfoDTO[] = [];
  const videos: MediaInfoDTO[] = [];
  series.seriesData.media.map((media: MediaInfoDTO) => {
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

export const seriesStatus = (status: string, isPublished: boolean) => {
  const isDraft = status === "EDITABLE" && !isPublished;
  const isPending = status === "PENDING_APPROVAL";
  const isRejected = status === "REJECTED";
  const isDraftChange = status === "EDITABLE" && isPublished;

  if (isRejected) {
    return SeriesStatus.REJECTED;
  } else if (isDraft && !isRejected) {
    return SeriesStatus.DRAFT;
  } else if (isDraftChange && !isRejected) {
    return SeriesStatus.DRAFT_CHANGE;
  } else if (isPending) {
    return SeriesStatus.PENDING;
  } else {
    return SeriesStatus.PUBLISHED;
  }
};

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidKeyword(keyword: string) {
  try {
    new Text(keyword);
    return true;
  } catch (_) {
    return false;
  }
}
