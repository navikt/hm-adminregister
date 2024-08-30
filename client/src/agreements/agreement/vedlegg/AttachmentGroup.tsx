import { Button, Dropdown, ExpansionCard, HStack, TextField } from "@navikt/ds-react";
import { FilePdfIcon, FloppydiskIcon, MenuElipsisVerticalIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { useRef, useState } from "react";
import EditAttachmentGroupModal from "./EditAttachmentGroupModal";
import { AgreementAttachment, MediaInfo } from "utils/types/response-types";
import { useErrorStore } from "utils/store/useErrorStore";
import {
  deleteAttachmentGroup,
  deleteFileFromAttachmentGroup,
  updateFilenameOfAgreementAttachment,
  uploadFilesToAgreement,
} from "api/AgreementApi";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { DocumentList } from "felleskomponenter/styledcomponents/DocumentList";
import { uriForMediaFile } from "utils/file-util";
import { EditAttachmentMenu } from "agreements/agreement/vedlegg/EditAttachmentMenu";
import UploadModal, { FileUpload } from "felleskomponenter/UploadModal";

interface Props {
  agreementId: string;
  attachment: AgreementAttachment;
  mutateAgreement: () => void;
}

export const AttachmentGroup = ({ agreementId, attachment, mutateAgreement }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editAttachmentGroupModalIsOpen, setEditAttachmentGroupModalIsOpen] = useState(false);
  const [deleteAttachmentIsOpen, setDeleteAttachmentIsOpen] = useState(false);
  const [editModeAttachmentId, setEditModeAttachmentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const [editedFileText, setEditedFileText] = useState("");

  const handleSaveUpdatedFileName = () => {
    updateFilenameOfAgreementAttachment(agreementId, editModeAttachmentId!, attachment.id!, editedFileText)
      .then(() => {
        mutateAgreement();
        setEditModeAttachmentId(null);
        setEditedFileText("");
      })
      .catch((error) => {
        setGlobalError(error.status, error.statusText);
      });
  };

  const handleEditFileName = (mediaInfo: MediaInfo) => {
    setEditModeAttachmentId(mediaInfo.uri);
    setEditedFileText(mediaInfo.text ?? "");
  };

  const { setGlobalError } = useErrorStore();
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

  const uploadFiles = async (uploads: FileUpload[]) =>
    uploadFilesToAgreement(agreementId, attachment.id!, uploads)
      .then(() => {
        mutateAgreement();
        setModalIsOpen(false);
      })
      .catch((error) => {
        setGlobalError(error);
      });

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        onSubmit={uploadFiles}
        fileType={"documents"}
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
        confirmButtonText="Slett"
        variant="danger"
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
                {editModeAttachmentId && editModeAttachmentId === pdf.uri ? (
                  <>
                    <TextField
                      ref={containerRef}
                      style={{ width: `${pdf.text?.length ?? 0}ch`, maxWidth: "550px", minWidth: "450px" }}
                      label="Endre filnavn"
                      value={editedFileText}
                      onChange={(event) => setEditedFileText(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSaveUpdatedFileName();
                        }
                      }}
                    />
                    <HStack align="end">
                      <Button
                        variant="tertiary"
                        title="Lagre"
                        onClick={handleSaveUpdatedFileName}
                        icon={<FloppydiskIcon fontSize="2rem" aria-hidden />}
                      />
                    </HStack>
                  </>
                ) : (
                  <>
                    <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                      <FilePdfIcon fontSize="2rem" />
                      <a href={uriForMediaFile(pdf)} target="_blank" className="document-type" rel="noreferrer">
                        {pdf.text || pdf.uri.split("/").pop()}
                      </a>
                    </HStack>

                    <HStack>
                      <EditAttachmentMenu
                        handleDeleteFile={handleDeleteFile}
                        handleEditFileName={handleEditFileName}
                        attachmentId={attachment.id!}
                        mediaInfo={pdf}
                      />
                    </HStack>
                  </>
                )}
              </li>
            ))}
          </DocumentList>
          <HStack>
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
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
