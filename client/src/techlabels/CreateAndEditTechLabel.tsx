import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { createTechLabel, updateTechLabel, listTechUnits } from 'api/TechLabelApi'
import FormBox from 'felleskomponenter/FormBox'
import { TechLabelCreateUpdateDTO, TechLabelRegistrationDTO, TechLabelType } from 'utils/types/response-types'

import { Button, HStack, Select, TextField, VStack, UNSAFE_Combobox } from '@navikt/ds-react'

type FormData = {
  label: string;
  type: TechLabelType;
  unit: string;
  required: 'true' | 'false';
  sort: number;
  isoCode: string;
  options: string;
}

const TECH_LABEL_TYPES = [
  { value: '', label: 'Velg type' },
  { value: 'N', label: 'Numerisk' },
  { value: 'L', label: 'Ja/Nei' },
  { value: 'C', label: 'Streng' },
]

const CreateAndEditTechLabel = () => {
  const location = useLocation()
  const editData = location.state as TechLabelRegistrationDTO | undefined
  const navigate = useNavigate()
  const [techUnits, setTechUnits] = useState<string[]>([])

  useEffect(() => {
    listTechUnits().then(setTechUnits).catch(() => setTechUnits([]))
  }, [])

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      label: editData?.label || '',
      type: editData?.type || 'N',
      unit: editData?.unit || '',
      required: editData?.required ? 'true' : 'false',
      sort: editData?.sort || 0,
      isoCode: editData?.isoCode || '',
      options: editData?.options?.join(', ') || '',
    },
  })

  async function onSubmit(data: FormData) {
    const dto: TechLabelCreateUpdateDTO = {
      ...data,
      required: data.required === 'true',
      options: data.options ? data.options.split(',').map((opt) => opt.trim()) : [],
    }

    if (editData) {
      await updateTechLabel(editData.id, dto)
    } else {
      await createTechLabel(dto)
    }
    navigate(`/tekniskdata?searchIsoCode=${data.isoCode}`)
  }

  const title = editData ? 'Endre teknisk-data beskrivelse' : 'Opprett ny teknisk-data beskrivelse'

  return (
    <FormBox title={title}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="space-8">
          <TextField
            {...register('label', { required: true })}
            label="Navn *"
            error={errors.label && 'Label is required'}
            id="label"
            autoComplete="on"
          />
          <Select
            {...register('type', { required: true })}
            label="Type *"
            error={errors.type && 'Type is required'}
            id="type"
            defaultValue={editData?.type || ''}
          >
            {TECH_LABEL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <UNSAFE_Combobox
            label="Enhet"
            id="unit"
            options={techUnits}
            defaultValue={editData?.unit || ''}
            allowNewValues
            onToggleSelected={(option, isSelected) => {
              setValue('unit', isSelected ? option : '')
            }}
          />
          <TextField
            {...register('isoCode', { required: true })}
            label="ISO-kode *"
            error={errors.isoCode && 'ISO Code is required'}
            id="isoCode"
            autoComplete="on"
          />
          <Select
              {...register('required', { required: true })}
              label="Obligatorisk *"
              error={errors.required && "Required is required"}
              id="required"
              defaultValue={editData?.required ? "true" : "false"}
            >
              <option value="true">Ja</option>
              <option value="false">Nei</option>
          </Select>
          <TextField
              {...register('sort', { required: true })}
              label="Sortering *"
              error={errors.sort && "Sortering is required"}
              id="sort"
              defaultValue={editData?.sort || 0}
          />
          <TextField
            {...register('options', { required: false })}
            label="Alternativer"
            id="options"
            autoComplete="on"
          />
          <HStack gap="space-4" align="center">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium">
              {editData ? 'Endre' : 'Opprett'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  )
}

export default CreateAndEditTechLabel
