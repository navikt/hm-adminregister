import { FileImageIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Button, Checkbox, Link, SortState, Table, Tag, VStack } from "@navikt/ds-react";
import { CreatedByFilter } from "approval/ForApproval";
import { PublishMultipleSeriesModal } from "approval/PublishMultipleSeriesModal";
import { Avstand } from "felleskomponenter/Avstand";
import TagWithIcon, { colors } from "felleskomponenter/TagWithIcon";
import { ImageContainer } from "products/files/images/ImageContainer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toDate, toReadableDateTimeString } from "utils/date-util";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import styles from "./ProductsToApproveTable.module.scss";

interface ProductTableProps {
  series: SeriesRegistrationDTO[];
  createdByFilter: CreatedByFilter;
  mutatePagedData: () => void;
}

export const ProductsToApproveTable = ({ series, createdByFilter, mutatePagedData }: ProductTableProps) => {
  const [sort, setSort] = useState<SortState | undefined>();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSort = (sortKey: string | undefined) => {
    if (!sortKey) return;
    {
      setSort(
        sort && sortKey === sort.orderBy && sort.direction === "descending"
          ? undefined
          : {
              orderBy: sortKey,
              direction:
                sort && sortKey === sort.orderBy && sort.direction === "ascending" ? "descending" : "ascending",
            },
      );
    }
  };
  const comparator = (a: any, b: any, orderBy: string) => {
    if (b[orderBy] < a[orderBy] || b[orderBy] === undefined) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const sortedData = series.slice().sort((a, b) => {
    if (sort) {
      return sort.direction === "ascending" ? comparator(b, a, sort.orderBy) : comparator(a, b, sort.orderBy);
    }
    return 1;
  });

  const onNavigateToProduct = (seriesUUID: string) => {
    navigate(`/produkter/${seriesUUID}`);
  };

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const forApprovalStatus = (published: string | null | undefined) =>
    typeof published === "string" ? "CHANGE" : "NEW";
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list) => (list.includes(value) ? list.filter((id) => id !== value) : [...list, value]));

  return (
    <>
      <PublishMultipleSeriesModal
        seriesIds={selectedRows}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mutateSeries={mutatePagedData}
        setSelectedRows={setSelectedRows}
      />
      <div className={styles.productsToApproveTable}>
        <Table sort={sort} onSortChange={(sortKey) => handleSort(sortKey)}>
          <Table.Header>
            <Table.Row>
              {createdByFilter === CreatedByFilter.ADMIN && (
                <Table.DataCell>
                  <Checkbox
                    checked={selectedRows.length === series.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length !== series.length}
                    onChange={() => {
                      selectedRows.length ? setSelectedRows([]) : setSelectedRows(series.map(({ id }) => id));
                    }}
                    hideLabel
                  >
                    Velg alle rader
                  </Checkbox>
                </Table.DataCell>
              )}
              <Table.HeaderCell> </Table.HeaderCell>
              <Table.HeaderCell>Produkt</Table.HeaderCell>
              <Table.ColumnHeader sortKey="status" sortable>
                Status
              </Table.ColumnHeader>
              {/* <Table.ColumnHeader sortKey="supplierName" sortable>
                Leverandør
              </Table.ColumnHeader> */}
              <Table.ColumnHeader sortKey="edited" sortable>
                Sist endret
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((series, i) => {
              let isExpired = toDate(series.expired) < new Date();
              let imgUrl = series.seriesData.media
                .filter((media) => media.type === "IMAGE")
                .find((media) => media.priority === 1);
              return (
                <Table.Row key={i + series.title} tabIndex={0}>
                  {createdByFilter === CreatedByFilter.ADMIN && (
                    <Table.DataCell>
                      <Checkbox
                        hideLabel
                        checked={selectedRows.includes(series.id)}
                        onChange={() => toggleSelectedRow(series.id)}
                        aria-labelledby={`id-${series.id}`}
                      >
                        {" "}
                      </Checkbox>
                    </Table.DataCell>
                  )}
                  <Table.DataCell className={styles.imgTd}>
                    <Box
                      className={styles.imageBox}
                      borderRadius="medium"
                      borderWidth="1"
                      width="75px"
                      height="75px"
                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                      {imgUrl?.uri ? (
                        <ImageContainer uri={imgUrl?.uri} size="xsmall" />
                      ) : (
                        <FileImageIcon title="Produkt mangler bilde" fontSize="2rem" />
                      )}
                    </Box>
                  </Table.DataCell>
                  <Table.DataCell
                    onClick={() => {
                      onNavigateToProduct(series.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        onNavigateToProduct(series.id);
                      }
                    }}
                  >
                    <Link
                      tabIndex={0}
                      onClick={() => {
                        onNavigateToProduct(series.id);
                      }}
                    >
                      <VStack gap="1">
                        {isExpired && (
                          <Box>
                            <Tag size="small" variant="neutral-moderate">
                              Utgått
                            </Tag>
                          </Box>
                        )}
                        <BodyShort weight="semibold" className="text-overflow-hidden-small-2-lines">
                          {series.title}
                        </BodyShort>
                      </VStack>
                    </Link>
                  </Table.DataCell>
                  <Table.DataCell>{<StatusTag status={forApprovalStatus(series.published)} />}</Table.DataCell>
                  {/* <Table.DataCell>{series.supplierName}</Table.DataCell> */}
                  <Table.DataCell>{`${toReadableDateTimeString(series.updated)}`}</Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {createdByFilter === CreatedByFilter.ADMIN && (
          <Avstand marginTop={6}>
            <Button
              onClick={() => {
                setIsOpen(true);
              }}
              disabled={selectedRows.length === 0}
            >
              Publiser valgte produkter
            </Button>
          </Avstand>
        )}
      </div>
    </>
  );
};

const StatusTag = ({ status }: { status: string }) => {
  if (status === "NEW") {
    return <TagWithIcon icon={<></>} text="Nytt produkt" color={colors.GREEN} />;
  } else if (status === "CHANGE") {
    return <TagWithIcon icon={<></>} text="Endret produkt" color={colors.ORANGE} />;
  } else {
    return <> </>;
  }
};
