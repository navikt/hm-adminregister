import { HM_REGISTER_URL } from "environments";
import { AgreementAttachment, AgreementDraftWithDTO, AgreementRegistrationDTO } from "utils/types/response-types";
import { EditCommonInfoAgreement } from "rammeavtaler/rammeavtale/Rammeavtale";
import { v4 as uuidv4 } from "uuid";
import { EditAgreementFormDataDto } from "utils/zodSchema/editAgreement";
import { EditAttachmentGroupFormData } from "rammeavtaler/rammeavtale/vedlegg/EditAttachmentGroupModal";
import {
  getAgreeementWithNewAttachmentGroup,
  getAgreeementWithoutDeletedAttachmentDTO,
  getEditedAgreementDTO,
  getEditedAgreementDTORemoveFiles,
  getEditedAgreementWithNewAttachmentGroupInfo,
  getEditedAgreementWithNewInfoDTO,
} from "utils/agreement-util";
import { NyAttachmentGroupFormData } from "rammeavtaler/rammeavtale/vedlegg/NewAttachmentGroupModal";

export const getAgreement = async (agreementId: string): Promise<AgreementRegistrationDTO> => {
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};
export const updateAgreement = async (
  agreementId: string,
  updatedAgreement: AgreementRegistrationDTO,
): Promise<AgreementRegistrationDTO> => {
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updatedAgreement),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const deleteAgreement = async (agreementId: string): Promise<AgreementRegistrationDTO> => {
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const postAgreementDraft = async (
  isAdmin: Boolean,
  agreementDraft: AgreementDraftWithDTO,
): Promise<AgreementRegistrationDTO> => {
  const createAgreementPath = () =>
    isAdmin
      ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/draft/reference`
      : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/agreement/registrations/draft/reference`;

  const response = await fetch(createAgreementPath(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(agreementDraft),
  });
  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const publishAgreement = async (agreementId: string): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  agreementToUpdate.draftStatus = "DONE";
  return await updateAgreement(agreementId, agreementToUpdate);
};

export const reorderPosts = async (
  agreementId: string,
  post1: number,
  post2: number,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  const post1Index = agreementToUpdate.agreementData.posts.findIndex((post) => post.nr === post1);
  const post2Index = agreementToUpdate.agreementData.posts.findIndex((post) => post.nr === post2);

  agreementToUpdate.agreementData.posts[post1Index].nr = post2;
  agreementToUpdate.agreementData.posts[post2Index].nr = post1;

  return await updateAgreement(agreementId, agreementToUpdate);
};

export const deleteFileFromAttachmentGroup = async (
  agreementId: string,
  uri: string,
  attachmentIdToUpdate: string,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  const editedAgreementDTO = getEditedAgreementDTORemoveFiles(agreementToUpdate, attachmentIdToUpdate, uri);

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO);
};

export const updateAgreementAttachmentGroup = async (
  agreementId: string,
  attachmentId: string,
  data: EditAttachmentGroupFormData,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  const editedAgreementDTO = getEditedAgreementWithNewAttachmentGroupInfo(agreementToUpdate, attachmentId, data);

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO);
};

export const updateAgreementInfo = async (
  agreementId: string,
  data: EditAgreementFormDataDto,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  const editedAgreementDTO = getEditedAgreementWithNewInfoDTO(agreementToUpdate, data);

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO);
};

export const updateAgreementDescription = async (
  agreementId: string,
  data: EditCommonInfoAgreement,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);

  const description = data.description ? data.description : "";

  const editedAgreementDTO = getEditedAgreementDTO(agreementToUpdate, description);

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO);
};

export const updateAgreementWithNewAttachmentGroup = async (
  agreementId: string,
  data: NyAttachmentGroupFormData,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate: AgreementRegistrationDTO = await getAgreement(agreementId);
  const nyAttachmentGroup: AgreementAttachment = {
    id: uuidv4(),
    title: data.tittel,
    description: data.beskrivelse,
    media: [],
  };

  const updatedAgreement = getAgreeementWithNewAttachmentGroup(agreementToUpdate, nyAttachmentGroup);

  return await updateAgreement(updatedAgreement.id, updatedAgreement);
};

export const deleteAttachmentGroup = async (
  agreementId: string,
  attachmentId: string,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate: AgreementRegistrationDTO = await getAgreement(agreementId);
  const updatedAgreement = getAgreeementWithoutDeletedAttachmentDTO(agreementToUpdate, attachmentId);

  return await updateAgreement(updatedAgreement.id, updatedAgreement);
};
