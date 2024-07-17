import { VStack } from "@navikt/ds-react";
import classNames from "classnames";
import { forwardRef, useState } from "react";
import { smallImageLoader } from "utils/image-util";
import { MediaInfoDTO } from "utils/types/response-types";
import ImageModal from "./ImageModal";
import { MoreMenu } from "./MoreMenu";

interface Props {
  mediaInfo: MediaInfoDTO;
  handleDeleteFile: (uri: string) => void;
  showMenuButton?: boolean;
}

const ImageCard = forwardRef<HTMLDivElement, Props>(function ImageCard(
  { mediaInfo, handleDeleteFile, showMenuButton = true }: Props,
  ref,
) {
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);

  return (
    <>
      <ImageModal mediaInfo={mediaInfo} onClose={() => setImageModalIsOpen(false)} isModalOpen={imageModalIsOpen} />
      <div className="image-card" ref={ref}>
        <VStack gap="2">
          <ImageContainer uri={mediaInfo.uri} text={mediaInfo.text} onClick={() => setImageModalIsOpen(true)} />
          <VStack gap="1" align="center">
            <i>Filnavn</i>{" "}
            <span className="text-overflow-hidden-small">{mediaInfo.filename ?? "OBS mangler beskrivelse"}</span>
          </VStack>

          {showMenuButton && (
            <div className="more-menu-container">
              <MoreMenu mediaInfo={mediaInfo} handleDeleteFile={handleDeleteFile} />
            </div>
          )}
        </VStack>
      </div>
    </>
  );
});

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
          <img
            src={"/adminregister/assets/image-error.png"}
            alt="Produktbilde"
            draggable="false"
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
              padding: "10px",
            }}
            sizes="50vw"
          />
        )}
      </button>
    </div>
  );
};

export default ImageCard;
