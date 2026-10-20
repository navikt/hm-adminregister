import { fetchAPI } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import useSWR from 'swr'
import { IsoVersion, useIsoVersion, withIsoVersion } from 'utils/iso-version'
import { fetcherGET } from 'utils/swr-hooks.ts'
import {
  TechLabelCreateUpdateDTO,
  TechLabelCriteria,
  TechLabelRegistrationDTO,
  TechLabelSectionUpdateDTO,
} from 'utils/types/response-types'

const BASE_URL = () => `${HM_REGISTER_URL()}/admreg/admin/api/v1/techlabel/registrations`
const LABEL_SERVICE_URL = () => `${HM_REGISTER_URL()}/admreg/api/v1/techlabels
`
type TechLabelResponse = {
  content: TechLabelRegistrationDTO[]
  totalElements: number
}

export const getTechLabels = (criteria: TechLabelCriteria = {}, page: number = 0, size: number = 20) => {
  const isoVersion = useIsoVersion()
  const params = new URLSearchParams()
  if (criteria.label) params.append('label', criteria.label)
  if (criteria.type) params.append('type', criteria.type)
  if (criteria.unit) params.append('unit', criteria.unit)
  if (criteria.isoCode) params.append(isoVersion === 'v22' ? 'isoCode22' : 'isoCode', criteria.isoCode)
  if (criteria.isoCode22) params.append('isoCode22', criteria.isoCode22)
  params.append('page', page.toString())
  params.append('size', size.toString())

  return useSWR<TechLabelResponse>([`${BASE_URL()}/?${params.toString()}`, isoVersion], ([url]) => fetcherGET(url))
}

export const createTechLabel = (dto: TechLabelCreateUpdateDTO): Promise<TechLabelRegistrationDTO> =>
  fetchAPI(`${BASE_URL()}/`, 'POST', dto)

export const updateTechLabel = (
  id: string,
  dto: TechLabelCreateUpdateDTO,
  isoVersion: IsoVersion = 'v16'
): Promise<TechLabelRegistrationDTO> => fetchAPI(withIsoVersion(`${BASE_URL()}/${id}`, isoVersion), 'PUT', dto)

export const getTechLabelsByLabel = (label: string): Promise<TechLabelRegistrationDTO[]> =>
  fetchAPI(`${BASE_URL()}/?label=${encodeURIComponent(label)}&size=50`, 'GET').then(
    (res: TechLabelResponse) => res.content
  )

export const deleteTechLabel = (id: string, forcedDelete: boolean, isoVersion: IsoVersion = 'v16'): Promise<void> =>
  fetchAPI(withIsoVersion(`${BASE_URL()}/${id}?forcedDelete=${forcedDelete}`, isoVersion), 'DELETE')

export const listTechUnits = (): Promise<string[]> => fetchAPI(`${LABEL_SERVICE_URL()}/all/units`, 'GET')

export const listTechLabelNames = (): Promise<string[]> => fetchAPI(`${LABEL_SERVICE_URL()}/all/names`, 'GET')

export const listTechLabelSections = (): Promise<string[]> => fetchAPI(`${LABEL_SERVICE_URL()}/all/sections`, 'GET')

export const updateTechLabelSection = (dto: TechLabelSectionUpdateDTO): Promise<TechLabelRegistrationDTO[]> =>
  fetchAPI(`${BASE_URL()}/section`, 'PUT', dto)
