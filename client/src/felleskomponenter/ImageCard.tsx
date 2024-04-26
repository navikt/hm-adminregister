import { VStack } from "@navikt/ds-react";
import { useState } from "react";
import classNames from "classnames";
import { MoreMenu } from "./MoreMenu";
import { MediaInfoDTO } from "utils/types/response-types";
import { smallImageLoader } from "utils/image-util";
import ImageModal from "./ImageModal";

interface Props {
  mediaInfo: MediaInfoDTO;
  handleDeleteFile: (uri: string) => void;
  showMenuButton?: boolean;
}

export const ImageCard = ({ mediaInfo, handleDeleteFile, showMenuButton = true }: Props) => {
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);

  return (
    <>
      <ImageModal mediaInfo={mediaInfo} onClose={() => setImageModalIsOpen(false)} isModalOpen={imageModalIsOpen} />
      <li className="image-card">
        <VStack gap="2">
          <ImageContainer uri={mediaInfo.uri} text={mediaInfo.text} onClick={() => setImageModalIsOpen(true)} />
          <VStack gap="1" align="center">
            <i>Filnavn</i>{" "}
            <span className="text-overflow-hidden">{mediaInfo.filename ?? "OBS mangler beskrivelse"}</span>
          </VStack>
        </VStack>
        {showMenuButton && (
          <div className="more-menu-container">
            <MoreMenu mediaInfo={mediaInfo} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </li>
    </>
  );
};

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
      <div className="image" onClick={onClick}>
        {imageLoadingError || !uri ? (
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
            src={smallImageLoader({ src: uri, width: 400 })}
            onError={() => {
              setImageLoadingError(true);
            }}
            alt={text ?? "OBS mangler alt-tekst"}
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
      </div>
    </div>
  );
};
