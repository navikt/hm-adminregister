import { PencilWritingIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { Alert, Box, Button, Pagination, Table, Tabs, VStack } from '@navikt/ds-react'
import { ProductRegistrationDTO } from '../utils/response-types'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { isUUID, toValueAndUnit } from '../utils/string-util'
import { getAllUniqueTechDataKeys } from '../utils/product-util'


const VariantsTab = ({ products }: { products: ProductRegistrationDTO[] }) => {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const techKeys = getAllUniqueTechDataKeys(products)
  const columnsPerPage = 5
  const totalPages = Math.ceil(products.length / columnsPerPage)
  const pageInUrl = Number(searchParams.get('page')) || 1
  const page = pageInUrl > totalPages ? totalPages : pageInUrl

  const isFirstTime = products.length === 1 && isUUID(products[0].supplierRef)

  const techValue = (product: ProductRegistrationDTO, key: string): string | undefined => {
    const data = product.productData.techData.find((data) => data.key === key)
    if (data) {
      return toValueAndUnit(data.value, data.unit)
    }
    return undefined
  }

  let paginatedVariants = products
  paginatedVariants = paginatedVariants.slice((page - 1) * columnsPerPage, page * columnsPerPage)

  return (
    <Tabs.Panel value='variants' className='tab-panel'>
      {isFirstTime && (
        <Alert variant='info'>
          Produktet trenger en eller flere artikler. Her kan man legge inn artikler som varierer for eksempel i
          størrelse eller farge. Alle artiklene skal ha eget navn som skiller variantene fra hverandre, artikkelnummer
          fra leverandør og teknisk data.
        </Alert>
      )}
      {!isFirstTime && (
        <Box background='surface-default' padding={{ xs: '2', md: '6' }} borderRadius='xlarge'>
          <VStack gap='4'>
            <div className='variant-table'>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope='row'></Table.HeaderCell>
                    {paginatedVariants.map((product, i) => (
                      <Table.HeaderCell scope='row' key={`edit-${product.id}`}>
                        <Link to={`${pathname}/rediger-variant/${product.id}?page=${page}`}>
                          <Button
                            as='a'
                            title='Rediger artikkel'
                            variant='tertiary-neutral'
                            size='small'
                            icon={<PencilWritingIcon aria-hidden title='rediger artikkel' />}
                            iconPosition='right'
                          />
                        </Link>
                      </Table.HeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.HeaderCell scope='row'>Artikkelnavn:</Table.HeaderCell>
                    {paginatedVariants.map((product, i) => (
                      <Table.DataCell key={`articleName-${i}`}>{product.articleName || '-'}</Table.DataCell>
                    ))}
                  </Table.Row>
                  <Table.Row>
                    <Table.HeaderCell scope='row'>Lev-artnr:</Table.HeaderCell>
                    {paginatedVariants.map((product, i) => (
                      <Table.DataCell key={`levart-${i}`}>
                        {product.supplierRef ? (isUUID(product.supplierRef) ? '-' : product.supplierRef) : '-'}
                      </Table.DataCell>
                    ))}
                  </Table.Row>
                  <Table.Row>
                    <Table.HeaderCell scope='row'>Hms-nr:</Table.HeaderCell>
                    {paginatedVariants.map((product, i) => (
                      <Table.DataCell key={`hms-${i}`}>{product.hmsArtNr || '-'}</Table.DataCell>
                    ))}
                  </Table.Row>
                  {techKeys.map((key) => (
                    <Table.Row key={key}>
                      <Table.HeaderCell scope='row'>{key}</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`${key}-${i}`}>{techValue(product, key) || '-'}</Table.DataCell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
            {totalPages > 1 && (
              <Pagination page={page} count={totalPages} size='small' />
            )}
          </VStack>
        </Box>
      )}
      {products[0] && (
        //Sender med siste siden
        <Link to={`${pathname}/opprett-variant/${products[0].id}?page=${totalPages + 1}`}>
          <Button
            as='a'
            className='fit-content'
            variant='tertiary'
            icon={<PlusCircleIcon title='Legg til beskrivelse' fontSize='1.5rem' />}
            style={{ marginTop: '16px' }}
          >
            Legg til ny artikkel
          </Button>
        </Link>
      )}
    </Tabs.Panel>
  )
}

export default VariantsTab
