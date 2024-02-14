import React from 'react'
import { ProductRegistrationDTO } from 'utils/response-types'
import { BodyLong, Button, Heading, Label, Textarea, VStack } from '@navikt/ds-react'
import StatusTag from 'components/StatusTag'
import { toReadableDateTimeString } from 'utils/date-util'

interface Props {
  product: ProductRegistrationDTO
}

const StatusPanel = ({ product }: Props) => {

  const handleSendMelding = () => {
    // product.message må settes?
    alert('klikk')
  }

  const isDraft = product.draftStatus === 'DRAFT'
  const isPending = product.adminStatus === 'PENDING'

  return (
    <VStack gap="10">
      <VStack gap="2">
        <Heading level="1" size="medium">
          Status
        </Heading>
        <StatusTag isPending={isPending} isDraft={isDraft} />
      </VStack>
      <VStack gap="2">
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
      <VStack gap="2">
        <div>
          <BodyLong size="small" weight="semibold">Sendt til godkjenning</BodyLong>
          <BodyLong size="small">Dato her</BodyLong>
        </div>
        <div>
          <BodyLong size="small" weight="semibold">Opprettet</BodyLong>
          <BodyLong size="small">{toReadableDateTimeString(product.created)}</BodyLong>
        </div>
      </VStack>
    </VStack>
  )
}

export default StatusPanel