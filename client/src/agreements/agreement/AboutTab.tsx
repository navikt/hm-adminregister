import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import { EditCommonInfoAgreement } from "./Agreement";
import { labelRequired } from "utils/string-util";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import parse from "html-react-parser";
import RichTextEditorQuill from "felleskomponenter/RichTextEditorQuill";

interface Props {
  agreement: AgreementRegistrationDTO;
  onSubmit: SubmitHandler<EditCommonInfoAgreement>;
}

const AboutTab = ({ agreement, onSubmit }: Props) => {
  const formMethods = useFormContext<EditCommonInfoAgreement>();
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  formMethods.setValue("description", agreement.agreementData.text ?? "");

  const handleSaveDescription = () => {
    setShowEditDescriptionMode(false);
    formRef.current?.requestSubmit();
  };

  return (
    <TabPanel value="about">
      <form method="POST" onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef}>
        <VStack gap="space-16">
          <VStack gap="space-2">
            <Heading level="2" size="small">
              {labelRequired("Beskrivelse")}
            </Heading>

            {!showEditDescriptionMode && (
              <>
                {!agreement.agreementData.text ? (
                  <>
                    <Alert variant="info">Rammeavtalen trenger en beskrivelse før det kan sendes til godkjenning</Alert>
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
                    <div className="preview">{parse(agreement.agreementData.text)}</div>
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<PencilWritingIcon title="Endre beskrivelse" fontSize="1.5rem" />}
                      onClick={() => setShowEditDescriptionMode(true)}
                    >
                      Endre beskrivelse
                    </Button>
                  </>
                )}
              </>
            )}

            {showEditDescriptionMode && (
              <>
                <RichTextEditorQuill
                  onTextChange={(description: string) => {
                    formMethods.setValue("description", description);
                  }}
                  defaultValue={agreement.agreementData.text || ""}
                  className="editor"
                  toolbar={[["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"]]}
                  formats={["bold", "italic", "underline", "list", "link"]}
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
    </TabPanel>
  );
};

export default AboutTab;
