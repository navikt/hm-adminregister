import { useState } from 'react'

import { Alert, BodyShort, Button, HStack, TextField, VStack } from '@navikt/ds-react'

import { extractErrorMessage } from './errorUtils'

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
  targetIsoCode,
}: {
  parentIsoCode: string
  targetIsoCode?: string
  // Koder som allerede finnes (fra klientens v22-kategoriliste) - gir en tydelig feilmelding før
  // kallet sendes, i stedet for backendens generiske 400 "already exists".
  existingIsoCodes?: ReadonlySet<string>
  onCreate: (payload: Iso22CategoryCreatePayload) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}) => {
  const level = parentIsoCode.length / 2 + 1
  const [suffix, setSuffix] = useState(targetIsoCode?.slice(-2) ?? '')
  const [isoTitle, setIsoTitle] = useState('')
  const [isoText, setIsoText] = useState('')
  const [searchWords, setSearchWords] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSuffixChange = (value: string) => {
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
    if (!/^\d{4}(\d{2})?$/.test(parentIsoCode) || code.length !== level * 2) {
      setError('Velg en eksisterende forelder på nivå 2 eller 3.')
      return
    }
    if (targetIsoCode && code !== targetIsoCode) {
      setError(`Koden må være ${targetIsoCode}, som mappingen peker på.`)
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
          Ny ISO-kode (nivå {level}, {level * 2} siffer)
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
            readOnly={!!targetIsoCode}
            onChange={(e) => handleSuffixChange(e.target.value)}
            placeholder="01"
          />
        </HStack>
        <BodyShort size="small" textColor="subtle">
          {targetIsoCode
            ? `Koden ${targetIsoCode} er fastsatt av mappingen.`
            : `Forelderen ${parentIsoCode} kan ikke endres. Fyll inn de 2 siste sifrene.`}
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
