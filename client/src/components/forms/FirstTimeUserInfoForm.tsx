import { zodResolver } from '@hookform/resolvers/zod'
import { PersonPencilIcon } from '@navikt/aksel-icons'
import { Loader, TextField, Button, Heading } from '@navikt/ds-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UserDTO } from "../../utils/response-types";
import { useNavigate } from "react-router-dom";
import { userInfoUpdate } from "../../utils/zodSchema/login";
import { formatPhoneNumber, labelRequired } from "../../utils/string-util";
import { HM_REGISTER_URL } from "../../environments";

type FormData = z.infer<typeof userInfoUpdate>

interface BlurredFields {
  name: boolean
  phone: boolean
  oldPassword: boolean
  newPassword: boolean
  confirmPassword: boolean
}

const FirstTimeUserInfoForm = ({ user, isAdmin }: { user: UserDTO; isAdmin: boolean }) => {
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    name: false,
    phone: false,
    confirmPassword: false,
    newPassword: false,
    oldPassword: false,
  })
  const [phoneValue, setPhoneValue] = useState('')
  const navigate = useNavigate()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setLoading] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(userInfoUpdate),
    mode: 'onChange',
    defaultValues: {
      name: user.name || '',
      phone: user.attributes.phone || '',
    },
  })

  const handleFieldBlur = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: true,
    })

    if (fieldName === 'phone') {
      const formattedValue = formatPhoneNumber(phoneValue)
      setPhoneValue(formattedValue)
    }
  }

  const handleFieldFocus = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: false,
    })
  }

  const userPasswordUrl = isAdmin ? `${HM_REGISTER_URL}admreg/admin/api/v1/users/password` : `${HM_REGISTER_URL}admreg/vendor/api/v1/users/password`
  const userInfoUrl = isAdmin ? `${HM_REGISTER_URL}admreg/admin/api/v1/users/${user.id}` : `${HM_REGISTER_URL}admreg/vendor/api/v1/users`

  async function onSubmit(data: FormData) {
    const cleanedPhoneNumber = data.phone.replace(/[^+\d]+/g, '')
    const passwordBody = JSON.stringify({
      oldPassword: data.oldPassword,
      newPassword: data.confirmPassword,
    })
    const userInfoBody = JSON.stringify({
      ...user,
      name: data.name,
      attributes: {
        ...user?.attributes,
        phone: cleanedPhoneNumber || '',
      },
    })
    try {
      setLoading(true)
      const passwordResponse = await fetch(userPasswordUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: passwordBody,
      })

      if (!passwordResponse.ok) {
        throw Error('Feil passord')
      }

      const userInfoResponse = await fetch(userInfoUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: userInfoBody,
      })

      if (passwordResponse.ok && userInfoResponse.ok) {
        isAdmin ? navigate('/admin/profil') : navigate('/logg-inn/leverandoropplysninger')
      }

      if (!passwordResponse.ok || !userInfoResponse.ok) {
        throw Error('Error from post')
      }

      setLoading(false)
    } catch (e: any) {
      setError(e)
      setLoading(false)
    }
  }

  if (isLoading) {
    return <Loader size="3xlarge" title="Sender..."></Loader>
  }

  return (
    <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
      <PersonPencilIcon title="a11y-title" fontSize="1.5rem" />
      <Heading spacing level="2" size="small" align="center">
        Fyll ut informasjonen om deg og lag et nytt passord.
      </Heading>
      <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('name', { required: true })}
          label={labelRequired('Navn')}
          autoComplete="on"
          description="Fornavn og etternavn"
          onBlur={() => handleFieldBlur('name')}
          onFocus={() => handleFieldFocus('name')}
          error={blurredFields.name && errors?.name?.message}
        />
        <TextField
          {...register('phone', { required: false })}
          label="Telefonnummer"
          autoComplete="on"
          type="text"
          name="phone"
          onBlur={() => handleFieldBlur('phone')}
          onFocus={() => handleFieldFocus('phone')}
          error={blurredFields.phone && errors?.phone?.message}
        />

        <TextField
          {...register('oldPassword', { required: true })}
          label={labelRequired('Gammelt passord')}
          type="password"
          placeholder="********"
          autoComplete="off"
          onBlur={() => handleFieldBlur('oldPassword')}
          onFocus={() => handleFieldFocus('oldPassword')}
          error={blurredFields.oldPassword && errors?.oldPassword?.message}
        />
        <TextField
          {...register('newPassword', { required: true })}
          label={labelRequired('Lag ett passord')}
          description="Minst 8 karakterer langt"
          type="password"
          placeholder="********"
          autoComplete="off"
          onBlur={() => handleFieldBlur('newPassword')}
          onFocus={() => handleFieldFocus('newPassword')}
          error={blurredFields.newPassword && errors?.newPassword?.message}
        />
        <TextField
          {...register('confirmPassword', { required: true })}
          label={labelRequired('Gjenta passord')}
          type="password"
          placeholder="********"
          autoComplete="off"
          onBlur={() => handleFieldBlur('confirmPassword')}
          onFocus={() => handleFieldFocus('confirmPassword')}
          error={blurredFields.confirmPassword && errors?.confirmPassword?.message}
        />
        {error?.name && <span className="auth-dialog-box__erorr-message">{error?.message}</span>}
        <Button type="submit" disabled={!isValid || isSubmitting}>
          Lagre
        </Button>
      </form>
    </div>
  )
}

export default FirstTimeUserInfoForm
