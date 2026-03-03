import { Alert, Button, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { PlusCircleIcon } from "@navikt/aksel-icons";
import { AttachmentGroup } from "./AttachmentGroup";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import NewAttachmentGroupModal from "agreements/agreement/vedlegg/NewAttachmentGroupModal";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";

interface Props {
  agreement: AgreementRegistrationDTO;
  mutateAgreement: () => void;
}

const FileTab = ({ agreement, mutateAgreement }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <NewAttachmentGroupModal
        oid={agreement.id}
        mutateAgreement={mutateAgreement}
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
      <TabPanel value="documents">
        <VStack gap="space-6">
          <>
            {agreement.agreementData.attachments.length > 0 &&
              agreement.agreementData.attachments.map((attachment, i) => (
                <AttachmentGroup
                  key={i}
                  agreementId={agreement.id}
                  mutateAgreement={mutateAgreement}
                  attachment={attachment}
                />
              ))}
            {agreement.agreementData.attachments.length === 0 && (
              <Alert variant="info">Avtalen trenger dokumenter før den kan publiseres</Alert>
            )}
          </>
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            Legg til dokumentgruppe
          </Button>
        </VStack>
      </TabPanel>
    </>
  );
};

export default FileTab;
