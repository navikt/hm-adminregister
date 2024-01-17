import { ProductAgreementRegistrationDTOList } from '../utils/response-types'
import { HM_REGISTER_URL } from '../environments'

export const getProductsForAgreement = async (agreementId: string): Promise<ProductAgreementRegistrationDTOList> => {

  const response = await fetch(
    `${HM_REGISTER_URL}/admreg/admin/api/v1/product-agreement/${agreementId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }
}
