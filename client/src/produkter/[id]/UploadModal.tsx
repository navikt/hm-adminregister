
import { FileImageFillIcon, FilePdfIcon, TrashIcon, UploadIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, HStack, Label, Loader, Modal } from '@navikt/ds-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHydratedErrorStore } from "../../utils/store/useErrorStore";
import { MediaDTO, ProductRegistrationDTO } from "../../utils/response-types";
import { getEditedProductDTOAddFiles, mapToMediaInfo } from "../../utils/product-util";
import { ImageContainer } from "../../components/ImageCard";

interface Props {
  modalIsOpen: boolean
  oid: string
  fileType: 'images' | 'documents'
  setModalIsOpen: (open: boolean) => void
  mutateProducts: () => void
}

interface Upload {
  file: File
  previewUrl?: string
}

const UploadModal = ({ modalIsOpen, oid, fileType, setModalIsOpen, mutateProducts }: Props) => {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [fileTypeError, setFileTypeError] = useState('')

  const { handleSubmit } = useForm()
  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmit() {
    setIsUploading(true)
    const formData = new FormData()
    for (const upload of uploads) {
      formData.append('files', upload.file)
    }
    let res = await fetch(`/admreg/vendor/api/v1/media/product/files/${oid}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      setGlobalError(res.status, res.statusText)
      return
    }
    const mediaDTOs: MediaDTO[] = await res.json()
    //Fetch produkt to update the latest version
    res = await fetch(`/admreg/vendor/api/v1/product/registrations/${oid}`, {
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

    const productToUpdate: ProductRegistrationDTO = await res.json()
    const editedProductDTO =
      mediaDTOs &&
      getEditedProductDTOAddFiles(
        productToUpdate,
        mapToMediaInfo(
          mediaDTOs,
          uploads.map((up) => up.file)
        )
      )

    res = await fetch(`/admreg/vendor/api/v1/product/registrations/${productToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(editedProductDTO),
    })
    if (!res.ok) {
      setGlobalError(res.status, res.statusText)
      return
    }
    setIsUploading(false)
    mutateProducts()
    setUploads([])
    setModalIsOpen(false)
  }

  console.log(uploads)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.currentTarget?.files || [])

    const allChosenFiles = uploads.concat(files.map((file) => ({ file })))
    setUploads(allChosenFiles)

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        }))
      )
    })
  }

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, file: File) => {
    event.preventDefault()
    const filteredFiles = uploads.filter((upload) => upload.file !== file)
    setUploads(filteredFiles)
  }

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError('')
    //NB! Må sjekke at det er et bilde.. kan droppe hvilken som helst fil
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
    const allChosenFiles = uploads.concat(files.map((file) => ({ file })))
    setUploads(allChosenFiles)

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        }))
      )
    })
  }
  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: 'Legg til bilder',
        closeButton: true,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div
            onDragEnter={handleDragEvent}
            onDragLeave={handleDragEvent}
            onDragOver={handleDragEvent}
            onDrop={handleDragEvent}
            className="images-tab__upload-container"
          >
            <FileImageFillIcon className="images-tab__upload-icon" title="filillustarsjon" fontSize="4rem" />
            <BodyShort className="images-tab__text">Slipp bildet her eller</BodyShort>
            <Button
              size="small"
              variant="secondary"
              icon={<UploadIcon title="Last opp bilde" fontSize="1.5rem" />}
              iconPosition="right"
              onClick={(event) => {
                event.preventDefault()
                fileInputRef?.current?.click()
              }}
            >
              Last opp
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
          <ol className="images-inline">
            {uploads.map((upload, i) => (
              <li key={`pdf-${i}`}>
                <HStack gap={{ xs: '1', sm: '2', md: '3' }} align="center">
                  {fileType === 'images' ? (
                    <ImageContainer uri={upload.previewUrl} size="xsmall" />
                  ) : (
                    <FilePdfIcon fontSize="1.5rem" />
                  )}

                  <Label>{upload.file.name}</Label>
                </HStack>
                <Button
                  variant="tertiary"
                  icon={<TrashIcon />}
                  title="slett"
                  fontSize="1.5rem"
                  onClick={(event) => handleDelete(event, upload.file)}
                />
              </li>
            ))}
          </ol>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Lagre
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault()
              setModalIsOpen(false)
            }}
            variant="secondary"
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default UploadModal

const fileToUri = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
      resolve(reader.result as string)
    }
    reader.onerror = function (error) {
      reject(error)
    }
  })
