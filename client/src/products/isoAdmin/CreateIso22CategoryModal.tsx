import Content from 'felleskomponenter/styledcomponents/Content'

import { BodyShort, Modal, VStack } from '@navikt/ds-react'

import Iso22CategoryCreateForm, { Iso22CategoryCreatePayload } from './Iso22CategoryCreateForm'

export type CreateIso22CategoryContext = {
  parentIsoCode: string
  parentIsoTitle?: string
  mappingIds: string[]
}

const CreateIso22CategoryModal = ({
  context,
  onClose,
  onCreate,
}: {
  context: CreateIso22CategoryContext | null
  onClose: () => void
  onCreate: (payload: Iso22CategoryCreatePayload & { parentIsoCode: string; mappingIds: string[] }) => Promise<void>
}) => {
  if (!context) return null

  return (
    <Modal open header={{ heading: 'Opprett ny ISO v22-kategori (nivå 4)' }} onClose={onClose}>
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            <BodyShort>
              Det finnes ingen ISO v22-kategori på nivå 4 under <strong>{context.parentIsoCode}</strong>
              {context.parentIsoTitle ? ` (${context.parentIsoTitle})` : ''}. ISO 9999 tillater at nasjonale
              tilleggskategorier opprettes på nivå 4 under en eksisterende nivå 3-kategori.
            </BodyShort>
            <Iso22CategoryCreateForm
              parentIsoCode={context.parentIsoCode}
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
