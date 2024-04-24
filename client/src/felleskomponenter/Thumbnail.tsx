import React, { useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { largeImageLoader, smallImageLoader } from "utils/image-util";
import "./thumbnail.scss";
import ImageModal from "felleskomponenter/ImageModal";

interface Props {
  mediaInfo: MediaInfoDTO;
}

export const Thumbnail = ({ mediaInfo }: Props) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);
  const [imageModalIsopen, setImageModalIsopen] = useState<boolean>(false);
  return (
    <>
      <ImageModal mediaInfo={mediaInfo} onClose={() => setImageModalIsopen(false)} isModalOpen={imageModalIsopen} />
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
            onClick={() => setImageModalIsopen(true)}
          />
        )}
      </div>
    </>
  );
};
