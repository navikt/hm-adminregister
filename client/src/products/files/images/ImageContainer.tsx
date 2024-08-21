import { useState } from "react";

import { FileImageIcon } from "@navikt/aksel-icons";
import classNames from "classnames";
import { smallImageLoader } from "utils/image-util";

export const ImageContainer = ({ uri, text, size }: { uri?: string; text?: string | null; size?: string }) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);

  return (
    <div className={classNames("image-container", { "image-container--xsmall": size == "xsmall" })}>
      <div className="image-container__image">
        {imageLoadingError || !uri ? (
          <FileImageIcon title="Produkt mangler bilde" fontSize="2rem" />
        ) : (
          <img
            src={smallImageLoader({ src: uri, width: 400 })}
            onError={() => {
              setImageLoadingError(true);
            }}
            alt={text ?? "OBS mangler alt-tekst"}
            draggable="false"
            sizes="50vw"
          />
        )}
      </div>
    </div>
  );
};
