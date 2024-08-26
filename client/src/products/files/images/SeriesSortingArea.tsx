import React, { useEffect } from "react";
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";

import { HStack } from "@navikt/ds-react";
import { updateSeriesMedia } from "api/SeriesApi";
import { ProductImageCard } from "products/files/images/ProductImageCard";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { useSeries } from "utils/swr-hooks";
import { MediaInfoDTO } from "utils/types/response-types";
import { LoggedInUser } from "utils/user-util";
import styles from "./SeriesSortingArea.module.scss";

interface Props {
  seriesId: string;
  allImages: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
}

export const moveItemInArray = (arr: MediaInfoDTO[], init: number, target: number) => {
  if (target >= 0 && target < arr.length) {
    [arr[init], arr[target]] = [arr[target], arr[init]];
  }
  return arr;
};

export const updateImagePriority = (updatedArray: MediaInfoDTO[]) => {
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
) => {
  updateSeriesMedia(seriesId, updatedArray, loggedInUser?.isAdmin || false)
    // .then(mutateSeries)
    .catch((error) => {
      setGlobalError(error);
    });
};

export default function SeriesSortingArea({ seriesId, allImages, handleDeleteFile }: Props) {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const [imagesArr, setImages] = React.useState(allImages);
  const { mutateSeries } = useSeries(seriesId!);

  useEffect(() => {
    setImages(allImages);
  }, [allImages]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => {
      const updatedArray = updateImagePriority(moveItemInArray(array, oldIndex, newIndex));
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError);
      return updatedArray;
    });
  };

  return (
    <SortableList onSortEnd={onSortEnd} className={styles.list} draggedItemClassName={styles.dragged}>
      <HStack as="ol" gap="2">
        {imagesArr && imagesArr.length > 0
          ? imagesArr
              .sort((a, b) => a.priority - b.priority)
              .map(
                (
                  item,
                  index, //
                ) => (
                  <li key={"bilde-" + index}>
                    <SortableItem>
                      <div className={styles.userSelect}>
                        <SortableKnob>
                          <ProductImageCard
                            seriesId={seriesId}
                            handleDeleteFile={handleDeleteFile}
                            setImages={setImages}
                            imagesArr={imagesArr}
                            index={index}
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
