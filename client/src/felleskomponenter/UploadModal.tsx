import { useEffect, useRef, useState } from 'react'

import { ImageContainer } from 'products/files/images/ImageContainer'
import { fileToUri } from 'utils/file-util'

import { FileImageFillIcon, TrashIcon, UploadIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  HStack,
  Heading,
  Label,
  Loader,
  Modal,
  Select,
  TextField,
  VStack,
} from '@navikt/ds-react'

import styles from './UploadModal.module.scss'

export const DOCUMENT_DISPLAY_NAME_OPTIONS = ['Bruksanvisning', 'Brosjyre', 'Bestillingsskjema', 'Sprengskisse', 'Målskjema']
export const OTHER_DISPLAY_NAME_OPTION = 'Annet'

interface Props {
  modalIsOpen: boolean
  fileType: 'images' | 'documents'
  setModalIsOpen: (open: boolean) => void
  uploadFiles: (uploads: FileUpload[]) => Promise<void>
  requireDisplayName?: boolean
}

const removeFileExtation = (fileName: string) => {
  if (fileName.includes('.')) {
    return fileName.split('.')[0]
  }
  return fileName
}

export interface FileUpload {
  file: File
  previewUrl?: string
  editedFileName?: string
}

const UploadModal = ({ modalIsOpen, fileType, setModalIsOpen, uploadFiles, requireDisplayName = false }: Props) => {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [fileTypeError, setFileTypeError] = useState('')

  const handleMediaEvent = (files: File[]) => {
    const allChosenFiles = uploads.concat(
      files.map((file) => ({
        file,
        editedFileName: fileType === 'documents' && requireDisplayName ? '' : removeFileExtation(file.name),
      }))
    )

    const uniqueAllChosenFiles = allChosenFiles.filter(
      (item, index, uploadList) =>
        index ===
        uploadList.findIndex((compareItem) => {
          return compareItem.file.name === item.file.name
        })
    )

    setUploads(uniqueAllChosenFiles)

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        }))
      )
    })
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.currentTarget?.files || [])
    handleMediaEvent(files)
  }

  const handleDelete = (file: File) => {
    const filteredFiles = uploads.filter((upload) => upload.file !== file)
    setUploads(filteredFiles)
  }

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError('')
    //Check is file is a picture as it is possible to drop any type of file
    event.preventDefault()
    const acceptedFileTypesImages = ['image/jpeg', 'image/jpg', 'image/png']
    const acceptedFileTypesDocuments = ['application/pdf']

    const files = Array.from(event.dataTransfer.files)
    const isValidFiles = files.every((file) =>
      fileType === 'images'
        ? acceptedFileTypesImages.includes(file.type)
        : acceptedFileTypesDocuments.includes(file.type)
    )

    if (!isValidFiles) {
      fileType === 'images'
        ? setFileTypeError('Ugyldig filtype. Vennligst velg en av disse filtypene jpeg, jpg, eller png.')
        : setFileTypeError('Ugyldig filtype. Kun pdf er gyldig dokumenttype.')

      return
    }
    handleMediaEvent(files)
  }

  const setEditedFileName = (upload: FileUpload, newFileName: string) => {
    setUploads((prevUploads) =>
      prevUploads.map((prevUpload) =>
        prevUpload.file === upload.file ? { ...prevUpload, editedFileName: newFileName } : prevUpload
      )
    )
  }

  const clearState = () => {
    setIsUploading(false)
    setUploads([])
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: fileType === 'images' ? 'Legg til bilder' : 'Legg til dokumenter',
        closeButton: true,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <div
          onDragEnter={handleDragEvent}
          onDragLeave={handleDragEvent}
          onDragOver={handleDragEvent}
          onDrop={handleDragEvent}
          className={styles.uploadContainer}
        >
          <FileImageFillIcon className={styles.uploadIcon} fontSize="4rem" aria-hidden />
          <BodyShort className={styles.uploadText}>Slipp filen her eller</BodyShort>
          <Button
            size="small"
            variant="secondary"
            icon={<UploadIcon fontSize="1.5rem" aria-hidden />}
            iconPosition="right"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
              fileInputRef?.current?.click()
            }}
          >
            Bla gjennom
          </Button>
          <input
            id="fileInput"
            onChange={(event) => handleChange(event)}
            multiple={true}
            ref={fileInputRef}
            type="file"
            hidden
            accept={fileType === 'images' ? 'image/jpeg, image/jpg, image/png' : 'application/pdf'}
          />
        </div>

        {isUploading && (
          <HStack justify="center">
            <Loader size="2xlarge" title="venter..." />
          </HStack>
        )}

        {fileTypeError && <BodyLong>{fileTypeError}</BodyLong>}
        <VStack as="ol" gap="space-4" className={styles.uploadInline}>
          {fileType === 'documents' && uploads.length > 0 && (
            <Heading size="small">Filnavn som vises på finnhjelpemidler.no</Heading>
          )}
          {uploads.map((upload) => (
            <Upload
              key={`${upload.file.name}`}
              upload={upload}
              fileType={fileType}
              requireDisplayName={requireDisplayName}
              handleDelete={handleDelete}
              setEditedFileName={setEditedFileName}
            />
          ))}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={uploads.some((value) => value.editedFileName?.trim().length === 0) || uploads.length === 0}
          onClick={() => {
            setIsUploading(true)
            uploadFiles(uploads).finally(() => clearState())
          }}
        >
          Last opp
        </Button>
        <Button
          onClick={() => {
            clearState()
            setModalIsOpen(false)
          }}
          variant="secondary"
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UploadModal

const Upload = ({
  upload,
  fileType,
  requireDisplayName,
  handleDelete,
  setEditedFileName,
}: {
  upload: FileUpload
  fileType: 'images' | 'documents'
  requireDisplayName?: boolean
  handleDelete: (file: File) => void
  setEditedFileName: (upload: FileUpload, newfileName: string) => void
}) => {
  //Need to initialize filName state with file.name because thats what the user chooses to upload. Then they can change it.
  const [fileName, setFileName] = useState(upload.editedFileName || '')
  const [onCreation] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const fileNameInputRef = useRef<HTMLInputElement>(null)

  const [selectedType, setSelectedType] = useState('')
  const [customName, setCustomName] = useState('')
  const customNameInputRef = useRef<HTMLInputElement>(null)

  function isTextSelected() {
    const selection = window.getSelection()
    return selection && selection.rangeCount > 0 && selection.toString().length > 0
  }

  useEffect(() => {
    if (fileNameInputRef.current && !isTextSelected()) {
      fileNameInputRef.current.select()
      fileNameInputRef.current.focus()
    }
  }, [onCreation])

  const validateFileName = (currentFileName: string) => {
    setErrorMessage(currentFileName.trim().length === 0 ? 'Filen må ha et navn' : '')
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    setErrorMessage('')
    setEditedFileName(upload, value === OTHER_DISPLAY_NAME_OPTION ? customName : value)
  }

  const handleCustomNameChange = (value: string) => {
    setCustomName(value)
    setEditedFileName(upload, value)
    setErrorMessage(value.trim().length === 0 ? 'Filen må ha et navn' : '')
  }

  const fileExtension = upload.file.name.includes('.') ? upload.file.name.split('.').pop()!.toUpperCase() : ''
  const effectiveDisplayName = selectedType === OTHER_DISPLAY_NAME_OPTION ? customName : selectedType
  const displayNamePreview =
    effectiveDisplayName.trim().length > 0
      ? `${effectiveDisplayName}${fileExtension ? ` (${fileExtension})` : ''}`
      : ''

  return (
    <HStack as="li" justify="space-between" wrap={false}>
      {fileType === 'documents' ? (
        requireDisplayName ? (
          <VStack gap="space-4" style={{ width: '500px' }}>
            <Select
              label="Visningsnavn"
              description={
                <>
                  Opprinnelig filnavn: {upload.file.name}
                  {displayNamePreview && (
                    <>
                      <br />
                      Visningsnavn: {displayNamePreview}
                    </>
                  )}
                </>
              }
              value={selectedType}
              onChange={(event) => handleTypeChange(event.currentTarget.value)}
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
                ref={customNameInputRef}
                label="Skriv inn visningsnavn"
                value={customName}
                onChange={(event) => handleCustomNameChange(event.currentTarget.value)}
                error={errorMessage}
                autoFocus
              />
            )}
          </VStack>
        ) : (
          <TextField
            ref={fileNameInputRef}
            style={{ width: '500px' }}
            label={'Endre filnavn'}
            value={fileName}
            onChange={(event) => {
              const newFileName = event.currentTarget.value
              setFileName(newFileName)
              setEditedFileName(upload, newFileName)
              validateFileName(newFileName)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
            error={errorMessage}
          />
        )
      ) : (
        <HStack gap={{ xs: 'space-1', sm: 'space-2', md: 'space-4' }} align="center" wrap={false}>
          <Box
            className={styles.uploadBox}
            borderRadius="8"
            borderWidth="1"
            width="75px"
            height="75px"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <ImageContainer uri={upload.previewUrl} size="xsmall" />
          </Box>

          <Label className="text-overflow-hidden-large">{fileName}</Label>
        </HStack>
      )}
      <HStack>
        <Button
          variant="tertiary"
          title="slett"
          onClick={() => handleDelete(upload.file)}
          icon={<TrashIcon fontSize="2rem" aria-hidden />}
        />
      </HStack>
    </HStack>
  )
}
