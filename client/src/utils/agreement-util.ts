import { AgreementAttachment, AgreementPostDTO, AgreementRegistrationDTO, MediaInfo } from "./response-types";
import { EditAttachmentGroupFormData } from "rammeavtaler/rammeavtale/vedlegg/EditAttachmentGroupModal";
import { EditAgreementFormDataDto } from "utils/zodSchema/editAgreement";

export const getEditedAgreementDTOAddFiles = (
  agreementToEdit: AgreementRegistrationDTO,
  attachmentIdToEdit: string,
  files: MediaInfo[],
): AgreementRegistrationDTO => {
  const indexOfAttachmentToEdit = agreementToEdit.agreementData.attachments.findIndex(
    (attachment) => attachment.id === attachmentIdToEdit,
  );
  const attachmentToEdit: AgreementAttachment = {
    ...agreementToEdit.agreementData.attachments[indexOfAttachmentToEdit],
  };

  attachmentToEdit.media = attachmentToEdit.media.concat(files);

  const oldAndNewAttachments = agreementToEdit.agreementData.attachments.map((attachment) => {
    return attachment.id === attachmentIdToEdit ? attachmentToEdit : attachment;
  });

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: oldAndNewAttachments,
    },
  };
};

export const getEditedAgreementDTORemoveFiles = (
  agreementToEdit: AgreementRegistrationDTO,
  attachmentIdToEdit: string,
  fileToRemoveUri: string,
): AgreementRegistrationDTO => {
  const indexOfAttachmentToEdit = agreementToEdit.agreementData.attachments.findIndex(
    (attachment) => attachment.id === attachmentIdToEdit,
  );
  const attachmentToEdit: AgreementAttachment = {
    ...agreementToEdit.agreementData.attachments[indexOfAttachmentToEdit],
  };

  attachmentToEdit.media = attachmentToEdit.media.filter((file) => file.uri !== fileToRemoveUri);

  const oldAndNewAttachments = agreementToEdit.agreementData.attachments.map((attachment) => {
    return attachment.id === attachmentIdToEdit ? attachmentToEdit : attachment;
  });

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: oldAndNewAttachments,
    },
  };
};

export const getEditedAgreementDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  newDescription: string,
): AgreementRegistrationDTO => {
  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      text: newDescription,
    },
  };
};

export const getEditedAgreementWithNewAttachmentGroupInfo = (
  agreementToEdit: AgreementRegistrationDTO,
  attachmentId: string,
  editedInfo: EditAttachmentGroupFormData,
): AgreementRegistrationDTO => {
  const indexOfAttachmentToUpdate = agreementToEdit.agreementData.attachments.findIndex(
    (attachment) => attachment.id === attachmentId,
  );
  const attachmentToUpdate = agreementToEdit.agreementData.attachments[indexOfAttachmentToUpdate];
  agreementToEdit.agreementData.attachments[indexOfAttachmentToUpdate] = {
    id: attachmentToUpdate.id,
    title: editedInfo.tittel,
    description: editedInfo.beskrivelse,
    media: attachmentToUpdate.media,
  };

  return agreementToEdit;
};

export const getEditedAgreementWithNewInfoDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  editedInfo: EditAgreementFormDataDto,
): AgreementRegistrationDTO => {
  return {
    ...agreementToEdit,
    title: editedInfo.agreementName,
    published: editedInfo.avtaleperiodeStart,
    expired: editedInfo.avtaleperiodeSlutt,
    reference: editedInfo.anbudsnummer,
  };
};

export const getAgreeementWithUpdatedDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  updatedPost: AgreementPostDTO,
): AgreementRegistrationDTO => {
  const index = agreementToEdit.agreementData.posts.findIndex((post) => post.identifier === updatedPost.identifier);
  agreementToEdit.agreementData.posts[index] = updatedPost;

  return {
    ...agreementToEdit,
  };
};

export const getAgreeementWithNewDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  newPost: AgreementPostDTO,
): AgreementRegistrationDTO => {
  const updatedPosts = [...agreementToEdit.agreementData.posts, newPost];

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      posts: updatedPosts,
    },
  };
};

export const getAgreeementWithNewAttachmentGroup = (
  agreementToEdit: AgreementRegistrationDTO,
  newAttachment: AgreementAttachment,
): AgreementRegistrationDTO => {
  const updatedAttachments = [...agreementToEdit.agreementData.attachments, newAttachment];

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: updatedAttachments,
    },
  };
};
export const getAgreeementWithoutDeletedDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  delkontraktId: string,
): AgreementRegistrationDTO => {
  const updatedPosts = agreementToEdit.agreementData.posts.filter((post) => post.identifier !== delkontraktId);

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      posts: updatedPosts,
    },
  };
};

export const getAgreeementWithoutDeletedAttachmentDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  attachmentId: string,
): AgreementRegistrationDTO => {
  const updatedAttachments = agreementToEdit.agreementData.attachments.filter(
    (attachment) => attachment.id !== attachmentId,
  );

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      attachments: updatedAttachments,
    },
  };
};
