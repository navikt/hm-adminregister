import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React, { useEffect } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";
import styles from "./sortingArea.module.scss";
import { HStack } from "@navikt/ds-react";

interface Props {
  sortedImages: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
}

export default function SortingArea({ sortedImages, handleDeleteFile }: Props) {
  const [images, setImages] = React.useState(sortedImages);

  useEffect(() => {
    setImages(sortedImages);
  }, [sortedImages]);

  console.log("OG state", sortedImages);
  console.log("new state", images);
  const updateImagePriority = () => {
    sortedImages.map((item) => console.log(item));
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array: MediaInfoDTO[]) => arrayMove(array, oldIndex, newIndex));
    updateImagePriority();
  };

  return (
    <SortableList onSortEnd={onSortEnd} className={styles.list} draggedItemClassName={styles.dragged}>
      <HStack gap="2">
        {images.map((image, index) => (
          <SortableItem key={index}>
            <div className={styles.item}>
              <SortableKnob>
                <ImageCard mediaInfo={image} handleDeleteFile={handleDeleteFile} showMenuButton={true} />
              </SortableKnob>
            </div>
          </SortableItem>
        ))}
      </HStack>
    </SortableList>
  );
}
