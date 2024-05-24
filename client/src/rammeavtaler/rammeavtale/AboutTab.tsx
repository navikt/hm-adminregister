import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import { EditCommonInfoAgreement } from "./Rammeavtale";
import { labelRequired } from "utils/string-util";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import parse from "html-react-parser";
import { AgreementDescriptionRTE } from "rammeavtaler/rammeavtale/AgreementDescriptionRTE";

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
        <VStack gap="14">
          <VStack gap="2">
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
                <AgreementDescriptionRTE
                  onChange={(description: string) => {
                    formMethods.setValue("description", description);
                  }}
                  textContent={agreement.agreementData.text || ""}
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
