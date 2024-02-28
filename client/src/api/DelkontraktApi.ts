import { HM_REGISTER_URL } from "environments";
import { DelkontraktRegistrationDTO } from "utils/types/response-types";

export const getDelkontrakter = async (agreementId: string): Promise<DelkontraktRegistrationDTO[]> => {
  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/agreement/${agreementId}`,
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
