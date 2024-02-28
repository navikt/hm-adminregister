import { HM_REGISTER_URL } from "environments";
import { DelkontraktRegistrationDTO } from "utils/types/response-types";
import { EditDelkontraktFormData } from "rammeavtaler/rammeavtale/delkontraktdetaljer/EditDelkontraktInfoModal";
import { todayTimestamp } from "utils/date-util";
import { v4 as uuidv4 } from "uuid";
import { NyDelkontraktFormData } from "rammeavtaler/rammeavtale/delkontraktliste/NewDelkontraktModal";
import { updateAgreement } from "api/AgreementApi";

export const getDelkontrakt = async (delkontraktId: string): Promise<DelkontraktRegistrationDTO> => {
  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const createDelkontrakt = async (
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

  const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newDelkontrakt),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const updateDelkontrakt = async (
  delkontraktId: string,
  updatedDelkontrakt: DelkontraktRegistrationDTO,
): Promise<DelkontraktRegistrationDTO> => {
  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updatedDelkontrakt),
    },
  );

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const deleteDelkontrakt = async (delkontraktId: string): Promise<void> => {
  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (response.ok) {
    return;
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

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

  console.log("dk1 to update", delkontrakt1ToUpdate);
  console.log("dk2 to update", delkontrakt2ToUpdate);

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
  const dk1 = await updateDelkontrakt(delkontrakt1Updated.id, delkontrakt1Updated);
  const dk2 = await updateDelkontrakt(delkontrakt2Updated.id, delkontrakt2Updated);

  console.log("dk1 after", dk1);
  console.log("dk2 after", dk2);

  return;
};
