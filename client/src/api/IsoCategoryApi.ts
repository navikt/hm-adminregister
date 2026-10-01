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

// Henter hele ISO 22-kategorien (med id, isoType, oversettelser osv.). Backend sin PUT erstatter hele
// raden, så en endring må bygge på denne og ikke på det reduserte IsoCategory22DTO fra den åpne listen.
export const getIso22Category = (isoCode: string): Promise<Iso22DTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isocategory/${isoCode}`, 'GET')

export const updateIso22Category = (iso: Iso22DTO): Promise<Iso22DTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isocategory/${iso.isoCode}`, 'PUT', iso)
