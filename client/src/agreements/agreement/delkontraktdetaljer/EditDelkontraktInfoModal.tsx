import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { updateDelkontraktinfo } from 'api/DelkontraktApi'
import { Avstand } from 'felleskomponenter/Avstand'
import RichTextEditorQuill from 'felleskomponenter/RichTextEditorQuill'
import Content from 'felleskomponenter/styledcomponents/Content'
import styles from 'products/about/Editor.module.scss'
import { useErrorStore } from 'utils/store/useErrorStore'
import { labelRequired } from 'utils/string-util'
import { DelkontraktRegistrationDTO } from 'utils/types/response-types'
import { editDelkontraktSchema } from 'utils/zodSchema/editDelkontrakt'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, HStack, Loader, Modal, TextField, VStack } from '@navikt/ds-react'

interface Props {
  modalIsOpen: boolean
  delkontrakt: DelkontraktRegistrationDTO
  setModalIsOpen: (open: boolean) => void
  mutateDelkontrakt: () => void
}

export type EditDelkontraktFormData = z.infer<typeof editDelkontraktSchema>

const EditDelkontraktInfoModal = ({ modalIsOpen, delkontrakt, setModalIsOpen, mutateDelkontrakt }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [editorValue, setEditorValue] = useState(delkontrakt.delkontraktData.description || '')

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditDelkontraktFormData>({
    resolver: zodResolver(editDelkontraktSchema),
    mode: 'onSubmit',
  })
  const { setGlobalError } = useErrorStore()

  useEffect(
    () => (
      setValue('tittel', delkontrakt.delkontraktData.title || ''),
      setValue('beskrivelse', delkontrakt.delkontraktData.description || '')
    ),
    []
  )

  async function onSubmitClose(data: EditDelkontraktFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  const onChangeBeskrivelse = (value: string) => {
    setEditorValue(value)
    setValue('beskrivelse', value)
  }

  async function onSubmit(data: EditDelkontraktFormData) {
    setIsSaving(true)

    updateDelkontraktinfo(delkontrakt.id, data)
      .then(() => {
        setIsSaving(false)
        mutateDelkontrakt()
      })
      .catch((error) => {
        setGlobalError(error.message)
        setIsSaving(false)
      })
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: 'Rediger delkontrakt',
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form>
        <Modal.Body>
          <Content>
            <VStack style={{ width: '100%' }}>
              <TextField
                {...register('tittel', { required: true })}
                defaultValue={delkontrakt.delkontraktData.title || ''}
                label={labelRequired('Tittel')}
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
                toolbar={[['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['link']]}
                formats={['bold', 'italic', 'list', 'link']}
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
              setModalIsOpen(false)
              reset()
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
  )
}

export default EditDelkontraktInfoModal
