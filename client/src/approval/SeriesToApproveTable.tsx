import { BodyShort, Box, Button, Checkbox, Link, SortState, Table, Tag, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { SeriesToApproveDto } from "utils/types/response-types";
import styles from "./SeriesToApproveTable.module.scss";
import { SeriesThumbnail } from "approval/SeriesThumbnail";
import { useNavigate } from "react-router-dom";
import TagWithIcon, { colors } from "felleskomponenter/TagWithIcon";
import { ForApprovalFilterOption } from "approval/ForApproval";
import { Avstand } from "felleskomponenter/Avstand";
import { PublishMultipleSeriesModal } from "approval/PublishMultipleSeriesModal";

interface SeriesTableProps {
  series: SeriesToApproveDto[];
  seriesToApproveFilter: ForApprovalFilterOption;
  mutateSeries: () => void;
}

export const SeriesToApproveTable = ({ series, seriesToApproveFilter, mutateSeries }: SeriesTableProps) => {
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
            }
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

  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list) => (list.includes(value) ? list.filter((id) => id !== value) : [...list, value]));

  return (
    <>
      <PublishMultipleSeriesModal
        seriesIds={selectedRows}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mutateSeries={mutateSeries}
        setSelectedRows={setSelectedRows}
      />
      <div className={styles.seriesToApproveTable}>
        <Table sort={sort} onSortChange={(sortKey) => handleSort(sortKey)}>
          <Table.Header>
            <Table.Row>
              {seriesToApproveFilter === ForApprovalFilterOption.ADMIN && (
                <Table.DataCell>
                  <Checkbox
                    checked={selectedRows.length === series.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length !== series.length}
                    onChange={() => {
                      selectedRows.length
                        ? setSelectedRows([])
                        : setSelectedRows(series.map(({ seriesUUID }) => seriesUUID));
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
              <Table.ColumnHeader sortKey="supplierName" sortable>
                Leverandør
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((series, i) => {
              return (
                <Table.Row key={i + series.title} tabIndex={0}>
                  {seriesToApproveFilter === ForApprovalFilterOption.ADMIN && (
                    <Table.DataCell>
                      <Checkbox
                        hideLabel
                        checked={selectedRows.includes(series.seriesUUID)}
                        onChange={() => toggleSelectedRow(series.seriesUUID)}
                        aria-labelledby={`id-${series.seriesUUID}`}
                      >
                        {" "}
                      </Checkbox>
                    </Table.DataCell>
                  )}
                  <Table.DataCell className={styles.imgTd}>
                    {series.thumbnail && <SeriesThumbnail mediaInfo={series.thumbnail} />}
                  </Table.DataCell>
                  <Table.DataCell
                    onClick={() => {
                      onNavigateToProduct(series.seriesUUID);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        onNavigateToProduct(series.seriesUUID);
                      }
                    }}
                  >
                    <Link
                      tabIndex={0}
                      onClick={() => {
                        onNavigateToProduct(series.seriesUUID);
                      }}
                    >
                      <VStack gap="1">
                        {series.isExpired && (
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
                  <Table.DataCell>{<StatusTag status={series.status} />}</Table.DataCell>
                  <Table.DataCell>{series.supplierName}</Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {seriesToApproveFilter === ForApprovalFilterOption.ADMIN && (
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
