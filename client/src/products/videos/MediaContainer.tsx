import { useState } from "react";

import {FileImageIcon, VideoIcon} from "@navikt/aksel-icons";
import { HStack } from "@navikt/ds-react";
import classNames from "classnames/bind";
import { smallImageLoader } from "utils/image-util";
import styles from "./MediaContainer.module.scss";
import ReactPlayer from "react-player";

const cx = classNames.bind(styles);

export const MediaContainer = ({ uri, text, size }: { uri?: string; text?: string | null; size?: string }) => {
  const [imageLoadingError, setImageLoadingError] = useState(false);

  return (
    <div className={styles.container}>
      <div className={cx({ image: size !== "xsmall", imageXsmall: size == "xsmall" })}>
        {!imageLoadingError || uri ? (
           <ReactPlayer url={uri} controls={true} width="100%" height="fit-content" />
/*            <img
                src={smallImageLoader({ src: uri, width: 400 })}
                onError={() => {
                    setImageLoadingError(true);
                }}
                alt={text ?? "OBS mangler alt-tekst"}
                draggable="false"
                sizes="50vw"
            />*/
        ):(
          <HStack height="100%" justify="center" align="center">
            <VideoIcon title="Produkt mangler video" fontSize="2rem" />
          </HStack>
        ) }
      </div>
    </div>
  );
};
