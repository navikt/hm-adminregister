import { Button, HStack, VStack } from "@navikt/ds-react";
import { forwardRef, useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { ChevronLeftIcon, ChevronRightIcon, MenuGridIcon } from "@navikt/aksel-icons";
import { ImageContainer } from "felleskomponenter/ImageCard";
import ImageModal from "felleskomponenter/ImageModal";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import styles from "./productImageCard.module.scss";

interface Props {
  mediaInfo: MediaInfoDTO;
  handleDeleteFile: (uri: string) => void;
  showMenuButton?: boolean;
}

export const ProductImageCard = forwardRef<HTMLDivElement, Props>(function ImageCard(
  { mediaInfo, handleDeleteFile, showMenuButton = true }: Props,
  ref,
) {
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);

  return (
    <>
      <ImageModal mediaInfo={mediaInfo} onClose={() => setImageModalIsOpen(false)} isModalOpen={imageModalIsOpen} />
      <div className={styles.imageCard} ref={ref}>
        <VStack gap="2">
          <ImageContainer uri={mediaInfo.uri} text={mediaInfo.text} onClick={() => setImageModalIsOpen(true)} />
          <VStack gap="1" align="center">
            <i>Filnavn</i>
            <span className="text-overflow-hidden-small">{mediaInfo.filename ?? "OBS mangler beskrivelse"}</span>
            <HStack paddingBlock={"2 2"} gap={"1"}>
              <Button variant="tertiary" icon={<ChevronLeftIcon title="a11y-title" fontSize="1.5rem" />}></Button>
              <MenuGridIcon title="a11y-title" fontSize="1.5rem" className={styles.grabbable} />
              <Button variant="tertiary" icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}></Button>
            </HStack>
          </VStack>
        </VStack>

        {showMenuButton && (
          <div className="more-menu-container">
            <MoreMenu mediaInfo={mediaInfo} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </div>
    </>
  );
});
