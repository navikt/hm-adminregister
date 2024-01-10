import React, { useState } from 'react'
import { Button, Heading, TextField } from '@navikt/ds-react'
import { Buldings3Icon } from '@navikt/aksel-icons'
import './create-supplier.scss'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { newSupplierSchema } from '../utils/zodSchema/newSupplier'
import { useHydratedErrorStore } from '../utils/store/useErrorStore'
import { useNavigate } from 'react-router-dom'
import { formatPhoneNumber, labelRequired } from '../utils/string-util'
import { SupplierDTOBody } from '../utils/supplier-util'
import { HM_REGISTER_URL } from '../environments'


type FormData = z.infer<typeof newSupplierSchema>

interface BlurredFields {
  name: boolean
  email: boolean
  homepage: boolean
  phone: boolean
}

export default function OpprettLeverandør() {
  const { setGlobalError } = useHydratedErrorStore()
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    name: false,
    email: false,
    homepage: false,
    phone: false,
  })
  const [phoneValue, setPhoneValue] = useState('')

  const navigate = useNavigate()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(newSupplierSchema),
    mode: 'onChange',
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

  async function onSubmit(data: FormData) {
    //remove all white spaces
    const cleanedPhoneNumber = phoneValue.replace(/\s+/g, '')

    const newSupplier: SupplierDTOBody = {
      name: data.name,
      supplierData: {
        email: data.email || '',
        phone: cleanedPhoneNumber || '',
        homepage: data.homepage || '',
      },
    }

    const response = await fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/supplier/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newSupplier),
    })
    if (response.ok) {
      const responseData = await response.json()
      const id = responseData.id
      if (id) navigate(`/leverandor/${id}`)
    } else {
      //Mulig 400 bør håndteres direkte her siden 400 i denne konteksten betyr skjemafeil og bør kanskje skrives rett under firmanavnfeltet.
      //Samtidig så bør ikke 400 skje med riktig validering men vi får 400 feil når man registrerer to
      //leverandører med samme navn.
      const responsData = await response.json()
      setGlobalError(response.status, responsData.message)
    }
  }

  return (
    <div className='create-new-supplier'>
      <div className='content'>
        <div className='header-container'>
          <Buldings3Icon title='a11y-title' width={43} height={43} aria-hidden />
          <Heading level='1' size='large' align='center'>
            Opprett ny leverandør
          </Heading>
        </div>
        <form action='' method='POST' onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('name', { required: true })}
            label={labelRequired('Firmanavn')}
            id='name'
            name='name'
            type='text'
            autoComplete='on'
            onBlur={() => handleFieldBlur('name')}
            onFocus={() => handleFieldFocus('name')}
            error={blurredFields.name && errors.name && errors.name.message}
          />
          <TextField
            {...register('email', { required: false })}
            label={'E-post'}
            id='email'
            type='email'
            name='email'
            autoComplete='on'
            onBlur={() => handleFieldBlur('email')}
            onFocus={() => handleFieldFocus('email')}
            error={blurredFields.email && errors.email && errors.email.message}
          />
          <TextField
            {...register('homepage', { required: false })}
            label='Nettside'
            id='homepage'
            type='text'
            name='homepage'
            description='Eksempel: www.domene.no'
            autoComplete='on'
            onBlur={() => handleFieldBlur('homepage')}
            onFocus={() => handleFieldFocus('homepage')}
            error={blurredFields.homepage && errors.homepage && errors.homepage.message}
          />
          <TextField
            {...register('phone', { required: false })}
            label='Telefonnummer'
            id='phoneNumber'
            type='text'
            name='phone'
            autoComplete='on'
            onChange={(event) => setPhoneValue(event.target.value)}
            onBlur={() => handleFieldBlur('phone')}
            onFocus={() => handleFieldFocus('phone')}
            error={blurredFields.phone && errors.phone && errors.phone.message}
            value={phoneValue}
          />
          <div className='button-container'>
            <Button type='reset' variant='secondary' size='medium' onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type='submit' size='medium' disabled={!isDirty || !isValid || isSubmitting}>
              Opprett
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
