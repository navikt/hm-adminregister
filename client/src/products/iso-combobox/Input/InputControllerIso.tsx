/* eslint-disable jsx-a11y/no-static-element-interactions */
import { MouseEvent, forwardRef, useEffect, useState } from 'react'

import cl from 'clsx'
import { useInputContext } from 'felleskomponenter/comboboxfelles/Input/Input.context'
import SelectedOptions from 'felleskomponenter/comboboxfelles/SelectedOptions/SelectedOptions'
import { useSelectedOptionsContext } from 'felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext'
import { useMergeRefs } from 'felleskomponenter/comboboxfelles/utils'

import { XMarkIcon } from '@navikt/aksel-icons'

import { useFilteredOptionsContext } from '../FilteredOptions/filteredOptionsContext'
import { IsoBoxProps } from '../types'

import Input from './Input'
import ToggleListButton from './ToggleListButton'

/* eslint-disable jsx-a11y/click-events-have-key-events */
export const InputControllerIso = forwardRef<
  HTMLInputElement,
  Omit<IsoBoxProps, 'label' | 'description' | 'hideLabel' | 'onChange' | 'options' | 'onClear' | 'value'>
>(function InputController(props, ref) {
  const { ...rest } = props

  const { clearInput, focusInput, inputProps, value, inputRef, toggleOpenButtonRef } = useInputContext()
  const { activeDecendantId, isListOpen, toggleIsListOpen } = useFilteredOptionsContext()
  const { selectedOptions, removeSelectedOption, maxSelected } = useSelectedOptionsContext()
  const [focusing, setFocusing] = useState(false)

  const mergedInputRef = useMergeRefs(inputRef, ref)

  const clearField = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    clearInput(event)
    if (selectedOptions.length > 0) {
      removeSelectedOption(selectedOptions[0])
    }
    setFocusing(true)
  }

  useEffect(() => {
    if (focusing) {
      focusInput()
      setFocusing(false)
    }
  }, [focusing])

  const onClick = () => {
    toggleIsListOpen(!isListOpen)
  }

  return (
    <div
      className={cl('aksel-combobox__wrapper-inner aksel-text-field__input', {
        'aksel-combobox__wrapper-inner--virtually-unfocused': activeDecendantId !== undefined,
      })}
      onClick={() => {
        focusInput()
        onClick()
      }}
    >
      <SelectedOptions selectedOptions={selectedOptions} removable={false}>
        {maxSelected && !maxSelected?.isLimitReached && <Input id={inputProps.id} ref={mergedInputRef} {...rest} />}
      </SelectedOptions>
      <div>
        {(value || selectedOptions.length > 0) && (
          <button
            type="button"
            onClick={clearField}
            onPointerDown={(e) => e.preventDefault()}
            className="aksel-combobox__button-clear"
          >
            <span className="aksel-sr-only">Tøm</span>
            <XMarkIcon aria-hidden />
          </button>
        )}
        <ToggleListButton ref={toggleOpenButtonRef} />
      </div>
    </div>
  )
})
