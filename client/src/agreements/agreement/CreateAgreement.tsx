import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { postAgreementDraft } from 'api/AgreementApi'
import Content from 'felleskomponenter/styledcomponents/Content'
import { mergeDateWithTime, toDateTimeString } from 'utils/date-util'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useErrorStore } from 'utils/store/useErrorStore'
import { labelRequired } from 'utils/string-util'
import { AgreementDraftWithDTO } from 'utils/types/response-types'
import { createNewAgreementSchema } from 'utils/zodSchema/newAgreement'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, DatePicker, HStack, Heading, Label, Loader, TextField, VStack, useDatepicker } from '@navikt/ds-react'

type FormData = z.infer<typeof createNewAgreementSchema>

export default function CreateAgreement() {
  const { setGlobalError } = useErrorStore()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [avtaleperiodeStartTid, setAvtaleperiodeStartTid] = useState<string>('00:00')
  const [avtaleperiodeSluttTid, setAvtaleperiodeSluttTid] = useState<string>('23:59')
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isValid },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(createNewAgreementSchema),
    mode: 'onSubmit',
  })
  const { loggedInUser } = useAuthStore()

  const { datepickerProps: datepickerPropsAvtaleperiodeStart, inputProps: inputPropsAvtaleperiodeStart } =
    useDatepicker({
      fromDate: undefined,
      onDateChange: (value) => {
        if (value) setValue('avtaleperiodeStart', mergeDateWithTime(value, avtaleperiodeStartTid))
      },
    })

  const { datepickerProps: datepickerPropsAvtaleperiodeSlutt, inputProps: inputPropsAvtaleperiodeSlutt } =
    useDatepicker({
      fromDate: undefined,
      onDateChange: (value) => {
        if (value) setValue('avtaleperiodeSlutt', mergeDateWithTime(value, avtaleperiodeSluttTid))
      },
    })

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    const avtaleperiodeStart = mergeDateWithTime(data.avtaleperiodeStart, avtaleperiodeStartTid)
    const avtaleperiodeSlutt = mergeDateWithTime(data.avtaleperiodeSlutt, avtaleperiodeSluttTid)
    const newAgreement: AgreementDraftWithDTO = {
      title: data.agreementName,
      reference: data.anbudsnummer,
      expired: toDateTimeString(avtaleperiodeSlutt),
      published: toDateTimeString(avtaleperiodeStart),
    }

    postAgreementDraft(loggedInUser?.isAdmin || false, newAgreement)
      .then((agreement) => {
        setIsSaving(false)
        navigate(`/rammeavtaler/${agreement.id}`)
      })
      .catch((error) => {
        setIsSaving(false)
        setGlobalError(error.message)
      })
  }

  if (isSubmitting) {
    return <Loader size="3xlarge" title="Sender..."></Loader>
  }

  return (
    <main>
      <Content>
        <VStack gap="space-8">
          <Heading level="1" size="large">
            Kom i gang med ny rammeavtale
          </Heading>
          <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('agreementName', { required: true })}
              label={labelRequired('Avtalenavn')}
              id="agreementName"
              name="agreementName"
              type="text"
              error={errors?.agreementName?.message}
            />
            <div>
              <Label>Avtaleperiode</Label>
              <HStack gap="space-4" justify="space-between" style={{ marginTop: '0.5rem' }}>
                <VStack gap="space-2">
                  <DatePicker {...datepickerPropsAvtaleperiodeStart}>
                    <DatePicker.Input
                      {...inputPropsAvtaleperiodeStart}
                      label={labelRequired('Fra')}
                      id="avtaleperiodeStart"
                      name="avtaleperiodeStart"
                      error={errors?.avtaleperiodeStart?.message}
                    />
                  </DatePicker>
                  <TextField
                    label={labelRequired('Tid')}
                    id="avtaleperiodeStartTid"
                    name="avtaleperiodeStartTid"
                    type="time"
                    step={60}
                    value={avtaleperiodeStartTid}
                    onChange={(event) => {
                      const value = event.target.value
                      setAvtaleperiodeStartTid(value)
                      const currentDate = getValues('avtaleperiodeStart')
                      if (currentDate) {
                        setValue('avtaleperiodeStart', mergeDateWithTime(currentDate, value))
                      }
                    }}
                  />
                </VStack>
                <VStack gap="space-2">
                  <DatePicker {...datepickerPropsAvtaleperiodeSlutt}>
                    <DatePicker.Input
                      {...inputPropsAvtaleperiodeSlutt}
                      label={labelRequired('Til')}
                      id="avtaleperiodeSlutt"
                      name="avtaleperiodeSlutt"
                      error={errors?.avtaleperiodeSlutt?.message}
                    />
                  </DatePicker>
                  <TextField
                    label={labelRequired('Tid')}
                    id="avtaleperiodeSluttTid"
                    name="avtaleperiodeSluttTid"
                    type="time"
                    step={60}
                    value={avtaleperiodeSluttTid}
                    onChange={(event) => {
                      const value = event.target.value
                      setAvtaleperiodeSluttTid(value)
                      const currentDate = getValues('avtaleperiodeSlutt')
                      if (currentDate) {
                        setValue('avtaleperiodeSlutt', mergeDateWithTime(currentDate, value))
                      }
                    }}
                  />
                </VStack>
              </HStack>
            </div>
            <TextField
              {...register('anbudsnummer', { required: true })}
              label={labelRequired('Anbudsnummer')}
              id="anbudsnummer"
              name="anbudsnummer"
              type="text"
              error={errors?.anbudsnummer?.message}
            />
            <div className="button-container">
              <Button type="reset" variant="tertiary" size="medium" onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type="submit" size="medium" disabled={isSaving || isSubmitting || !isValid}>
                Opprett
              </Button>
            </div>
          </form>
        </VStack>
      </Content>
    </main>
  )
}
