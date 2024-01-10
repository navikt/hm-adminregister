import { Alert, Button, Heading, Tabs, Textarea, VStack } from '@navikt/ds-react'
import React, { useRef, useState } from 'react'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { FloppydiskIcon, PencilWritingIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { AgreementRegistrationDTO } from '../../utils/response-types'
import { EditCommonInfoAgreement } from './Rammeavtale'
import { labelRequired } from '../../utils/string-util'

interface Props {
  agreement: AgreementRegistrationDTO
  onSubmit: SubmitHandler<EditCommonInfoAgreement>
}

const AboutTab = ({ agreement, onSubmit }: Props) => {
  const formMethods = useFormContext<EditCommonInfoAgreement>()
  const [showEditDescriptionMode, setShowEditDescriptionMode] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  formMethods.setValue('description', agreement.agreementData.text ?? '')

  const getDescription = () => (
    <>

    </>
  )

  const handleSaveDescription = () => {
    setShowEditDescriptionMode(false)
    formRef.current?.requestSubmit()
  }

  return (
    <Tabs.Panel value='about' className='tab-panel'>
      <form method='POST' onSubmit={formMethods.handleSubmit(onSubmit)} ref={formRef} role='legg til beskrivelse'>
        <VStack gap='14'>

          <VStack gap='2'>
            <Heading level='2' size='small'>
              {labelRequired('Beskrivelse')}
            </Heading>

            {!showEditDescriptionMode && (
              <>
                {!agreement.agreementData.text ? (
                  <>
                    <Alert variant='info'>Rammeavtalen trenger en beskrivelse før det kan sendes til godkjenning</Alert>
                    <Button
                      className='fit-content'
                      variant='tertiary'
                      icon={<PlusCircleIcon title='Legg til beskrivelse' fontSize='1.5rem' />}
                      onClick={() => setShowEditDescriptionMode(true)}
                    >
                      Legg til beskrivelse
                    </Button>
                  </>
                ) : (
                  <>
                    <pre className='pre'>{agreement.agreementData.text}</pre>
                    <Button
                      className='fit-content'
                      variant='tertiary'
                      icon={<PencilWritingIcon title='Endre beskrivelse' fontSize='1.5rem' />}
                      onClick={() => setShowEditDescriptionMode(true)}
                    >
                      Endre beskrivelse
                    </Button>
                  </>
                )}
              </>
            )}

            {showEditDescriptionMode && (
              <>
                <Textarea
                  defaultValue={agreement.agreementData.text || ''}
                  label={''}
                  id='description'
                  name='description'
                  onChange={(event) => formMethods.setValue('description', event.currentTarget.value)}
                />
                <Button
                  className='fit-content'
                  variant='tertiary'
                  icon={<FloppydiskIcon title='Lagre beskrivelse' fontSize='1.5rem' />}
                  onClick={handleSaveDescription}
                >
                  Lagre
                </Button>
              </>
            )}
          </VStack>
        </VStack>
      </form>
    </Tabs.Panel>
  )
}

export default AboutTab
