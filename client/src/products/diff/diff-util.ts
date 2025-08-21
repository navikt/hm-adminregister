import { DifferenceDTO, MediaInfo, TechData } from "utils/types/response-types";

function getDifferentElements(list1: Array<TechData>, list2: Array<TechData>): Array<TechDataDiff> {
  if (list1.length != list2.length) {
    // Can not compare lists of different lengths
    return [];
  }

  list1.sort((a, b) => a.key.localeCompare(b.key));
  list2.sort((a, b) => a.key.localeCompare(b.key));

  const diff: Array<TechDataDiff> = [];

  for (let i = 0; i < list1.length; i++) {
    if (list1[i]["value"] !== list2[i]["value"]) {
      diff.push({ oldData: list2[i], newData: list1[i] });
    }
  }
  return diff;
}

export function getTechDataDiff(diffDto: DifferenceDTO): Array<TechDataDiff> {
  const diffArrays = diffDto.diff.entriesDiffering["productData.techData"];

  return getDifferentElements(
    diffArrays.first as unknown as Array<TechData>,
    diffArrays.second as unknown as Array<TechData>
  );
}

function areArraysSimilar(arr1: MediaInfo[], arr2: MediaInfo[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return (
    arr1.every((item1) => arr2.some((item2) => JSON.stringify(item1) === JSON.stringify(item2))) &&
    arr2.every((item1) => arr1.some((item2) => JSON.stringify(item2) === JSON.stringify(item1)))
  );
}

export function getMediaDiff(diffDto: DifferenceDTO): MediaDiff {
  const diffArrays = diffDto.diff.entriesDiffering["seriesData.media"];

  if (diffArrays === undefined) {
    return {
      videoChanges: false,
      documentChanges: false,
      imageChanges: false,
    };
  }
  const videoChanges = areArraysSimilar(
    (diffArrays.first as unknown as MediaInfo[]).filter((media) => media.type === "VIDEO"),
    (diffArrays.second as unknown as MediaInfo[]).filter((media) => media.type === "VIDEO"),
  );

  const documentChanges = areArraysSimilar(
    (diffArrays.first as unknown as MediaInfo[]).filter((media) => media.type === "PDF"),
    (diffArrays.second as unknown as MediaInfo[]).filter((media) => media.type === "PDF"),
  );

  const imageChanges = areArraysSimilar(
    (diffArrays.first as unknown as MediaInfo[]).filter((media) => media.type === "IMAGE"),
    (diffArrays.second as unknown as MediaInfo[]).filter((media) => media.type === "IMAGE"),
  );

  return {
    videoChanges: !videoChanges,
    documentChanges: !documentChanges,
    imageChanges: !imageChanges,
  };
}

export interface TechDataDiff {
  oldData: TechData;
  newData: TechData;
}

export interface MediaDiff {
  videoChanges: boolean;
  documentChanges: boolean;
  imageChanges: boolean;
}