import { ChevronLeftIcon, ChevronRightIcon, MenuGridIcon } from "@navikt/aksel-icons";
import {Button, HStack, Link, VStack} from "@navikt/ds-react";
import ImageModal from "felleskomponenter/ImageModal";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import {
  handleUpdateOfSeriesMedia,
  moveItemInArray,
  updateImagePriority,
} from "products/videos/MediaSeriesSortingArea";
import React, { forwardRef, useState } from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { useSeries } from "utils/swr-hooks";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./ProductMediaCard.module.scss";
import productStyles from "../ProductPage.module.scss";
import {MediaContainer} from "products/videos/MediaContainer";
import ReactPlayer from "react-player";

interface Props {
  seriesId: string,
  handleDeleteFile: (uri: string) => void,
  setMediaArr: MediaInfoDTO[] | any,
  mediaArr: MediaInfoDTO[],
  index: number,
  isEditable: boolean,
  mediaType?: string
}

export const ProductMediaCard = forwardRef<HTMLDivElement, Props>(function MediaCard(
  { seriesId, handleDeleteFile, setMediaArr, mediaArr, index, isEditable }: Props,
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
      const updatedArray = updateImagePriority(moveItemInArray(mediaArr, index, index - 1));
      setMediaArr(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError, "VIDEO");
      leftButtonArray[index - 1].focus();
    }
  };

  const handleMoveRight = () => {
    if (index < mediaArr.length - 1) {
      const updatedArray = updateImagePriority(moveItemInArray(mediaArr, index, index + 1));
      setMediaArr(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError, "VIDEO");
      rightButtonArray[index + 1].focus();
    }
  };

  return (
    <>
     {/* <ImageModal
        mediaInfo={mediaArr}
        index={index}
        onClose={() => setImageModalIsOpen(false)}
        isModalOpen={imageModalIsOpen}
      />*/}
      <div className={styles.imageCard} ref={ref}>
        <VStack gap="2">
          <b>{mediaArr[index].priority}</b>
          <button
            type="button"
            className={styles.buttonImage}
            onClick={() => setImageModalIsOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <MediaContainer uri={mediaArr[index].uri} text={mediaArr[index].text} />
          </button>
          <VStack gap="1" align="center">
            <Link target="_blank" title={mediaArr[index].uri} href={mediaArr[index].uri}>
              {mediaArr[index].text || mediaArr[index].uri}
            </Link>
{/*            <span className="text-overflow-hidden-small">{mediaArr[index].filename ?? "OBS mangler beskrivelse"}</span>*/}
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
            <MoreMenu mediaInfo={mediaArr[index]} handleDeleteFile={handleDeleteFile} />
          </div>
        )}
      </div>
    </>
  );
});
