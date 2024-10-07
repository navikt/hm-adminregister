import { Alert, BodyShort, Button, Heading, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import parse from "html-react-parser";
import { useState } from "react";
import { updateProductDescriptionV2 } from "api/SeriesApi";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import { useErrorStore } from "utils/store/useErrorStore";
import RichTextEditorQuill from "felleskomponenter/RichTextEditorQuill";
import styles from "./Editor.module.scss";

interface Props {
  series: SeriesRegistrationDTOV2;
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

  const handleSaveDescription = (updatedDescription: string) => {
    setShowEditDescriptionMode(false);
    updateProductDescriptionV2(series!.id, updatedDescription, isAdmin)
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
                  icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
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
                    icon={<PencilWritingIcon fontSize="1.5rem" aria-hidden />}
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
            <BodyShort as="div" textColor="subtle">
              Beskrivelsen vises på produktsiden og bør:
              <ul>
                <li>Være mellom 100 og 750 tegn</li>
                <li>Ikke inneholde tekniske data, for eksempel. “Totalvekt i str. 42x40”</li>
                <li>Ha en nøytral språkstil uten markedsføringsuttrykk</li>
              </ul>
            </BodyShort>
            <RichTextEditorQuill
              onTextChange={setUpdatedDescription}
              defaultValue={updatedDescription}
              className={styles.editor}
              toolbar={[
                ["bold", "italic"],
                [{ list: "ordered" }, { list: "bullet" }],
              ]}
              formats={["bold", "italic", "list"]}
            />
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon fontSize="1.5rem" aria-hidden />}
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
