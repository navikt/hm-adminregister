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
  attachmentIdToEdit: string,
  files: MediaInfo[],
): AgreementRegistrationDTO => {

  const indexOfAttachmentToEdit =
    agreementToEdit.agreementData.attachments.findIndex((attachment) => attachment.id === attachmentIdToEdit)
  const attachmentToEdit: AgreementAttachment = {
    ...agreementToEdit.agreementData.attachments[indexOfAttachmentToEdit],
  }

  attachmentToEdit.media = attachmentToEdit.media.concat(files)

  const oldAndNewAttachments =
    agreementToEdit.agreementData.attachments.map((attachment) => {
      return attachment.id === attachmentIdToEdit ? attachmentToEdit : attachment
    })

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: oldAndNewAttachments,
    },
  }
}

export const getEditedAgreementDTORemoveFiles = (
  agreementToEdit: AgreementRegistrationDTO,
  attachmentIdToEdit: string,
  fileToRemoveUri: string,
): AgreementRegistrationDTO => {


  const indexOfAttachmentToEdit =
    agreementToEdit.agreementData.attachments.findIndex((attachment) => attachment.id === attachmentIdToEdit)
  const attachmentToEdit: AgreementAttachment = {
    ...agreementToEdit.agreementData.attachments[indexOfAttachmentToEdit],
  }

  attachmentToEdit.media = attachmentToEdit.media.filter((file) => file.uri !== fileToRemoveUri)

  const oldAndNewAttachments =
    agreementToEdit.agreementData.attachments.map((attachment) => {
      return attachment.id === attachmentIdToEdit ? attachmentToEdit : attachment
    })

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: oldAndNewAttachments,
    },
  }

}
