import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { RichTextEditor } from "produkter/RichTextEditor";
import { useState } from "react";
import { updateProductDescription } from "api/SeriesApi";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { useErrorStore } from "utils/store/useErrorStore";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
  mutateSeries: () => void;
  showInputError: boolean;
  isEditable: boolean;
}

export const AboutTabDescription = ({ series, isAdmin, mutateSeries, showInputError, isEditable }: Props) => {
  const description = series.text;
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState<string>(description);
  const { setGlobalError } = useErrorStore();

  const getDescription = () => (
    <>
      Beskrivelsen vises på produktsiden og bør:
      <ul>
        <li>Være mellom 100 og 750 tegn</li>
        <li>Ikke inneholde tekniske data, for eksempel. “Totalvekt i str. 42x40”</li>
        <li>Ha en nøytral språkstil uten markedsføringsuttrykk</li>
      </ul>
    </>
  );

  const handleSaveDescription = (updatedDescription: string) => {
    setShowEditDescriptionMode(false);
    updateProductDescription(series!.id, updatedDescription, isAdmin)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  };

  return (
    <>
      <VStack gap="2">
        <Heading level="2" size="small">
          {labelRequired("Produktbeskrivelse")}
        </Heading>

        {!showEditDescriptionMode && (
          <>
            {!description ? (
              <>
                <Alert variant={showInputError ? "error" : "info"}>
                  Produktet trenger en beskrivelse før det kan sendes til godkjenning
                </Alert>
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PlusCircleIcon title="Legg til beskrivelse" fontSize="1.5rem" />}
                  onClick={() => setShowEditDescriptionMode(true)}
                >
                  Legg til beskrivelse
                </Button>
              </>
            ) : (
              <>
                <div className="preview">{parse(description)}</div>

                {isEditable && (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PencilWritingIcon title="Endre beskrivelse" fontSize="1.5rem" />}
                    onClick={() => setShowEditDescriptionMode(true)}
                  >
                    Endre beskrivelse
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {showEditDescriptionMode && (
          <>
            <RichTextEditor
              description={getDescription()}
              onChange={(description: string) => {
                setUpdatedDescription(description);
              }}
              textContent={updatedDescription}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon title="Lagre beskrivelse" fontSize="1.5rem" />}
              onClick={() => {
                handleSaveDescription(updatedDescription);
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

export default AboutTabDescription;
