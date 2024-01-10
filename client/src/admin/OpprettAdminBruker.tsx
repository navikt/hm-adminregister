import React, { useState } from 'react'
import './opprett-admin-user.scss'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PersonIcon } from '@navikt/aksel-icons'
import { Alert, Button, Checkbox, Heading, TextField } from '@navikt/ds-react'
import { newAdminUserSchema } from '../utils/zodSchema/newUser'
import { useHydratedErrorStore } from '../utils/store/useErrorStore'
import { useNavigate } from 'react-router-dom'
import { NewAdminUserDTO } from '../utils/admin-util'
import { labelRequired } from '../utils/string-util'
import { HM_REGISTER_URL } from '../environments'

type FormData = z.infer<typeof newAdminUserSchema>

interface BlurredFields {
  email: boolean
  password: boolean
}

export default function OpprettAdminBruker() {
  const { setGlobalError } = useHydratedErrorStore()
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    email: false,
    password: false,
  })
  const navigate = useNavigate()
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(newAdminUserSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleFieldBlur = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: true,
    })
  }
  const handleFieldFocus = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: false,
    })
  }

  async function onSubmit(data: FormData) {
    const newAdminUser: NewAdminUserDTO = {
      name: '',
      email: data.email || '',
      password: data.password || '',
      roles: ['ROLE_ADMIN'],
      attributes: {},
    }
    const response = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newAdminUser),
    })
    if (response.ok) {
      const responseData = await response.json()
      navigate('/admin/profil')
    } else {
      //Mulig 400 bør håndteres direkte her siden 400 i denne konteksten betyr skjemafeil og bør kanskje skrives rett under firmanavnfeltet.
      //Samtidig så bør ikke 400 skje med riktig validering men vi får 400 feil når man registrerer to
      //leverandører med samme navn.
      const responsData = await response.json()
      setGlobalError(response.status, responsData.message)
    }
  }

  return (
    <main>
      <div className='create-new-admin-user'>
        <div className='content'>
          <div className='header-container'>
            <PersonIcon aria-hidden={true} title='Person-ikon' width={43} height={43} />
            <Heading level='1' size='large' align='center'>
              Opprett ny admin-bruker
            </Heading>
          </div>
          <form className='form form--max-width-small' onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email', { required: true })}
              label={labelRequired('E-post')}
              id='email'
              type='email'
              name='email'
              description='Eksempel: firma@domene.no'
              autoComplete='off'
              onBlur={() => handleFieldBlur('email')}
              onFocus={() => handleFieldFocus('email')}
              error={blurredFields.email && errors?.email?.message}
            />
            <TextField
              {...register('password', { required: true })}
              label={labelRequired('Midlertidig passord')}
              id='password'
              type={isPasswordShown ? 'text' : 'password'}
              name='password'
              autoComplete='off'
              onBlur={() => handleFieldBlur('password')}
              onFocus={() => handleFieldFocus('password')}
              error={blurredFields.password && errors?.password?.message}
            />
            <Checkbox onClick={() => setIsPasswordShown((prevState) => !prevState)} value='isPassShown'>
              Vis passord
            </Checkbox>
            <Alert variant='info'>
              Husk at det ikke vil være mulig å finne tilbake til det midlertidige passordet etter at
              brukeren er
              opprettet.
            </Alert>
            <div className='button-container'>
              <Button type='reset' variant='secondary' size='medium'
                      onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type='submit' size='medium' disabled={!isDirty || !isValid || isSubmitting}>
                Opprett
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
