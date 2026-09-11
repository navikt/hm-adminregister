import { validateNorwegianDecimal } from 'utils/string-util'
import { ExtendedTechDataDTO } from 'utils/types/response-types'

import { Select, TextField } from '@navikt/ds-react'

// Controlled, type-specific rendering of a single tech data field (NUMBER/BOOLEAN/OPTIONS/TEXT).
// Mirrors the field-type mapping used in ProductVariantForm.tsx, but as a plain controlled
// component (value/onChange) so it can be reused outside of a react-hook-form context, e.g. for
// inline editing of many variants at once in VariantsTab.
const TechDataFieldControl = ({
  techData,
  value,
  onChange,
  label,
  size = 'medium',
}: {
  techData: ExtendedTechDataDTO
  value: string
  onChange: (value: string) => void
  label: string
  size?: 'small' | 'medium'
}) => {
  const error = validationError(techData, value)

  switch (techData.type) {
    case 'NUMBER':
      return (
        <TextField
          label={label}
          hideLabel
          size={size}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          error={error}
          description={!error ? 'Bruk komma som desimalskilletegn f.eks. 1,5' : undefined}
        />
      )
    case 'BOOLEAN':
      return (
        <Select label={label} hideLabel size={size} value={value} onChange={(event) => onChange(event.target.value)} error={error}>
          <option value="">Velg</option>
          <option value="Ja">Ja</option>
          <option value="Nei">Nei</option>
        </Select>
      )
    case 'OPTIONS':
      return (
        <Select label={label} hideLabel size={size} value={value} onChange={(event) => onChange(event.target.value)} error={error}>
          <option value="">Velg</option>
          {techData.options?.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Select>
      )
    case 'TEXT':
    default:
      return (
        <TextField label={label} hideLabel size={size} value={value} onChange={(event) => onChange(event.target.value)} error={error} />
      )
  }
}

export const validationError = (techData: ExtendedTechDataDTO, value: string): string | undefined => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return techData.required ? `${techData.key} er påkrevd` : undefined
  }
  if (techData.type === 'NUMBER') {
    const decimalError = validateNorwegianDecimal(trimmed)
    return decimalError === true ? undefined : decimalError
  }
  return undefined
}

export default TechDataFieldControl
