import { useEffect, useState } from 'react'

import { getIso22Category, updateIso22Category } from 'api/IsoCategoryApi'
import { Iso22DTO } from 'utils/types/response-types'

import { Alert, BodyShort, Loader, Modal, VStack } from '@navikt/ds-react'

import Iso22CategoryCreateForm from './Iso22CategoryCreateForm'
import { extractErrorMessage } from './errorUtils'

const EditIso22CategoryModal = ({
  isoCode,
  locked,
  onClose,
  onUpdated,
}: {
  isoCode: string | null
  locked: boolean
  onClose: () => void
  onUpdated: (category: Iso22DTO) => void
}) => {
  const [category, setCategory] = useState<Iso22DTO | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  useEffect(() => {
    setCategory(null)
    setLoadError(null)
    if (!isoCode) return
    const controller = new AbortController()
    getIso22Category(isoCode, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.isoCode.replace(/\s/g, '') !== isoCode || result.level !== 4) {
          setLoadError('Svaret inneholder ikke den valgte nivå 4-kategorien.')
          return
        }
        setCategory(result)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(extractErrorMessage(error, 'Kunne ikke hente kategorien'))
      })
    return () => controller.abort()
  }, [isoCode])
  if (!isoCode) return null
  return (
    <Modal open header={{ heading: `Endre ISO v22-kategori ${isoCode}` }} onClose={onClose}>
      <Modal.Body>
        <VStack gap="space-16">
          {locked ? (
            <Alert variant="warning">
              Fjern verifisering fra alle mappinger som bruker kategorien før du endrer den.
            </Alert>
          ) : (
            <>
              {loadError && <Alert variant="error">{loadError}</Alert>}
              {!loadError && !category && <Loader size="small" title="Henter kategorien" />}
              {category && (
                <>
                  <BodyShort>Endringene gjelder alle mappinger og produkter som bruker ISO {isoCode}.</BodyShort>
                  {category.isoType === 'ISO' && (
                    <Alert variant="warning" size="small">
                      Endringene overstyrer teksten fra ISO 9999-standarden.
                    </Alert>
                  )}
                  <Iso22CategoryCreateForm
                    key={isoCode}
                    parentIsoCode={isoCode.slice(0, 6)}
                    lockedIsoCode={isoCode}
                    initialValues={{
                      suffix: isoCode.slice(-2),
                      isoTitle: category.isoTitle,
                      isoText: category.isoText ?? '',
                      searchWords: category.searchWords ?? [],
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
            </>
          )}
        </VStack>
      </Modal.Body>
    </Modal>
  )
}

export default EditIso22CategoryModal
