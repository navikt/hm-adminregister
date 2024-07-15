import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";

interface Props {
  sortedImages: MediaInfoDTO[];
  handleDeleteFile: (uri: string) => void;
}

export default function SortingArea({ sortedImages, handleDeleteFile }: Props) {
  const [images, setImages] = React.useState(sortedImages);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => arrayMove(array, oldIndex, newIndex));
  };

  return (
    <SortableList onSortEnd={onSortEnd} className="list" draggedItemClassName="dragged">
      {images.map((image, index) => (
        <SortableItem key={index}>
          <div className="item">
            <SortableKnob>
              <ImageCard mediaInfo={image} handleDeleteFile={handleDeleteFile} showMenuButton={true} />
            </SortableKnob>
          </div>
        </SortableItem>
      ))}
    </SortableList>
  );
}
