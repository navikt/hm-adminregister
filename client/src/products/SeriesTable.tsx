import { SeriesRegistrationDTO } from "utils/types/response-types";
import { Heading, Table } from "@navikt/ds-react";
import styles from "products/ProductTable.module.scss";
import StatusTag from "felleskomponenter/StatusTag";
import { seriesStatus } from "products/seriesUtils";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  seriesList: SeriesRegistrationDTO[];
  heading?: string;
}

export const SeriesTable = ({ seriesList, heading }: Props) => {
  const navigate = useNavigate();

  return (
    <div className={styles.productTable}>
      {heading && <Heading size="medium">{heading}</Heading>}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.HeaderCell scope="col">Antall varianter</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {seriesList.map((product, i) => (
            <Table.Row
              key={i + product.id}
              onClick={() => {
                navigate(`/produkter/${product.id}`);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(`/produkter/${product.id}`);
                }
              }}
              tabIndex={0}
            >
              <Table.HeaderCell scope="row">
                <b>{product.title}</b>
              </Table.HeaderCell>
              <Table.DataCell>
                <StatusTag seriesStatus={seriesStatus(product)} />
              </Table.DataCell>
              <Table.DataCell>{product.count}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
