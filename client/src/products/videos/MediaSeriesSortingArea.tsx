import React, { useEffect } from "react";
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";

import { HStack } from "@navikt/ds-react";
import { updateSeriesMedia } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { useSeries } from "utils/swr-hooks";
import { MediaInfoDTO } from "utils/types/response-types";
import { LoggedInUser } from "utils/user-util";
import styles from "./MediaSeriesSortingArea.module.scss";
import { ProductMediaCard } from "products/videos/ProductMediaCard";

interface Props {
  seriesId: string;
  mediaInfo: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
  isEditable: boolean;
  mediaType: "VIDEO" | "IMAGE";
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
  loggedInUser: LoggedInUser | undefined,
  mutateSeries: () => void,
  setGlobalError: any,
  mediaType: string,
) => {
  if (mediaType === "VIDEO") {
    updateSeriesMedia(seriesId, updatedArray, loggedInUser?.isAdmin || false, mediaType)
      // .then(mutateSeries)
      .catch((error) => {
        setGlobalError(error);
      });
  }
};

export default function MediaSeriesSortingArea({
  seriesId,
  mediaInfo,
  handleDeleteFile,
  isEditable,
  mediaType,
}: Props) {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const [mediaArr, setMediaArr] = React.useState(mediaInfo);
  const { mutateSeries } = useSeries(seriesId!);

  useEffect(() => {
    setMediaArr(mediaInfo);
  }, [mediaInfo]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setMediaArr((array) => {
      const updatedArray = updateMediaPriority(moveItemInArray(array, oldIndex, newIndex));
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError, mediaType);
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
      <HStack as="ol" gap="2">
        {mediaArr && mediaArr.length > 0
          ? mediaArr
              .sort((a, b) => a.priority - b.priority)
              .map(
                (
                  item,
                  index, //
                ) => (
                  <li key={"media-" + index}>
                    <SortableItem>
                      <div className={styles.userSelect}>
                        <SortableKnob>
                          <ProductMediaCard
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
                ),
              )
          : null}
      </HStack>
    </SortableList>
  );
}
