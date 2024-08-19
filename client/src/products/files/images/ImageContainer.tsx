import { useState } from "react";

import { FileImageIcon } from "@navikt/aksel-icons";
import classNames from "classnames";
import { smallImageLoader } from "utils/image-util";

export const ImageContainer = ({
  uri,
  text,
  size,
  onClick,
}: {
  uri?: string;
  text?: string | null;
  size?: string;
  onClick?: () => void;
}) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);

  return (
    <div className={classNames("image-container", { "image-container--xsmall": size == "xsmall" })}>
      <button type="button" className="button-image" onClick={onClick}>
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
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              inset: "0px",
              objectFit: "contain",
              color: "transparent",
              padding: "6px",
            }}
            sizes="50vw"
          />
        )}
      </button>
    </div>
  );
};
