import { MediaInfoDTO, SeriesRegistrationDTO, SeriesRegistrationDTOV2 } from "utils/types/response-types";
import { SeriesStatus } from "utils/types/types";

export const numberOfImages = (series: SeriesRegistrationDTOV2) => {
  return series.seriesData.media.filter((media) => media.type == "IMAGE").length;
};

export const numberOfDocuments = (series: SeriesRegistrationDTOV2) => {
  return series.seriesData.media.filter((media) => media.type == "PDF").length;
};

export const numberOfVideos = (series: SeriesRegistrationDTOV2) => {
  return series.seriesData.media.filter((media) => media.type == "VIDEO" && media.source === "EXTERNALURL").length;
};

export const mapThumbnail = (series: SeriesRegistrationDTO): MediaInfoDTO | null => {
  return series.seriesData.media.find((media) => media.type == "IMAGE") ?? null;
};

export const mapImagesAndPDFfromMedia = (
  series: SeriesRegistrationDTOV2
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

export const seriesStatus = (series: SeriesRegistrationDTO): SeriesStatus => {
  const isDraft = series.draftStatus === "DRAFT" && !series.published;
  const isPending = series.adminStatus === "PENDING";
  const isRejected = series.adminStatus === "REJECTED";
  const isDeleted = series.status === "DELETED";
  const isDraftChange = series.draftStatus === "DRAFT" && series.published;

  if (isDeleted) {
    return SeriesStatus.DELETED;
  } else if (isRejected) {
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

export const seriesStatusV2 = (series: SeriesRegistrationDTOV2) => {
  const isDraft = series.status === "EDITABLE" && !series.published;
  const isPending = series.status === "PENDING_APPROVAL";
  const isRejected = series.status === "REJECTED";
  const isDraftChange = series.status === "EDITABLE" && series.published;

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
