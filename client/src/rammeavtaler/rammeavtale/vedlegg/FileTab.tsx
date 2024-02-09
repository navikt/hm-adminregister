import { Alert, Button, Tabs, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import './../agreement-page.scss'
import { PlusCircleIcon } from '@navikt/aksel-icons'
import { AttachmentGroup } from './AttachmentGroup'
import { AgreementRegistrationDTO } from 'utils/response-types'
import NewAttachmentGroupModal from 'rammeavtaler/rammeavtale/vedlegg/NewAttachmentGroupModal'

interface Props {
  agreement: AgreementRegistrationDTO
  mutateAgreement: () => void
}

const FileTab = ({ agreement, mutateAgreement }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState(false)

  return (
    <>
      <NewAttachmentGroupModal
        oid={agreement.id}
        mutateAgreement={mutateAgreement}
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
      <Tabs.Panel value='documents' className='tab-panel'>
        <VStack gap='5'>
          <>
            {agreement.agreementData.attachments.length > 0 && (
              agreement.agreementData.attachments.map((attachment, i) => (
                <AttachmentGroup key={i} agreementId={agreement.id} mutateAgreement={mutateAgreement}
                                 attachment={attachment} />
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
              setModalIsOpen(true)
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
