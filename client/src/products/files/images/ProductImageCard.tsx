import { ChevronLeftIcon, ChevronRightIcon, MenuGridIcon } from "@navikt/aksel-icons";
import { Button, HStack, VStack } from "@navikt/ds-react";
import ImageModal from "felleskomponenter/ImageModal";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { ImageContainer } from "products/files/images/ImageContainer";
import {
  handleUpdateOfSeriesMedia,
  moveItemInArray,
  updateImagePriority,
} from "products/files/images/SeriesSortingArea";
import { forwardRef, useState } from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { useSeries } from "utils/swr-hooks";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./ProductImageCard.module.scss";
import productStyles from "../../ProductPage.module.scss";

interface Props {
  seriesId: string;
  handleDeleteFile: (uri: string) => void;
  setImages: any;
  imagesArr: MediaInfoDTO[];
  index: number;
  isEditable: boolean;
}

export const ProductImageCard = forwardRef<HTMLDivElement, Props>(function ImageCard(
  { seriesId, handleDeleteFile, setImages, imagesArr, index, isEditable }: Props,
  ref
) {
  const [imageModalIsOpen, setImageModalIsOpen] = useState<boolean>(false);
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const { mutateSeries } = useSeries(seriesId!);
  const rightButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".rightButton")) || [];
  const leftButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".leftButton")) || [];

  const handleMoveLeft = () => {
    if (index > 0) {
      const updatedArray = updateImagePriority(moveItemInArray(imagesArr, index, index - 1));
      setImages(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError);
      leftButtonArray[index - 1].focus();
    }
  };

  const handleMoveRight = () => {
    if (index < imagesArr.length - 1) {
      const updatedArray = updateImagePriority(moveItemInArray(imagesArr, index, index + 1));
      setImages(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError);
      rightButtonArray[index + 1].focus();
    }
  };

  return (
    <>
      <ImageModal
        mediaInfo={imagesArr}
        index={index}
        onClose={() => setImageModalIsOpen(false)}
        isModalOpen={imageModalIsOpen}
      />
      <div className={styles.imageCard} ref={ref}>
        <VStack gap="2">
          <button
            type="button"
            className={styles.buttonImage}
            onClick={() => setImageModalIsOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <ImageContainer uri={imagesArr[index].uri} text={imagesArr[index].text} />
          </button>
          <VStack gap="1" align="center">
            <i>Filnavn</i>
            <span className="text-overflow-hidden-small">{imagesArr[index].filename ?? "OBS mangler beskrivelse"}</span>
            {isEditable && (
              <HStack paddingBlock={"2 2"} gap={"1"}>
                <Button
                  variant="tertiary"
                  icon={<ChevronLeftIcon fontSize="1.5rem" aria-hidden />}
                  className={"leftButton"}
                  onClick={handleMoveLeft}
                  title="Flytt til venstre"
                ></Button>
                <MenuGridIcon title="Flytt bilde" fontSize="1.5rem" className={styles.grabbable} />
                <Button
                  variant="tertiary"
                  icon={<ChevronRightIcon fontSize="1.5rem" aria-hidden />}
                  className={"rightButton"}
                  onClick={handleMoveRight}
                  title="Flytt til høyre"
                ></Button>
              </HStack>
            )}
          </VStack>
        </VStack>
        {isEditable && (
          <div className={productStyles.moreMenuContainer}>
            <MoreMenu mediaInfo={imagesArr[index]} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </div>
    </>
  );
});
