import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { RichTextEditor } from "produkter/RichTextEditor";
import React, { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { EditSeriesInfo } from "produkter/Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";

interface Props {
  series: SeriesRegistrationDTO;
  onSubmit: SubmitHandler<EditSeriesInfo>;
  isEditable: boolean;
  showInputError: boolean;
  // handleSaveDescription: () => void;
}

export const AboutTabDescription = ({
  series,
  onSubmit,
  isEditable,
  showInputError,
}: // handleSaveDescription,
Props) => {
  const formMethods = useFormContext<EditSeriesInfo>();
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSaveDescription = () => {
    setShowEditDescriptionMode(false);
    formRef.current?.requestSubmit();
  };

  return (
    <>
      {/*<form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>*/}
      <VStack gap="2">
        <Heading level="2" size="small">
          {labelRequired("Produktbeskrivelse")}
        </Heading>

        {!showEditDescriptionMode && (
          <>
            {!series.text ? (
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
                <div className="preview">{parse(series.text)}</div>

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
                formMethods.setValue("description", description);
              }}
              textContent={series.text || ""}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon title="Lagre beskrivelse" fontSize="1.5rem" />}
              onClick={handleSaveDescription}
            >
              Lagre
            </Button>
          </>
        )}
      </VStack>
      {/*</form>*/}
    </>
  );
};

export default AboutTabDescription;
