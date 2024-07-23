import { HM_REGISTER_URL } from "environments";
import { AgreementAttachment, AgreementDraftWithDTO, AgreementRegistrationDTO } from "utils/types/response-types";
import { EditCommonInfoAgreement } from "agreements/agreement/Agreement";
import { v4 as uuidv4 } from "uuid";
import { EditAgreementFormDataDto } from "utils/zodSchema/editAgreement";
import { EditAttachmentGroupFormData } from "agreements/agreement/vedlegg/EditAttachmentGroupModal";
import {
  getAgreeementWithNewAttachmentGroup,
  getAgreeementWithoutDeletedAttachmentDTO,
  getEditedAgreementDTO,
  getEditedAgreementDTORemoveFiles,
  getEditedAgreementWithNewAttachmentGroupInfo,
  getEditedAgreementWithNewInfoDTO,
} from "utils/agreement-util";
import { NyAttachmentGroupFormData } from "agreements/agreement/vedlegg/NewAttachmentGroupModal";
import { fetchAPI, getPath } from "api/fetch";

export const getAgreement = (agreementId: string): Promise<AgreementRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, "GET");

export const updateAgreement = (
  agreementId: string,
  updatedAgreement: AgreementRegistrationDTO,
): Promise<AgreementRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, "PUT", updatedAgreement);

export const deleteAgreement = (agreementId: string): Promise<AgreementRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, "DELETE");

export const postAgreementDraft = (
  isAdmin: boolean,
  agreementDraft: AgreementDraftWithDTO,
): Promise<AgreementRegistrationDTO> => {
  const createAgreementPath = () => getPath(isAdmin, "/api/v1/agreement/registrations/draft/reference");

  return fetchAPI(createAgreementPath(), "POST", agreementDraft);
};

export const publishAgreement = async (agreementId: string): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  agreementToUpdate.draftStatus = "DONE";
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
