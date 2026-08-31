import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  createTechLabel,
  getTechLabelsByLabel,
  listTechLabelNames,
  listTechLabelSections,
  listTechUnits,
  updateTechLabel,
} from 'api/TechLabelApi'
import FormBox from 'felleskomponenter/FormBox'
import { TechLabelCreateUpdateDTO, TechLabelRegistrationDTO, TechLabelType } from 'utils/types/response-types'

import { Button, HStack, Select, TextField, UNSAFE_Combobox, VStack } from '@navikt/ds-react'

type FormData = {
  label: string
  type: TechLabelType
  unit: string
  required: 'true' | 'false'
  sort: number
  isoCode: string
  options: string
  definition: string
  section: string
}

const DIVERSE_VALUE = 'DIVERSE'

const TECH_LABEL_TYPES = [
  { value: '', label: 'Velg type' },
  { value: 'N', label: 'Numerisk' },
  { value: 'L', label: 'Ja/Nei' },
  { value: 'C', label: 'Tekst' },
]

const mostCommonSection = (labels: TechLabelRegistrationDTO[]): string => {
  const counts = new Map<string, number>()
  labels.forEach((l) => {
    const key = l.section ?? DIVERSE_VALUE
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })
  let best = ''
  let bestCount = -1
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key
      bestCount = count
    }
  })
  return best
}

const CreateAndEditTechLabel = () => {
  const location = useLocation()
  const editData = location.state as TechLabelRegistrationDTO | undefined
  const navigate = useNavigate()
  const [techUnits, setTechUnits] = useState<string[]>([])
  const [techLabelNames, setTechLabelNames] = useState<string[]>([])
  const [techSections, setTechSections] = useState<string[]>([])

  useEffect(() => {
    listTechUnits()
      .then(setTechUnits)
      .catch(() => setTechUnits([]))
    listTechLabelNames()
      .then(setTechLabelNames)
      .catch(() => setTechLabelNames([]))
    listTechLabelSections()
      .then(setTechSections)
      .catch((e) => {
        console.error('Failed to fetch tech label sections', e)
        setTechSections([])
      })
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
      options: editData?.options?.join('; ') || '',
      definition: editData?.definition || '',
      section: editData ? (editData.section ?? DIVERSE_VALUE) : '',
    },
  })

  async function onSubmit(data: FormData) {
    const dto: TechLabelCreateUpdateDTO = {
      ...data,
      required: data.required === 'true',
      options: data.options ? data.options.split(';').map((opt) => opt.trim()) : [],
      section: data.section === DIVERSE_VALUE ? null : data.section,
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
          <input type="hidden" {...register('label', { required: true })} />
          <UNSAFE_Combobox
            label="Navn *"
            id="label"
            options={[...new Set(techLabelNames)].sort((a, b) => a.localeCompare(b, 'nb'))}
            defaultValue={editData?.label || ''}
            allowNewValues
            error={errors.label && 'Label is required'}
            onToggleSelected={(option, isSelected) => {
              setValue('label', isSelected ? option : '', {
                shouldDirty: true,
                shouldValidate: true,
              })
              if (isSelected) {
                getTechLabelsByLabel(option)
                  .then((existing) => {
                    if (existing.length > 0) {
                      setValue('section', mostCommonSection(existing), { shouldDirty: false })
                    }
                  })
                  .catch(() => undefined)
              }
            }}
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
          <Select
            {...register('section', { required: true })}
            label="Seksjon *"
            error={errors.section && 'Seksjon is required'}
            id="section"
            defaultValue={editData ? (editData.section ?? DIVERSE_VALUE) : ''}
          >
            <option value="">Velg seksjon</option>
            <option value={DIVERSE_VALUE}>Diverse</option>
            {techSections.map((s) => (
              <option key={s} value={s}>
                {s}
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
              setValue('unit', isSelected ? option : '', {
                shouldDirty: true,
                shouldValidate: true,
              })
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
            error={errors.required && 'Required is required'}
            id="required"
            defaultValue={editData?.required ? 'true' : 'false'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <TextField
            {...register('sort', { required: true })}
            label="Sortering *"
            error={errors.sort && 'Sortering is required'}
            id="sort"
            defaultValue={editData?.sort || 0}
          />
          <TextField
            {...register('options', { required: false })}
            label="Alternativer"
            id="options"
            autoComplete="on"
          />
          <TextField
            {...register('definition', { required: false })}
            label="Beskrivelse "
            id="definition"
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
