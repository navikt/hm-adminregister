import React from 'react'
import { useProductVariantsBySeriesId } from '../../../utils/swr-hooks'
import { BodyShort, Table, VStack } from '@navikt/ds-react'
import { ProductRegistrationDTO } from '../../../utils/response-types'


interface Props {
  seriesId?: string
  product: ProductRegistrationDTO
}

export const VarianterListe = ({ seriesId, product }: Props) => {

  const { data: variants, isLoading } = useProductVariantsBySeriesId(seriesId)

  return (
    <>
      {variants && (
        <VStack>
          <BodyShort>Varianter: </BodyShort>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope='col'>Navn</Table.HeaderCell>
                <Table.HeaderCell scope='col'>HMS-nummer.</Table.HeaderCell>
                <Table.HeaderCell scope='col'>Levart. nr.</Table.HeaderCell>
                <Table.HeaderCell scope='col'></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row key={product.id}>
                <Table.DataCell>{product.title}</Table.DataCell>
                <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
                <Table.DataCell>{product.supplierRef}</Table.DataCell>
                <Table.DataCell></Table.DataCell>
              </Table.Row>
              {variants.filter((variant) => variant.hmsArtNr !== product.hmsArtNr).map((variant, i) => {
                return (
                  <Table.Row key={variant.id}>
                    <Table.DataCell>{variant.title}</Table.DataCell>
                    <Table.DataCell>{variant.hmsArtNr}</Table.DataCell>
                    <Table.DataCell>{variant.supplierRef}</Table.DataCell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </VStack>
      ) || <BodyShort>Ingen varianter: {variants?.length} </BodyShort>}
    </>

  )

}