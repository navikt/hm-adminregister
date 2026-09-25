import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import Content from 'felleskomponenter/styledcomponents/Content'

import { Alert, BodyShort, Button, Modal, Radio, RadioGroup, VStack } from '@navikt/ds-react'

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onClick: (isoCategory22: string) => void
  // Målene kommer fra mappingene for produktets v16-kode (se resolveIso22Targets), aldri fra fritt søk.
  // Ett mål låses. Ved splitt (flere mål) må admin velge eksplisitt.
  targetOptions: { code: string; title: string }[]
  // Vises når det ikke finnes noen nivå 4-kategori under nivå 3-forelderen enda - tilkobling er da
  // ikke mulig før en slik kategori er opprettet (se CreateIso22CategoryModal, åpnet av parent).
  missingLevel4?: boolean
  iso22Lvl3?: string
  iso22Lvl3Title?: string
  mappingIds?: string[]
  // Åpner den frittstående CreateIso22CategoryModal som en 2. modal over denne, i stedet for å vise
  // opprettelsesskjemaet inline her.
  onRequestCreateCategory?: (context: { parentIsoCode: string; parentIsoTitle?: string; mappingIds: string[] }) => void
  heading?: string
  previewContent?: ReactNode
  confirmButtonText?: string
  lockedMessage?: ReactNode
  onRequestUnlock?: () => void
  unlocking?: boolean
  submitting?: boolean
  error?: string | null
}

// Kobler et enkeltprodukt til en ISO v22-kategori uten å endre v16-kategorien - v16 og v22
// sameksisterer gjennom hele migreringsperioden (se IsoBulkMoveModal for samme resonnement på
// tvers av flere produkter). Brukes kun av ISO Admin. Product.tsx bruker fortsatt
// ChangeISOCategoryModal til å endre v16-kategorien.
const AttachIso22CategoryModal = ({
  isOpen,
  setIsOpen,
  onClick,
  targetOptions,
  missingLevel4,
  iso22Lvl3,
  iso22Lvl3Title,
  mappingIds,
  onRequestCreateCategory,
  heading = 'Koble til ISO v22-kategori',
  previewContent,
  confirmButtonText = 'Koble til',
  lockedMessage,
  onRequestUnlock,
  unlocking,
  submitting,
  error,
}: Props) => {
  const [chosenCode, setChosenCode] = useState('')
  useEffect(() => {
    if (isOpen) setChosenCode('')
  }, [isOpen])

  const selectedCode = targetOptions.length === 1 ? targetOptions[0].code : chosenCode
  const selectedOption = targetOptions.find((option) => option.code === selectedCode)
  const canAttach = !!selectedOption && !lockedMessage
  const onSubmit = () => {
    if (selectedOption && !lockedMessage) onClick(selectedOption.code)
  }

  return (
    <Modal
      open={isOpen}
      header={{
        heading,
        closeButton: false,
      }}
      onClose={() => {
        if (!submitting) setIsOpen(false)
      }}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            {previewContent}
            {lockedMessage && (
              <Alert variant="warning">
                <VStack gap="space-8">
                  {lockedMessage}
                  {onRequestUnlock && (
                    <Button variant="secondary" size="small" loading={unlocking} onClick={onRequestUnlock}>
                      Fjern verifisering
                    </Button>
                  )}
                </VStack>
              </Alert>
            )}
            {targetOptions.length > 1 ? (
              <RadioGroup
                legend="Velg ISO v22-kategori"
                description="v16-koden er splittet i flere v22-kategorier. Velg den som passer dette produktet."
                value={selectedCode}
                onChange={(value: string) => setChosenCode(value)}
                disabled={!!lockedMessage}
              >
                {targetOptions.map((option) => (
                  <Radio key={option.code} value={option.code}>
                    {option.code}
                    {option.title ? ` - ${option.title}` : ''}
                  </Radio>
                ))}
              </RadioGroup>
            ) : targetOptions.length === 1 ? (
              <Alert variant="info" size="small">
                {lockedMessage ? 'Anbefalt ISO v22-kategori: ' : 'Produktet vil bli koblet til ISO v22-kategori '}
                <strong>{targetOptions[0].code}</strong>
                {targetOptions[0].title ? ` - ${targetOptions[0].title}` : ''}.
              </Alert>
            ) : missingLevel4 && iso22Lvl3 ? (
              <Box22MissingLevel4
                iso22Lvl3={iso22Lvl3}
                iso22Lvl3Title={iso22Lvl3Title}
                mappingIds={mappingIds}
                onRequestCreateCategory={onRequestCreateCategory}
              />
            ) : (
              <Alert variant="warning" size="small">
                Fant ingen tilhørende v22-kategori for dette produktet. Kontroller ISO-mappingen.
              </Alert>
            )}
            {error && (
              <Alert variant="error" size="small" role="alert">
                {error}
              </Alert>
            )}
          </VStack>
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={submitting}>
          Avbryt
        </Button>
        <Button onClick={onSubmit} variant="primary" disabled={!canAttach} loading={submitting}>
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Vises i stedet for en attach-kontroll når nivå 4 mangler - "shortcutter" rett til
// kategorioppretting, siden det er eneste veien videre.
const Box22MissingLevel4 = ({
  iso22Lvl3,
  iso22Lvl3Title,
  mappingIds,
  onRequestCreateCategory,
}: {
  iso22Lvl3: string
  iso22Lvl3Title?: string
  mappingIds?: string[]
  onRequestCreateCategory?: (context: { parentIsoCode: string; parentIsoTitle?: string; mappingIds: string[] }) => void
}) => {
  if (!onRequestCreateCategory) {
    return (
      <Alert variant="warning" size="small">
        Det finnes ingen ISO v22-kategori på nivå 4 under {iso22Lvl3} ({iso22Lvl3Title}).
      </Alert>
    )
  }
  return (
    <Alert variant="warning" size="small">
      <VStack gap="space-8">
        <BodyShort size="small">
          Det finnes ingen ISO v22-kategori på nivå 4 under {iso22Lvl3} ({iso22Lvl3Title}). En nivå 4-kategori må
          opprettes før produktet kan kobles til v22.
        </BodyShort>
        <Button
          variant="primary"
          size="small"
          onClick={() =>
            onRequestCreateCategory({
              parentIsoCode: iso22Lvl3,
              parentIsoTitle: iso22Lvl3Title,
              mappingIds: mappingIds ?? [],
            })
          }
        >
          Opprett ny ISO v22-kategori...
        </Button>
      </VStack>
    </Alert>
  )
}

export default AttachIso22CategoryModal
