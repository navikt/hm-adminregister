import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreementAttachment } from "utils/types/response-types";
import { editAttachmentGroupInfoSchema } from "utils/zodSchema/editAttachmentGroupInfo";
import { useErrorStore } from "utils/store/useErrorStore";
import { labelRequired } from "utils/string-util";
import { Avstand } from "felleskomponenter/Avstand";
import { updateAgreementAttachmentGroup } from "api/AgreementApi";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  attachment: AgreementAttachment;
  setModalIsOpen: (open: boolean) => void;
  mutateAgreement: () => void;
}

export type EditAttachmentGroupFormData = z.infer<typeof editAttachmentGroupInfoSchema>;

const EditAttachmentGroupModal = ({ modalIsOpen, oid, attachment, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditAttachmentGroupFormData>({
    resolver: zodResolver(editAttachmentGroupInfoSchema),
    mode: "onSubmit",
  });
  const { setGlobalError } = useErrorStore();

  async function onSubmit(data: EditAttachmentGroupFormData) {
    setIsSaving(true);
    setModalIsOpen(false);
    updateAgreementAttachmentGroup(oid, attachment.id!, data)
      .then(() => {
        mutateAgreement();
      })
      .catch((error) => {
        setGlobalError(error);
      });
    setIsSaving(false);
    reset();
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Rediger vedleggsgruppe",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Content>
            <VStack style={{ width: "100%" }}>
              <TextField
                {...register("tittel", { required: true })}
                defaultValue={attachment.title || ""}
                label={labelRequired("Tittel")}
                id="tittel"
                name="tittel"
                type="text"
                error={errors?.tittel?.message}
              />
              <Avstand marginBottom={5} />
              <Textarea
                {...register("beskrivelse", { required: false })}
                defaultValue={attachment.description || ""}
                label="Beskrivelse"
                id="beskrivelse"
                name="beskrivelse"
                error={errors?.beskrivelse?.message}
              />
            </VStack>
          </Content>
          {isSaving && (
            <HStack justify="center">
              <Loader size="2xlarge" title="venter..." />
            </HStack>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setModalIsOpen(false);
              reset();
            }}
            variant="tertiary"
            type="reset"
          >
            Avbryt
          </Button>
          <Button type="submit" variant="secondary">
            Lagre endringer
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditAttachmentGroupModal;
