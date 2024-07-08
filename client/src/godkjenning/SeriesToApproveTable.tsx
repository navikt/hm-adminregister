import { SortState, Table } from "@navikt/ds-react";
import { useState } from "react";
import { SeriesToApproveDto } from "utils/types/response-types";
import styles from "./SeriesToApproveTable.module.scss";
import { Thumbnail } from "felleskomponenter/Thumbnail";
import { useNavigate } from "react-router-dom";
import TagWithIcon, { colors } from "felleskomponenter/TagWithIcon";

interface SeriesTableProps {
  series: SeriesToApproveDto[];
}

export const SeriesToApproveTable = ({ series }: SeriesTableProps) => {
  const [sort, setSort] = useState<SortState | undefined>();
  const navigate = useNavigate();

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

  return (
    <div className={styles.seriesToApproveTable}>
      <Table sort={sort} onSortChange={(sortKey) => handleSort(sortKey)}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell> </Table.HeaderCell>
            <Table.HeaderCell>Produkt</Table.HeaderCell>
            <Table.ColumnHeader sortKey="status" sortable>
              Status
            </Table.ColumnHeader>
            {/*<Table.ColumnHeader sortKey="delkontrakttittel" sortable>*/}
            {/*  Delkontrakt*/}
            {/*</Table.ColumnHeader>*/}
            <Table.ColumnHeader sortKey="supplierName" sortable>
              Leverandør
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map((series, i) => {
            return (
              <Table.Row
                key={i + series.title}
                onClick={() => {
                  onNavigateToProduct(series.seriesUUID);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onNavigateToProduct(series.seriesUUID);
                  }
                }}
                tabIndex={0}
              >
                <Table.DataCell className={styles.imgTd}>
                  {series.thumbnail && <Thumbnail mediaInfo={series.thumbnail} />}
                </Table.DataCell>
                <Table.DataCell>
                  <div>{series.title}</div>
                </Table.DataCell>
                <Table.DataCell>{<StatusTag status={series.status} />}</Table.DataCell>
                <Table.DataCell>{series.supplierName}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
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
