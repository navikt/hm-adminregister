import { ChevronRightIcon, FileImageIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Button, Checkbox, HStack, Link, SortState, Stack, Table, Tag, VStack } from "@navikt/ds-react";
import { CreatedByFilter } from "approval/ForApproval";
import { PublishMultipleSeriesModal } from "approval/PublishMultipleSeriesModal";
import { Avstand } from "felleskomponenter/Avstand";
import LocalTag, { colors } from "felleskomponenter/LocalTag";
import { ImageContainer } from "products/files/images/ImageContainer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toDate, toReadableDateTimeString } from "utils/date-util";
import { useSuppliers } from "utils/swr-hooks";
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
  const { suppliers } = useSuppliers();

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

  const forApprovalStatus = (published: string | null | undefined) =>
    typeof published === "string" ? "CHANGE" : "NEW";

  const comparator = (a: any, b: any, orderBy: string) => {
    if (orderBy === "status") {
      const aNotUndefined = forApprovalStatus(a["published"]) || "";
      const bNotUndefined = forApprovalStatus(b["published"]) || "";
      return aNotUndefined.localeCompare(bNotUndefined);
    }

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
                  <HStack justify={"center"}>
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
                  </HStack>
                </Table.DataCell>
              )}

              <Table.HeaderCell>Produkt</Table.HeaderCell>
              <Table.ColumnHeader sortKey="status" sortable>
                Status
              </Table.ColumnHeader>
              {/* <Table.ColumnHeader sortKey="supplierName" sortable>
                Leverandør
              </Table.ColumnHeader> */}
              <Table.ColumnHeader sortKey="updated" sortable>
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
                      <HStack justify={"center"}>
                        <Checkbox
                          hideLabel
                          checked={selectedRows.includes(series.id)}
                          onChange={() => toggleSelectedRow(series.id)}
                          aria-labelledby={`id-${series.id}`}
                        >
                          {" "}
                        </Checkbox>
                      </HStack>
                    </Table.DataCell>
                  )}
                  <Table.DataCell className={styles.imageColumn}>
                    <Stack wrap={false} gap="3" direction="row-reverse" align="center" justify="start">
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
                        <BodyShort size="small" color="subtle" className="text-overflow-hidden-small-2-lines">
                          {suppliers?.find((supplier) => supplier.id === series.supplierId)?.name || ""}
                        </BodyShort>
                      </VStack>
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
                    </Stack>
                  </Table.DataCell>
                  <Table.DataCell>{<StatusTag status={forApprovalStatus(series.published)} />}</Table.DataCell>
                  {/* <Table.DataCell>{series.supplierName}</Table.DataCell> */}
                  <Table.DataCell style={{ paddingLeft: "12px" }}>{`${toReadableDateTimeString(
                    series.updated,
                  )}`}</Table.DataCell>
                  <Table.DataCell>
                    <VStack>
                      <Link
                        className={styles.linkToProduct}
                        onClick={() => {
                          onNavigateToProduct(series.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            onNavigateToProduct(series.id);
                          }
                        }}
                      >
                        <ChevronRightIcon aria-hidden fontSize={"1.5rem"} />
                      </Link>
                    </VStack>
                  </Table.DataCell>
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
    return <LocalTag text="Nytt" color={colors.GREEN} />;
  } else if (status === "CHANGE") {
    return <LocalTag text="Endret" color={colors.BLUE} />;
  } else {
    return <></>;
  }
};
