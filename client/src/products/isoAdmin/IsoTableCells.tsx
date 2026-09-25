import { MenuElipsisVerticalCircleIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button, HStack, Table, Tag } from '@navikt/ds-react'

import {
  ExtractedProductVariant,
  ISO_MAP_LABELS,
  IsoMapEnum,
  OptionalColumnV1,
  OptionalColumnV22,
  OptionalIsoLevel,
  SortDir,
  SortKey,
} from './isoOversiktTypes'

export const SortHeader = ({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) => (
  <Table.HeaderCell scope="col" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'inherit', padding: 0 }}
      aria-label={
        active
          ? `${label}, sortert ${dir === 'asc' ? 'stigende' : 'synkende'}. Aktiver for å snu sorteringen`
          : `${label}, sorter stigende`
      }
    >
      {label}
      <span aria-hidden="true">{active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
    </button>
  </Table.HeaderCell>
)

export type IsoTitlesV1 = Pick<
  ExtractedProductVariant,
  'iso1Title' | 'iso2Title' | 'iso3Title' | 'iso4Title' | 'iso4Text' | 'iso4SearchWords'
>
export type IsoTitlesV22 = Pick<
  ExtractedProductVariant,
  'iso22Lvl1Title' | 'iso22Lvl2Title' | 'iso22Lvl3Title' | 'iso22Lvl4Title' | 'iso22Lvl4Text' | 'iso22Lvl4SearchWords'
>

export const OptionalTitleHeadersV1 = ({ visible }: { visible: Set<OptionalColumnV1> }) => (
  <>
    {visible.has('v16 nivå 1 tittel') && <Table.HeaderCell scope="col">v16 - 1 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 2 tittel') && <Table.HeaderCell scope="col">v16 - 2 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 3 tittel') && <Table.HeaderCell scope="col">v16 - 3 tittel</Table.HeaderCell>}
    {visible.has('v16 nivå 4 tittel') && <Table.HeaderCell scope="col">v16 - 4 tittel</Table.HeaderCell>}
    {visible.has('v16 forklaring') && <Table.HeaderCell scope="col">v16 - forklaring</Table.HeaderCell>}
    {visible.has('v16 søkeord') && <Table.HeaderCell scope="col">v16 - søkeord</Table.HeaderCell>}
  </>
)

export const OptionalTitleCellsV1 = ({ visible, row }: { visible: Set<OptionalColumnV1>; row: IsoTitlesV1 }) => (
  <>
    {visible.has('v16 nivå 1 tittel') && <Table.DataCell>{row.iso1Title}</Table.DataCell>}
    {visible.has('v16 nivå 2 tittel') && <Table.DataCell>{row.iso2Title}</Table.DataCell>}
    {visible.has('v16 nivå 3 tittel') && <Table.DataCell>{row.iso3Title}</Table.DataCell>}
    {visible.has('v16 nivå 4 tittel') && <Table.DataCell>{row.iso4Title}</Table.DataCell>}
    {visible.has('v16 forklaring') && <Table.DataCell>{row.iso4Text}</Table.DataCell>}
    {visible.has('v16 søkeord') && <Table.DataCell>{row.iso4SearchWords}</Table.DataCell>}
  </>
)

export const OptionalTitleHeadersV22 = ({ visible }: { visible: Set<OptionalColumnV22> }) => (
  <>
    {visible.has('v22 nivå 1 tittel') && <Table.HeaderCell scope="col">v22 - 1 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 2 tittel') && <Table.HeaderCell scope="col">v22 - 2 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 3 tittel') && <Table.HeaderCell scope="col">v22 - 3 tittel</Table.HeaderCell>}
    {visible.has('v22 nivå 4 tittel') && <Table.HeaderCell scope="col">v22 - 4 tittel</Table.HeaderCell>}
    {visible.has('v22 forklaring') && <Table.HeaderCell scope="col">v22 - forklaring</Table.HeaderCell>}
    {visible.has('v22 søkeord') && <Table.HeaderCell scope="col">v22 - søkeord</Table.HeaderCell>}
  </>
)

export const OptionalTitleCellsV22 = ({ visible, row }: { visible: Set<OptionalColumnV22>; row: IsoTitlesV22 }) => (
  <>
    {visible.has('v22 nivå 1 tittel') && <Table.DataCell>{row.iso22Lvl1Title}</Table.DataCell>}
    {visible.has('v22 nivå 2 tittel') && <Table.DataCell>{row.iso22Lvl2Title}</Table.DataCell>}
    {visible.has('v22 nivå 3 tittel') && <Table.DataCell>{row.iso22Lvl3Title}</Table.DataCell>}
    {visible.has('v22 nivå 4 tittel') && <Table.DataCell>{row.iso22Lvl4Title}</Table.DataCell>}
    {visible.has('v22 forklaring') && <Table.DataCell>{row.iso22Lvl4Text}</Table.DataCell>}
    {visible.has('v22 søkeord') && <Table.DataCell>{row.iso22Lvl4SearchWords}</Table.DataCell>}
  </>
)

export const IsoLevelHeaders = ({
  sortKey,
  sortDir,
  onSort,
  visibleLevels,
}: {
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  visibleLevels: Set<OptionalIsoLevel>
}) => (
  <>
    {(['iso1', 'iso2', 'iso3', 'iso4'] as const).map((k, i) =>
      i === 3 || visibleLevels.has((i + 1) as OptionalIsoLevel) ? (
        <SortHeader
          key={k}
          label={`v16 - nivå ${i + 1}`}
          active={sortKey === k}
          dir={sortDir}
          onClick={() => onSort(k)}
        />
      ) : null
    )}
  </>
)

export const IsoLevelCells = ({
  row,
  visibleLevels,
}: {
  row: Pick<ExtractedProductVariant, 'iso1' | 'iso2' | 'iso3' | 'iso4'>
  visibleLevels: Set<OptionalIsoLevel>
}) => (
  <>
    {visibleLevels.has(1) && <Table.DataCell>{row.iso1}</Table.DataCell>}
    {visibleLevels.has(2) && <Table.DataCell>{row.iso2}</Table.DataCell>}
    {visibleLevels.has(3) && <Table.DataCell>{row.iso3}</Table.DataCell>}
    <Table.DataCell>{row.iso4}</Table.DataCell>
  </>
)

export const Iso22LevelHeaders = ({ visibleLevels }: { visibleLevels: Set<OptionalIsoLevel> }) => (
  <>
    {visibleLevels.has(1) && <Table.HeaderCell scope="col">v22 - nivå 1</Table.HeaderCell>}
    {visibleLevels.has(2) && <Table.HeaderCell scope="col">v22 - nivå 2</Table.HeaderCell>}
    {visibleLevels.has(3) && <Table.HeaderCell scope="col">v22 - nivå 3</Table.HeaderCell>}
    <Table.HeaderCell scope="col">v22 - nivå 4</Table.HeaderCell>
  </>
)

export const Iso22LevelCells = ({
  row,
  visibleLevels,
}: {
  row: Pick<ExtractedProductVariant, 'iso22Lvl1' | 'iso22Lvl2' | 'iso22Lvl3' | 'iso22Lvl4'>
  visibleLevels: Set<OptionalIsoLevel>
}) => (
  <>
    {visibleLevels.has(1) && <Table.DataCell>{row.iso22Lvl1}</Table.DataCell>}
    {visibleLevels.has(2) && <Table.DataCell>{row.iso22Lvl2}</Table.DataCell>}
    {visibleLevels.has(3) && <Table.DataCell>{row.iso22Lvl3}</Table.DataCell>}
    <Table.DataCell>{row.iso22Lvl4}</Table.DataCell>
  </>
)

export const MappingTypes = ({ types, mappingAvailable }: { types: IsoMapEnum[]; mappingAvailable: boolean }) => (
  <HStack gap="space-4" wrap>
    {!mappingAvailable ? (
      <Tag variant="neutral" size="small">
        Ikke tilgjengelig
      </Tag>
    ) : types.length > 0 ? (
      types.map((type) => (
        <Tag key={type} variant={type === 'SAME' ? 'success' : 'neutral'} size="small">
          {ISO_MAP_LABELS[type]}
        </Tag>
      ))
    ) : (
      <Tag variant="neutral" size="small">
        Mangler kobling
      </Tag>
    )}
  </HStack>
)

export const MappingVerification = ({ verified }: { verified: boolean | null }) => {
  if (verified === null) {
    return (
      <Tag variant="neutral" size="small">
        Ikke tilgjengelig
      </Tag>
    )
  }
  return (
    <Tag variant={verified ? 'success' : 'warning'} size="small">
      {verified ? 'Verifisert' : 'Ikke verifisert'}
    </Tag>
  )
}

export const AksjonHeader = () => <Table.HeaderCell scope="col">Aksjon</Table.HeaderCell>

export const AksjonCell = ({
  menuLabel,
  mappingIds,
  mappingVerified,
  mappingAvailable,
  seriesId,
  isoCode,
  iso22Lvl3,
  iso22Lvl3Title,
  iso22Lvl4,
  attachmentComplete,
  attachmentUnknown,
  busy,
  onRequestVerify,
  onMove,
  onMoveIsoCode,
  onCreateCategory,
}: {
  // Skiller radmenyene fra hverandre for skjermleser, f.eks. "Rad-meny for ISO 18090301".
  menuLabel?: string
  mappingIds: string[]
  mappingVerified: boolean | null
  mappingAvailable: boolean
  seriesId?: string
  isoCode?: string
  iso22Lvl3?: string
  iso22Lvl3Title?: string
  iso22Lvl4?: string
  // Om alle produkter/varianter i denne konteksten faktisk er koblet til riktig v22-kategori. Sperrer
  // kun "Verifiser" (ikke "Fjern verifisering") - man skal alltid kunne trekke tilbake en verifisering.
  // Udefinert (f.eks. i eldre kall) tolkes som "komplett" for bakoverkompatibilitet.
  attachmentComplete?: boolean
  // Produktlisten er ikke lastet inn, så tilknytningsstatus er ukjent - "Verifiser" sperres da også.
  attachmentUnknown?: boolean
  busy?: boolean
  onRequestVerify?: (mappingIds: string[], verified: boolean, context: { seriesId?: string; isoCode?: string }) => void
  onMove?: (seriesId: string) => void
  onMoveIsoCode?: (isoCode: string) => void
  onCreateCategory?: (context: { parentIsoCode: string; parentIsoTitle?: string; mappingIds: string[] }) => void
}) => {
  // Rader uten v16-kode ("Ny klasse") kan ikke verifiseres: backend (IsoMapAdminController.updateIsoMap)
  // krever code16 og feiler med 500 når den er null.
  const canVerify = mappingAvailable && mappingIds.length > 0 && !!isoCode && !!onRequestVerify
  // "Verifiser" (ikke "Fjern verifisering") er sperret til alle produkter/varianter faktisk er
  // koblet til riktig v22-kategori - man skal ikke kunne bekrefte en migrering som ikke er utført.
  const verifyBlocked = !mappingVerified && (attachmentComplete === false || attachmentUnknown === true)
  // Flytting er sperret mens raden er verifisert - man må fjerne verifiseringen først for å unngå
  // at en godkjent v16->v22-migrering blir endret "under" en verifisert status.
  const isLockedByVerification = mappingVerified === true
  const canMove = !!seriesId && !!onMove
  const canMoveIsoCode = !!isoCode && !!onMoveIsoCode
  // Ny ISO v22-kategori (nivå 4, nasjonal tilleggskode) kan kun opprettes under en eksisterende
  // nivå 3-forelder, og kun mens mappingen ikke er verifisert.
  const canCreateCategory =
    mappingAvailable && mappingVerified === false && !!iso22Lvl3 && !iso22Lvl4 && !!onCreateCategory

  if (!canVerify && !canMove && !canMoveIsoCode && !canCreateCategory) return <Table.DataCell />

  return (
    <Table.DataCell>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button
            variant="tertiary"
            icon={<MenuElipsisVerticalCircleIcon aria-hidden />}
            size="small"
            aria-label={menuLabel ? `Rad-meny for ${menuLabel}` : 'Rad-meny'}
            loading={busy}
          />
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          {canVerify && (
            <ActionMenu.Item
              disabled={verifyBlocked}
              onSelect={() => onRequestVerify?.(mappingIds, !mappingVerified, { seriesId, isoCode })}
            >
              {mappingVerified
                ? 'Fjern verifisering'
                : attachmentUnknown && !mappingVerified
                  ? 'Verifiser (last inn produkter først)'
                  : verifyBlocked
                    ? 'Verifiser (koble produkter til v22 først)'
                    : 'Verifiser'}
            </ActionMenu.Item>
          )}
          {canMove && (
            <ActionMenu.Item disabled={isLockedByVerification} onSelect={() => onMove?.(seriesId as string)}>
              {isLockedByVerification
                ? 'Koble til ISO v22-kategori (fjern verifisering først)'
                : 'Koble til ISO v22-kategori'}
            </ActionMenu.Item>
          )}
          {canMoveIsoCode && (
            <>
              <ActionMenu.Item onSelect={() => onMoveIsoCode?.(isoCode as string)}>Vis oversikt</ActionMenu.Item>
              <ActionMenu.Item disabled={isLockedByVerification} onSelect={() => onMoveIsoCode?.(isoCode as string)}>
                {isLockedByVerification
                  ? 'Koble alle produkter til ISO v22-kategori (fjern verifisering først)'
                  : 'Koble alle produkter til ISO v22-kategori'}
              </ActionMenu.Item>
            </>
          )}
          {canCreateCategory && (
            <ActionMenu.Item
              onSelect={() =>
                onCreateCategory?.({
                  parentIsoCode: iso22Lvl3 as string,
                  parentIsoTitle: iso22Lvl3Title,
                  mappingIds,
                })
              }
            >
              Opprett ny ISO v22-kategori (nivå 4)
            </ActionMenu.Item>
          )}
        </ActionMenu.Content>
      </ActionMenu>
    </Table.DataCell>
  )
}
