import { useState } from "react";
import { MediaInfo, MediaInfoDTO } from "utils/types/response-types";
import { smallImageLoader } from "utils/image-util";
import "./thumbnail.scss";

interface Props {
  mediaInfo: MediaInfoDTO;
}

export const Thumbnail = ({ mediaInfo }: Props) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);

  return (
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
        />
      )}
    </div>
  );
};
