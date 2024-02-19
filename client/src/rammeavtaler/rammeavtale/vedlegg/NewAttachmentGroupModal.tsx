import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelRequired } from "utils/string-util";
import { Avstand } from "components/Avstand";
import { updateAgreementWithNewAttachmentGroup } from "api/AgreementApi";
import { createNewAttachmentGroupSchema } from "utils/zodSchema/newAttachmentGroup";
import Content from "components/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  setModalIsOpen: (open: boolean) => void;
  mutateAgreement: () => void;
}

export type NyAttachmentGroupFormData = z.infer<typeof createNewAttachmentGroupSchema>;

const NewAttachmentGroupModal = ({ modalIsOpen, oid, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NyAttachmentGroupFormData>({
    resolver: zodResolver(createNewAttachmentGroupSchema),
    mode: "onSubmit",
  });
  const { setGlobalError } = useHydratedErrorStore();

  async function onSubmitContinue(data: NyAttachmentGroupFormData) {
    await onSubmit(data);
  }

  async function onSubmitClose(data: NyAttachmentGroupFormData) {
    await onSubmit(data);
    setModalIsOpen(false);
  }

  async function onSubmit(data: NyAttachmentGroupFormData) {
    setIsSaving(true);

    updateAgreementWithNewAttachmentGroup(oid, data)
      .then((agreement) => {
        setIsSaving(false);
        mutateAgreement();
      })
      .catch((error) => {
        setGlobalError(error.message);
        setIsSaving(false);
      });
    reset();
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Legg til dokumentgruppe",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form>
        <Modal.Body>
          <Content>
            <VStack style={{ width: "100%" }}>
              <TextField
                {...register("tittel", { required: true })}
                label={labelRequired("Tittel")}
                id="tittel"
                name="tittel"
                type="text"
                error={errors?.tittel?.message}
              />
              <Avstand marginBottom={5} />
              <Textarea
                {...register("beskrivelse", { required: true })}
                label={labelRequired("Beskrivelse")}
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
          <Button onClick={handleSubmit(onSubmitClose)} type="submit" variant="secondary">
            Legg til
          </Button>
          <Button onClick={handleSubmit(onSubmitContinue)} variant="primary" type="submit">
            Legg til og fortsett
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default NewAttachmentGroupModal;
