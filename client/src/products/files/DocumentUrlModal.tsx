import { useEffect, useState } from 'react'

import { saveDocumentUrlToSeries, updateSeriesDocumentUrls } from 'api/SeriesApi'
import { isValidUrl } from 'products/seriesUtils'
import { useErrorStore } from 'utils/store/useErrorStore'
import { DocumentUrl } from 'utils/types/response-types'

import { Button, Modal, TextField, VStack } from '@navikt/ds-react'

type DocumentUrlModalProps = {
  seriesId: string
  mutateSeries: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  existingDocumentUrls?: DocumentUrl[]
  editDocumentUrl?: DocumentUrl
}

export const DocumentUrlModal = ({
  seriesId,
  mutateSeries,
  isOpen,
  setIsOpen,
  existingDocumentUrls = [],
  editDocumentUrl,
}: DocumentUrlModalProps) => {
  const { setGlobalError } = useErrorStore()
  const [errorMessage, setErrorMessage] = useState('')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const isEditMode = !!editDocumentUrl

  useEffect(() => {
    if (isOpen) {
      setTitle(editDocumentUrl?.title ?? '')
      setUrl(editDocumentUrl?.url ?? '')
      setErrorMessage('')
    }
  }, [isOpen, editDocumentUrl])

  async function handleSaveLink() {
    if (!validateUrlRequirements()) {
      return
    }

    const onSuccess = () => {
      mutateSeries()
      setIsOpen(false)
    }
    const onFailure = (error: { status: number; statusText: string }) => {
      setGlobalError(error.status, error.statusText)
    }

    if (isEditMode) {
      const updatedDocumentUrls = existingDocumentUrls.map((documentUrl) =>
        documentUrl.url === editDocumentUrl.url ? { title, url } : documentUrl
      )
      updateSeriesDocumentUrls(seriesId, updatedDocumentUrls).then(onSuccess, onFailure)
    } else {
      saveDocumentUrlToSeries(seriesId, { uri: url, title: title }).then(onSuccess, onFailure)
    }
  }

  const validateUrlRequirements = () => {
    if (!isValidUrl(url)) {
      setErrorMessage('Ugyldig URL-format')
      return false
    }
    return true
  }

  const resetInputFields = () => {
    setTitle('')
    setUrl('')
    setErrorMessage('')
  }

  return (
    <Modal
      open={isOpen}
      header={{
        heading: isEditMode ? 'Endre lenke' : 'Legg til lenke',
        closeButton: true,
      }}
      onClose={() => {
        resetInputFields()
        setIsOpen(false)
      }}
    >
      <Modal.Body>
        <VStack gap="space-16">
          <TextField
            value={title}
            style={{ width: '400px' }}
            label="Tittel"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
          <TextField
            value={url}
            style={{ width: '400px' }}
            label="Lenke"
            description="Legg inn en gyldig URL"
            onChange={(event) => setUrl(event.currentTarget.value)}
            onFocus={() => setErrorMessage('')}
            error={errorMessage}
          />
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleSaveLink()} variant="primary">
          Lagre
        </Button>
        <Button
          onClick={() => {
            resetInputFields()
            setIsOpen(false)
          }}
          variant="secondary"
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
