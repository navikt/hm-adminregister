import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { RichTextEditor } from "produkter/RichTextEditor";
import React, { useState } from "react";
import { EditSeriesInfo } from "produkter/Produkt";

interface Props {
  description: string;
  updateSeriesInfo: (editSeriesInfo: EditSeriesInfo) => void;
  showInputError: boolean;
  isEditable: boolean;
}

export const AboutTabDescription = ({ description, updateSeriesInfo, showInputError, isEditable }: Props) => {
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState<string>(description);

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
    updateSeriesInfo({ description: updatedDescription });
    setShowEditDescriptionMode(false);
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
