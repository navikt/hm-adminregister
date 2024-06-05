import { Link, SortState, Table, Tag } from "@navikt/ds-react";
import { useState } from "react";
import { SeriesToApproveDto } from "utils/types/response-types";
import { ChevronRightIcon } from "@navikt/aksel-icons";
import { baseUrl } from "utils/swr-hooks";
import { Thumbnail } from "felleskomponenter/Thumbnail";

interface SeriesTableProps {
  series: SeriesToApproveDto[];
}

export const SeriesTable = ({ series }: SeriesTableProps) => {
  const [sort, setSort] = useState<SortState | undefined>();

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

  return (
    <>
      <Table className="products-table" sort={sort} onSortChange={(sortKey) => handleSort(sortKey)}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader> </Table.ColumnHeader>
            <Table.ColumnHeader>Produkt</Table.ColumnHeader>
            <Table.ColumnHeader sortKey="status" sortable>
              Status
            </Table.ColumnHeader>
            {/*<Table.ColumnHeader sortKey="delkontrakttittel" sortable>*/}
            {/*  Delkontrakt*/}
            {/*</Table.ColumnHeader>*/}
            <Table.ColumnHeader sortKey="supplierName" sortable>
              Leverandør
            </Table.ColumnHeader>
            <Table.ColumnHeader> </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map((series, i) => {
            return (
              <Table.Row key={i + series.title}>
                <Table.DataCell style={{ padding: "8px" }}>
                  {series.thumbnail && <Thumbnail mediaInfo={series.thumbnail} />}
                </Table.DataCell>
                <Table.HeaderCell scope="row">
                  <div>{series.title}</div>
                </Table.HeaderCell>
                <Table.DataCell>{<StatusTag status={"NEW"} />}</Table.DataCell>
                {/*<Table.DataCell>{delkontrakttittel ?? "Ingen delkontrakt"}</Table.DataCell>*/}
                <Table.DataCell>{series.supplierName}</Table.DataCell>
                <Table.DataCell>
                  {" "}
                  <Link href={baseUrl(`/produkter/${series.seriesUUID}`)}>
                    <ChevronRightIcon title="gå til produkt" fontSize="1.5rem" />
                  </Link>
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
};

const StatusTag = ({ status }: { status: string }) => {
  if (status === "NEW") {
    return (
      <Tag size="small" variant="warning">
        Nytt produkt
      </Tag>
    );
  } else if (status === "CHANGE") {
    return (
      <Tag size="small" variant="warning">
        Nytt produkt
      </Tag>
    );
  } else {
    return <> </>;
  }
};
