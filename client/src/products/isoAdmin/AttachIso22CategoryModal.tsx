import type { ReactNode } from 'react'

import Content from 'felleskomponenter/styledcomponents/Content'

import { Alert, BodyShort, Button, Modal, VStack } from '@navikt/ds-react'

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onClick: (isoCategory22: string) => void
  // Målkategorien er låst til den anbefalte v22 nivå 4-koden for v16-kategorien produktet ligger i
  // (se isoMappingUtils) - admin skal ikke kunne søke opp og velge en vilkårlig v22-kategori, siden
  // det ville frikoblet v16<->v22-migreringen fra selve mappingtabellen.
  targetIso22Code?: string
  targetIso22Title?: string
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
}

// Kobler et enkeltprodukt til en ISO v22-kategori uten å endre v16-kategorien - v16 og v22
// sameksisterer gjennom hele migreringsperioden (se IsoBulkMoveModal for samme resonnement på
// tvers av flere produkter). Brukes kun av ISO Admin - Product.tsx sin generelle v16-korrigering
// (ChangeISOCategoryModal) er upåvirket.
const AttachIso22CategoryModal = ({
  isOpen,
  setIsOpen,
  onClick,
  targetIso22Code,
  targetIso22Title,
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
}: Props) => {
  const canAttach = !!targetIso22Code && !lockedMessage
  const onSubmit = () => {
    if (targetIso22Code) onClick(targetIso22Code)
  }

  return (
    <Modal
      open={isOpen}
      header={{
        heading,
        closeButton: false,
      }}
      onClose={() => setIsOpen(false)}
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
            {targetIso22Code ? (
              <Alert variant="info" size="small">
                Produktet vil bli koblet til ISO v22-kategori <strong>{targetIso22Code}</strong>
                {targetIso22Title ? ` - ${targetIso22Title}` : ''}.
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
          </VStack>
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
        <Button onClick={onSubmit} variant="primary" disabled={!canAttach}>
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
