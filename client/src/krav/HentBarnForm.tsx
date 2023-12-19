import { Search } from '@navikt/ds-react'
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { validator, validering } from '../validering'

export interface HentBarnFormData {
  fnr: string
}

export interface HentBarnFormProps {
  onValid: SubmitHandler<HentBarnFormData>
  onInvalid?: SubmitErrorHandler<HentBarnFormData>
}

export function HentBarnForm(props: HentBarnFormProps) {
  const { onValid, onInvalid } = props
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HentBarnFormData>({ defaultValues: { fnr: '' } })
  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} role="search" autoComplete="off">
      <Controller
        control={control}
        name="fnr"
        rules={{
          required: t('krav.validering_fnr_påkrevd'),
          validate: validator(validering.fnr, t('krav.validering_fnr_ugyldig')),
        }}
        render={({ field }) => (
          <Søkefelt>
            <Search
              label={t('krav.ledetekst_barnets_fnr')}
              hideLabel={false}
              maxLength={11}
              size="medium"
              error={errors.fnr?.message}
              {...field}
            >
              <Search.Button type="submit" loading={isSubmitting} />
            </Search>
          </Søkefelt>
        )}
      />
    </form>
  )
}

const Søkefelt = styled.div`
  //max-width: 330px;
`
