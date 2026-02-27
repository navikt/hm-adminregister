import { VStack } from "@navikt/ds-react";
import ImageModal from "felleskomponenter/ImageModal";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { ImageContainer } from "products/files/images/ImageContainer";
import { forwardRef, useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./ProductImageCard.module.scss";

interface Props {
  handleDeleteFile: (uri: string) => void;
  imagesArr: MediaInfoDTO[];
  index: number;
  isEditable: boolean;
}

export const ProductImageCard = forwardRef<HTMLDivElement, Props>(function ImageCard(
  { handleDeleteFile, imagesArr, index, isEditable }: Props,
  ref,
) {
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);
  const currentImage = imagesArr[index];

  return (
    <>
      <ImageModal
        mediaInfo={imagesArr}
        index={index}
        onClose={() => setImageModalIsOpen(false)}
        isModalOpen={imageModalIsOpen}
      />
      <div className={styles.imageCard} ref={ref}>
        <VStack gap="space-2">
          <button
            type="button"
            className={styles.buttonImage}
            onClick={() => setImageModalIsOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <ImageContainer uri={currentImage.uri} text={currentImage.text} />
          </button>
          <VStack gap="space-1" align="center">
            <i>Filnavn</i>
            <span className="text-overflow-hidden-small">{currentImage.filename ?? "OBS mangler beskrivelse"}</span>
          </VStack>
        </VStack>
        {isEditable && (
          <div className={styles.moreMenuContainer}>
            <MoreMenu mediaInfo={currentImage} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </div>
    </>
  );
});
