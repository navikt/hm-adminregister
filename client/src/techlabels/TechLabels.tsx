import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { deleteTechLabel, getTechLabels } from 'api/TechLabelApi'
import { useUrlSyncedSearchParam } from 'utils/common-hooks'

import { PencilWritingIcon, PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Box,
  Button,
  Heading,
  HGrid,
  HStack,
  Loader,
  Modal,
  Pagination,
  Popover,
  Search,
  Table,
  Tooltip,
  VStack,
} from '@navikt/ds-react'

import styles from './TechLabels.module.scss'
import ErrorAlert from 'error/ErrorAlert.tsx'

const PAGE_SIZE = 15
const MAX_VISIBLE_OPTIONS = 10

export const TechLabels = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useUrlSyncedSearchParam('q')

  const searchIsoCode = searchParams.get('searchIsoCode') || ''

  const [page, setPage] = useState(1)

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [forceDeleteId, setForceDeleteId] = useState<string | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const updateUrlOnSearchIsoCodeChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set('searchIsoCode', value)
    } else {
      nextParams.delete('searchIsoCode')
    }

    setSearchParams(nextParams)
  }

  const handleDelete = async (id: string, forcedDelete: boolean) => {
    setDeleteError(null)
    await deleteTechLabel(id, forcedDelete)
      .then(() => {
        mutateTechLabels()
        setForceDeleteId(null)
      })
      .catch((err) => {
        const backendMessage = err?.response?.data?.message || err?.message || 'Failed to delete techlabel: ' + id
        setDeleteError(backendMessage)
        setForceDeleteId(id)
        setDeleteModalOpen(true)
      })
  }

  const {
    data: dataTechLabels,
    error: errorTechLabels,
    isLoading: loadingTechLabels,
    mutate: mutateTechLabels,
  } = getTechLabels({}, 0, 5000)

  if (loadingTechLabels) {
    return (
      <HGrid gap="space-12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    )
  }

  if (!dataTechLabels || !dataTechLabels.content || errorTechLabels) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    )
  }

  const techLabels = dataTechLabels.content

  const filteredLabels = techLabels.filter(
    (label) =>
      label.label?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      label.isoCode?.toLowerCase().includes(searchIsoCode.toLowerCase())
  )

  const paginatedLabels = filteredLabels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const optionsFix = (options: string[]) => {
    const allOptions = options.join('; ')
    return options && options.length > 0 ? (
      <Tooltip content={allOptions}>
        {options.length > MAX_VISIBLE_OPTIONS ? (
          <BodyShort>
            {options.slice(0, MAX_VISIBLE_OPTIONS).join('; ')}, ... ({options.length})
          </BodyShort>
        ) : (
          <BodyShort className={styles.column}>{allOptions}</BodyShort>
        )}
      </Tooltip>
    ) : (
      <BodyShort>-</BodyShort>
    )
  }

  return (
    <main className="show-menu">
      <DeleteTechDataModal
        open={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        deleteError={deleteError}
        forceDeleteId={forceDeleteId}
        handleDelete={handleDelete}
        setDeleteError={setDeleteError}
        setForceDeleteId={setForceDeleteId}
      />
      <div className="page__background-container" style={{ overflow: 'auto' }}>
        <Heading level="1" size="large" spacing>
          Teknisk-data beskrivelser
        </Heading>

        <VStack gap="space-24" className={styles.techLabelsContainer}>
          <HStack justify="space-between" wrap gap="space-16" marginBlock="space-24 space-0">
            <Box role="search" className="search-box">
              <Search
                label="Søk etter navn på teknisk-data"
                variant="simple"
                placeholder="Søk etter navn på teknisk-data"
                size="medium"
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Box>
            <Box role="search" className="search-box">
              <Search
                label="Søk etter ISO-kode"
                variant="simple"
                placeholder="Søk etter ISO-kode"
                size="medium"
                value={searchIsoCode}
                onChange={updateUrlOnSearchIsoCodeChange}
              />
            </Box>

            <Button
              variant="secondary"
              size="medium"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={() => navigate('/tekniskdata/opprett')}
            >
              Opprett ny teknisk-data beskrivelse
            </Button>
          </HStack>

          <Table size={'small'}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className={styles.mediumColumn}>Navn</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>ISO-kode</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Type</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Enhet</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Sortering</Table.HeaderCell>
                <Table.HeaderCell className={styles.requiredColumn}>Obligatorisk</Table.HeaderCell>
                <Table.HeaderCell className={styles.optionsColumn}>Alternativer</Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>Beskrivelse</Table.HeaderCell>
                <Table.HeaderCell className={styles.editButtonHeader} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paginatedLabels.map((label, index) => (
                <Table.Row key={index + label.id}>
                  <Table.DataCell className={styles.mediumColumn}>{label.label}</Table.DataCell>
                  <Table.DataCell className={styles.shortColumn}>{label.isoCode}</Table.DataCell>
                  <Table.DataCell className={styles.shortColumn}>{label.type}</Table.DataCell>
                  <Table.DataCell className={styles.shortColumn}>{label.unit}</Table.DataCell>
                  <Table.DataCell className={styles.shortColumn}>{label.sort}</Table.DataCell>
                  <Table.DataCell className={styles.requiredColumn}>{label.required ? 'Ja' : 'Nei'}</Table.DataCell>
                  <Table.DataCell className={styles.optionsColumn}>{optionsFix(label.options)}</Table.DataCell>
                  <Table.DataCell className={styles.mediumColumn}>{label.definition}</Table.DataCell>
                  <Table.DataCell className={styles.editButton}>
                    <Button
                      size="xsmall"
                      variant="tertiary"
                      icon={<PencilWritingIcon aria-hidden />}
                      onClick={() => navigate(`/tekniskdata/rediger/${label.id}`, { state: label })}
                      aria-label="Rediger"
                    />
                    <Button
                      size="xsmall"
                      variant="tertiary"
                      icon={<TrashIcon aria-hidden />}
                      onClick={() => handleDelete(label.id, false)}
                      aria-label="Slett"
                      style={{ marginLeft: '0.5rem' }}
                    />
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {filteredLabels.length > PAGE_SIZE && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={Math.ceil(filteredLabels.length / PAGE_SIZE)}
              boundaryCount={1}
              siblingCount={0}
              size="small"
            />
          )}
        </VStack>
      </div>
    </main>
  )
}

type DeleteModalProps = {
  open: boolean
  setIsOpen: (value: boolean) => void
  deleteError: string | null
  forceDeleteId: string | null
  setDeleteError: (value: string | null) => void
  setForceDeleteId: (value: string | null) => void
  handleDelete: (id: string, flag: boolean) => void
}
const DeleteTechDataModal = ({
  open,
  setIsOpen,
  deleteError,
  forceDeleteId,
  handleDelete,
  setDeleteError,
  setForceDeleteId,
}: DeleteModalProps) => {
  return (
    <Modal
      open={open}
      onClose={() => {
        setDeleteError(null)
        setForceDeleteId(null)
        setIsOpen(false)
      }}
      header={{ heading: 'Delete failed' }}
    >
      <Modal.Body>
        <Alert variant="error">{deleteError}</Alert>
        <p>Vil du virkelig slette?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setDeleteError(null)
            setForceDeleteId(null)
            setIsOpen(false)
          }}
        >
          Avbryt
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (forceDeleteId) handleDelete(forceDeleteId, true)
          }}
        >
          Slett uansett
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
