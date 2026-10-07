import Content from 'felleskomponenter/styledcomponents/Content'

import { BodyShort, Modal, VStack } from '@navikt/ds-react'

import Iso22CategoryCreateForm, {
  Iso22CategoryCreateInitialValues,
  Iso22CategoryCreatePayload,
} from './Iso22CategoryCreateForm'

export type CreateIso22CategoryContext = {
  parentIsoCode: string
  parentIsoTitle?: string
  mappingIds: string[]
  targetIsoCode?: string
  initialValues?: Iso22CategoryCreateInitialValues
  copyFrom?: { isoCode: string; linksMapping: boolean }
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
              {context.copyFrom && (
                <>
                  Feltene er fylt ut med data fra v16-kategorien <strong>{context.copyFrom.isoCode}</strong>. Kontroller
                  og juster feltene før du oppretter kategorien.{' '}
                </>
              )}
              Opprett en v22-kategori under <strong>{context.parentIsoCode}</strong>
              {context.parentIsoTitle ? ` (${context.parentIsoTitle})` : ''}.
              {context.copyFrom &&
                (context.copyFrom.linksMapping
                  ? ' Mappingen oppdateres til den nye kategorien.'
                  : ' Mappingen for v16-koden endres ikke.')}
            </BodyShort>
            <Iso22CategoryCreateForm
              key={`${context.parentIsoCode}-${context.targetIsoCode ?? ''}-${!!context.initialValues}`}
              parentIsoCode={context.parentIsoCode}
              targetIsoCode={context.targetIsoCode}
              initialValues={context.initialValues}
              existingIsoCodes={existingIsoCodes}
              onCancel={onClose}
              submitLabel={
                context.copyFrom && !context.copyFrom.linksMapping
                  ? 'Opprett kategori'
                  : 'Opprett kategori og koble til mapping'
              }
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
