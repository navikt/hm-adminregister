import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React, { useEffect } from "react";
import { MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";
import styles from "./sortingArea.module.scss";
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

export default function SortingArea({ series, allImages, mutateSeries, handleDeleteFile }: Props) {
  const { loggedInUser } = useAuthStore();
  const [imagesArr, setImages] = React.useState(allImages);
  const { setGlobalError } = useErrorStore();
  useEffect(() => {
    setImages(allImages);
  }, [allImages]);

  const updateImagePriority = (updatedArray: MediaInfoDTO[]) => {
    return updatedArray.map((item, index) => ({
      ...item,
      priority: index,
    }));
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => {
      const updatedArray = updateImagePriority(arrayMove(array, oldIndex, newIndex));
      updateSeriesMedia(series.id, updatedArray, loggedInUser?.isAdmin || false)
        .then(mutateSeries)
        .catch((error) => {
          setGlobalError(error);
        });
      return updatedArray;
    });
  };
  return (
    <SortableList onSortEnd={onSortEnd} className={styles.lsit} draggedItemClassName={styles.dragged}>
      <HStack gap="2">
        {imagesArr
          .sort((a, b) => a.priority - b.priority)
          .map(
            (
              item,
              index, //
            ) => (
              <SortableItem key={index}>
                <div className={styles.item}>
                  <SortableKnob>
                    <ImageCard mediaInfo={item} handleDeleteFile={handleDeleteFile} showMenuButton={true} />
                  </SortableKnob>
                </div>
              </SortableItem>
            ),
          )}
      </HStack>
    </SortableList>
  );
}
