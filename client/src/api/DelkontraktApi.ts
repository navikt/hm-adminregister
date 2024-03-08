import { HM_REGISTER_URL } from "environments";
import { DelkontraktRegistrationDTO } from "utils/types/response-types";
import { EditDelkontraktFormData } from "rammeavtaler/rammeavtale/delkontraktdetaljer/EditDelkontraktInfoModal";
import { todayTimestamp } from "utils/date-util";
import { v4 as uuidv4 } from "uuid";
import { NyDelkontraktFormData } from "rammeavtaler/rammeavtale/delkontraktliste/NewDelkontraktModal";
import { fetchAPI } from "api/fetch";

export const getDelkontrakt = (delkontraktId: string): Promise<DelkontraktRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`, "GET");

export const createDelkontrakt = (
  agreementId: string,
  data: NyDelkontraktFormData,
  sortnr: number,
): Promise<DelkontraktRegistrationDTO> => {
  const newDelkontrakt: DelkontraktRegistrationDTO = {
    id: uuidv4(),
    identifier: uuidv4(),
    createdBy: todayTimestamp(),
    updated: todayTimestamp(),
    agreementId: agreementId,
    updatedBy: "REGISTER",
    delkontraktData: {
      title: data.tittel,
      description: data.beskrivelse,
      sortNr: sortnr,
    },
  };

  return fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/`,
    "POST",
    newDelkontrakt,
  );
};

export const updateDelkontrakt = (
  delkontraktId: string,
  updatedDelkontrakt: DelkontraktRegistrationDTO,
): Promise<DelkontraktRegistrationDTO> =>
  fetchAPI(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`,
    "PUT",
    updatedDelkontrakt,
  );

export const deleteDelkontrakt = (delkontraktId: string): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`, "DELETE");

export const updateDelkontraktinfo = async (
  delkontraktId: string,
  data: EditDelkontraktFormData,
): Promise<DelkontraktRegistrationDTO> => {
  const delkontraktToUpdate: DelkontraktRegistrationDTO = await getDelkontrakt(delkontraktId);

  if (delkontraktToUpdate === undefined) {
    return Promise.reject("Delkontrakt not found");
  }

  const oppdatertDelkontrakt: DelkontraktRegistrationDTO = {
    ...delkontraktToUpdate,
    updated: todayTimestamp(),
    delkontraktData: {
      title: data.tittel,
      description: data.beskrivelse,
      sortNr: delkontraktToUpdate.delkontraktData.sortNr,
      refNr: delkontraktToUpdate.delkontraktData.refNr,
    },
  };

  return await updateDelkontrakt(oppdatertDelkontrakt.id, oppdatertDelkontrakt);
};

export const reorderDelkontrakter = async (delkontrakt1: string, delkontrakt2: string): Promise<void> => {
  const delkontrakt1ToUpdate = await getDelkontrakt(delkontrakt1);
  const delkontrakt2ToUpdate = await getDelkontrakt(delkontrakt2);

  const delkontrakt1Updated: DelkontraktRegistrationDTO = {
    ...delkontrakt1ToUpdate,
    delkontraktData: {
      ...delkontrakt1ToUpdate.delkontraktData,
      sortNr: delkontrakt2ToUpdate.delkontraktData.sortNr,
    },
  };

  const delkontrakt2Updated: DelkontraktRegistrationDTO = {
    ...delkontrakt2ToUpdate,
    delkontraktData: {
      ...delkontrakt2ToUpdate.delkontraktData,
      sortNr: delkontrakt1ToUpdate.delkontraktData.sortNr,
    },
  };

  // todo: should probably do this in one back end transaction
  await updateDelkontrakt(delkontrakt1Updated.id, delkontrakt1Updated);
  await updateDelkontrakt(delkontrakt2Updated.id, delkontrakt2Updated);

  return;
};
