import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

type Props = {
  defaultValue?: string
  options?: string[]
  setValue?(value: string): void
  label?: JSX.Element
  errorMessage?: string
}

export default function Combobox({ defaultValue, options, setValue, label, errorMessage }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue ? [defaultValue] : [])
  const [filteredOptions, setFilteredOptions] = useState<string[]>()

  const onToggleSelected = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOptions([option])
      setValue && setValue(option)
    } else {
      setSelectedOptions([])
      setValue && setValue('')
    }
  }

  useEffect(() => {
    const filtered = options?.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
    setFilteredOptions(filtered)
  }, [inputValue, options])

  return (
    <UNSAFE_Combobox
      label={label || ''}
      description={'Velg isokategori produktet passer best inn i'}
      selectedOptions={selectedOptions}
      onChange={(event) => {
        setInputValue(event?.target.value || '')
      }}
      filteredOptions={filteredOptions}
      options={options || []}
      shouldAutocomplete={false}
      clearButton={true}
      onToggleSelected={onToggleSelected}
      error={errorMessage && errorMessage}
    />
  )
}
