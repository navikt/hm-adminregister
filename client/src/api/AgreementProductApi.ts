import {
  ProductAgreementRegistrationDTO,
  ProductAgreementRegistrationDTOList,
  ProductRegistrationDTO,
} from '../utils/response-types'
import { HM_REGISTER_URL } from '../environments'
import { CustomError } from '../utils/swr-hooks'
import { v4 as uuidv4 } from 'uuid'
import { todayTimestamp } from '../utils/date-util'

export const deleteProductsFromAgreement = async (agreementProductIds: string[]) => {

  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/ids`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(agreementProductIds),
    })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }

}

export const changeRankOnProductAgreements = async (productAgreementIds: string[], newRank: number) => {

  const productAgreementsToUpdate: ProductAgreementRegistrationDTO[] = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/get-by-ids`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(productAgreementIds),
    },
  ).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status)
      })
    }
    return res.json()
  })

  const updatedProductAgreements: ProductAgreementRegistrationDTO[] =
    getEditedProductAgreements(productAgreementsToUpdate, newRank)

  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/batch`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updatedProductAgreements),
    })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    console.log(error)
    return Promise.reject(error)
  }

}

export const addProductsToAgreement = async (agreementId: string, post: number, productsToAdd: ProductRegistrationDTO[]): Promise<ProductAgreementRegistrationDTOList> => {

  const agreementToUpdate = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status)
      })
    }
    return res.json()
  })

  const productAgreementsToAdd: ProductAgreementRegistrationDTO[] = []

  productsToAdd.forEach(product => {
    const productAgreement: ProductAgreementRegistrationDTO = {
      id: uuidv4(),
      productId: product.id,
      seriesUuid: product.seriesUUID,
      title: product.title,
      articleName: product.articleName,
      supplierRef: product.supplierRef,
      supplierId: product.supplierId,
      hmsArtNr: product.hmsArtNr,
      agreementId: agreementId,
      reference: product.supplierRef,
      status: product.registrationStatus,
      createdBy: 'REGISTER',
      created: agreementToUpdate.created,
      updated: todayTimestamp(),
      rank: 1, //todo
      post: post,
      published: agreementToUpdate.published,
      expired: agreementToUpdate.expired,
      updatedByUser: agreementToUpdate.updatedByUser, // todo: get from user?
    }
    productAgreementsToAdd.push(productAgreement)
  })

  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/batch`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(productAgreementsToAdd),
    })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    console.log(error)
    return Promise.reject(error)
  }
}

const getEditedProductAgreements = (
  productAgreementsToEdit: ProductAgreementRegistrationDTO[],
  newRanking: number,
): ProductAgreementRegistrationDTO[] => {


  return productAgreementsToEdit.map(productAgreement => {
    return {
      ...productAgreement,
      rank: newRanking,
      updated: todayTimestamp(),
    }
  })

}
