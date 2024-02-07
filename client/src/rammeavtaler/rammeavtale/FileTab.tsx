import { Alert, Button, Tabs, VStack } from '@navikt/ds-react'
import React from 'react'
import './agreement-page.scss'
import { AgreementRegistrationDTO } from '../../utils/response-types'
import { PlusCircleIcon } from '@navikt/aksel-icons'
import { AttachmentGroup } from './AttachmentGroup'

interface Props {
  agreement: AgreementRegistrationDTO
  mutateAgreement: () => void
}

const FileTab = ({ agreement, mutateAgreement }: Props) => {

  return (
    <>
      <Tabs.Panel value='documents' className='tab-panel'>
        <VStack gap='8'>
          <>
            {agreement.agreementData.attachments.length > 0 && (
              agreement.agreementData.attachments.map((attachment, i) => (
                <AttachmentGroup agreementId={agreement.id} mutateAgreement={mutateAgreement} attachment={attachment} />
              ))
            )}
            {agreement.agreementData.attachments.length === 0 && (
              <Alert variant='info'>Avtalen trenger dokumenter før den kan publiseres</Alert>
            )}
          </>
          <Button
            className='fit-content'
            variant='tertiary'
            icon={
              <PlusCircleIcon
                title='Legg til dokument'
                fontSize='1.5rem'
              />
            }
            onClick={() => {

            }}
          >
            Legg til dokumentgruppe
          </Button>
        </VStack>
      </Tabs.Panel>
    </>
  )
}

export default FileTab
