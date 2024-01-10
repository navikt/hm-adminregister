import { AgreementAttachment, AgreementRegistrationDTO, MediaInfo } from './response-types'

export const mapPDFfromMedia = (
  agreement: AgreementRegistrationDTO,
): { pdfs: MediaInfo[] } => {
  const seen: { [uri: string]: boolean } = {}
  const pdfs: MediaInfo[] = []
  const images: MediaInfo[] = []
  agreement.agreementData.attachments
    .flatMap((attachment: AgreementAttachment) => attachment.media)
    .map((media: MediaInfo) => {
      if (media.type == 'PDF' && media.uri && !seen[media.uri]) {
        pdfs.push(media)
      }
      seen[media.uri] = true
    })

  return {
    pdfs: pdfs,
  }
}

export const getEditedAgreementDTOAddFiles = (
  agreementToEdit: AgreementRegistrationDTO,
  files: MediaInfo[],
): AgreementRegistrationDTO => {

  //todo: fix merging av attachments
  const oldAndNewAttachments =
    agreementToEdit.agreementData.attachments
      .flatMap(attatchment => attatchment.media.concat(files))

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: [{
        ...agreementToEdit.agreementData.attachments[0],
        media: oldAndNewAttachments,
      }],
    },
  }
}

export const getEditedAgreementDTORemoveFiles = (
  agreementToEdit: AgreementRegistrationDTO,
  fileToRemoveUri: string,
): AgreementRegistrationDTO => {
  const filteredFiles =
    agreementToEdit.agreementData.attachments
      .flatMap(attachment => attachment.media).filter((file) => file.uri !== fileToRemoveUri)
  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: [{
        ...agreementToEdit.agreementData.attachments[0],
        media: filteredFiles,
      }],
    },
  }
}
