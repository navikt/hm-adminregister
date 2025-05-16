import { Alert, BodyLong, BodyShort, Button, Heading, HelpText, HStack, Link, Tabs, VStack } from "@navikt/ds-react";
import { SeriesDTO } from "utils/types/response-types";

import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { deleteFileFromSeries } from "api/SeriesApi";
import styles from "../ProductPage.module.scss";
import { PlusCircleIcon } from "@navikt/aksel-icons";
import FellesSortingArea from "felleskomponenter/sort/FellesSortingArea";
import { VideoModal } from "products/videos/VideoModal";

const VideoTab = ({
  series,
  mutateSeries,
  isEditable,
}: {
  series: SeriesDTO;
  mutateSeries: () => void;
  isEditable: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { videos } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();
  const videoAmountLimit = 4;

  async function handleDeleteVideoLink(uri: string) {
    deleteFileFromSeries(series.id, uri)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <Tabs.Panel value="videos" className={styles.tabPanel}>
      <VStack gap="8">
        {videos.length === 0 && (
          <Alert variant="info">Videoene vises på FinnHjelpemiddel og vil sorteres alfabetisk.</Alert>
        )}

        <VideoRequirementBox />

        {videos.length > 0 && (
          <VStack gap="8 2">
            {series && (
              <FellesSortingArea
                seriesId={series.id}
                allMedia={videos}
                handleDeleteFile={handleDeleteVideoLink}
                isEditable={isEditable}
              />
            )}
          </VStack>
        )}

        {isEditable && (
          <HStack align={"center"}>
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
              onClick={() => {
                setModalIsOpen(true);
              }}
              disabled={videos.length >= videoAmountLimit}
            >
              Legg til videolenke
            </Button>
            {videos.length >= videoAmountLimit && (
              <BodyShort weight={"semibold"}>Du kan ikke legge til mer enn {videoAmountLimit} videoer.</BodyShort>
            )}
          </HStack>
        )}
      </VStack>
      <VideoModal seriesId={series.id} mutateSeries={mutateSeries} isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
    </Tabs.Panel>
  );
};

export default VideoTab;

const VideoRequirementBox = () => (
  <Alert variant="warning">
    <Heading spacing size="small" level="1">
      Krav til video
    </Heading>
    <BodyLong>- er på norsk, svensk eller dansk språk (engelsk kan unntaksvis benyttes)</BodyLong>
    <BodyLong>- er informativ og relevant til produktet</BodyLong>
    <BodyLong>- er nøytral og har et objektivt preg</BodyLong>
    <BodyLong>- er tekstet</BodyLong>
    <HStack>
      <BodyLong spacing>- er synstolket (gjelder videoer publisert etter 01.02.2024)</BodyLong>
      <HelpText title="Informasjon om synstolking">
        Synstolking betyr at viktig visuell informasjon i video bli beskrevet via lyd.
      </HelpText>
    </HStack>
    <BodyLong>
      Les mer på{" "}
      <Link href="https://www.uutilsynet.no/wcag-standarden/12-tidsbaserte-medier/743" target="_blank">
        Tilsynet for universell utforming sine nettsider
      </Link>
    </BodyLong>
  </Alert>
);
