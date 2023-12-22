import { FilePdfIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { Alert, Button, HStack, Tabs, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import './agreement-page.scss'
import UploadModal from './UploadModal'
import { AgreementRegistrationDTO } from '../../utils/response-types'
import { getEditedAgreementDTORemoveFiles, mapPDFfromMedia } from '../../utils/agreement-util'
import { useHydratedErrorStore } from '../../utils/store/useErrorStore'
import { MoreMenu } from '../../components/MoreMenu'
import { HM_REGISTER_URL } from '../../environments'

interface Props {
  agreement: AgreementRegistrationDTO
  mutateAgreement: () => void
}

const FileTab = ({ agreement, mutateAgreement }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const { pdfs } = mapPDFfromMedia(agreement)
  const { setGlobalError } = useHydratedErrorStore()

  const sortedPdfs = pdfs.sort((a, b) => new Date(a.updated).getTime() - new Date(b.updated).getTime())

  const handleDeleteFile = async (uri: string) => {
    const oid = agreement.id
    //Fetch latest version of product
    let res = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${oid}`, {
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
    const editedAgreementDTO = getEditedAgreementDTORemoveFiles(agreementToUpdate, uri)

    res = await fetch(`/admreg/admin/api/v1/agreement/registrations/${agreementToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(editedAgreementDTO),
    })
    if (!res.ok) {
      setGlobalError(res.status, res.statusText)
      return
    }
    mutateAgreement()
  }

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={agreement.id}
        mutateAgreement={mutateAgreement}
      />
      <Tabs.Panel value="documents" className="tab-panel">
        <VStack gap="8">
            <>
              {sortedPdfs.length > 0 && (
                <ol className="documents">
                  {sortedPdfs.map((pdf) => (
                    <li className="document" key={pdf.uri}>
                      <HStack gap={{ xs: '1', sm: '2', md: '3' }} align="center">
                        <FilePdfIcon fontSize="2rem" />
                        <a href={pdf.sourceUri} target="_blank" className="document-type">
                          {pdf.text || pdf.uri.split('/').pop()}
                        </a>
                      </HStack>
                      <MoreMenu mediaInfo={pdf} handleDeleteFile={handleDeleteFile} fileType="document" />
                    </li>
                  ))}
                </ol>
              )}
              {sortedPdfs.length === 0 && (
                <Alert variant="info">Produktet trenger dokumenter før det kan sendes til godkjenning</Alert>
              )}
            </>


          <Button
            className="fit-content"
            variant="tertiary"
            icon={
              <PlusCircleIcon
                title='Legg til dokument'
                fontSize="1.5rem"
              />
            }
            onClick={() => setModalIsOpen(true)}
          >
            Legg til dokumenter
          </Button>
        </VStack>
      </Tabs.Panel>
    </>
  )
}

export default FileTab
