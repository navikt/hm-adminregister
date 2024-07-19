import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import React, { useEffect } from "react";
import { MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";
import styles from "./seriesSortingArea.module.scss";
import { HStack } from "@navikt/ds-react";
import { updateSeriesMedia } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";

interface Props {
  series: SeriesRegistrationDTO;
  allImages: MediaInfoDTO[];
  mutateSeries: () => void;
  handleDeleteFile: (uri: string) => void;
}

export default function SeriesSortingArea({ series, allImages, mutateSeries, handleDeleteFile }: Props) {
  const { loggedInUser } = useAuthStore();
  const [imagesArr, setImages] = React.useState(allImages);
  const { setGlobalError } = useErrorStore();
  useEffect(() => {
    setImages(allImages);
  }, [allImages]);

  const updateImagePriority = (updatedArray: MediaInfoDTO[]) => {
    return updatedArray.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));
  };

  const moveItemInArray = (arr: MediaInfoDTO[], init: number, target: number) => {
    [arr[init], arr[target]] = [arr[target], arr[init]];
    return arr;
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => {
      const updatedArray = updateImagePriority(moveItemInArray(array, oldIndex, newIndex));
      updateSeriesMedia(series.id, updatedArray, loggedInUser?.isAdmin || false)
        .then(mutateSeries)
        .catch((error) => {
          setGlobalError(error);
        });
      return updatedArray;
    });
  };

  return (
    <SortableList onSortEnd={onSortEnd} className={styles.list} draggedItemClassName={styles.dragged}>
      <HStack as="ol" gap="2" className="images">
        {imagesArr
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
                      <ImageCard mediaInfo={item} handleDeleteFile={handleDeleteFile} showMenuButton={true} />
                    </SortableKnob>
                  </div>
                </SortableItem>
              </li>
            ),
          )}
      </HStack>
    </SortableList>
  );
}