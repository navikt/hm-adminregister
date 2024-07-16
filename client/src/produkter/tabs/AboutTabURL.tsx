import { Button, Heading, TextField, VStack } from "@navikt/ds-react";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import { isValidUrl } from "produkter/seriesUtils";
import { updateSeriesURL } from "api/SeriesApi";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { useErrorStore } from "utils/store/useErrorStore";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
  mutateSeries: () => void;
  isEditable: boolean;
}

export const AboutTabURL = ({ series, isAdmin, mutateSeries, isEditable }: Props) => {
  const [showEditUrlMode, setShowEditUrlMode] = useState(false);
  const [urlFormatError, setUrlFormatError] = useState<string | undefined>(undefined);
  const [updatedUrl, setUpdatedUrl] = useState<string>(series.seriesData.attributes.url ?? "");
  const { setGlobalError } = useErrorStore();

  const url = series.seriesData.attributes.url;

  const handleSaveUrl = (updatedUrl: string) => {
    setShowEditUrlMode(false);

    updateSeriesURL(series!.id, updatedUrl, isAdmin)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  };

  return (
    <>
      <VStack gap="2">
        <Heading level="2" size="xsmall">
          {"URL til leverandørs produktside"}
        </Heading>
        {!showEditUrlMode && (
          <>
            {!url ? (
              <>
                {isEditable ? (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PlusCircleIcon title="Legg til URL til leverandørs produktside" fontSize="1.5rem" />}
                    onClick={() => setShowEditUrlMode(true)}
                  >
                    Legg til URL til leverandørs produktside
                  </Button>
                ) : (
                  "-"
                )}
              </>
            ) : (
              <>
                <a href={url} target="_blank" className="preview" rel="noreferrer">
                  {url}
                </a>
                {isEditable && (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PencilWritingIcon title="Endre url" fontSize="1.5rem" />}
                    onClick={() => setShowEditUrlMode(true)}
                  >
                    Endre URL
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {showEditUrlMode && (
          <>
            <TextField
              defaultValue={url || ""}
              label={""}
              id="url"
              name="url"
              type="text"
              onChange={(e) => {
                if (e.target.value.length > 0 && !isValidUrl(e.target.value)) {
                  setUrlFormatError("Ugyldig URL-format");
                } else {
                  setUpdatedUrl(e.target.value?.trim());
                  setUrlFormatError(undefined);
                }
              }}
              error={urlFormatError}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon title="Lagre URL" fontSize="1.5rem" />}
              onClick={() => {
                handleSaveUrl(updatedUrl);
              }}
            >
              Lagre
            </Button>
          </>
        )}
      </VStack>
    </>
  );
};

export default AboutTabURL;
