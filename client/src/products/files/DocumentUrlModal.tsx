import { useState } from 'react'

import { saveDocumentUrlToSeries } from 'api/SeriesApi'
import { isValidUrl } from 'products/seriesUtils'
import { useErrorStore } from 'utils/store/useErrorStore'

import { Alert, BodyLong, Button, Heading, List, Modal, TextField, VStack } from '@navikt/ds-react'

type DocumentUrlModalProps = {
  seriesId: string
  mutateSeries: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const DocumentUrlModal = ({ seriesId, mutateSeries, isOpen, setIsOpen }: DocumentUrlModalProps) => {
  const { setGlobalError } = useErrorStore()
  const [errorMessage, setErrorMessage] = useState('')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  async function handleSaveLink() {
    const isUrlValid = validateUrlRequirements()
    if (isUrlValid) {
      saveDocumentUrlToSeries(seriesId, { uri: url, title: title }).then(
        () => {
          mutateSeries()
          setIsOpen(false)
        },
        (error) => {
          setGlobalError(error.status, error.statusText)
        }
      )
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
        heading: 'Legg til lenke',
        closeButton: true,
      }}
      onClose={() => {
        resetInputFields()
        setIsOpen(false)
      }}
    >
      <Modal.Body>
        <VStack gap="space-16">
          <DocumentUrlRequirementBox />
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

// TODO: Innholdet under er en midlertidig plassholder og må utarbeides i samarbeid med fagpersoner.
const DocumentUrlRequirementBox = () => (
  <Alert variant="info">
    <Heading size="small" level="2">
      Hva slags lenke bør legges inn?
    </Heading>
    <BodyLong weight="semibold" textColor= "subtle" >
      (disse er bare forslag og vil bli endret i dialog med IHT)
    </BodyLong>
    <BodyLong>
      Lenken bør forbeholdes sprengskisser eller andre tekniske dokumenter, ikke en salg/kjøpeside for produktet.
    </BodyLong>
    <BodyLong weight="semibold">Egnet innhold</BodyLong>
    <List>
      <List.Item>Sprengskisser</List.Item>
      <List.Item>Tekniske dokumenter og datablad</List.Item>
    </List>

    <BodyLong weight="semibold">Unngå</BodyLong>
    <List>
      <List.Item>Salg/ kjøpeside eller nettbutikk for produktet....</List.Item>
    </List>
  </Alert>
)
