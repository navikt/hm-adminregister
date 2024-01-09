import { HM_REGISTER_URL } from '../environments'
import { AgreementDraftWithDTO, AgreementRegistrationDTO } from '../utils/response-types'

export const postAgreementDraft = async (isAdmin: Boolean, agreementDraft: AgreementDraftWithDTO): Promise<AgreementRegistrationDTO> => {
  const createAgreementPath = () => isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/draft/reference`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/agreement/registrations/draf/reference`

  const response = await fetch(createAgreementPath(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(agreementDraft),
  })
  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }
}

