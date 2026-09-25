import { fetchAPI } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import { IsoCategory22DTO, IsoCategoryDTO, IsoMapDTO } from 'utils/types/response-types'

export const getAllIsoCategories = (): Promise<IsoCategoryDTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v1/isocategories`, 'GET')

export const getAllIsoCategories22 = (): Promise<IsoCategory22DTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/api/v22/isocategories`, 'GET')

export const getAllIsoMappings = (): Promise<IsoMapDTO[]> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v22/isomap`, 'GET')
