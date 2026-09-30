import { useEffect, useState } from 'react'

import { getIso22Category, updateIso22Category } from 'api/IsoCategoryApi'
import Content from 'felleskomponenter/styledcomponents/Content'
import { Iso22DTO } from 'utils/types/response-types'

import { Alert, BodyShort, Loader, Modal, VStack } from '@navikt/ds-react'

import Iso22CategoryCreateForm from './Iso22CategoryCreateForm'
import { extractErrorMessage } from './errorUtils'

const EditIso22CategoryModal = ({
  isoCode,
  onClose,
  onUpdated,
}: {
  isoCode: string | null
  onClose: () => void
  onUpdated: (category: Iso22DTO) => void
}) => {
  const [category, setCategory] = useState<Iso22DTO | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Kategorien hentes fra admin-endepunktet (databasen) hver gang modalen åpnes. Backend sin PUT
  // erstatter hele raden, så id, isoType og oversettelser må komme fra den lagrede kategorien.
  useEffect(() => {
    if (!isoCode) return
    let cancelled = false
    setCategory(null)
    setLoadError(null)
    getIso22Category(isoCode)
      .then((result) => {
        if (!cancelled) setCategory(result)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(extractErrorMessage(err, `Kunne ikke hente ISO ${isoCode}`))
      })
    return () => {
      cancelled = true
    }
  }, [isoCode])

  if (!isoCode) return null

  return (
    <Modal open header={{ heading: 'Endre ISO v22-kategori (nivå 4)' }} onClose={onClose}>
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            {loadError && <Alert variant="error">{loadError}</Alert>}
            {!loadError && !category && <Loader size="medium" title="Henter kategorien" />}
            {category && (
              <>
                {category.isoType === 'ISO' ? (
                  <Alert variant="warning" size="small">
                    ISO {category.isoCode} er en offisiell ISO 9999-kategori. Endringer overstyrer teksten fra
                    standarden.
                  </Alert>
                ) : (
                  <BodyShort>
                    Endringene gjelder alle mappinger og produkter som bruker ISO {category.isoCode}.
                  </BodyShort>
                )}
                <Iso22CategoryCreateForm
                  parentIsoCode={category.isoCode.slice(0, 6)}
                  lockedIsoCode={category.isoCode}
                  initialValues={{
                    suffix: category.isoCode.slice(6, 8),
                    isoTitle: category.isoTitle,
                    isoText: category.isoText ?? '',
                    searchWords: category.searchWords,
                  }}
                  submitLabel="Lagre endringer"
                  onCancel={onClose}
                  onCreate={async ({ isoTitle, isoText, searchWords }) => {
                    const updated = await updateIso22Category({ ...category, isoTitle, isoText, searchWords })
                    onUpdated(updated)
                    onClose()
                  }}
                />
              </>
            )}
          </VStack>
        </Content>
      </Modal.Body>
    </Modal>
  )
}

export default EditIso22CategoryModal
