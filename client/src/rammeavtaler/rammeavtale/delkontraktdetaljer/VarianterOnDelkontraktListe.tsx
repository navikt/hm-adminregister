import React, { useEffect, useState } from 'react'
import { BodyShort, Checkbox, Table, VStack } from '@navikt/ds-react'
import { ProductRegistrationDTO } from 'utils/response-types'


interface Props {
  seriesId?: string
  product: ProductRegistrationDTO
  variants: ProductRegistrationDTO[]
  setValgteRader: (rader: string[]) => void
}

export const VarianterOnDelkontraktListe = ({ product, variants, setValgteRader }: Props) => {

  const [selectedRows, setSelectedRows] = useState<string[]>([product.hmsArtNr!!])
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value)
        ? list.filter((id: string) => id !== value)
        : [...list, value],
    )

  useEffect(() => {
    setSelectedRows([product.hmsArtNr!!])
  }, [product])

  useEffect(() => {
    setValgteRader(selectedRows)
  }, [selectedRows])

  return (
    <>
      {variants && (
        <VStack>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope='col'>Navn</Table.HeaderCell>
                <Table.HeaderCell scope='col'>HMS-nummer</Table.HeaderCell>
                <Table.HeaderCell scope='col'>Lev-artnr.</Table.HeaderCell>
                <Table.DataCell>
                  <Checkbox
                    checked={selectedRows.length === variants.length}
                    onChange={() => {
                      selectedRows.length
                        ? setSelectedRows([])
                        : setSelectedRows(variants.map(({ hmsArtNr }) => hmsArtNr!!))
                    }}
                    hideLabel
                  >
                    Velg alle rader
                  </Checkbox>
                </Table.DataCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row key={product.id}>
                <Table.DataCell className='no-bottom-border'>{product.articleName}</Table.DataCell>
                <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
                <Table.DataCell>{product.supplierRef}</Table.DataCell>
                <Table.DataCell>
                  <Checkbox
                    hideLabel
                    checked={selectedRows.includes(product.hmsArtNr!!)}
                    onChange={() => {
                      toggleSelectedRow(product.hmsArtNr!!)
                    }}
                    aria-labelledby={`id-${product.hmsArtNr}`}
                  >
                    {' '}
                  </Checkbox>
                </Table.DataCell>
              </Table.Row>
              {variants.filter((variant) => variant.hmsArtNr !== product.hmsArtNr).map((variant, i) => {
                return (
                    <Table.Row key={variant.id}>
                      <Table.DataCell>{variant.articleName}</Table.DataCell>
                      <Table.DataCell>{variant.hmsArtNr}</Table.DataCell>
                      <Table.DataCell>{variant.supplierRef}</Table.DataCell>
                      <Table.DataCell>
                        <Checkbox
                          hideLabel
                          checked={selectedRows.includes(variant.hmsArtNr!!)}
                          onChange={() => {
                            toggleSelectedRow(variant.hmsArtNr!!)
                          }}
                          aria-labelledby={`id-${variant.hmsArtNr}`}
                        >
                          {' '}
                        </Checkbox>
                      </Table.DataCell>
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