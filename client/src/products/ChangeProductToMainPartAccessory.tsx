import { useState } from 'react'

import Content from 'felleskomponenter/styledcomponents/Content'
import { MainPartAccessoryDTO } from 'utils/types/response-types'

import { Button, Checkbox, Modal, VStack } from '@navikt/ds-react'

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onClick: (flags: MainPartAccessoryDTO) => void
  isSaving: boolean
}

const ChangeProductToMainPartAccessory = ({ isOpen, setIsOpen, onClick, isSaving }: Props) => {
  const [flags, setFlags] = useState<MainPartAccessoryDTO>({
    main: false,
    part: false,
    accessory: false,
  })

  const onSubmit = () => {
    if (!isSaving) {
      onClick(flags)
    }
  }


  return (
    <Modal
      open={isOpen}
      header={{
        heading: 'Endre produkttype',
        closeButton: false,
      }}
      onClose={() => {
        if (!isSaving) setIsOpen(false)
      }}
    >

        <Modal.Body>
          <Content>
            <VStack gap="space-16">
              <Checkbox
                checked={flags.main}
                disabled={isSaving}
                onChange={(event) => setFlags({ ...flags, main: event.target.checked })}
              >
                Hovedprodukt
              </Checkbox>
              <Checkbox
                checked={flags.part}
                disabled={isSaving}
                onChange={(event) => setFlags({ ...flags, part: event.target.checked })}
              >
                Reservedel
              </Checkbox>
              <Checkbox
                checked={flags.accessory}
                disabled={isSaving}
                onChange={(event) => setFlags({ ...flags, accessory: event.target.checked })}
              >
                Tilbehør
              </Checkbox>
            </VStack>
          </Content>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" disabled={isSaving} onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={onSubmit} variant="primary" loading={isSaving} disabled={isSaving}>
            OK
          </Button>
        </Modal.Footer>
    </Modal>
  )
}

export default ChangeProductToMainPartAccessory
