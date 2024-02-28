import { HM_REGISTER_URL } from "environments";
import { DelkontraktRegistrationDTO } from "utils/types/response-types";
import { EditDelkontraktFormData } from "rammeavtaler/rammeavtale/delkontraktdetaljer/EditDelkontraktInfoModal";
import { todayTimestamp } from "utils/date-util";

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

export const updatDelkontrakt = async (
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

export const updateDelkontrakt = async (
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

  return await updatDelkontrakt(oppdatertDelkontrakt.id, oppdatertDelkontrakt);
};
