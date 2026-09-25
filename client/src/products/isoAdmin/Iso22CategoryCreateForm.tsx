import { useState } from 'react'

import { Alert, BodyShort, Button, HStack, TextField, VStack } from '@navikt/ds-react'

import { extractErrorMessage } from './errorUtils'

// ISO 9999 tillater at nasjonale (NAT) kategorier opprettes på nivå 4 under en eksisterende
// nivå 3-forelder. Koden er derfor alltid forelderens 6-sifrede kode + 2 ekstra sifre - nivå
// 3-delen kan ikke endres, så admin skal kun fylle inn de 2 siste sifrene (med ledende null for
// tall 1-9, f.eks. 01, 02 ... 09, 10 ... 99).
export type Iso22CategoryCreatePayload = {
  isoCode: string
  isoTitle: string
  isoText: string
  searchWords: string[]
}

const Iso22CategoryCreateForm = ({
  parentIsoCode,
  onCreate,
  onCancel,
  submitLabel = 'Opprett kategori',
  existingIsoCodes,
}: {
  parentIsoCode: string
  // Koder som allerede finnes (fra klientens v22-kategoriliste) - gir en tydelig feilmelding før
  // kallet sendes, i stedet for backendens generiske 400 "already exists".
  existingIsoCodes?: ReadonlySet<string>
  onCreate: (payload: Iso22CategoryCreatePayload) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}) => {
  const [suffix, setSuffix] = useState('')
  const [isoTitle, setIsoTitle] = useState('')
  const [isoText, setIsoText] = useState('')
  const [searchWords, setSearchWords] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSuffixChange = (value: string) => {
    // Kun siffer, maks 2 tegn - resten av koden (nivå 1-3) er låst til forelderen.
    setSuffix(value.replace(/\D/g, '').slice(0, 2))
  }

  const handleSubmit = async () => {
    const trimmedSuffix = suffix.trim()
    const paddedSuffix = trimmedSuffix.length === 1 ? `0${trimmedSuffix}` : trimmedSuffix
    if (!/^\d{2}$/.test(paddedSuffix) || paddedSuffix === '00') {
      setError('De 2 siste sifrene må være et tall mellom 01 og 99, f.eks. 01, 02 ... 09, 10 ... 99')
      return
    }
    const code = `${parentIsoCode}${paddedSuffix}`
    if (code.length !== 8) {
      setError(`ISO-koden må bestå av 8 siffer og starte med ${parentIsoCode}, f.eks. ${parentIsoCode}01`)
      return
    }
    if (existingIsoCodes?.has(code)) {
      setError(`ISO ${code} finnes allerede. Velg andre sifre.`)
      return
    }
    if (!isoTitle.trim()) {
      setError('Du må angi en tittel for den nye kategorien')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const words = searchWords
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word.length > 0)
      await onCreate({
        isoCode: code,
        isoTitle: isoTitle.trim(),
        isoText: isoText.trim(),
        searchWords: words,
      })
    } catch (err) {
      setError(extractErrorMessage(err, 'Ukjent feil oppstod'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <VStack gap="space-8">
      <VStack gap="space-2">
        <BodyShort size="small" weight="semibold">
          Ny ISO-kode (nivå 4, 8 siffer)
        </BodyShort>
        <HStack gap="space-4" align="center">
          <BodyShort size="small">{parentIsoCode}</BodyShort>
          <TextField
            label="Siste 2 siffer"
            hideLabel
            size="small"
            style={{ width: '4.5rem' }}
            inputMode="numeric"
            maxLength={2}
            value={suffix}
            onChange={(e) => handleSuffixChange(e.target.value)}
            placeholder="01"
          />
        </HStack>
        <BodyShort size="small" textColor="subtle">
          Nivå 1-3 ({parentIsoCode}) kan ikke endres. Fyll kun inn de 2 siste sifrene, f.eks. 01, 02 ... 09, 10 ... 99.
        </BodyShort>
      </VStack>
      <TextField label="Tittel" size="small" value={isoTitle} onChange={(e) => setIsoTitle(e.target.value)} />
      <TextField
        label="Forklaring (valgfritt)"
        size="small"
        value={isoText}
        onChange={(e) => setIsoText(e.target.value)}
      />
      <TextField
        label="Søkeord (kommaseparert, valgfritt)"
        description="Brukes til søk etter ISO-kategorien i systemet, f.eks. 'rullestol, manuell'"
        size="small"
        value={searchWords}
        onChange={(e) => setSearchWords(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <HStack gap="space-8">
        {onCancel && (
          <Button variant="secondary" size="small" onClick={onCancel} disabled={submitting}>
            Avbryt
          </Button>
        )}
        <Button variant="primary" size="small" onClick={handleSubmit} loading={submitting}>
          {submitLabel}
        </Button>
      </HStack>
    </VStack>
  )
}

export default Iso22CategoryCreateForm
