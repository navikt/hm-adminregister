import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelRequired } from "utils/string-util";
import { Avstand } from "felleskomponenter/Avstand";
import { editDelkontraktSchema } from "utils/zodSchema/editDelkontrakt";
import Content from "felleskomponenter/styledcomponents/Content";
import { DelkontraktRegistrationDTO } from "utils/types/response-types";
import { updateDelkontraktinfo } from "api/DelkontraktApi";

interface Props {
  modalIsOpen: boolean;
  delkontrakt: DelkontraktRegistrationDTO;
  setModalIsOpen: (open: boolean) => void;
  mutateDelkontrakt: () => void;
}

export type EditDelkontraktFormData = z.infer<typeof editDelkontraktSchema>;

const EditDelkontraktInfoModal = ({ modalIsOpen, delkontrakt, setModalIsOpen, mutateDelkontrakt }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditDelkontraktFormData>({
    resolver: zodResolver(editDelkontraktSchema),
    mode: "onSubmit",
  });
  const { setGlobalError } = useErrorStore();

  async function onSubmitClose(data: EditDelkontraktFormData) {
    await onSubmit(data);
    setModalIsOpen(false);
  }

  async function onSubmit(data: EditDelkontraktFormData) {
    setIsSaving(true);

    updateDelkontraktinfo(delkontrakt.id, data)
      .then(() => {
        setIsSaving(false);
        mutateDelkontrakt();
      })
      .catch((error) => {
        setGlobalError(error.message);
        setIsSaving(false);
      });
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Rediger delkontrakt",
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
                defaultValue={delkontrakt.delkontraktData.title || ""}
                label={labelRequired("Tittel")}
                id="tittel"
                name="tittel"
                type="text"
                error={errors?.tittel?.message}
              />
              <Avstand marginBottom={5} />
              <Textarea
                {...register("beskrivelse", { required: true })}
                defaultValue={delkontrakt.delkontraktData.description || ""}
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
            Lagre endringer
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditDelkontraktInfoModal;
