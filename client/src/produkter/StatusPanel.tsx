import React from 'react'
import { ProductRegistrationDTO } from 'utils/response-types'
import { BodyLong, Box, Button, Heading, Label, Textarea, VStack } from '@navikt/ds-react'
import StatusTag from 'components/StatusTag'
import { toReadableDateTimeString } from 'utils/date-util'

interface Props {
  product: ProductRegistrationDTO,
  isAdmin: boolean
}

const StatusPanel = ({ product, isAdmin }: Props) => {

  const handleSendMelding = () => {
    // product.message må settes?
    alert('klikk')
  }

  const isDraft = product.draftStatus === 'DRAFT'
  const isPending = product.adminStatus === 'PENDING'
  const sendtTilGodkjenning = (!isDraft && isPending)
  const publisert = (!isDraft && product.adminStatus === 'APPROVED')

  return (
    <VStack gap="4">
      <Heading level="1" size="medium">
        Status
      </Heading>

      <StatusTag isPending={isPending} isDraft={isDraft} />

      {isAdmin && (
        <VStack gap="2" align="start">
          <Textarea
            label={'Melding til leverandør'}
            description={'Unngå personopplysninger i meldingen'}
          />
          <Button
            variant="secondary"
            size="small"
            onClick={handleSendMelding}
          >
            Send melding
          </Button>
        </VStack>
      )}

      {!isAdmin && product.message && (
        <Box>
          <BodyLong size="small" weight="semibold">Melding til leverandør</BodyLong>
          <BodyLong size="small">{product.message}</BodyLong>
        </Box>
      )}

      {publisert && product.published && (
        <StatusBox title="Publisert" date={product.published} />
      )}

      {publisert && product.published && (
        <StatusBox title="Endringer publisert" date={product.published} />
      )}
      
      {sendtTilGodkjenning && (
        <StatusBox title="Sendt til godkjenning" date={product.created} />
      )}

      <StatusBox title="Endret" date={product.updated} />

      <StatusBox title="Opprettet" date={product.created} />
    </VStack>
  )
}

const StatusBox = ({ title, date }: {
  title: string,
  date: string
}) => {
  return (
    <Box>
      <BodyLong size="small" weight="semibold">{title}</BodyLong>
      <BodyLong size="small">{toReadableDateTimeString(date)}</BodyLong>
    </Box>
  )
}
export default StatusPanel