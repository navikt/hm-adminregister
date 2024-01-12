import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHydratedErrorStore } from '../../utils/store/useErrorStore'
import { z } from 'zod'
import { createNewDelkontraktSchema } from '../../utils/zodSchema/newDelkontrakt'
import { zodResolver } from '@hookform/resolvers/zod'
import { labelRequired } from '../../utils/string-util'
import { Avstand } from '../../components/Avstand'
import { updateAgreementWithNewDelkontrakt } from '../../api/AgreementApi'

interface Props {
  modalIsOpen: boolean
  oid: string
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

export type NyDelkontraktFormData = z.infer<typeof createNewDelkontraktSchema>

const NewDelkontraktModal = ({ modalIsOpen, oid, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NyDelkontraktFormData>({
    resolver: zodResolver(createNewDelkontraktSchema),
    mode: 'onSubmit',
  })
  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmitContinue(data: NyDelkontraktFormData) {
    await onSubmit(data)
  }

  async function onSubmitClose(data: NyDelkontraktFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  async function onSubmit(data: NyDelkontraktFormData) {
    setIsSaving(true)

    updateAgreementWithNewDelkontrakt(oid, data).then(
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
        heading: 'Legg til delkontrakt',
        closeButton: true,
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
          <Button
            onClick={handleSubmit(onSubmitContinue)}
            variant='primary'
            type='submit'
          >
            Legg til og fortsett
          </Button>
          <Button
            onClick={handleSubmit(onSubmitClose)}
            type='submit' variant='secondary'>
            Legg til
          </Button>
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
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default NewDelkontraktModal
