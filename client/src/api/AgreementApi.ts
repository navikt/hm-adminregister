import { HM_REGISTER_URL } from "environments";
import {
  AgreementAttachment,
  AgreementDraftWithDTO,
  AgreementRegistrationDTO,
  MediaDTO,
} from "utils/types/response-types";
import { EditCommonInfoAgreement } from "agreements/agreement/Agreement";
import { v4 as uuidv4 } from "uuid";
import { EditAgreementFormDataDto } from "utils/zodSchema/editAgreement";
import { EditAttachmentGroupFormData } from "agreements/agreement/vedlegg/EditAttachmentGroupModal";
import {
  getAgreeementWithNewAttachmentGroup,
  getAgreeementWithoutDeletedAttachmentDTO,
  getEditedAgreementDTO,
  getEditedAgreementDTOAddFiles,
  getEditedAgreementDTOchangeTextOnFile,
  getEditedAgreementDTORemoveFiles,
  getEditedAgreementWithNewAttachmentGroupInfo,
  getEditedAgreementWithNewInfoDTO,
} from "utils/agreement-util";
import { NyAttachmentGroupFormData } from "agreements/agreement/vedlegg/NewAttachmentGroupModal";
import { fetchAPI, fetchAPIAttachment, getPath } from "api/fetch";
import { mapToMediaInfoWithFilename } from "api/MediaApi";
import { FileUpload } from "felleskomponenter/UploadModal";

export const getAgreement = (agreementId: string): Promise<AgreementRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, "GET");

const updateAgreement = (
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

export const uploadFilesToAgreement = async (
  agreementId: string,
  agreementAttachmentId: string,
  uploads: FileUpload[],
) => {
  const formData = new FormData();
  for (const upload of uploads) {
    formData.append("files", upload.file);
  }

  const createdMediaDTOs: MediaDTO[] = await fetchAPIAttachment(
    getPath(true, `/api/v1/media/agreement/files/${agreementId}`),
    "POST",
    formData,
  );

  const agreementToUpdate = await fetchAPI(getPath(true, `/api/v1/agreement/registrations/${agreementId}`), "GET");

  const mediaInfos = mapToMediaInfoWithFilename(createdMediaDTOs, uploads);

  const editedAgreementRegistrationDTO =
    mediaInfos && getEditedAgreementDTOAddFiles(agreementToUpdate, agreementAttachmentId, mediaInfos);

  return await fetchAPI(
    getPath(true, `/api/v1/agreement/registrations/${agreementToUpdate.id}`),
    "PUT",
    editedAgreementRegistrationDTO,
  );
};

export const updateFilenameOfAgreementAttachment = async (
  agreementId: string,
  uri: string,
  attachmentIdToUpdate: string,
  editedText: string,
): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate = await getAgreement(agreementId);
  const editedAgreementDTO = getEditedAgreementDTOchangeTextOnFile(
    agreementToUpdate,
    attachmentIdToUpdate,
    uri,
    editedText,
  );

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
