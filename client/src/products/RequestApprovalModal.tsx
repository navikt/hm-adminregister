import {useMemo, useState} from 'react'

import {requestApproval} from 'api/SeriesApi'
import {numberOfDocuments, numberOfImages} from 'products/seriesUtils'
import {useAuthStore} from 'utils/store/useAuthStore'
import {useErrorStore} from 'utils/store/useErrorStore'
import {SeriesDTO} from 'utils/types/response-types'

import {
  ArrowUndoIcon,
  ChevronDownUpIcon,
  ChevronUpDownIcon,
  InformationSquareIcon,
  RocketIcon,
} from '@navikt/aksel-icons'
import {BodyLong, Button, Modal} from '@navikt/ds-react'

import styles from './ProductPage.module.scss'

export const RequestApprovalModal = ({
  series,
  mutateSeries,
  isValid,
  missingRequiredTechData,
  onPublishWithErrors,
  isOpen,
  setIsOpen,
}: {
  series: SeriesDTO
  mutateSeries: () => void
  isValid: boolean
  missingRequiredTechData: Array<{ key: string; variants: string[] }>
  onPublishWithErrors?: () => void
  isOpen: boolean
  setIsOpen: (newState: boolean) => void
}) => {
  const { setGlobalError } = useErrorStore()
  const { loggedInUser } = useAuthStore()
  const [showMissingOverview, setShowMissingOverview] = useState(false)
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({})

  async function onSendTilGodkjenning() {
    requestApproval(series.id)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const isAdmin = loggedInUser?.isAdmin || false
  const readyHeading = isAdmin ? 'Klar for publisering?' : 'Klar for godkjenning?'
  const introText = isAdmin ? 'Før du publiserer, sjekk at:' : 'Før du sender til godkjenning, sjekk at:'
  const baseErrors = [
    !series.text ? 'Produktet må ha en produktbeskrivelse' : null,
    numberOfImages(series) < 2 ? 'Produktet må ha minst to unike bilder' : null,
    numberOfDocuments(series) < 1 ? 'Produktet må ha minst ett dokument' : null,
    series.variants.length === 0 ? 'Produktet mangler teknisk data' : null,
  ]

  const baseErrorsFiltered = baseErrors.filter((error): error is string => error !== null)

  const hasMissingRequiredTechData = missingRequiredTechData.length > 0
  const missingByVariant = useMemo(() => {
    const map = new Map<string, string[]>()

    missingRequiredTechData.forEach((field) => {
      field.variants.forEach((variantName) => {
        const existing = map.get(variantName) ?? []
        map.set(variantName, [...existing, field.key])
      })
    })

    return Array.from(map.entries())
      .map(([variant, keys]) => ({
        variant,
        keys: Array.from(new Set(keys)).sort((a, b) => a.localeCompare(b, 'nb')),
      }))
      .sort((a, b) => a.variant.localeCompare(b.variant, 'nb'))
  }, [missingRequiredTechData])
  const hasErrors = !isValid || baseErrorsFiltered.length > 0 || hasMissingRequiredTechData

  const modalHeading = showMissingOverview
    ? 'Manglende påkrevde tekniske data'
    : hasErrors
      ? 'Produktet mangler data'
      : readyHeading

  return (
    <Modal
      open={isOpen}
      header={{
        icon: <RocketIcon aria-hidden />,
        heading: modalHeading,
      }}
      onClose={() => {
        setShowMissingOverview(false)
        setExpandedVariants({})
        setIsOpen(false)
      }}
    >
      <Modal.Body>
        {!showMissingOverview && (
          <>
            <BodyLong>{introText}</BodyLong>
            <ul>
              <li>produktbeskrivelsen ikke inneholder tekniske data eller salgsord.</li>
              <li>tekniske data er korrekte.</li>
              <li>påkrevde felter i tekniske data for alle varianter er fylt inn.</li>
              <li>produktet inneholder nødvendige bilder, brosjyre, bruksanvisning etc.</li>
            </ul>
            {hasErrors && (
              <>
                <BodyLong className={styles.errorText}>Vennligst rett opp følgende feil:</BodyLong>
                <ul className={styles.errorText}>
                  {baseErrorsFiltered.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                  {hasMissingRequiredTechData && (
                    <li>Påkrevde felt i tekniske data mangler verdi — se oversikt for detaljer per variant.</li>
                  )}
                </ul>
              </>
            )}
          </>
        )}

        {showMissingOverview && hasMissingRequiredTechData && (
          <ul className={styles.errorText}>
            {missingByVariant.map(({ variant, keys }) => {
              const isExpanded = expandedVariants[variant]

              return (
                <li key={variant}>
                  <strong>{variant}</strong> — {keys.length} manglende felt
                  <Button
                    size="xsmall"
                    variant="tertiary"
                    type="button"
                    onClick={() =>
                      setExpandedVariants((current) => ({
                        ...current,
                        [variant]: !current[variant],
                      }))
                    }
                  >
                    {isExpanded ? (
                      <>
                        Skjul felter <ChevronDownUpIcon aria-hidden fontSize="1rem" />
                      </>
                    ) : (
                      <>
                        Vis felter
                        <ChevronUpDownIcon aria-hidden fontSize="1rem" />
                      </>
                    )}
                  </Button>
                  {isExpanded && (
                    <ul>
                      {keys.map((key) => (
                        <li key={`${variant}-${key}`}>{key}</li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        {hasMissingRequiredTechData && (
          <Button
            variant={showMissingOverview ? 'primary' : 'secondary'}
            onClick={() => setShowMissingOverview((current) => !current)}
          >
            {showMissingOverview ? 'Tilbake til sammendrag' : 'Oversikt over feil'}
            {showMissingOverview ? (
              <ArrowUndoIcon aria-hidden fontSize="1.5rem" />
            ) : (
              <InformationSquareIcon aria-hidden fontSize="1.5rem" />
            )}
          </Button>
        )}
        {!showMissingOverview && isAdmin && onPublishWithErrors && (
          <>
            {hasMissingRequiredTechData ? (
              <Button
                variant="danger"
                onClick={() => {
                  onPublishWithErrors()
                  setShowMissingOverview(false)
                  setIsOpen(false)
                }}
              >
                Publiser med feil
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onPublishWithErrors()
                  setShowMissingOverview(false)
                  setIsOpen(false)
                }}
              >
                Publiser
              </Button>
            )}
          </>
        )}
        {!showMissingOverview && !isAdmin && (
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
        )}
        <Button
          variant="secondary"
          onClick={() => {
            setShowMissingOverview(false)
            setExpandedVariants({})
            setIsOpen(false)
          }}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
