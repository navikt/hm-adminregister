import { HM_REGISTER_URL } from 'environments'
import { AgreementDraftWithDTO, AgreementPostDTO, AgreementRegistrationDTO } from 'utils/response-types'
import { EditCommonInfoAgreement } from 'rammeavtaler/rammeavtale/Rammeavtale'
import { todayTimestamp } from 'utils/date-util'
import { v4 as uuidv4 } from 'uuid'
import { NyDelkontraktFormData } from 'rammeavtaler/rammeavtale/delkontraktliste/NewDelkontraktModal'
import { EditDelkontraktFormData } from 'rammeavtaler/rammeavtale/delkontraktdetaljer/EditDelkontraktInfoModal'
import { EditAgreementFormDataDto } from 'utils/zodSchema/editAgreement'

export const getAgreement = async (agreementId: string): Promise<AgreementRegistrationDTO> => {
  const response = await fetch(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }
}
export const updateAgreement = async (agreementId: string, updatedAgreement: AgreementRegistrationDTO): Promise<AgreementRegistrationDTO> => {
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updatedAgreement),
  })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }

}
export const postAgreementDraft = async (isAdmin: Boolean, agreementDraft: AgreementDraftWithDTO): Promise<AgreementRegistrationDTO> => {
  const createAgreementPath = () => isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/draft/reference`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/agreement/registrations/draft/reference`

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

export const updateAgreementInfo = async (agreementId: string, data: EditAgreementFormDataDto): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate = await getAgreement(agreementId)
  const editedAgreementDTO = getEditedAgreementWithNewInfoDTO(agreementToUpdate, data)

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO)
}

export const updateAgreementDescription = async (agreementId: string, data: EditCommonInfoAgreement): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate = await getAgreement(agreementId)

  const description = data.description
    ? data.description
    : ''

  const editedAgreementDTO = getEditedAgreementDTO(agreementToUpdate, description)

  return await updateAgreement(editedAgreementDTO.id, editedAgreementDTO)
}

export const updateAgreementWithNewDelkontrakt = async (agreementId: string, data: NyDelkontraktFormData): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate: AgreementRegistrationDTO = await getAgreement(agreementId)

  const nyDelkontrakt: AgreementPostDTO = {
    identifier: uuidv4(),
    nr: Math.max(...agreementToUpdate.agreementData.posts.map((post) => post.nr)) + 1,
    title: data.tittel,
    description: data.beskrivelse,
    created: todayTimestamp(),
  }

  const updatedAgreement = getAgreeementWithNewDelkontraktDTO(agreementToUpdate, nyDelkontrakt)

  return await updateAgreement(updatedAgreement.id, updatedAgreement)
}

export const deleteDelkontrakt = async (agreementId: string, delkontraktId: string): Promise<AgreementRegistrationDTO> => {
  const agreementToUpdate: AgreementRegistrationDTO = await getAgreement(agreementId)
  const updatedAgreement = getAgreeementWithoutDeletedDelkontraktDTO(agreementToUpdate, delkontraktId)

  return await updateAgreement(updatedAgreement.id, updatedAgreement)
}

export const updateDelkontrakt = async (agreementId: string, delkontraktId: string, data: EditDelkontraktFormData): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate: AgreementRegistrationDTO = await getAgreement(agreementId)

  const delkontraktToUpdate = agreementToUpdate.agreementData.posts.find(
    (post: AgreementPostDTO) => post.identifier === delkontraktId,
  )

  if (delkontraktToUpdate === undefined) {
    return Promise.reject('Delkontrakt not found')
  }

  const oppdatertDelkontrakt: AgreementPostDTO = {
    identifier: delkontraktToUpdate.identifier,
    nr: delkontraktToUpdate.nr,
    title: data.tittel,
    description: data.beskrivelse,
    created: delkontraktToUpdate.created,
  }

  const updatedAgreement =
    getAgreeementWithUpdatedDelkontraktDTO(agreementToUpdate, oppdatertDelkontrakt)

  return await updateAgreement(updatedAgreement.id, updatedAgreement)
}

const getEditedAgreementDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  newDescription: string,
): AgreementRegistrationDTO => {
  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      text: newDescription,
    },
  }
}

const getEditedAgreementWithNewInfoDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  editedInfo: EditAgreementFormDataDto,
): AgreementRegistrationDTO => {
  return {
    ...agreementToEdit,
    title: editedInfo.agreementName,
    published: editedInfo.avtaleperiodeStart,
    expired: editedInfo.avtaleperiodeSlutt,
    reference: editedInfo.anbudsnummer,
  }
}

const getAgreeementWithUpdatedDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  updatedPost: AgreementPostDTO,
): AgreementRegistrationDTO => {

  const index = agreementToEdit.agreementData.posts.findIndex((post) => post.identifier === updatedPost.identifier)
  agreementToEdit.agreementData.posts[index] = updatedPost

  return {
    ...agreementToEdit,
  }
}

const getAgreeementWithNewDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  newPost: AgreementPostDTO,
): AgreementRegistrationDTO => {

  const updatedPosts = [
    ...agreementToEdit.agreementData.posts, newPost,
  ]

  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      posts: updatedPosts,
    },
  }
}

const getAgreeementWithoutDeletedDelkontraktDTO = (
  agreementToEdit: AgreementRegistrationDTO,
  delkontraktId: string,
): AgreementRegistrationDTO => {

  const updatedPosts =
    agreementToEdit.agreementData.posts.filter((post) => post.identifier !== delkontraktId)


  return {
    ...agreementToEdit,
    agreementData: {
      ...agreementToEdit.agreementData,
      posts: updatedPosts,
    },
  }
}

