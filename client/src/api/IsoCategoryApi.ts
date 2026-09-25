import { fetchAPI } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import { Iso22DTO, IsoCategory22DTO, IsoCategoryDTO, IsoMapDTO } from 'utils/types/response-types'

export const getAllIsoCategories = (): Promise<IsoCategoryDTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/isocategories`, 'GET')

export const getAllIsoCategories22 = (): Promise<IsoCategory22DTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v22/isocategories`, 'GET')

export const getAllIsoMappings = (): Promise<IsoMapDTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isomap`, 'GET')

export const updateIsoMapping = (isoMap: IsoMapDTO): Promise<IsoMapDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isomap/${isoMap.id}`, 'PUT', { isoMap })

// Oppretter en ny ISO 22-kategori (brukes for å legge til et manglende nivå 4-kodepunkt under en
// eksisterende nivå 1-3-kategori). Backend overstyrer createdByUser/updatedByUser/created/updated,
// men id/createdBy/updatedBy må sendes fra klienten (se Iso22AdminController.createIso).
export const createIso22Category = (iso: Iso22DTO): Promise<Iso22DTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isocategory`, 'POST', iso)
