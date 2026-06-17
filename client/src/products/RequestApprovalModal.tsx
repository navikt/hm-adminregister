import {useState} from 'react'

import {requestApproval} from 'api/SeriesApi'
import {numberOfDocuments, numberOfImages} from 'products/seriesUtils'
import {useAuthStore} from 'utils/store/useAuthStore'
import {useErrorStore} from 'utils/store/useErrorStore'
import {SeriesDTO} from 'utils/types/response-types'

import {RocketIcon} from '@navikt/aksel-icons'
import {BodyLong, Button, Modal} from '@navikt/ds-react'

import styles from './ProductPage.module.scss'

export const RequestApprovalModal = ({
  series,
  mutateSeries,
  isValid,
  missingRequiredTechData,
  isOpen,
  setIsOpen,
}: {
  series: SeriesDTO
  mutateSeries: () => void
  isValid: boolean
  missingRequiredTechData: Array<{ key: string; variants: string[] }>
  isOpen: boolean
  setIsOpen: (newState: boolean) => void
}) => {
  const { setGlobalError } = useErrorStore()
  const { loggedInUser } = useAuthStore()
  const [showMissingOverview, setShowMissingOverview] = useState(false)

  async function onSendTilGodkjenning() {
    requestApproval(series.id)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const baseErrors = loggedInUser?.isAdmin
    ? [series.variants.length === 0 ? 'Produktet mangler teknisk data' : null].filter(
        (error): error is string => error !== null
      )
    : [
        !series.text ? 'Produktet må ha en produktbeskrivelse' : null,
        numberOfImages(series) < 2 ? 'Produktet må ha minst to bilder' : null,
        numberOfDocuments(series) < 1 ? 'Produktet må ha minst ett dokument' : null,
        series.variants.length === 0 ? 'Produktet mangler teknisk data' : null,
      ].filter((error): error is string => error !== null)

  const hasMissingRequiredTechData = missingRequiredTechData.length > 0
  const hasErrors = !isValid || baseErrors.length > 0 || hasMissingRequiredTechData

  return (
    <Modal
      open={isOpen}
      header={{
        icon: <RocketIcon aria-hidden />,
        heading: hasErrors ? 'Produktet mangler data' : 'Klar for godkjenning?',
      }}
      onClose={() => {
        setShowMissingOverview(false)
        setIsOpen(false)
      }}
    >
      <Modal.Body>
        {!showMissingOverview && (
          <>
            <BodyLong>Før du sender til godkjenning, sjekk at:</BodyLong>
            <ul>
              <li>produktbeskrivelsen ikke inneholder tekniske data eller salgsord.</li>
              <li>tekniske data er korrekte.</li>
              <li>påkrevde felter i tekniske data for alle varianter er fylt inn.</li>
              <li>produktet inneholder nødvendig brosjyre, bruksanvisning etc.</li>
            </ul>
          </>
        )}

        {hasErrors && (
          <>
            <BodyLong className={styles.errorText}>Vennligst rett opp følgende feil:</BodyLong>
            <ul className={styles.errorText}>
              {baseErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
              {hasMissingRequiredTechData && <p>Påkrevde felt/er i tekniske data mangler verdi/er:</p>}
            </ul>
          </>
        )}

        {showMissingOverview && hasMissingRequiredTechData && (
          <ul className={styles.errorText}>
            {missingRequiredTechData.map((field) => (
              <li key={field.key}>
                <strong>{field.key}</strong>: {field.variants.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        {hasMissingRequiredTechData && (
          <Button variant="secondary" onClick={() => setShowMissingOverview((current) => !current)}>
            Oversikt over feil
          </Button>
        )}
        <Button
          disabled={hasErrors}
          onClick={() => {
            onSendTilGodkjenning().then(() => {
              setShowMissingOverview(false)
              setIsOpen(false)
            })
          }}
        >
          Send til godkjenning
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setShowMissingOverview(false)
            setIsOpen(false)
          }}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
