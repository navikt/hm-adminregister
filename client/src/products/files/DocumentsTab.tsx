import { useState } from 'react'

import {
  changeFilenameOnAttachedFile,
  deleteDocumentUrlFromSeries,
  deleteFileFromSeries,
  uploadFilesToSeries,
  useSeriesV2,
} from 'api/SeriesApi'
import { MoreMenu } from 'felleskomponenter/MoreMenu'
import UploadModal, { FileUpload, DOCUMENT_DISPLAY_NAME_OPTIONS, OTHER_DISPLAY_NAME_OPTION } from 'felleskomponenter/UploadModal'
import { DocumentUrlModal } from 'products/files/DocumentUrlModal'
import { mapImagesAndPDFfromMedia } from 'products/seriesUtils'
import { uriForMediaFile } from 'utils/file-util'
import { useErrorStore } from 'utils/store/useErrorStore'
import { DocumentUrl, MediaInfoDTO, SeriesDTO } from 'utils/types/response-types'

import { FilePdfIcon, FloppydiskIcon, LinkIcon, PlusCircleIcon, XMarkIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Heading, HStack, Select, Tabs, TextField, VStack } from '@navikt/ds-react'

import styles from '../ProductPage.module.scss'

interface Props {
  series: SeriesDTO
  isEditable: boolean
  showInputError: boolean
}

const DocumentsTab = ({ series, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [doccumentUrlModalIsOpen, setDocumentUrlModalIsOpen] = useState(false)
  const [editDocumentUrl, setEditDocumentUrl] = useState<DocumentUrl | undefined>(undefined)
  const { pdfs } = mapImagesAndPDFfromMedia(series)
  const { setGlobalError } = useErrorStore()
  const { mutate: mutateSeries } = useSeriesV2(series.id)

  const allPdfsSorted = pdfs.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0

    const dateB = b.updated ? new Date(b.updated).getTime() : 0
    return dateA - dateB
  })

  async function handleDeleteFile(uri: string) {
    deleteFileFromSeries(series.id, uri)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const handleEditFileName = async (uri: string, editedText: string) => {
    changeFilenameOnAttachedFile(series.id, { uri: uri, newFileTitle: editedText })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const uploadFiles = async (uploads: FileUpload[]) => {
    return uploadFilesToSeries(series.id, uploads)
      .then(() => {
        mutateSeries()
        setModalIsOpen(false)
      })
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const handleDeleteDocumentUrl = (url: string) => {
    deleteDocumentUrlFromSeries(series.id, { uri: url })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error)
      })
  }

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        fileType="documents"
        requireDisplayName
        uploadFiles={uploadFiles}
      />
      <DocumentUrlModal
        seriesId={series.id}
        mutateSeries={mutateSeries}
        isOpen={doccumentUrlModalIsOpen}
        setIsOpen={(open) => {
          setDocumentUrlModalIsOpen(open)
          if (!open) {
            setEditDocumentUrl(undefined)
          }
        }}
        existingDocumentUrls={series.seriesData.attributes.documentUrls ?? []}
        editDocumentUrl={editDocumentUrl}
      />
      <Tabs.Panel value="documents" className={styles.tabPanel}>
        <VStack gap="space-16">
          <Heading size="small">Dokumenter</Heading>
          {allPdfsSorted.length === 0 && (
            <Alert variant={showInputError ? 'error' : 'info'}>
              Produktet har ingen dokumenter. Her kan man for eksempel legge med brosjyre, bruksanvisning eller
              sprengskisse til produktet.
            </Alert>
          )}

          <VStack gap="space-16">
            {allPdfsSorted.length > 0 && (
              <VStack as="ol" gap="space-16" className={styles.documentListContainer}>
                {allPdfsSorted.map((pdf) => (
                  <DocumentListItem
                    key={pdf.uri}
                    isEditable={isEditable}
                    file={pdf}
                    handleDeleteFile={handleDeleteFile}
                    handleUpdateFileName={handleEditFileName}
                  />
                ))}
              </VStack>
            )}

            {isEditable && (
              <Button
                className="fit-content"
                variant="tertiary"
                icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
                onClick={() => {
                  setModalIsOpen(true)
                }}
              >
                Legg til dokumenter
              </Button>
            )}
          </VStack>

          <VStack gap="space-16" marginBlock="space-4 space-0">
            <Heading size="small">Lenker</Heading>
            {(!series.seriesData.attributes.documentUrls || series.seriesData.attributes.documentUrls.length === 0) && (
              <Alert variant="info">
                Produktet har ingen lenker. Her kan man for eksempel legge med lenke til sprengskisse/delebok til
                produktet.
              </Alert>
            )}
            <DocumentUrlRequirementBox />

            <VStack gap="space-16">
              {series.seriesData.attributes.documentUrls && series.seriesData.attributes.documentUrls.length > 0 && (
                <VStack as="ol" gap="space-16" className={styles.documentListContainer}>
                  {series.seriesData.attributes.documentUrls?.map((documentUrl) => (
                    <HStack as="li" justify="space-between" wrap={false} key={documentUrl.url}>
                      <HStack gap={{ xs: 'space-16', sm: 'space-8', md: 'space-16' }} align="center" wrap={false}>
                        <LinkIcon fontSize="2rem" title="Fil" />
                        <a
                          href={documentUrl.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-overflow-hidden-large"
                        >
                          {documentUrl.title || documentUrl.url}
                        </a>
                      </HStack>
                      {isEditable && (
                        <MoreMenu
                          id={documentUrl.url}
                          handleDelete={handleDeleteDocumentUrl}
                          handleEdit={() => {
                            setEditDocumentUrl(documentUrl)
                            setDocumentUrlModalIsOpen(true)
                          }}
                          editText="Endre"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}

              {isEditable && (
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
                  onClick={() => {
                    setEditDocumentUrl(undefined)
                    setDocumentUrlModalIsOpen(true)
                  }}
                >
                  Legg til lenke
                </Button>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Tabs.Panel>
    </>
  )
}

export default DocumentsTab

const DocumentUrlRequirementBox = () => (
  <Alert variant="warning">
    <Heading spacing size="small" level="2">
      Krav til lenke
    </Heading>
    <BodyLong>- Skal ikke benyttes til leverandørens produktside/nettbutikk</BodyLong>
    <BodyLong>- Skal benyttes til tekniske dokumenter på leverandørens hjemmeside, for eksempel sprengskisse</BodyLong>
  </Alert>
)

const DocumentListItem = ({
  isEditable,
  file,
  handleDeleteFile,
  handleUpdateFileName,
}: {
  isEditable: boolean
  file: MediaInfoDTO
  handleDeleteFile: (uri: string) => void
  handleUpdateFileName: (uri: string, text: string) => void
}) => {
  const initialSelectedType = DOCUMENT_DISPLAY_NAME_OPTIONS.includes(file.text || '')
    ? file.text!
    : file.text
      ? OTHER_DISPLAY_NAME_OPTION
      : ''
  const [selectedType, setSelectedType] = useState(initialSelectedType)
  const [customName, setCustomName] = useState(initialSelectedType === OTHER_DISPLAY_NAME_OPTION ? (file.text || '') : '')
  const [editMode, setEditMode] = useState(false)

  const handleEditFileName = () => {
    setEditMode(true)
  }

  const effectiveDisplayName = selectedType === OTHER_DISPLAY_NAME_OPTION ? customName : selectedType
  const canSave = selectedType !== '' && (selectedType !== OTHER_DISPLAY_NAME_OPTION || customName.trim() !== '')

  const fileExtension = (() => {
    const filename = file.uri.split('/').pop() || ''
    return filename.includes('.') ? filename.split('.').pop()!.toUpperCase() : ''
  })()
  const displayNamePreview =
    effectiveDisplayName.trim().length > 0
      ? `${effectiveDisplayName}${fileExtension ? ` (${fileExtension})` : ''}`
      : ''

  const handleSaveFileName = () => {
    setEditMode(false)
    handleUpdateFileName(file.uri, effectiveDisplayName)
  }

  return (
    <HStack as="li" justify="space-between" wrap={false}>
      {editMode ? (
        <>
          <VStack gap="space-4" style={{ minWidth: '300px', maxWidth: '500px' }}>
            <Select
              label="Visningsnavn"
              description={displayNamePreview ? `Visningsnavn: ${displayNamePreview}` : undefined}
              value={selectedType}
              onChange={(e) => setSelectedType(e.currentTarget.value)}
            >
              <option value="">Velg dokumenttype</option>
              {DOCUMENT_DISPLAY_NAME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={OTHER_DISPLAY_NAME_OPTION}>{OTHER_DISPLAY_NAME_OPTION}</option>
            </Select>
            {selectedType === OTHER_DISPLAY_NAME_OPTION && (
              <TextField
                label="Skriv inn visningsnavn"
                value={customName}
                onChange={(e) => setCustomName(e.currentTarget.value)}
                autoFocus
              />
            )}
          </VStack>
          <HStack align="end">
            <Button
              variant="tertiary"
              title="Lagre"
              onClick={handleSaveFileName}
              disabled={!canSave}
              icon={<FloppydiskIcon fontSize="2rem" aria-hidden />}
            />
            <Button
              variant="tertiary"
              title="Avbryt"
              onClick={() => {
                setSelectedType(initialSelectedType)
                setCustomName(initialSelectedType === OTHER_DISPLAY_NAME_OPTION ? (file.text || '') : '')
                setEditMode(false)
              }}
              icon={<XMarkIcon fontSize="2rem" aria-hidden />}
            />
          </HStack>
        </>
      ) : (
        <>
          <HStack gap={{ xs: 'space-16', sm: 'space-8', md: 'space-16' }} align="center" wrap={false}>
            <FilePdfIcon fontSize="2rem" title="Fil" />
            <a href={uriForMediaFile(file)} target="_blank" rel="noreferrer" className="text-overflow-hidden-large">
              {file.text || file.uri.split('/').pop()}
            </a>
          </HStack>
          {isEditable && (
            <HStack>
              <MoreMenu id={file.uri} handleDelete={handleDeleteFile} handleEdit={handleEditFileName} />
            </HStack>
          )}
        </>
      )}
    </HStack>
  )
}
