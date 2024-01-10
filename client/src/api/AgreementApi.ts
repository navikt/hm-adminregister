import { HM_REGISTER_URL } from '../environments'
import { AgreementDraftWithDTO, AgreementRegistrationDTO } from '../utils/response-types'
import { CustomError } from '../utils/swr-hooks'
import { EditCommonInfoAgreement } from '../rammeavtaler/rammeavtale/Rammeavtale'

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

