import { ChevronLeftIcon, ChevronRightIcon, MenuGridIcon } from "@navikt/aksel-icons";
import { Button, HStack, VStack } from "@navikt/ds-react";
import { handleUpdateOfSeriesMedia, moveItemInArray, updateMediaPriority } from "./FellesSortingArea";
import { forwardRef } from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./SortCard.module.scss";
import { SortItem } from "felleskomponenter/sort/SortItem";

interface Props {
  seriesId: string;
  handleDeleteFile: (uri: string) => void;
  setMediaArr: MediaInfoDTO[] | any;
  mediaArr: MediaInfoDTO[];
  index: number;
  isEditable: boolean;
}

export const SortCard = forwardRef<HTMLDivElement, Props>(function SortCard(
  { seriesId, handleDeleteFile, setMediaArr, mediaArr, index, isEditable }: Props,
  ref,
) {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const rightButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".rightButton")) || [];
  const leftButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".leftButton")) || [];

  const handleMoveLeft = () => {
    if (index > 0) {
      const updatedArray = updateMediaPriority(moveItemInArray(mediaArr, index, index - 1));
      setMediaArr(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, setGlobalError);
      leftButtonArray[index - 1].focus();
    }
  };

  const handleMoveRight = () => {
    if (index < mediaArr.length - 1) {
      const updatedArray = updateMediaPriority(moveItemInArray(mediaArr, index, index + 1));
      setMediaArr(updatedArray);
      handleUpdateOfSeriesMedia(seriesId, updatedArray, setGlobalError);
      rightButtonArray[index + 1].focus();
    }
  };

  return (
    <VStack className={styles.mediaCard} ref={ref}>
      <SortItem handleDeleteFile={handleDeleteFile} imagesArr={mediaArr} index={index} isEditable={isEditable} />
      <VStack align="center" paddingBlock={"2 2"}>
        <b>{index + 1}</b>
        {isEditable && (
          <HStack gap={"1"}>
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
  );
});
