import { fetchAPI, getPath } from 'api/fetch'
import { HM_REGISTER_URL } from 'environments'
import useSWR from 'swr'
import { fetcherGET } from 'utils/swr-hooks'
import { ServiceJobDTO } from 'utils/types/response-types'

export function getServiceJobsForAgreement(agreementId: string) {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/service-job/agreement/${agreementId}`
  const { data, error, isLoading, mutate } = useSWR<ServiceJobDTO[]>(path, fetcherGET)

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}

export type UpdateServiceJobPayload = Pick<ServiceJobDTO, 'title' | 'hmsNr'>

export const updateServiceJob = async (id: string, payload: UpdateServiceJobPayload): Promise<ServiceJobDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/service-job/${id}`), 'PUT', payload)
}

export const deleteServiceJob = async (id: string): Promise<void> => {
  return await fetchAPI(getPath(true, `/api/v1/service-job/${id}`), 'DELETE')
}
