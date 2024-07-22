import { Button, HStack, VStack } from "@navikt/ds-react";
import { forwardRef, useState } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import { ChevronLeftIcon, ChevronRightIcon, MenuGridIcon } from "@navikt/aksel-icons";
import { ImageContainer } from "felleskomponenter/ImageCard";
import ImageModal from "felleskomponenter/ImageModal";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import styles from "./productImageCard.module.scss";
import { handleUpdateOfSeriesMedia, moveItemInArray, updateImagePriority } from "products/tabs/SeriesSortingArea";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { useSeries } from "utils/swr-hooks";

interface Props {
  seriesId: string;
  handleDeleteFile: (uri: string) => void;
  setImages: any;
  imagesArr: MediaInfoDTO[];
  index: number;
}

export const ProductImageCard = forwardRef<HTMLDivElement, Props>(function ImageCard(
  { seriesId, handleDeleteFile, setImages, imagesArr, index }: Props,
  ref,
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
        mediaInfo={imagesArr[index]}
        onClose={() => setImageModalIsOpen(false)}
        isModalOpen={imageModalIsOpen}
      />
      <div className={styles.imageCard} ref={ref}>
        <VStack gap="2">
          <ImageContainer
            uri={imagesArr[index].uri}
            text={imagesArr[index].text}
            onClick={() => setImageModalIsOpen(true)}
          />
          <VStack gap="1" align="center">
            <i>Filnavn</i>
            <span className="text-overflow-hidden-small">{imagesArr[index].filename ?? "OBS mangler beskrivelse"}</span>
            <HStack paddingBlock={"2 2"} gap={"1"}>
              <Button
                variant="tertiary"
                icon={<ChevronLeftIcon title="a11y-title" fontSize="1.5rem" />}
                className={"leftButton"}
                onClick={handleMoveLeft}
              ></Button>
              <MenuGridIcon title="a11y-title" fontSize="1.5rem" className={styles.grabbable} />
              <Button
                variant="tertiary"
                icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                className={"rightButton"}
                onClick={handleMoveRight}
              ></Button>
            </HStack>
          </VStack>
        </VStack>
        <div className="more-menu-container">
          <MoreMenu mediaInfo={imagesArr[index]} handleDeleteFile={handleDeleteFile} />
        </div>
      </div>
    </>
  );
});
