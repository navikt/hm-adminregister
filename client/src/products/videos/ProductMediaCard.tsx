import { Link, VStack } from "@navikt/ds-react";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { forwardRef } from "react";
import { MediaInfoDTO } from "utils/types/response-types";
import styles from "./ProductMediaCard.module.scss";
import productStyles from "../ProductPage.module.scss";
import { MediaContainer } from "products/videos/MediaContainer";

interface Props {
  handleDeleteFile: (uri: string) => void;
  mediaArr: MediaInfoDTO[];
  index: number;
  isEditable: boolean;
}

export const ProductMediaCard = forwardRef<HTMLDivElement, Props>(function MediaCard(
  { handleDeleteFile, mediaArr, index, isEditable }: Props,
  ref,
) {
  return (
    <>
      <div className={styles.mediaCard} ref={ref}>
        <VStack gap="space-2">
          <Link target="_blank" title={mediaArr[index].uri} href={mediaArr[index].uri}>
            {mediaArr[index].text || mediaArr[index].uri}
          </Link>
          <MediaContainer uri={mediaArr[index].uri} text={mediaArr[index].text} />
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
