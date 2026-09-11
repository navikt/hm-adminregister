import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { bulkUpdateTechData, deleteProducts, setVariantToActive, setVariantToExpired } from 'api/ProductApi'
import { moveProductsToSeries } from 'api/SeriesApi'
import ConfirmModal from 'felleskomponenter/ConfirmModal'
import CopyTechDataValueModal from 'products/variants/CopyTechDataValueModal'
import MoveProductVariantsModal from 'products/variants/MoveProductVariantsModal'
import TechDataFieldControl from 'products/variants/TechDataFieldControl'
import { useTechDataChanges } from 'products/variants/useTechDataChanges'
import { getAllUniqueTechDataKeys } from 'utils/product-util'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useErrorStore } from 'utils/store/useErrorStore'
import { isUUID, toValueAndUnit } from 'utils/string-util'
import { userProductVariantsBySeriesId } from 'utils/swr-hooks'
import { ProductRegistrationDTOV2, SeriesDTO } from 'utils/types/response-types'

import {
  ArrowsSquarepathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilesIcon,
  MenuElipsisHorizontalCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Dropdown,
  HelpText,
  HStack,
  Pagination,
  Search,
  Table,
  Tabs,
  Tag,
  VStack,
} from '@navikt/ds-react'

import styles from '../ProductPage.module.scss'

const helpTextWorksWith = (
  <BodyLong>
    Hjelpemiddelet virker sammen med disse opplistede hjelpemidlene som er satt opp i samråd med leverandører og fageksperter.
    Koblinger kan kun redigeres av Nav, ved spørsmål kontakt{' '}
    <a href="mailto:finnhjelpemiddel@nav.no">finnhjelpemiddel@nav.no</a>
    <br />
    <br />
    Man trenger ikke å velge alle hjelpemidler fra lista. Det kan være flere alternativer av samme type, der man kun
    trenger å velge én.
  </BodyLong>
)

const VariantsTab = ({
  series,
  showInputError,
  mutateSeries,
}: {
  series: SeriesDTO
  showInputError: boolean
  mutateSeries: () => void
}) => {
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { loggedInUser } = useAuthStore()
  const { setGlobalError } = useErrorStore()
  const techKeys = getAllUniqueTechDataKeys(series.variants)
  const columnsPerPage = 5
  const [pageState, setPageState] = useState(Number(searchParams.get('page')) || 1)
  const [variant, setVariant] = useState<undefined | ProductRegistrationDTOV2>(undefined)
  const [deleteVariantConfirmationModalIsOpen, setDeleteVariantConfirmationModalIsOpen] = useState<boolean>(false)
  useState<boolean>(false)
  const [moveProductVariantModalIsOpen, setMoveProductVariantModalIsOpen] = useState<boolean>(false)
  const [variantFilterString, setVariantFilterString] = useState<string>('')

  const [techDataEditMode, setTechDataEditMode] = useState<boolean>(false)
  const [cancelEditConfirmationModalIsOpen, setCancelEditConfirmationModalIsOpen] = useState<boolean>(false)
  const [copyTechDataSource, setCopyTechDataSource] = useState<
    { product: ProductRegistrationDTOV2; key: string; value: string } | undefined
  >(undefined)
  const [techDataSaveError, setTechDataSaveError] = useState<string | undefined>(undefined)
  const [techDataIsSaving, setTechDataIsSaving] = useState<boolean>(false)
  const techDataChanges = useTechDataChanges()

  const { mutateVariants } = userProductVariantsBySeriesId(series.id)

  const hasNoVariants = series.variants.length === 0

  const variantsToShow =
    variantFilterString === ''
      ? series.variants
      : series.variants.filter(
          (variant) =>
            variant.articleName?.toLowerCase().includes(variantFilterString.toLowerCase()) ||
            variant.hmsArtNr?.toLowerCase().includes(variantFilterString.toLowerCase()) ||
            variant.supplierRef?.toLowerCase().includes(variantFilterString.toLowerCase())
        )

  const totalPages = Math.ceil(variantsToShow.length / columnsPerPage)

  const techValue = (product: ProductRegistrationDTOV2, key: string): string | undefined => {
    const data = product.productData.techData.find((data) => data.key === key)
    if (data && data.value) {
      return toValueAndUnit(data.value, data.unit)
    }
    return undefined
  }

  const techDataFieldFor = (product: ProductRegistrationDTOV2, key: string) =>
    product.productData.techData.find((field) => field.key === key)

  async function onDelete() {
    if (!variant) return

    deleteProducts(loggedInUser?.isAdmin ?? true, [variant.id], variant.isPublished)
      .then(() => {
        mutateVariants()
        mutateSeries()

        const deletingSingleVariantOnPage =
          pageState > 1 && pageState == totalPages && series.variants.length % columnsPerPage == 1

        if (deletingSingleVariantOnPage) {
          searchParams.set('page', (pageState - 1).toString())
          setSearchParams(searchParams)
          setPageState(pageState - 1)
        }
      })
      .catch((error) => {
        setGlobalError(error)
      })
  }

  async function onMoveProductVariantToOtherSeries(seriesId: string, productVariantIds: string[]) {
    moveProductsToSeries(seriesId, productVariantIds)
      .then(() => {
        mutateVariants()
        mutateSeries()
        setMoveProductVariantModalIsOpen(false)
      })
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const variantsById = new Map(series.variants.map((product) => [product.id!, product]))

  const closeTechDataEditMode = () => {
    techDataChanges.clearAll()
    setTechDataSaveError(undefined)
    setTechDataEditMode(false)
  }

  const onCancelTechDataEdit = () => {
    if (techDataChanges.changeCount > 0) {
      setCancelEditConfirmationModalIsOpen(true)
    } else {
      closeTechDataEditMode()
    }
  }

  const onSaveTechDataChanges = () => {
    const bulkUpdateDTO = techDataChanges.buildBulkUpdateDTO(variantsById)
    if (bulkUpdateDTO.updates.length === 0) return

    setTechDataIsSaving(true)
    setTechDataSaveError(undefined)
    bulkUpdateTechData(bulkUpdateDTO)
      .then((result) => {
        const savedProductIds = result.updated.map((product) => product.id!)
        techDataChanges.clearForProducts(savedProductIds)
        mutateVariants()
        mutateSeries()

        if (result.failed.length > 0) {
          const names = result.failed
            .map((failure) => {
              const product = variantsById.get(failure.productId)
              const name = product?.articleName || product?.hmsArtNr || failure.productId
              return `${name}: ${failure.message}`
            })
            .join(', ')
          setTechDataSaveError(`Noen endringer kunne ikke lagres og er beholdt for retting: ${names}`)
        } else {
          setTechDataEditMode(false)
        }
      })
      .catch((error) => {
        setGlobalError(error.status, error.message)
      })
      .finally(() => {
        setTechDataIsSaving(false)
      })
  }

  const onCopyTechDataConfirm = (targetProductIds: string[]) => {
    if (!copyTechDataSource) return
    targetProductIds.forEach((productId) => {
      techDataChanges.setValue(productId, copyTechDataSource.key, copyTechDataSource.value)
    })
    setCopyTechDataSource(undefined)
  }

  const paginatedVariants = variantsToShow.slice((pageState - 1) * columnsPerPage, pageState * columnsPerPage)

  const anyExpired = series.variants.some((variant) => variant.isExpired)

  const setAsExpired = (product: ProductRegistrationDTOV2) => {
    setVariantToExpired(product.id, loggedInUser?.isAdmin || false)
      .then(() => {
        mutateSeries()
      })
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const setAsActive = (product: ProductRegistrationDTOV2) => {
    setVariantToActive(product.id, loggedInUser?.isAdmin || false)
      .then(() => {
        mutateSeries()
      })
      .catch((error) => {
        setGlobalError(error)
      })
  }

  const resetPageState = () => {
    searchParams.set('page', '1')
    setSearchParams(searchParams)
    setPageState(1)
  }

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages)
    searchParams.set('page', clamped.toString())
    setSearchParams(searchParams)
    setPageState(clamped)
  }

  return (
    <>
      <ConfirmModal
        title={'Er du sikker på at du vil slette varianten?'}
        confirmButtonText={'Slett'}
        onClick={() => onDelete().then(() => setDeleteVariantConfirmationModalIsOpen(false))}
        onClose={() => setDeleteVariantConfirmationModalIsOpen(false)}
        isModalOpen={deleteVariantConfirmationModalIsOpen}
      />
      <MoveProductVariantsModal
        seriesId={series.id}
        variants={series.variants}
        seriesFromIso={series.isoCategory?.isoCode ?? ''}
        onClick={onMoveProductVariantToOtherSeries}
        onClose={() => setMoveProductVariantModalIsOpen(false)}
        isModalOpen={moveProductVariantModalIsOpen}
      />
      <ConfirmModal
        title={'Du har ulagrede endringer i teknisk data. Vil du forkaste dem?'}
        confirmButtonText={'Forkast endringer'}
        onClick={() => {
          closeTechDataEditMode()
          setCancelEditConfirmationModalIsOpen(false)
        }}
        onClose={() => setCancelEditConfirmationModalIsOpen(false)}
        isModalOpen={cancelEditConfirmationModalIsOpen}
      />
      {copyTechDataSource && (
        <CopyTechDataValueModal
          isModalOpen={!!copyTechDataSource}
          onClose={() => setCopyTechDataSource(undefined)}
          onConfirm={onCopyTechDataConfirm}
          techKey={copyTechDataSource.key}
          value={copyTechDataSource.value}
          sourceProduct={copyTechDataSource.product}
          otherVariants={series.variants.filter((variant) => variant.id !== copyTechDataSource.product.id)}
        />
      )}
      <Tabs.Panel value="variants" className={styles.tabPanel}>
        {hasNoVariants && (
          <Alert variant={showInputError ? 'error' : 'info'}>
            Produktet trenger en eller flere varianter. Her kan man legge inn varianter som varierer for eksempel i
            størrelse eller farge. Alle variantene skal ha eget navn som skiller variantene fra hverandre,
            artikkelnummer fra leverandør og teknisk data.
          </Alert>
        )}
        {!hasNoVariants && (
          <Box background="default" padding={{ xs: 'space-8', md: 'space-16' }} borderRadius="12">
            <VStack gap="space-16">
              {series.status === 'EDITABLE' && loggedInUser?.isAdmin && techKeys.length > 0 && (
                <HStack justify="end">
                  {!techDataEditMode ? (
                    <Button
                      className="fit-content"
                      variant="secondary"
                      size="small"
                      icon={<PencilIcon aria-hidden />}
                      onClick={() => setTechDataEditMode(true)}
                    >
                      Rediger teknisk data
                    </Button>
                  ) : (
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      size="small"
                      icon={<XMarkIcon aria-hidden />}
                      onClick={onCancelTechDataEdit}
                    >
                      Avbryt redigering
                    </Button>
                  )}
                </HStack>
              )}
              {(series.variants.length > columnsPerPage || totalPages > 1) && (
                <HStack justify="space-between" align="center" gap="space-16" wrap>
                  {series.variants.length > columnsPerPage ? (
                    <Box role="search" style={{ maxWidth: '475px', flex: '1 1 260px' }}>
                      <Search
                        className="search-button"
                        label="Søk"
                        variant="simple"
                        clearButton={true}
                        onClear={() => {
                          setVariantFilterString('')
                          resetPageState()
                        }}
                        placeholder="Filtrer på hms-nr, lev-artnr, variantnavn"
                        size="medium"
                        value={variantFilterString}
                        onChange={(value) => {
                          setVariantFilterString(value)
                          resetPageState()
                        }}
                        hideLabel={true}
                      />
                    </Box>
                  ) : (
                    <span />
                  )}
                  {totalPages > 1 && (
                    <nav className="aksel-pagination aksel-pagination--medium" aria-label="Paginering topp">
                      <ul className="aksel-pagination__list" style={{ alignItems: 'center' }}>
                        <li>
                          <Button
                            className="aksel-pagination__item"
                            variant="tertiary"
                            data-color="neutral"
                            size="medium"
                            icon={<ChevronLeftIcon title="Forrige side" />}
                            onClick={() => goToPage(pageState - 1)}
                            disabled={pageState <= 1}
                          />
                        </li>
                        <li>
                          <BodyShort
                            size="medium"
                            weight="regular"
                            aria-live="polite"
                            style={{ color: 'var(--ax-text-accent)' }}
                          >
                            {`${pageState} av ${totalPages}`}
                          </BodyShort>
                        </li>
                        <li>
                          <Button
                            className="aksel-pagination__item"
                            variant="tertiary"
                            data-color="neutral"
                            size="medium"
                            icon={<ChevronRightIcon title="Neste side" />}
                            onClick={() => goToPage(pageState + 1)}
                            disabled={pageState >= totalPages}
                          />
                        </li>
                      </ul>
                    </nav>
                  )}
                </HStack>
              )}
              <div className={styles.variantTable}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="row"></Table.HeaderCell>
                      {paginatedVariants.map((product) => (
                        <Table.HeaderCell scope="row" key={`edit-${product.id}-i`}>
                          {series.status === 'EDITABLE' && (
                            <Dropdown>
                              <Button
                                variant="tertiary"
                                size="small"
                                icon={<MenuElipsisHorizontalCircleIcon title="Meny" />}
                                as={Dropdown.Toggle}
                              ></Button>
                              <Dropdown.Menu>
                                <Dropdown.Menu.List>
                                  {series.status === 'EDITABLE' && (
                                    <>
                                      <Dropdown.Menu.List.Item
                                        onClick={() => {
                                          navigate(`${pathname}/rediger-variant/${product.id}?page=${pageState}`, {
                                            state: state,
                                          })
                                        }}
                                      >
                                        Endre
                                        <PencilIcon aria-hidden />
                                      </Dropdown.Menu.List.Item>
                                      {!product.isPublished ? (
                                        <Dropdown.Menu.List.Item
                                          onClick={() => {
                                            setVariant(product)
                                            setDeleteVariantConfirmationModalIsOpen(true)
                                          }}
                                        >
                                          Slett
                                          <TrashIcon aria-hidden />
                                        </Dropdown.Menu.List.Item>
                                      ) : product.isExpired ? (
                                        <Dropdown.Menu.List.Item onClick={() => setAsActive(product)}>
                                          Marker variant som aktiv
                                        </Dropdown.Menu.List.Item>
                                      ) : (
                                        <Dropdown.Menu.List.Item onClick={() => setAsExpired(product)}>
                                          Marker variant som utgått
                                        </Dropdown.Menu.List.Item>
                                      )}
                                      {product.isPublished && loggedInUser?.isAdmin && (
                                        <Dropdown.Menu.List.Item
                                          onClick={() => {
                                            setVariant(product)
                                            setDeleteVariantConfirmationModalIsOpen(true)
                                          }}
                                        >
                                          Slett
                                          <TrashIcon aria-hidden />
                                        </Dropdown.Menu.List.Item>
                                      )}
                                    </>
                                  )}
                                </Dropdown.Menu.List>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </Table.HeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.HeaderCell scope="row">Variantnavn:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`articleName-${i}`}>{product.articleName || '-'}</Table.DataCell>
                      ))}
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell scope="row">
                        <HStack gap="space-4" align="center">
                          På avtale
                          <HelpText title="Om på avtale" strategy="fixed" placement="top">
                            Anbudsnumrene denne varianten er knyttet til.
                          </HelpText>
                        </HStack>
                      </Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`onAgreement-${i}`}>{agreementValue(product)}</Table.DataCell>
                      ))}
                    </Table.Row>
                    {anyExpired && (
                      <Table.Row>
                        <Table.HeaderCell scope="row">Status:</Table.HeaderCell>
                        {paginatedVariants.map((product, i) => (
                          <Table.DataCell key={`expired-${i}`}>
                            {product.isExpired && <Tag variant="warning-moderate">Utgått</Tag>}
                          </Table.DataCell>
                        ))}
                      </Table.Row>
                    )}
                    <Table.Row>
                      <Table.HeaderCell scope="row">Lev-artnr:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`levart-${i}`}>
                          {product.supplierRef ? (isUUID(product.supplierRef) ? '-' : product.supplierRef) : '-'}
                        </Table.DataCell>
                      ))}
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell scope="row">Hms-nr:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`hms-${i}`}>{product.hmsArtNr || '-'}</Table.DataCell>
                      ))}
                    </Table.Row>
                    {loggedInUser?.isAdmin && (
                      <Table.Row>
                        <Table.HeaderCell scope="row">
                          <HStack gap="space-4" align="center">
                            <span className={styles.worksWithHeader}>Virker sammen med</span>
                            <HelpText strategy="fixed" placement="top">
                              {helpTextWorksWith}
                            </HelpText>
                          </HStack>
                        </Table.HeaderCell>

                        {paginatedVariants.map((product, i) => (
                          <Table.DataCell key={`workswith-${i}`}>
                            {series.status === 'EDITABLE' ? (
                              <Link to={`${pathname}/rediger-passer-med/${product.id}?page=${pageState}`}>
                                {noWorksWith(product)} produkter <PencilIcon />
                              </Link>
                            ) : noWorksWith(product) > 0 ? (
                              <Link to={`${pathname}/se-passer-med/${product.id}?page=${pageState}`}>
                                {noWorksWith(product)} produkter
                              </Link>
                            ) : (
                              <span>0 produkter</span>
                            )}
                          </Table.DataCell>
                        ))}
                      </Table.Row>
                    )}
                    {techKeys.map((key) => (
                      <Table.Row key={key}>
                        <Table.HeaderCell scope="row">{key}</Table.HeaderCell>
                        {paginatedVariants.map((product, i) => {
                          const field = techDataFieldFor(product, key)
                          if (!techDataEditMode || !field) {
                            return (
                              <Table.DataCell key={`${key}-${i}`}>{techValue(product, key) || '-'}</Table.DataCell>
                            )
                          }
                          const currentValue = techDataChanges.getValue(product.id!, key, field.value)
                          return (
                            <Table.DataCell key={`${key}-${i}`}>
                              <HStack align="end" gap="space-4" wrap={false}>
                                <TechDataFieldControl
                                  techData={field}
                                  value={currentValue}
                                  onChange={(value) => techDataChanges.setValue(product.id!, key, value)}
                                  label={`${key} for ${product.articleName || product.hmsArtNr || product.supplierRef}`}
                                />
                                <Button
                                  variant="tertiary"
                                  size="small"
                                  title="Kopier verdi til andre varianter"
                                  icon={<FilesIcon aria-hidden />}
                                  onClick={() =>
                                    setCopyTechDataSource({
                                      product,
                                      key,
                                      value: currentValue,
                                    })
                                  }
                                />
                              </HStack>
                            </Table.DataCell>
                          )
                        })}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination
                  page={pageState}
                  onPageChange={goToPage}
                  count={totalPages}
                  size="small"
                />
              )}
              {techDataEditMode && (
                <HStack justify="space-between" align="center" gap="space-16" wrap>
                  <BodyShort>
                    {techDataChanges.changeCount === 0
                      ? 'Ingen endringer'
                      : `${techDataChanges.changeCount} ulagret${techDataChanges.changeCount === 1 ? '' : 'e'} endring${
                          techDataChanges.changeCount === 1 ? '' : 'er'
                        }`}
                  </BodyShort>
                  <HStack gap="space-8">
                    <Button variant="tertiary" size="small" onClick={onCancelTechDataEdit} disabled={techDataIsSaving}>
                      Avbryt
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={onSaveTechDataChanges}
                      disabled={techDataChanges.changeCount === 0 || techDataIsSaving}
                      loading={techDataIsSaving}
                    >
                      Lagre endringer
                    </Button>
                  </HStack>
                </HStack>
              )}
              {techDataSaveError && <Alert variant="error">{techDataSaveError}</Alert>}
            </VStack>
          </Box>
        )}
        {series.status === 'EDITABLE' && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            style={{ marginTop: '16px' }}
            onClick={() => {
              navigate(
                `${pathname}/opprett-variant/${series.id}?page=${
                  Math.floor(series.variants.length / columnsPerPage) + 1
                }`
              )
            }}
          >
            Legg til ny variant
          </Button>
        )}
        {series.status === 'EDITABLE' && loggedInUser?.isAdmin && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<ArrowsSquarepathIcon fontSize="1.5rem" aria-hidden />}
            style={{ marginTop: "16'px" }}
            onClick={() => setMoveProductVariantModalIsOpen(true)}
          >
            Flytt varianter til annen serie
          </Button>
        )}
      </Tabs.Panel>
    </>
  )
}

const noWorksWith = (product: ProductRegistrationDTOV2) => {
  return product.productData.attributes.worksWith?.productIds.length ?? 0
}

const agreementValue = (product: ProductRegistrationDTOV2) => {
  const activeAgreements = product.agreements.filter((agreement) => agreement.status === 'ACTIVE')
  if (activeAgreements.length === 0) {
    return '-'
  }

  const references = [...new Set(activeAgreements.map((agreement) => agreement.reference).filter(Boolean))]
  return references.length > 0 ? references.join(', ') : 'Ja'
}

export default VariantsTab
