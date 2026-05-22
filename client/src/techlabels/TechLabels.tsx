import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { deleteTechLabel, getTechLabels } from 'api/TechLabelApi'

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
  Search,
  Tooltip,
  VStack,
} from '@navikt/ds-react'

import styles from './TechLabels.module.scss'
import ErrorAlert from 'error/ErrorAlert.tsx'

const PAGE_SIZE = 15
const MAX_VISIBLE_OPTIONS = 10

export const TechLabels = () => {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')

  const searchIsoCode = searchParams.get('searchIsoCode') || ''

  const [page, setPage] = useState(1)

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [forceDeleteId, setForceDeleteId] = useState<string | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const updateUrlOnSearchIsoCodeChange = (value: string) => {
    navigate(`${pathname}?searchIsoCode=${value}`)
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

        <div className={styles.techLabelsContainer}>
          <VStack gap="space-24">
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

            <div className="panel-list__container">
              <div className={styles.cardRow + ' ' + styles.cardHeader}>
                <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                  <strong>Navn</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                  <strong>ISO-kode</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                  <strong>Type</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                  <strong>Enhet</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                  <strong>Sortering</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                  <strong>Obligatorisk</strong>
                </BodyShort>
                <BodyShort className={`${styles.cardValue} ${styles.optionsColumn}`}>
                  <strong>Alternativer</strong>
                </BodyShort>
                <span className={styles.editButtonHeader}></span>
              </div>

              {paginatedLabels.map((label) => (
                <Box key={label.id} className={styles.cardBox}>
                  <div className={styles.cardRow}>
                    <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>{label.label}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>{label.isoCode}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>{label.type}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>{label.unit}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>{label.sort}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                      {label.required ? 'Ja' : 'Nei'}
                    </BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.optionsColumn}`}>
                      {label.options && label.options.length > 0 ? (
                        label.options.length > MAX_VISIBLE_OPTIONS ? (
                          <Tooltip content={label.options.join(', ')}>
                            <span>
                              {label.options.slice(0, MAX_VISIBLE_OPTIONS).join(', ')}, ... ({label.options.length})
                            </span>
                          </Tooltip>
                        ) : (
                          label.options.join(', ')
                        )
                      ) : (
                        '-'
                      )}
                    </BodyShort>
                    <span className={styles.editButton}>
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
                    </span>
                  </div>
                </Box>
              ))}
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
            </div>
          </VStack>
        </div>
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
