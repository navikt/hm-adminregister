import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { z } from "zod";
import { createNewDelkontraktSchema } from "utils/zodSchema/newDelkontrakt";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelRequired } from "utils/string-util";
import { Avstand } from "felleskomponenter/Avstand";
import Content from "felleskomponenter/styledcomponents/Content";
import { createDelkontrakt } from "api/DelkontraktApi";
import styles from "products/about/Editor.module.scss";
import RichTextEditorQuill from "felleskomponenter/RichTextEditorQuill";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  setModalIsOpen: (open: boolean) => void;
  mutateDelkontrakter: () => void;
  newSortNr: number;
}

export type NyDelkontraktFormData = z.infer<typeof createNewDelkontraktSchema>;

const NewDelkontraktModal = ({ modalIsOpen, oid, setModalIsOpen, mutateDelkontrakter, newSortNr }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NyDelkontraktFormData>({
    resolver: zodResolver(createNewDelkontraktSchema),
    mode: "onSubmit",
  });
  const { setGlobalError } = useErrorStore();
  const [editorValue, setEditorValue] = useState("");

  const onChangeBeskrivelse = (value: string) => {
    setEditorValue(value);
    setValue("beskrivelse", value);
  };

  async function onSubmitContinue(data: NyDelkontraktFormData) {
    await onSubmit(data);
  }

  async function onSubmitClose(data: NyDelkontraktFormData) {
    await onSubmit(data);
    setModalIsOpen(false);
  }

  async function onSubmit(data: NyDelkontraktFormData) {
    setIsSaving(true);

    createDelkontrakt(oid, data, newSortNr)
      .then((_) => {
        setIsSaving(false);
        mutateDelkontrakter();
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
        heading: "Legg til delkontrakt",
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
              <RichTextEditorQuill
                defaultValue={editorValue}
                onTextChange={onChangeBeskrivelse}
                className={styles.editor}
                toolbar={[["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link"]]}
                formats={["bold", "italic", "list", "link"]}
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

export default NewDelkontraktModal;
