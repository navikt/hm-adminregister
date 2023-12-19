import { BodyLong, Button, ConfirmationPanel, Heading, Loader } from '@navikt/ds-react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Avstand } from '../components/Avstand'
import { Knapper } from '../components/Knapper'
import { LenkeMedLogging } from '../components/LenkeMedLogging'
import { LoaderContainer } from '../components/LoaderContainer'
import { KravSteg } from './KravSteg'

export interface BrukervilkårProps {
  loading: boolean

  onGodta(): Promise<void>
}

export function Brukervilkår(props: BrukervilkårProps) {
  const { loading, onGodta } = props
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ godtatt: boolean }>({
    defaultValues: {
      godtatt: false,
    },
  })

  if (loading) {
    return (
      <LoaderContainer>
        <Avstand paddingBottom={5} paddingTop={5}>
          <Loader />
        </Avstand>
      </LoaderContainer>
    )
  }

  return (
    <KravSteg>
      <Heading level="2" size="medium">
        {t('brukervilkår.overskrift')}
      </Heading>
      <BodyLong spacing>
        <Trans t={t} i18nKey="brukervilkår.ingress">
          {''}
          <LenkeMedLogging href="https://nav.no/barnebriller">nav.no</LenkeMedLogging>
        </Trans>
      </BodyLong>
      {t('brukervilkår.vilkår')}:
      <ul>
        <li>{t('brukervilkår.vilkår_1')}</li>
        <li>{t('brukervilkår.vilkår_2')}</li>
        <li>{t('brukervilkår.vilkår_3')}</li>
      </ul>
      <BodyLong spacing>{t('brukervilkår.forklaring')}</BodyLong>
      <form onSubmit={handleSubmit(async () => onGodta())}>
        <Controller
          control={control}
          name="godtatt"
          rules={{
            validate(value) {
              return value || t('brukervilkår.validering_godtatt')
            },
          }}
          render={({ field }) => (
            <ConfirmationPanel
              error={errors.godtatt?.message}
              label={t('brukervilkår.ledetekst_godtatt')}
              checked={field.value}
              {...field}
            />
          )}
        />
        <Avstand marginBottom={5} />
        <Knapper>
          <Button type="submit" loading={isSubmitting}>
            {t('brukervilkår.knapp_godta')}
          </Button>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => {
              window.location.href = 'https://nav.no/barnebriller'
            }}
          >
            {t('brukervilkår.knapp_avbryt')}
          </Button>
        </Knapper>
      </form>
    </KravSteg>
  )
}
