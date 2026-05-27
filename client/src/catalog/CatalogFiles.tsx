import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { deleteCatalogFile, findCatalogFiles } from 'api/CatalogFileApi'
import { toReadableDateTimeString } from 'utils/date-util'
import { CatalogFile } from 'utils/types/response-types'

import { MenuElipsisVerticalCircleIcon, PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  ActionMenu,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  HelpText,
  HStack,
  Loader,
  Modal,
  Pagination,
  Search,
  Table,
  Tooltip,
  VStack,
} from '@navikt/ds-react'

import styles from './CatalogFiles.module.scss'

const PAGE_SIZE = 15

export const CatalogFiles = () => {
  const [searchFileName, setSearchFileName] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading, error, mutate } = findCatalogFiles(
    { fileName: searchFileName },
    page - 1,
    PAGE_SIZE,
    'updated,DESC'
  )

  const handleDelete = async (id: string) => {
    await deleteCatalogFile(id).then(() => mutate())
  }

  const statusLabels: Record<string, string> = {
    ERROR: 'Feil',
    DONE: 'Ferdig',
    PROCESSING: 'Behandler',
    PENDING: 'I kø',
  }
  console.log(data)
  return (
    <main className="show-menu">
      <div className="page__background-container" style={{ overflow: 'auto' }}>
        <Heading level="1" size="large" spacing>
          Katalog
        </Heading>
        <VStack gap="space-8" className={styles.catalogfilesContainer}>
          <HStack justify="space-between" wrap gap="space-4" marginBlock="space-8 space-0">
            <Box role="search" className="search-box">
              <Search
                label="Søk etter filnavn"
                variant="simple"
                placeholder="Søk etter filnavn"
                size="medium"
                value={searchFileName}
                onChange={setSearchFileName}
              />
            </Box>
            <Button
              variant="secondary"
              size="medium"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={() => navigate('/katalog/importer-fil')}
            >
              Last opp ny katalog
            </Button>
          </HStack>

          <Table size={'small'}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className={styles.longColumn}>Filnavn</Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>Bestillingsnr.</Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>Anbudsnr.</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Rader</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Status</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Bruker</Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>
                  <HStack gap="space-2" justify="center">
                    <BodyShort weight={'semibold'}>Sist oppdatert</BodyShort>
                    <HelpText title="Om sist oppdatert" wrapperClassName={styles.helpText}>
                      Denne kolonnen viser når filen sist ble oppdatert, enten ved opplasting eller ved nattlig
                      synkronisering mot FinnHjelpemiddel.
                    </HelpText>
                  </HStack>
                </Table.HeaderCell>
                <Table.HeaderCell className={styles.editButtonHeader} aria-label={'Meny-kolonne'} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row style={{ backgroundColor: 'transparent', borderStyle: 'hidden' }}>
                  <Table.DataCell style={{ backgroundColor: 'transparent' }}>
                    <Loader size="3xlarge" title="venter..." />
                  </Table.DataCell>
                </Table.Row>
              ) : error ? (
                <Table.Row>
                  <Table.DataCell>
                    <Alert variant="error">Kunne ikke hente katalogfiler.</Alert>
                  </Table.DataCell>
                </Table.Row>
              ) : data && data.content.length === 0 ? (
                <Table.Row>
                  <Table.DataCell>
                    <Alert variant="info">Ingen katalogfiler funnet.</Alert>
                  </Table.DataCell>
                </Table.Row>
              ) : (
                data?.content.map((file: CatalogFile, index) => (
                  <Table.Row key={index + file.id}>
                    <Table.DataCell className={styles.longColumn}>
                      <Tooltip content={file.fileName}>
                        <BodyShort className={styles.column}>{file.fileName}</BodyShort>
                      </Tooltip>
                    </Table.DataCell>
                    <Table.DataCell className={styles.mediumColumn}>{file.orderRef}</Table.DataCell>
                    <Table.DataCell className={styles.mediumColumn}>{file.catalogList[0].reference}</Table.DataCell>
                    <Table.DataCell className={styles.shortColumn}>{file.catalogList.length}</Table.DataCell>
                    <Table.DataCell className={styles.shortColumn}>
                      {file.status === 'ERROR' ? (
                        <BodyShort className={styles.errorStatus}>{statusLabels[file.status] || file.status}</BodyShort>
                      ) : (
                        statusLabels[file.status] || file.status
                      )}
                    </Table.DataCell>
                    <Table.DataCell className={styles.shortColumn}>
                      {file.updatedByUser
                        ? file.updatedByUser.split('.')[0].charAt(0).toUpperCase() +
                          file.updatedByUser.split('.')[0].slice(1)
                        : ''}
                    </Table.DataCell>
                    <Table.DataCell className={styles.mediumColumn}>
                      {toReadableDateTimeString(file.updated)}
                    </Table.DataCell>
                    <Table.DataCell className={styles.editButton}>
                      {file.status === 'ERROR' ? <Menu file={file} handleDelete={handleDelete} /> : ' '}
                    </Table.DataCell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {data && data.totalPages && data.totalPages > 1 && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={data.totalPages}
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

const Menu = ({ file, handleDelete }: { file: CatalogFile; handleDelete: (file: string) => void }) => {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button
            variant={'tertiary'}
            icon={<MenuElipsisVerticalCircleIcon aria-hidden />}
            size={'small'}
            aria-label={'Katalog-meny'}
          />
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => ref.current?.showModal()}>Vis feilmelding</ActionMenu.Item>
          <ActionMenu.Item variant={'danger'} icon={<TrashIcon aria-hidden />} onSelect={() => handleDelete(file.id)}>
            Slett katalog
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      <Modal ref={ref} header={{ heading: 'Feilmelding' }} className={styles.errorDialog}>
        <Modal.Body>
          <BodyLong>{file.errorMessage}</BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={() => ref.current?.close()}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
