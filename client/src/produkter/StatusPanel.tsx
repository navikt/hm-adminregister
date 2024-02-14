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

  return (
    <VStack gap="4">
      <Heading level="1" size="medium">
        Status
      </Heading>
      <StatusTag isPending={isPending} isDraft={isDraft} />

      <Box>
        <BodyLong size="small" weight="semibold">Endret</BodyLong>
        <BodyLong size="small">{toReadableDateTimeString(product.updated)}</BodyLong>
      </Box>

      {isAdmin ? (
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
      ) : (
        <Box>
          <BodyLong size="small" weight="semibold">Melding til leverandør</BodyLong>
          <BodyLong size="small">{product.message}</BodyLong>
        </Box>
      )}
      <Box>
        <BodyLong size="small" weight="semibold">Sendt til godkjenning</BodyLong>
        <BodyLong size="small">Dato her</BodyLong>
      </Box>
      <Box>
        <BodyLong size="small" weight="semibold">Opprettet</BodyLong>
        <BodyLong size="small">{toReadableDateTimeString(product.created)}</BodyLong>
      </Box>
    </VStack>
  )
}

export default StatusPanel