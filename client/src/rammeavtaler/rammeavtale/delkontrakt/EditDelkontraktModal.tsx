import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHydratedErrorStore } from '../../../utils/store/useErrorStore'
import { z } from 'zod'
import { createNewDelkontraktSchema } from '../../../utils/zodSchema/newDelkontrakt'
import { zodResolver } from '@hookform/resolvers/zod'
import { labelRequired } from '../../../utils/string-util'
import { Avstand } from '../../../components/Avstand'
import { updateDelkontrakt } from '../../../api/AgreementApi'
import { editDelkontraktSchema } from '../../../utils/zodSchema/editDelkontrakt'
import { AgreementPostDTO } from '../../../utils/response-types'

interface Props {
  modalIsOpen: boolean
  oid: string
  delkontrakt: AgreementPostDTO
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

export type EditDelkontraktFormData = z.infer<typeof editDelkontraktSchema>

const EditDelkontraktModal = ({ modalIsOpen, oid, delkontrakt, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditDelkontraktFormData>({
    resolver: zodResolver(createNewDelkontraktSchema),
    mode: 'onSubmit',
    defaultValues: {
      tittel: delkontrakt.title || '',
      beskrivelse: delkontrakt.description || '',
    },
  })
  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmitClose(data: EditDelkontraktFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  async function onSubmit(data: EditDelkontraktFormData) {
    setIsSaving(true)

    updateDelkontrakt(oid, delkontrakt.identifier, data).then(
      (agreement) => {
        setIsSaving(false)
        mutateAgreement()
      },
    ).catch((error) => {
      setGlobalError(error.message)
      setIsSaving(false)
    })
    reset()
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
          <div
            className='delkontrakter-tab__new-delkontrakt-container'
          >
            <VStack style={{ width: '100%' }}>
              <TextField
                {...register('tittel', { required: true })}
                label={labelRequired('Tittel')}
                id='tittel'
                name='tittel'
                type='text'
                error={errors?.tittel?.message}
              />
              <Avstand marginBottom={5} />
              <Textarea
                {...register('beskrivelse', { required: true })}
                label={labelRequired('Beskrivelse')}
                id='beskrivelse'
                name='beskrivelse'
                error={errors?.beskrivelse?.message}
              />
            </VStack>
          </div>
          {isSaving && (
            <HStack justify='center'>
              <Loader size='2xlarge' title='venter...' />
            </HStack>
          )}
        </Modal.Body>
        <Modal.Footer>
          <HStack gap='2'>
            <Button
              onClick={() => {
                setModalIsOpen(false)
                reset()
              }}
              variant='tertiary'
              type='reset'
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSubmit(onSubmitClose)}
              type='submit' variant='secondary'>
              Lagre endringer
            </Button>
          </HStack>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default EditDelkontraktModal
