import DefinitionList from 'felleskomponenter/definition-list/DefinitionList'
import SeriesStatusTag from 'products/SeriesStatusTag'
import { seriesStatus } from 'products/seriesUtils'
import { toReadableDateTimeString } from 'utils/date-util'
import { SeriesDTO } from 'utils/types/response-types'

import { HStack, Heading, HelpText, VStack } from '@navikt/ds-react'

const StatusPanel = ({ series }: { series: SeriesDTO }) => {
  const allAgreements = series.variants
    .flatMap((variant) => variant.agreements)
    .filter((agr) => agr.status === 'ACTIVE')
    .filter((agr, idx, arr) => arr.findIndex((a) => a.id === agr.id) === idx)

  return (
    <VStack gap={{ xs: 'space-16', md: 'space-12' }}>
      <VStack gap="space-16">
        <Heading level="1" size="medium">
          Status
        </Heading>
        <SeriesStatusTag seriesStatus={seriesStatus(series.status, series.isPublished)} />
      </VStack>

      <DefinitionList>
        <DefinitionList.Term>Leverandør</DefinitionList.Term>
        <DefinitionList.Definition>{series.supplierName}</DefinitionList.Definition>

        {allAgreements.length > 0 && (
          <>
            <DefinitionList.Term>
              <HStack gap="space-4" align="center">
                Avtalenavn
                <HelpText title="Om avtalenavn" strategy="fixed" placement="top">
                  Hele produktet er ikke nødvendigvis på avtale. Variantene kan være på samme avtale, på ulike avtaler,
                  eller noen kan være på avtale mens andre ikke er det.
                </HelpText>
              </HStack>
            </DefinitionList.Term>
            <DefinitionList.Definition>
              {allAgreements.length === 1 ? (
                allAgreements[0].title
              ) : (
                <ol>
                  {allAgreements.map((agr) => (
                    <li key={agr.id}>{agr.title}</li>
                  ))}
                </ol>
              )}
            </DefinitionList.Definition>
          </>
        )}

        {series.message && (
          <>
            <DefinitionList.Term>Melding til leverandør</DefinitionList.Term>
            <DefinitionList.Definition>{series.message}</DefinitionList.Definition>
          </>
        )}
        {series.published && (
          <>
            <DefinitionList.Term>Publisert</DefinitionList.Term>
            <DefinitionList.Definition>{toReadableDateTimeString(series.published)}</DefinitionList.Definition>
          </>
        )}

        <DefinitionList.Term>Endret</DefinitionList.Term>
        <DefinitionList.Definition>{toReadableDateTimeString(series.updated)}</DefinitionList.Definition>
        <DefinitionList.Term>Endret av</DefinitionList.Term>
        <DefinitionList.Definition>{series.updatedByUser}</DefinitionList.Definition>
        <DefinitionList.Term>Opprettet</DefinitionList.Term>
        <DefinitionList.Definition>{toReadableDateTimeString(series.created)}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  )
}

export default StatusPanel
