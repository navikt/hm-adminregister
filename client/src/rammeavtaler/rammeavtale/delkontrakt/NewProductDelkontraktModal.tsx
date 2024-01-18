import { Button, HStack, Loader, Modal, Textarea, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHydratedErrorStore } from '../../../utils/store/useErrorStore'
import { z } from 'zod'
import { createNewDelkontraktSchema } from '../../../utils/zodSchema/newDelkontrakt'
import { zodResolver } from '@hookform/resolvers/zod'
import { labelRequired } from '../../../utils/string-util'
import { Avstand } from '../../../components/Avstand'
import { updateAgreementWithNewDelkontrakt } from '../../../api/AgreementApi'
import { createNewProductOnDelkontraktSchema } from '../../../utils/zodSchema/newProductOnDelkontrakt'

interface Props {
  modalIsOpen: boolean
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

export type NewProductDelkontraktFormData = z.infer<typeof createNewProductOnDelkontraktSchema>

const NewProductDelkontraktModal = ({ modalIsOpen, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NewProductDelkontraktFormData>({
    resolver: zodResolver(createNewProductOnDelkontraktSchema),
    mode: 'onSubmit',
  })
  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmitContinue(data: NewProductDelkontraktFormData) {
    await onSubmit(data)
  }

  async function onSubmitClose(data: NewProductDelkontraktFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  async function onSubmit(data: NewProductDelkontraktFormData) {
    setIsSaving(true)

    // todo: metode for å legge til produkt på delkontrakt
    reset()
    setIsSaving(false)
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: 'Legg til produkt',
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
                {...register('hmsNummer', { required: true })}
                label={labelRequired('HMS-nummer')}
                id='hmsNummer'
                name='hmsNummer'
                type='text'
                error={errors?.hmsNummer?.message}
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
              Legg til
            </Button>
            <Button
              onClick={handleSubmit(onSubmitContinue)}
              variant='primary'
              type='submit'
            >
              Legg til og fortsett
            </Button>
          </HStack>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default NewProductDelkontraktModal
