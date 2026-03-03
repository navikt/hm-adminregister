import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Loader,
  Pagination,
  Search,
  BodyShort,
  Tooltip,
  Alert,
  VStack,
  HelpText,
} from "@navikt/ds-react";
import { TrashIcon, ArrowUpIcon, PlusIcon } from "@navikt/aksel-icons";
import { findCatalogFiles, deleteCatalogFile, retryCatalogFile } from "api/CatalogFileApi";
import { CatalogFile } from "utils/types/response-types";
import styles from "./CatalogFiles.module.scss";
import { toReadableDateTimeString } from "utils/date-util";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;

const CatalogFiles = () => {
  const [searchFileName, setSearchFileName] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, error, mutate } = findCatalogFiles(
    { fileName: searchFileName },
    page - 1,
    PAGE_SIZE,
    "updated,DESC",
  );

  const handleDelete = async (id: string) => {
    await deleteCatalogFile(id);
    mutate();
  };

  const handleRetry = async (id: string) => {
    await retryCatalogFile(id);
    mutate();
  };

  const statusLabels: Record<string, string> = {
    ERROR: "Feil",
    DONE: "Ferdig",
    PROCESSING: "Behandler",
    PENDING: "I kø",
  };

  return (
    <main className="show-menu">
      <div className="page__background-container" style={{ overflow: "auto" }}>
        <Heading level="1" size="large" spacing>
          Katalog
        </Heading>
        <div className={styles.catalogfilesContainer}>
          <VStack gap="space-8">
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
                onClick={() => navigate("/katalog/importer-fil")}
              >
                Last opp ny katalog
              </Button>
            </HStack>
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {error && <Alert variant="error">Kunne ikke hente katalogfiler.</Alert>}
              {!isLoading && data && data.content.length === 0 && (
                <Alert variant="info">Ingen katalogfiler funnet.</Alert>
              )}
              {!isLoading && data && data.content.length > 0 && (
                <div className={styles.cardRow + " " + styles.cardHeader}>
                  <BodyShort className={`${styles.cardValue} ${styles.longColumn}`}>
                    <strong>Filnavn</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                    <strong>Bestillingsnr.</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                    <strong>Anbudsnr.</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                    <strong>Rader</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                    <strong>Status</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                    <strong>Bruker</strong>
                  </BodyShort>
                  <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                    <HStack gap="space-2" justify="center">
                    <strong>Sist oppdatert</strong>
                    <HelpText title="om sist oppdatert" >
                      Denne kolonnen viser når filen sist ble oppdatert, enten ved opplasting
                      eller ved nattlig synkronisering mot FinnHjelpemiddel.
                    </HelpText>
                    </HStack>
                  </BodyShort>
                </div>
              )}
              {data?.content.map((file: CatalogFile) => (
                <Box key={file.id} className={styles.cardBox}>
                  <div className={styles.cardRow}>
                    <BodyShort className={`${styles.cardValue} ${styles.longColumn}`}>{file.fileName}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>{file.orderRef}</BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                      {file.catalogList[0].reference}
                    </BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                      {file.catalogList.length}
                    </BodyShort>
                    {file.status === "ERROR" ? (
                      <Tooltip content={file.errorMessage || ""} placement="top" maxChar={500}>
                        <BodyShort className={`${styles.cardValue} ${styles.shortColumn} ${styles.errorStatus}`}>
                          {statusLabels[file.status] || file.status}
                        </BodyShort>
                      </Tooltip>
                    ) : (
                      <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                        {statusLabels[file.status] || file.status}
                      </BodyShort>
                    )}
                    <BodyShort className={`${styles.cardValue} ${styles.shortColumn}`}>
                      {file.updatedByUser
                        ? file.updatedByUser.split(".")[0].charAt(0).toUpperCase() +
                          file.updatedByUser.split(".")[0].slice(1)
                        : ""}
                    </BodyShort>
                    <BodyShort className={`${styles.cardValue} ${styles.mediumColumn}`}>
                      {toReadableDateTimeString(file.updated)}
                    </BodyShort>
                    {file.status === "ERROR" && (
                      <span className={styles.editButton}>
                        <Button
                          size="xsmall"
                          variant="tertiary"
                          icon={<TrashIcon aria-hidden />}
                          onClick={() => handleDelete(file.id)}
                          aria-label="Slett"
                        />
                      </span>
                    )}
                  </div>
                </Box>
              ))}
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
            </div>
          </VStack>
        </div>
      </div>
    </main>
  );
};

export default CatalogFiles;
