import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React, { useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import classNames from "classnames";
import { smallImageLoader } from "utils/image-util";

interface Props {
  sortedImages: MediaInfoDTO[];
}

export default function SortingArea({ sortedImages }: Props) {
  const [images, setImages] = React.useState(sortedImages);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setImages((array) => arrayMove(array, oldIndex, newIndex));
  };

  const [imageLoadingError, setImageLoadingError] = useState(false);

  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);

  return (
    <SortableList onSortEnd={onSortEnd} className="list" draggedItemClassName="dragged">
      {images.map((image, index) => (
        <SortableItem key={index}>
          <div className="item">
            <SortableKnob>
              <div className={classNames("image-container")}>
                <button type="button" className="button-image" onClick={() => setImageModalIsOpen(true)}>
                  {imageLoadingError || !image.uri ? (
                    <img
                      src={"/adminregister/assets/image-error.png"}
                      alt="Produktbilde"
                      style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        inset: "0px",
                        objectFit: "contain",
                        color: "transparent",
                        padding: "10px",
                      }}
                      sizes="50vw"
                    />
                  ) : (
                    <img
                      src={smallImageLoader({ src: image.uri, width: 400 })}
                      alt={"OBS mangler alt-tekst"}
                      style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        inset: "0px",
                        objectFit: "contain",
                        color: "transparent",
                        padding: "10px",
                      }}
                      sizes="50vw"
                    />
                  )}
                </button>
              </div>
            </SortableKnob>
          </div>
        </SortableItem>
      ))}
    </SortableList>
  );
}
