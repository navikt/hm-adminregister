import { useEffect, useState } from 'react'

import {
  changeFilenameOnAttachedFile,
  deleteFileFromSeries,
  saveVideoToSeries,
  updateSeriesMediaPriority,
} from 'api/SeriesApi'
import { validateUrl } from 'products/videos/videoUrlUtils'
import { useErrorStore } from 'utils/store/useErrorStore'
import { MediaInfoDTO } from 'utils/types/response-types'

import { Button, ConfirmationPanel, Modal, TextField, VStack } from '@navikt/ds-react'

type VideoModalProps = {
  seriesId: string
  mutateSeries: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editVideo?: MediaInfoDTO
}

export const VideoModal = ({ seriesId, mutateSeries, isOpen, setIsOpen, editVideo }: VideoModalProps) => {
  const { setGlobalError } = useErrorStore()
  const [errorMessage, setErrorMessage] = useState('')
  const [errorMessageConfirmVideoRequirements, setErrorMessageConfirmVideoRequirements] = useState('')
  const [confirmVideoRequirements, setConfirmVideoRequirements] = useState(false)

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const isEditMode = !!editVideo

  useEffect(() => {
    if (isOpen) {
      setTitle(editVideo?.text ?? '')
      setUrl(editVideo?.uri ?? '')
      setErrorMessage('')
      setConfirmVideoRequirements(false)
      setErrorMessageConfirmVideoRequirements('')
    }
  }, [isOpen, editVideo])

  async function handleSaveVideoLink() {
    if (!validateVideoUrlRequirements()) return
    if (!isEditMode && !validateVideoRequirementsConfirmed()) return

    const onSuccess = () => {
      mutateSeries()
      setIsOpen(false)
    }
    const onFailure = (error: { status: number; statusText: string }) => {
      mutateSeries()
      setGlobalError(error.status, error.statusText)
    }

    if (isEditMode) {
      if (url === editVideo.uri) {
        changeFilenameOnAttachedFile(seriesId, { uri: url, newFileTitle: title }).then(onSuccess, onFailure)
      } else {
        saveVideoToSeries(seriesId, { uri: url, title })
          .then(() => updateSeriesMediaPriority(seriesId, [{ uri: url, priority: editVideo.priority }]))
          .then(() => deleteFileFromSeries(seriesId, editVideo.uri))
          .then(onSuccess)
          .catch(onFailure)
      }
    } else {
      saveVideoToSeries(seriesId, { uri: url, title: title }).then(onSuccess, onFailure)
    }
  }

  const validateVideoUrlRequirements = () => {
    const urlError = validateUrl(url)
    if (urlError) {
      setErrorMessage(urlError)
      return false
    }
    return true
  }

  const validateVideoRequirementsConfirmed = () => {
    setErrorMessageConfirmVideoRequirements('')
    if (!confirmVideoRequirements) {
      setErrorMessageConfirmVideoRequirements('Du må bekrefte at kravene til videoer er oppfylt')
      return false
    }
    return true
  }

  const resetInputFields = () => {
    setTitle('')
    setUrl('')
    setErrorMessage('')
    setConfirmVideoRequirements(false)
    setErrorMessageConfirmVideoRequirements('')
  }

  return (
    <Modal
      open={isOpen}
      header={{
        heading: isEditMode ? 'Endre videolenke' : 'Legg til videolenke',
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
            description="Må være til en video og ikke en spilleliste, høyreklikk og kopier i videospilleren"
            onChange={(event) => setUrl(event.currentTarget.value)}
            onFocus={() => setErrorMessage('')}
            error={errorMessage}
          />
          {!isEditMode && (
            <ConfirmationPanel
              checked={confirmVideoRequirements}
              label="Jeg bekrefter at kravene til videoer er oppfylt, herunder krav til universell utforming."
              onChange={() => setConfirmVideoRequirements((x) => !x)}
              onFocus={() => setErrorMessageConfirmVideoRequirements('')}
              error={errorMessageConfirmVideoRequirements}
            />
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleSaveVideoLink()} variant="primary">
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
