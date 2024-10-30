import { useState } from "react";

import { VideoIcon} from "@navikt/aksel-icons";
import { HStack } from "@navikt/ds-react";
import styles from "./MediaContainer.module.scss";
import ReactPlayer from "react-player";


export const MediaContainer = ({ uri, text, size }: { uri?: string; text?: string | null; size?: string }) => {
    const [mediaLoadingError, setMediaLoadingError] = useState(false);

  return (
    <div className={styles.container}>
      <div>
        {!mediaLoadingError || uri ? (
           <ReactPlayer
               url={uri}
               width={'100%'}
               height='100%'
               playing={false}
               muted={true}
               controls={true}
               onError={() => {
                   setMediaLoadingError(true);
               }}
               alt={text ?? "OBS mangler alt-tekst"}
           />
        ):(
          <HStack height="100%" justify="center" align="center">
            <VideoIcon title="Produkt mangler media" fontSize="2rem" />
          </HStack>
        ) }
      </div>
    </div>
  );
};
