import { HM_REGISTER_URL } from '../environments'
import { AgreementDraftWithDTO, AgreementPostDTO, AgreementRegistrationDTO } from '../utils/response-types'
import { CustomError } from '../utils/swr-hooks'
import { EditCommonInfoAgreement } from '../rammeavtaler/rammeavtale/Rammeavtale'
import { todayTimestamp } from '../utils/date-util'
import { NyDelkontraktFormData } from '../rammeavtaler/rammeavtale/delkontrakt/NewDelkontraktModal'
import { EditDelkontraktFormData } from '../rammeavtaler/rammeavtale/delkontrakt/EditDelkontraktModal'

export const postAgreementDraft = async (isAdmin: Boolean, agreementDraft: AgreementDraftWithDTO): Promise<AgreementRegistrationDTO> => {
  const createAgreementPath = () => isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/draft/reference`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/agreement/registrations/draft/reference`

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


export const updateAgreement = async (agreementId: string, data: EditCommonInfoAgreement): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate = await fetch(
    `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementId}`,
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

  const description = data.description
    ? data.description
    : ''

  const editedAgreementDTO = getEditedAgreementDTO(agreementToUpdate, description)

  const response = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementToUpdate.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(editedAgreementDTO),
  })

  if (response.ok) {
    return await response.json()
  } else {
    const error = await response.json()
    return Promise.reject(error)
  }
}

export const updateAgreementWithNewDelkontrakt = async (agreementId: string, data: NyDelkontraktFormData): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate = await fetch(
    `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementId}`,
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

  // todo: sette riktig info i delkontrakt
  const nyDelkontrakt: AgreementPostDTO = {
    // identifier: (agreementToUpdate.agreementData.posts.length + 2).toString(),
    identifier: 'adawdwadawdawd',
    nr: agreementToUpdate.agreementData.posts.length + 2,
    title: data.tittel,
    description: data.beskrivelse,
    created: todayTimestamp(),
  }

  const updatedAgreement = getAgreeementWithNewDelkontraktDTO(agreementToUpdate, nyDelkontrakt)

  const response = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementToUpdate.id}`, {
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

export const updateDelkontrakt = async (agreementId: string, delkontraktId: string, data: EditDelkontraktFormData): Promise<AgreementRegistrationDTO> => {

  const agreementToUpdate = await fetch(
    `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementId}`,
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

  const delkontraktToUpdate = agreementToUpdate.agreementData.posts.find(
    (post: AgreementPostDTO) => post.identifier === delkontraktId,
  )

  const oppdatertDelkontrakt: AgreementPostDTO = {
    identifier: delkontraktToUpdate.identifier,
    nr: delkontraktToUpdate.nr,
    title: data.tittel,
    description: data.beskrivelse,
    created: delkontraktToUpdate.created,
  }

  const updatedAgreement =
    getAgreeementWithUpdatedDelkontraktDTO(agreementToUpdate, oppdatertDelkontrakt)

  const response = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementToUpdate.id}`, {
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

