import { FC, MouseEvent, ReactNode } from 'react'

import { useInputContext } from 'felleskomponenter/comboboxfelles/Input/Input.context'
import { useSelectedOptionsContext } from 'felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext'
import { ComboboxOption } from 'felleskomponenter/comboboxfelles/types'

import { Chips } from '@navikt/ds-react'

interface SelectedOptionsProps {
  selectedOptions?: ComboboxOption[]
  removable: boolean
  children: ReactNode
}

const Option = ({ option, removable }: { option: ComboboxOption; removable: boolean }) => {
  const { removeSelectedOption } = useSelectedOptionsContext()
  const { focusInput } = useInputContext()
  const onClick = (e: MouseEvent) => {
    e.stopPropagation()
    removeSelectedOption(option)
    focusInput()
  }

  if (!removable) {
    return <div className="aksel-combobox__selected-options--no-bg">{option.label}</div>
  }
  return <Chips.Removable onClick={onClick}>{option.label}</Chips.Removable>
}

const SelectedOptions: FC<SelectedOptionsProps> = ({ selectedOptions = [], removable, children }) => {
  return (
    <Chips className="aksel-combobox__selected-options" style={{ gap: '0.5rem' }}>
      {selectedOptions.length
        ? selectedOptions.map((option, i) => <Option key={option.label + i} option={option} removable={removable} />)
        : []}
      {children}
    </Chips>
  )
}

export default SelectedOptions
