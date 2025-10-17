import { HM_REGISTER_URL } from "environments";
import { fetchAPI } from "api/fetch";
import { TechLabelCreateUpdateDTO, TechLabelCriteria, TechLabelRegistrationDTO } from "utils/types/response-types";

const BASE_URL = () => `${HM_REGISTER_URL()}/admreg/admin/api/v1/techlabel/registrations`;

export const getTechLabels = (
  criteria: TechLabelCriteria = {},
  page: number = 0,
  size: number = 20,
): Promise<{ content: TechLabelRegistrationDTO[]; totalElements: number }> => {
  const params = new URLSearchParams();
  if (criteria.label) params.append("label", criteria.label);
  if (criteria.type) params.append("type", criteria.type);
  if (criteria.unit) params.append("unit", criteria.unit);
  if (criteria.isoCode) params.append("isoCode", criteria.isoCode);
  params.append("page", page.toString());
  params.append("size", size.toString());

  return fetchAPI(`${BASE_URL()}/?${params.toString()}`, "GET");
};

export const createTechLabel = (dto: TechLabelCreateUpdateDTO): Promise<TechLabelRegistrationDTO> =>
  fetchAPI(`${BASE_URL()}/`, "POST", dto);

export const updateTechLabel = (id: string, dto: TechLabelCreateUpdateDTO): Promise<TechLabelRegistrationDTO> =>
  fetchAPI(`${BASE_URL()}/${id}`, "PUT", dto);
