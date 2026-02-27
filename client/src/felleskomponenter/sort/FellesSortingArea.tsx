import { useEffect, useState } from "react";
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";

import { HStack } from "@navikt/ds-react";
import { updateSeriesMediaPriority } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./FellesSortingArea.module.scss";
import { SortCard } from "felleskomponenter/sort/SortCard";

interface Props {
  seriesId: string;
  allMedia: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
  isEditable: boolean;
}

export const moveItemInArray = (arr: MediaInfoDTO[], init: number, target: number) => {
  if (target >= 0 && target < arr.length) {
    [arr[init], arr[target]] = [arr[target], arr[init]];
  }
  return arr;
};

export const updateMediaPriority = (updatedArray: MediaInfoDTO[]) => {
  return updatedArray.map((item, index) => ({
    ...item,
    priority: index + 1,
  }));
};

export const handleUpdateOfSeriesMedia = (
  seriesId: string,
  updatedArray: MediaInfoDTO[],
  setGlobalError: (errorCode: number, errorMessage?: string) => void,
) => {
  const mediaSort = updatedArray.map((media) => ({
    uri: media.uri,
    priority: media.priority,
  }));
  updateSeriesMediaPriority(seriesId, mediaSort).catch((error) => {
    setGlobalError(error);
  });
};

export default function FellesSortingArea({ seriesId, allMedia, handleDeleteFile, isEditable }: Props) {
  const { setGlobalError } = useErrorStore();
  const [mediaArr, setMediaArr] = useState(allMedia);

  useEffect(() => {
    setMediaArr(allMedia);
  }, [allMedia]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setMediaArr((array) => {
      const updatedArray = updateMediaPriority(moveItemInArray(array, oldIndex, newIndex));
      handleUpdateOfSeriesMedia(seriesId, updatedArray, setGlobalError);
      return updatedArray;
    });
  };

  return (
    <SortableList
      onSortEnd={onSortEnd}
      className={styles.list}
      draggedItemClassName={styles.dragged}
      allowDrag={isEditable}
    >
      <HStack as="ol" gap="space-2">
        {mediaArr && mediaArr.length > 0
          ? mediaArr
              .sort((a, b) => a.priority - b.priority)
              .map((_, index) => (
                <li key={"media-" + index}>
                  <SortableItem>
                    <div className={styles.userSelect}>
                      <SortableKnob>
                        <SortCard
                          seriesId={seriesId}
                          handleDeleteFile={handleDeleteFile}
                          setMediaArr={setMediaArr}
                          mediaArr={mediaArr}
                          index={index}
                          isEditable={isEditable}
                        />
                      </SortableKnob>
                    </div>
                  </SortableItem>
                </li>
              ))
          : null}
      </HStack>
    </SortableList>
  );
}
