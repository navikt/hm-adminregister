import { Button, Dropdown, ExpansionCard, HStack } from '@navikt/ds-react'
import { FilePdfIcon, MenuElipsisVerticalIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons'
import React, { useState } from 'react'
import UploadModal from './UploadModal'
import EditAttachmentGroupModal from './EditAttachmentGroupModal'
import { AgreementAttachment, AgreementRegistrationDTO } from 'utils/response-types'
import { useHydratedErrorStore } from 'utils/store/useErrorStore'
import { HM_REGISTER_URL } from 'environments'
import { getEditedAgreementDTORemoveFiles } from 'utils/agreement-util'
import { updateAgreement } from 'api/AgreementApi'



interface Props {
  agreementId: string
  attachment: AgreementAttachment
  mutateAgreement: () => void
}

export const AttachmentGroup = ({ agreementId, attachment, mutateAgreement }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedAgreementAttachment, setSelectedAgreementAttachment] = useState<AgreementAttachment | undefined>(undefined)
  const [editAttachmentGroupModalIsOpen, setEditAttachmentGroupModalIsOpen] = useState(false)

  const { setGlobalError } = useHydratedErrorStore()
  const handleDeleteFile = async (uri: string, attachmentIdToUpdate: string) => {
    const oid = agreementId
    //Fetch latest version of agreement
    let res = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${oid}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      setGlobalError(res.status, res.statusText)
      return
    }

    const agreementToUpdate: AgreementRegistrationDTO = await res.json()
    const editedAgreementDTO = getEditedAgreementDTORemoveFiles(agreementToUpdate, attachmentIdToUpdate, uri)

    updateAgreement(agreementToUpdate.id, editedAgreementDTO).then(
      () => {
        mutateAgreement()
      },
    ).catch(
      (error) => {
        setGlobalError(error.status, error.statusText)
      },
    )
  }

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={agreementId}
        mutateAgreement={mutateAgreement}
        agreementAttachmentId={selectedAgreementAttachment?.id}
      />
      <EditAttachmentGroupModal
        modalIsOpen={editAttachmentGroupModalIsOpen}
        oid={agreementId}
        attachment={attachment}
        setModalIsOpen={setEditAttachmentGroupModalIsOpen}
        mutateAgreement={mutateAgreement}
      />
      <ExpansionCard size='small' key={attachment.id} aria-label='default-demo'>
        <ExpansionCard.Header>
          <ExpansionCard.Title size='small'>{attachment.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content style={{ overflow: 'auto' }}>
          <ol className='documents'>
            <p className='beskrivelse'><b>Beskrivelse:</b></p>
            {attachment.description && <p>{attachment.description}</p>}
            {attachment.media.map((pdf, j) => (
              <li className='document' key={pdf.uri}>
                <HStack gap={{ xs: '1', sm: '2', md: '3' }} align='center'>
                  <FilePdfIcon fontSize='2rem' />
                  <a href={pdf.sourceUri} target='_blank' className='document-type'>
                    {pdf.text || pdf.uri.split('/').pop()}
                  </a>
                </HStack>

                <Button
                  iconPosition='right'
                  variant={'tertiary'}
                  icon={
                    <TrashIcon
                      title='Slett'
                      fontSize='1.5rem'
                    />
                  }
                  onClick={() => {
                    handleDeleteFile(pdf.uri, attachment.id!!)
                  }} />
              </li>
            ))}
          </ol>
          <HStack>
            <Button
              className='fit-content'
              variant='tertiary'
              icon={
                <PlusCircleIcon
                  title='Legg til dokumenter'
                  fontSize='1.5rem'
                />
              }
              onClick={() => {
                setModalIsOpen(true)
              }}
            >
              <span className='produkt-button'>Legg til dokumenter</span>
            </Button>
            <Dropdown>
              <Button
                style={{ marginLeft: 'auto' }}
                variant='tertiary'
                icon={
                  <MenuElipsisVerticalIcon
                    title='Rediger'
                    fontSize='1.5rem'
                  />
                }

                as={Dropdown.Toggle}>
              </Button>
              <Dropdown.Menu>
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item onClick={() => {
                    setEditAttachmentGroupModalIsOpen(true)
                  }}>
                    Endre tittel og beskrivelse
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.List>
                  <Dropdown.Menu.List.Item
                    onClick={() => {
                      //setDeleteDelkontraktIsOpen(true)
                    }}
                  >
                    Slett dokumentgruppe
                  </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
              </Dropdown.Menu>
            </Dropdown>
          </HStack>
        </ExpansionCard.Content>
      </ExpansionCard>
    </>
  )
}