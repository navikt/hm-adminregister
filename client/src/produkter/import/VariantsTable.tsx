import { Table } from "@navikt/ds-react";
import { Fragment, useState } from "react";
import { formatAgreementRanks, toValueAndUnit } from "utils/string-util";
import classNames from "classnames";
import { sortIntWithStringFallback } from "utils/sort-util";
import { Product, ProductVariant } from "utils/types/types";
import "./import-page.scss";

type SortColumns = {
  orderBy: string | null;
  direction: "ascending" | "descending";
};

export const VariantsTable = ({ product }: { product: Product }) => {
  const [sortColumns, setSortColumns] = useState<SortColumns>({ orderBy: "HMS", direction: "ascending" });

  const sortColumnsByRowKey = (variants: ProductVariant[]) => {
    return variants.sort((variantA, variantB) => {
      if (sortColumns.orderBy === "HMS") {
        if (variantA.hmsArtNr && variantB.hmsArtNr) {
          return sortIntWithStringFallback(
            variantA.hmsArtNr,
            variantB.hmsArtNr,
            sortColumns?.direction === "descending",
          );
        }
        return -1;
      }

      if (
        sortColumns.orderBy &&
        variantA.techData[sortColumns.orderBy]?.value &&
        variantB.techData[sortColumns.orderBy]?.value
      ) {
        return sortIntWithStringFallback(
          variantA.techData[sortColumns.orderBy].value,
          variantB.techData[sortColumns.orderBy].value,
          sortColumns.direction === "descending",
        );
      } else return -1;
    });
  };

  let sortedByKey = sortColumnsByRowKey(product.variants);
  const allDataKeys = [...new Set(sortedByKey.flatMap((variant) => Object.keys(variant.techData)))];

  const techDataKeys = product.attributes.commonCharacteristics
    ? allDataKeys.filter((key) => product.attributes.commonCharacteristics![key] === undefined)
    : allDataKeys;

  const rows: { [key: string]: string[] } = Object.assign(
    {},
    ...techDataKeys.map((key) => ({
      [key]: product.variants.map((variant) =>
        variant.techData[key] !== undefined
          ? toValueAndUnit(variant.techData[key].value, variant.techData[key].unit)
          : "-",
      ),
    })),
  );

  const hasDifferentValues = ({ row }: { row: string[] }) => {
    let uniqueValues = new Set(row);
    uniqueValues.delete("-");
    return uniqueValues.size > 1;
  };

  return (
    <div className="variants-table">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tittel</Table.ColumnHeader>
            {product.variants.map((variant) => (
              <Table.ColumnHeader key={variant.id}>{variant.articleName}</Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell>HMS-nummer</Table.HeaderCell>
            {product.variants.map((variant) => (
              <Table.DataCell key={variant.id}>{variant.hmsArtNr ?? "-"}</Table.DataCell>
            ))}
          </Table.Row>

          {product.agreements && product.agreements.length > 0 && (
            <Table.Row>
              <Table.HeaderCell>Rangering</Table.HeaderCell>
              {product.variants.map((variant) => (
                <Fragment key={variant.id}>
                  <Table.DataCell key={variant.id}>{formatAgreementRanks(variant.agreements!)}</Table.DataCell>
                </Fragment>
              ))}
            </Table.Row>
          )}

          <Table.Row>
            <Table.HeaderCell>Lev-artnr</Table.HeaderCell>
            {product.variants.map((variant) => (
              <Table.DataCell key={variant.id}>{variant.supplierRef}</Table.DataCell>
            ))}
          </Table.Row>
          {Object.keys(rows).length > 0 &&
            Object.entries(rows).map(([key, row], i) => {
              const isSortableRow = hasDifferentValues({ row });
              return (
                <Table.Row
                  key={key + "row" + i}
                  className={classNames(
                    { "comparing-table__sorted-row": key === sortColumns.orderBy },
                    { "comparing-table__sortable-row": isSortableRow },
                  )}
                >
                  <Table.HeaderCell>{key}</Table.HeaderCell>
                  {row.map((value, i) => (
                    <Table.DataCell key={key + "-" + i}>{value}</Table.DataCell>
                  ))}
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>
    </div>
  );
};
