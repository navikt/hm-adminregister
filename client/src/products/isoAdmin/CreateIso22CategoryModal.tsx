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
  copyFrom?: {
    isoCode: string
    initialValues: Iso22CategoryCreateInitialValues
    linksMapping: boolean
  }
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
  const { copyFrom } = context
  const parentLabel = (
    <>
      <strong>{context.parentIsoCode}</strong>
      {context.parentIsoTitle ? ` (${context.parentIsoTitle})` : ''}
    </>
  )

  return (
    <Modal open header={{ heading: 'Opprett ny ISO v22-kategori (nivå 4)' }} onClose={onClose}>
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            {copyFrom ? (
              <BodyShort>
                Feltene er fylt ut med data fra v16-kategorien <strong>{copyFrom.isoCode}</strong>. Den nye kategorien
                opprettes under {parentLabel}.
                {copyFrom.linksMapping
                  ? ' Mappingen for v16-koden kobles til den nye kategorien.'
                  : ' Mappingen for v16-koden endres ikke.'}{' '}
                Kontroller og juster feltene før du oppretter kategorien.
              </BodyShort>
            ) : (
              <BodyShort>
                Det finnes ingen ISO v22-kategori på nivå 4 under {parentLabel}. ISO 9999 tillater at nasjonale
                tilleggskategorier opprettes på nivå 4 under en eksisterende nivå 3-kategori.
              </BodyShort>
            )}
            <Iso22CategoryCreateForm
              key={`${context.parentIsoCode}-${copyFrom?.isoCode ?? ''}`}
              parentIsoCode={context.parentIsoCode}
              existingIsoCodes={existingIsoCodes}
              initialValues={copyFrom?.initialValues}
              onCancel={onClose}
              submitLabel={
                copyFrom && !copyFrom.linksMapping ? 'Opprett kategori' : 'Opprett kategori'
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
