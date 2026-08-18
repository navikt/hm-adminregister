import { fetchAPI } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import useSWR from 'swr'
import { fetcherGET } from 'utils/swr-hooks.ts'
import { TechLabelCreateUpdateDTO, TechLabelCriteria, TechLabelRegistrationDTO } from 'utils/types/response-types'

const BASE_URL = () => `${HM_REGISTER_URL()}/admreg/admin/api/v1/techlabel/registrations`
const LABEL_SERVICE_URL = () => `${HM_REGISTER_URL()}/admreg/api/v1/techlabels
`
type TechLabelResponse = {
  content: TechLabelRegistrationDTO[]
  totalElements: number
}

export const getTechLabels = (criteria: TechLabelCriteria = {}, page: number = 0, size: number = 20) => {
  const params = new URLSearchParams()
  if (criteria.label) params.append('label', criteria.label)
  if (criteria.type) params.append('type', criteria.type)
  if (criteria.unit) params.append('unit', criteria.unit)
  if (criteria.isoCode) params.append('isoCode', criteria.isoCode)
  params.append('page', page.toString())
  params.append('size', size.toString())

  return useSWR<TechLabelResponse>(`${BASE_URL()}/?${params.toString()}`, fetcherGET)
}

export const createTechLabel = (dto: TechLabelCreateUpdateDTO): Promise<TechLabelRegistrationDTO> =>
  fetchAPI(`${BASE_URL()}/`, 'POST', dto)

export const updateTechLabel = (id: string, dto: TechLabelCreateUpdateDTO): Promise<TechLabelRegistrationDTO> =>
  fetchAPI(`${BASE_URL()}/${id}`, 'PUT', dto)

export const deleteTechLabel = (id: string, forcedDelete: boolean): Promise<void> =>
  fetchAPI(`${BASE_URL()}/${id}?forcedDelete=${forcedDelete}`, 'DELETE')

export const listTechUnits = (): Promise<string[]> => fetchAPI(`${LABEL_SERVICE_URL()}/all/units`, 'GET')

export const listTechLabelNames = (): Promise<string[]> => fetchAPI(`${LABEL_SERVICE_URL()}/all/names`, 'GET')
