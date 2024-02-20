import { Button, Dropdown, ExpansionCard, HStack } from "@navikt/ds-react";
import { FilePdfIcon, MenuElipsisVerticalIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import UploadModal from "./UploadModal";
import EditAttachmentGroupModal from "./EditAttachmentGroupModal";
import { AgreementAttachment } from "utils/response-types";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { deleteAttachmentGroup, deleteFileFromAttachmentGroup } from "api/AgreementApi";
import ConfirmModal from "components/ConfirmModal";
import { DocumentList } from "components/styledcomponents/DocumentList";

interface Props {
  agreementId: string;
  attachment: AgreementAttachment;
  mutateAgreement: () => void;
}

export const AttachmentGroup = ({ agreementId, attachment, mutateAgreement }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editAttachmentGroupModalIsOpen, setEditAttachmentGroupModalIsOpen] = useState(false);
  const [deleteAttachmentIsOpen, setDeleteAttachmentIsOpen] = useState(false);

  const { setGlobalError } = useHydratedErrorStore();
  const handleDeleteFile = async (uri: string, attachmentIdToUpdate: string) => {
    deleteFileFromAttachmentGroup(agreementId, uri, attachmentIdToUpdate)
      .then(() => {
        mutateAgreement();
      })
      .catch((error) => {
        setGlobalError(error.status, error.statusText);
      });
  };

  const onConfirmDeleteDelkontrakt = () => {
    deleteAttachmentGroup(agreementId, attachment.id!)
      .then(() => {
        mutateAgreement();
      })
      .catch((error) => {
        setGlobalError(error.status, error.statusText);
      });
    setDeleteAttachmentIsOpen(false);
  };

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={agreementId}
        mutateAgreement={mutateAgreement}
        agreementAttachmentId={attachment.id!}
      />
      <EditAttachmentGroupModal
        modalIsOpen={editAttachmentGroupModalIsOpen}
        oid={agreementId}
        attachment={attachment}
        setModalIsOpen={setEditAttachmentGroupModalIsOpen}
        mutateAgreement={mutateAgreement}
      />
      <ConfirmModal
        title={`Slett '${attachment.title}'`}
        text="Er du sikker på at du vil slette vedleggsgruppen?"
        onClick={onConfirmDeleteDelkontrakt}
        onClose={() => {
          setDeleteAttachmentIsOpen(false);
        }}
        isModalOpen={deleteAttachmentIsOpen}
      />
      <ExpansionCard size="small" key={attachment.id} aria-label="default-demo">
        <ExpansionCard.Header>
          <ExpansionCard.Title size="small">{attachment.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content style={{ overflow: "auto" }}>
          <DocumentList>
            <b>Beskrivelse:</b>
            {attachment.description}
            {attachment.media.map((pdf, j) => (
              <li key={pdf.uri}>
                <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                  <FilePdfIcon fontSize="2rem" />
                  <a href={pdf.sourceUri} target="_blank" className="document-type">
                    {pdf.text || pdf.uri.split("/").pop()}
                  </a>
                </HStack>

                <Button
                  iconPosition="right"
                  variant={"tertiary"}
                  icon={<TrashIcon title="Slett" fontSize="1.5rem" />}
                  onClick={() => {
                    handleDeleteFile(pdf.uri, attachment.id!!);
                  }}
                />
              </li>
            ))}
          </DocumentList>
          <HStack>
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<PlusCircleIcon title="Legg til dokumenter" fontSize="1.5rem" />}
              onClick={() => {
                setModalIsOpen(true);
              }}
            >
              <span>Legg til dokumenter</span>
            </Button>
            <Dropdown>
              <Button
                style={{ marginLeft: "auto" }}
                variant="tertiary"
                icon={<MenuElipsisVerticalIcon title="Rediger" fontSize="1.5rem" />}
                as={Dropdown.Toggle}
              ></Button>
              <Dropdown.Menu>
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item
                    onClick={() => {
                      setEditAttachmentGroupModalIsOpen(true);
                    }}
                  >
                    Endre tittel og beskrivelse
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.List>
                  <Dropdown.Menu.List.Item
                    onClick={() => {
                      setDeleteAttachmentIsOpen(true);
                    }}
                  >
                    Slett dokumentgruppe
                  </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
              </Dropdown.Menu>
            </Dropdown>
          </HStack>
        </ExpansionCard.Content>
      </ExpansionCard>
    </>
  );
};
