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
  mutateSeries: () => void;
  showInputError: boolean;
  isEditable: boolean;
}

export const AboutTabDescription = ({ series, mutateSeries, showInputError, isEditable }: Props) => {
  const description = series.text;
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const [descriptionLengthError, setDescriptionLengthError] = useState<string | undefined>(undefined);
  const [updatedDescription, setUpdatedDescription] = useState<string>(description);
  const { setGlobalError } = useErrorStore();

  //Vi lagrer description onBlur, så lagreknappen bare lukker for nå.
  const closeDescriptionEditor = () => {
    if (descriptionLengthError) return;
    setShowEditDescriptionMode(false);
  };

  const handleSaveDescription = (updatedDescription: string) => {
    if (descriptionLengthError) return;
    updateProductDescriptionV2(series!.id, updatedDescription)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  };

  const onTextChange = (html: string, rawText: string) => {
    if (rawText.length > 750) {
      setDescriptionLengthError("Beskrivelsen kan ikke være lengre enn 750 tegn");
    } else {
      setDescriptionLengthError(undefined);
      setUpdatedDescription(html);
    }
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
              onTextChange={onTextChange}
              defaultValue={updatedDescription}
              className={styles.editor}
              toolbar={[["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]]}
              formats={["bold", "italic", "list", "link"]}
              onBlur={() => {
                handleSaveDescription(updatedDescription);
              }}
            />
            <div className="navds-form-field__error">
              <p
                className="navds-error-message navds-label"
                style={{ display: descriptionLengthError ? "flex" : "none" }}
              >
                • {descriptionLengthError}
              </p>
            </div>
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<FloppydiskIcon fontSize="1.5rem" aria-hidden />}
              onClick={() => {
                closeDescriptionEditor();
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
