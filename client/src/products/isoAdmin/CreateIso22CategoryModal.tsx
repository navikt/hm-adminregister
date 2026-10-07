import Content from 'felleskomponenter/styledcomponents/Content'

import { BodyShort, Modal, VStack } from '@navikt/ds-react'

import Iso22CategoryCreateForm, { Iso22CategoryCreatePayload } from './Iso22CategoryCreateForm'

export type CreateIso22CategoryContext = {
  parentIsoCode: string
  parentIsoTitle?: string
  mappingIds: string[]
  targetIsoCode?: string
}

const CreateIso22CategoryModal = ({
  context,
  onClose,
  onCreate,
  existingIsoCodes,
}: {
  context: CreateIso22CategoryContext | null
  existingIsoCodes?: ReadonlySet<string>
  onClose: () => void
  onCreate: (payload: Iso22CategoryCreatePayload & { parentIsoCode: string; mappingIds: string[] }) => Promise<void>
}) => {
  if (!context) return null

  return (
    <Modal
      open
      header={{ heading: `Opprett ny ISO v22-kategori (nivå ${context.parentIsoCode.length / 2 + 1})` }}
      onClose={onClose}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            <BodyShort>
              Opprett en v22-kategori under <strong>{context.parentIsoCode}</strong>
              {context.parentIsoTitle ? ` (${context.parentIsoTitle})` : ''}.
            </BodyShort>
            <Iso22CategoryCreateForm
              parentIsoCode={context.parentIsoCode}
              targetIsoCode={context.targetIsoCode}
              existingIsoCodes={existingIsoCodes}
              onCancel={onClose}
              submitLabel="Opprett kategori og koble til mapping"
              onCreate={async (payload) => {
                await onCreate({ ...payload, parentIsoCode: context.parentIsoCode, mappingIds: context.mappingIds })
                onClose()
              }}
            />
          </VStack>
        </Content>
      </Modal.Body>
    </Modal>
  )
}

export default CreateIso22CategoryModal
