import { Alert, Button, Heading, Tabs, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { EditSeriesInfo } from "../Produkt";
import { IsoCategoryDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { RichTextEditor } from "produkter/RichTextEditor";
import DOMPurify from "dompurify";
import draftToHtml from "draftjs-to-html";
import { RawDraftContentState } from "draft-js";

interface Props {
  series: SeriesRegistrationDTO;
  onSubmit: SubmitHandler<EditSeriesInfo>;
  isoCategory?: IsoCategoryDTO;
  isEditable: boolean;
  showInputError: boolean;
}

const AboutTab = ({ series, onSubmit, isoCategory, isEditable, showInputError }: Props) => {
  const formMethods = useFormContext<EditSeriesInfo>();
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function createMarkup(contentState: RawDraftContentState) {
    const html = draftToHtml(contentState);

    return {
      __html: DOMPurify.sanitize(html),
    };
  }

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
    <Tabs.Panel value="about" className="tab-panel">
      <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>
        <VStack gap="14">
          <VStack gap="2">
            <Heading level="2" size="small">
              Iso-kategori (kode)
            </Heading>

            <div>
              {isoCategory?.isoTitle} ({isoCategory?.isoCode})
            </div>
          </VStack>

          <VStack gap="2">
            <Heading level="2" size="small">
              {labelRequired("Produktbeskrivelse")}
            </Heading>

            {!showEditDescriptionMode && (
              <>
                {!series.text && !series.formattedText ? (
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
                    {series.formattedText ? (
                      <div
                        className="preview"
                        dangerouslySetInnerHTML={createMarkup(JSON.parse(series.formattedText))}
                      ></div>
                    ) : (
                      <pre className="pre">{series.text}</pre>
                    )}

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
                  onChangeFormatted={(description: string) => {
                    formMethods.setValue("descriptionFormatted", description);
                  }}
                  textContent={series.text || ""}
                  formattedContent={series.formattedText || undefined}
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
        </VStack>
      </form>
    </Tabs.Panel>
  );
};

export default AboutTab;
