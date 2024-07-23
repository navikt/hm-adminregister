import React, { useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { largeImageLoader, smallImageLoader } from "utils/image-util";
import "./thumbnail.scss";
import ImageModal from "felleskomponenter/ImageModal";

interface Props {
  mediaInfo: MediaInfoDTO;
}

export const SeriesThumbnail = ({ mediaInfo }: Props) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);
  return (
    <>
      <ImageModal mediaInfo={mediaInfo} onClose={() => setImageModalIsOpen(false)} isModalOpen={imageModalIsOpen} />
      <div className="thumbnail">
        {imageLoadingError || !mediaInfo.uri ? (
          <></>
        ) : (
          <img
            src={smallImageLoader({ src: mediaInfo.uri, width: 400 })}
            onError={() => {
              setImageLoadingError(true);
            }}
            alt={mediaInfo.text ?? "OBS mangler alt-tekst"}
            onClick={() => setImageModalIsOpen(true)}
          />
        )}
      </div>
    </>
  );
};
