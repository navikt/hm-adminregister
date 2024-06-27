import { DifferenceDTO, TechData } from "utils/types/response-types";
import { TechDataDict } from "utils/types/types";

function getDifferentElements(list1: Array<TechData>, list2: Array<TechData>): Array<TechDataDiff> {
  if (list1.length != list2.length) {
    // Can not compare lists of different lengths
    return [];
  }

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
  return getDifferentElements(diffArrays.first as Array<TechData>, diffArrays.second as Array<TechData>);
}

export interface TechDataDiff {
  oldData: TechData;
  newData: TechData;
}
