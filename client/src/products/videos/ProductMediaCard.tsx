import {ChevronLeftIcon, ChevronRightIcon, MenuGridIcon} from "@navikt/aksel-icons";
import {Button, HStack, Link, VStack} from "@navikt/ds-react";
import {MoreMenu} from "felleskomponenter/MoreMenu";
import {handleUpdateOfSeriesMedia, moveItemInArray, updateMediaPriority,} from "products/videos/MediaSeriesSortingArea";
import {forwardRef} from "react";
import {useAuthStore} from "utils/store/useAuthStore";
import {useErrorStore} from "utils/store/useErrorStore";
import {useSeries} from "utils/swr-hooks";
import {MediaInfoDTO} from "utils/types/response-types";
import styles from "./ProductMediaCard.module.scss";
import productStyles from "../ProductPage.module.scss";
import {MediaContainer} from "products/videos/MediaContainer";

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
    {seriesId, handleDeleteFile, setMediaArr, mediaArr, index, isEditable}: Props,
    ref
) {
    const {loggedInUser} = useAuthStore();
    const {setGlobalError} = useErrorStore();
    const {mutateSeries} = useSeries(seriesId!);
    const rightButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".rightButton")) || [];
    const leftButtonArray: HTMLButtonElement[] = Array.from(document.querySelectorAll(".leftButton")) || [];

    const handleMoveLeft = () => {
        if (index > 0) {
            const updatedArray = updateMediaPriority(moveItemInArray(mediaArr, index, index - 1));
            setMediaArr(updatedArray);
            handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError, "VIDEO");
            leftButtonArray[index - 1].focus();
        }
    };

    const handleMoveRight = () => {
        if (index < mediaArr.length - 1) {
            const updatedArray = updateMediaPriority(moveItemInArray(mediaArr, index, index + 1));
            setMediaArr(updatedArray);
            handleUpdateOfSeriesMedia(seriesId, updatedArray, loggedInUser, mutateSeries, setGlobalError, "VIDEO");
            rightButtonArray[index + 1].focus();
        }
    };

    return (
        <>
            <div className={styles.mediaCard} ref={ref}>
                <VStack gap="2">
                    <Link target="_blank" title={mediaArr[index].uri} href={mediaArr[index].uri}>
                        {mediaArr[index].text || mediaArr[index].uri}
                    </Link>
                    <MediaContainer uri={mediaArr[index].uri} text={mediaArr[index].text}/>
                    <VStack gap="1" align="center">
                        <b>{index + 1}</b>
                        {isEditable && (
                            <HStack paddingBlock={"2 2"} gap={"1"}>
                                <Button
                                    variant="tertiary"
                                    icon={<ChevronLeftIcon fontSize="1.5rem" aria-hidden/>}
                                    className={"leftButton"}
                                    onClick={handleMoveLeft}
                                    title="Flytt til venstre"
                                ></Button>
                                <MenuGridIcon title="Flytt bilde" fontSize="1.5rem" className={styles.grabbable}/>
                                <Button
                                    variant="tertiary"
                                    icon={<ChevronRightIcon fontSize="1.5rem" aria-hidden/>}
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
                        <MoreMenu mediaInfo={mediaArr[index]} handleDeleteFile={handleDeleteFile}/>
                    </div>
                )}
            </div>
        </>
    );
});
