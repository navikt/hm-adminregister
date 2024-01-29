import { Button, DatePicker, HStack, Label, Loader, Modal, TextField, useDatepicker, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHydratedErrorStore } from '../../utils/store/useErrorStore'
import {
  EditAgreementFormData,
  EditAgreementFormDataDto,
  editAgreementSchema,
} from '../../utils/zodSchema/editAgreement'
import { updateAgreementInfo } from '../../api/AgreementApi'
import { AgreementRegistrationDTO } from '../../utils/response-types'
import { useHydratedAuthStore } from '../../utils/store/useAuthStore'
import { labelRequired } from '../../utils/string-util'
import { toDate, toDateTimeString } from '../../utils/date-util'


interface Props {
  modalIsOpen: boolean
  agreement: AgreementRegistrationDTO
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

const EditRammeavtaleInfoModal = ({ modalIsOpen, agreement, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const { loggedInUser } = useHydratedAuthStore()

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditAgreementFormData>({
    resolver: zodResolver(editAgreementSchema),
    mode: 'onSubmit',
    defaultValues: {
      agreementName: agreement?.title,
      anbudsnummer: agreement?.reference,
      avtaleperiodeStart: toDate(agreement?.published),
      avtaleperiodeSlutt: toDate(agreement?.expired),
    },
  })

  const { datepickerProps: datepickerPropsAvtaleperiodeStart, inputProps: inputPropsAvtaleperiodeStart } =
    useDatepicker({
      fromDate: new Date('Jan 01 2015'),
      toDate: new Date('Jan 01 2025'),
      defaultSelected: toDate(agreement?.published),
      onDateChange: (value) => {
        if (value) setValue('avtaleperiodeStart', value)
      },
    })

  const { datepickerProps: datepickerPropsAvtaleperiodeSlutt, inputProps: inputPropsAvtaleperiodeSlutt } =
    useDatepicker({
      defaultSelected: toDate(agreement.expired),
      onDateChange: (value) => {
        if (value) setValue('avtaleperiodeSlutt', value)
      },
    })

  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmitClose(data: EditAgreementFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  async function onSubmit(data: EditAgreementFormData) {
    setIsSaving(true)

    const editAgreementFormDataDto: EditAgreementFormDataDto = {
      agreementName: data.agreementName,
      anbudsnummer: data.anbudsnummer,
      avtaleperiodeStart: toDateTimeString(data.avtaleperiodeStart),
      avtaleperiodeSlutt: toDateTimeString(data.avtaleperiodeSlutt),
    }

    updateAgreementInfo(agreement.id, editAgreementFormDataDto).then(
      (agreement) => {
        setIsSaving(false)
        mutateAgreement()
        setModalIsOpen(false)
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
        heading: 'Rediger rammeavtale',
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form>
        <Modal.Body>
          <div
            className='delkontrakter-tab__new-delkontrakt-container'
          >
            <VStack gap='5' style={{ width: '100%' }}>
              <TextField
                {...register('agreementName', { required: true })}
                label={labelRequired('Avtalenavn')}
                defaultValue={agreement?.title}
                id='agreementName'
                name='agreementName'
                type='text'
                error={errors?.agreementName?.message}
              />
              <div>
                <Label className='outer-label'>Avtaleperiode</Label>
                <HStack gap='4' justify='space-between' style={{ marginTop: '0.5rem' }}>
                  <DatePicker {...datepickerPropsAvtaleperiodeStart} >
                    <DatePicker.Input
                      {...inputPropsAvtaleperiodeStart}
                      label={labelRequired('Fra')}
                      id='avtaleperiodeStart'
                      name='avtaleperiodeStart'
                      error={errors?.avtaleperiodeStart?.message}

                    />
                  </DatePicker>
                  <DatePicker {...datepickerPropsAvtaleperiodeSlutt}>
                    <DatePicker.Input
                      {...inputPropsAvtaleperiodeSlutt}
                      label={labelRequired('Til')}
                      id='avtaleperiodeSlutt'
                      name='avtaleperiodeSlutt'
                      error={errors?.avtaleperiodeSlutt?.message} />
                  </DatePicker>
                </HStack>
              </div>
              <TextField
                {...register('anbudsnummer', { required: true })}
                label={labelRequired('Anbudsnummer')}
                id='anbudsnummer'
                name='anbudsnummer'
                defaultValue={agreement?.reference}
                type='text'
                error={errors?.anbudsnummer?.message}
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

export default EditRammeavtaleInfoModal
