import { BodyLong, BodyShort, Button, Heading, HStack, Label, Loader } from '@navikt/ds-react'
import '../create-product.scss'
import React, { useRef, useState } from 'react'
import { FileExcelIcon, FileImageFillIcon, TrashIcon, UploadIcon } from '@navikt/aksel-icons'

export interface Upload {
  file: File
  previewUrl?: string
}

export interface Props {
  validerImporterteProdukter: (upload: Upload) => void
}

export default function ImporterProdukter({ validerImporterteProdukter }: Props) {

  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [upload, setUpload] = useState<Upload | undefined>(undefined)
  const [fileTypeError, setFileTypeError] = useState('')
  const [moreThanOnefileError, setMoreThanOnefileError] = useState('')

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileTypeError('')
    setMoreThanOnefileError('')
    const files = Array.from(event?.currentTarget?.files || [])

    if (files.length !== 1) {
      setMoreThanOnefileError('Du kan kun laste opp en fil om gangen.')
      return
    }

    const file = files[0]
    fileToUri(file).then((url) => {
      setUpload({ file, previewUrl: url })
    })
  }

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError('')
    setMoreThanOnefileError('')
    event.preventDefault()
    const acceptedFileTypesDocuments = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

    const files = Array.from(event.dataTransfer.files)
    const isValidFiles = files.every((file) =>
      acceptedFileTypesDocuments.includes(file.type),
    )


    if (!isValidFiles) {
      setFileTypeError('Ugyldig filtype. Kun xlsx er gyldig dokumenttype.')
      return
    }

    if (files.length !== 1) {
      setMoreThanOnefileError('Du kan kun laste opp en fil om gangen.')
      return
    }

    const file = files[0]
    fileToUri(file).then((url) => {
      setUpload({ file, previewUrl: url })
    })
  }

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, file: File) => {
    event.preventDefault()
    setUpload(undefined)
  }

  return (
    <main>
      <div className='create-new-product'>
        <div className='content'>
          <Heading level='1' size='large' align='center'>
            Importer produkter
          </Heading>
          <BodyShort>
            Velg importfil fra din maskin og last opp. Filen må være i .xlsx format.
          </BodyShort>

          {!upload && (
            <div
              onDragEnter={handleDragEvent}
              onDragLeave={handleDragEvent}
              onDragOver={handleDragEvent}
              onDrop={handleDragEvent}
              className='images-tab__upload-container'
            >
              <FileImageFillIcon className='images-tab__upload-icon' title='filillustarsjon' fontSize='4rem' />
              <BodyShort className='images-tab__text'>Slipp filen her eller</BodyShort>
              <Button
                size='small'
                variant='secondary'
                icon={<UploadIcon title='Last opp bilde' fontSize='1.5rem' />}
                iconPosition='right'
                onClick={(event) => {
                  event.preventDefault()
                  fileInputRef?.current?.click()
                }}
              >
                Last opp
              </Button>
              <input
                id='fileInput'
                onChange={(event) => handleChange(event)}
                multiple={true}
                ref={fileInputRef}
                type='file'
                hidden
                accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              />
            </div>
          )}

          {isUploading && (
            <HStack justify='center'>
              <Loader size='2xlarge' title='venter...' />
            </HStack>
          )}

          {fileTypeError && <BodyLong>{fileTypeError}</BodyLong>}
          {moreThanOnefileError && <BodyLong>{moreThanOnefileError}</BodyLong>}

          {upload && (
            <ol className='images-inline'>
              <li key={`xlxs}`}>
                <HStack gap={{ xs: '1', sm: '2', md: '3' }} align='center'>

                  <FileExcelIcon fontSize='1.5rem' />

                  <Label>{upload.file.name}</Label>
                </HStack>
                <Button
                  variant='tertiary'
                  icon={<TrashIcon />}
                  title='slett'
                  fontSize='1.5rem'
                  onClick={(event) => handleDelete(event, upload.file)}
                />
              </li>
            </ol>
          )}


          <HStack justify='end'>
            <Button
              disabled={!upload}
              size='small'
              variant='secondary'
              onClick={(event) => {
                validerImporterteProdukter(upload!)
              }}
            >
              Gå videre
            </Button>
          </HStack>
        </div>
      </div>
    </main>
  )
}

const fileToUri = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function() {
      resolve(reader.result as string)
    }
    reader.onerror = function(error) {
      reject(error)
    }
  })
