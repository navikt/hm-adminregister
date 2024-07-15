import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React, { useEffect } from "react";
import { MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";
import styles from "./sortingArea.module.scss";
import { HStack } from "@navikt/ds-react";
import { updateSeriesMedia } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";

interface Props {
  series: SeriesRegistrationDTO;
  allImages: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
}

export default function SortingArea({ series, allImages, handleDeleteFile }: Props) {
  const { loggedInUser } = useAuthStore();
  const [imagesArr, setImages] = React.useState(allImages); // RES from sereis

  useEffect(() => {
    setImages(allImages);
  }, [allImages]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => arrayMove(array, oldIndex, newIndex));
  };

  function updateImagePriority() {
    allImages.map((ogItem) => {
      imagesArr.map((item, index) => {
        item === ogItem && (ogItem.priority = index);
      });
    });
    console.log(allImages);
    //updateSeriesMedia(series.id, allImages, loggedInUser?.isAdmin || false);
  }
  updateImagePriority();

  return (
    <SortableList onSortEnd={onSortEnd} className={styles.lsit} draggedItemClassName={styles.dragged}>
      <HStack gap="2">
        {imagesArr.map(
          // res from usestate
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
