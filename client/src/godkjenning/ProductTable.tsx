import { HStack, Link, SortState, Table, Tag } from "@navikt/ds-react";
import { useState } from "react";
import { ProductToApproveDto } from "utils/types/response-types";
import { ChevronRightIcon } from "@navikt/aksel-icons";
import { baseUrl } from "utils/swr-hooks";
import { Thumbnail } from "felleskomponenter/Thumbnail";

interface ProductTableProps {
  products: ProductToApproveDto[];
}

export const ProductTable = ({ products }: ProductTableProps) => {
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

  const sortedData = products.slice().sort((a, b) => {
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
            <Table.ColumnHeader>Produkt</Table.ColumnHeader>
            <Table.ColumnHeader sortKey="status" sortable>
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="delkontrakttittel" sortable>
              Delkontrakt
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="supplierName" sortable>
              Leverandør
            </Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map(({ title, status, delkontrakttittel, supplierName, seriesId, thumbnail }, i) => {
            return (
              <Table.Row key={i + title}>
                <Table.HeaderCell scope="row">
                  <HStack justify="space-evenly" style={{ alignItems: "center" }}>
                    {thumbnail && <Thumbnail mediaInfo={thumbnail} />}
                    <div>{title}</div>
                  </HStack>
                </Table.HeaderCell>
                <Table.DataCell>{<StatusTag status={status} />}</Table.DataCell>
                <Table.DataCell>{delkontrakttittel ?? "Ingen delkontrakt"}</Table.DataCell>
                <Table.DataCell>{supplierName}</Table.DataCell>
                <Table.DataCell>
                  {" "}
                  <Link href={baseUrl(`/produkter/${seriesId}`)}>
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
  if (status === "NEW" || status === "EXISTING") {
    return (
      <Tag size="small" variant="warning">
        Nytt produkt
      </Tag>
    );
  } else {
    return <></>;
  }
};
