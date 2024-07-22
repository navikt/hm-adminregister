import { ExpansionCard, Table, VStack } from "@navikt/ds-react";
import React from "react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";
import * as _ from "lodash";

interface Props {
  productAgreements: ProductAgreementRegistrationDTO[];
}

export const ProductAgreementsWithNoSeries = ({ productAgreements }: Props) => {
  if (productAgreements.length === 0) {
    return <></>;
  }

  const groupedByAgreement = _.groupBy(productAgreements, "agreementId");

  return (
    <VStack>
      {Object.entries(groupedByAgreement).map(([key, dtos]) => {
        return (
          <ExpansionCard aria-label="Produkter uten serietilknytning" style={{ width: "90vw" }} size="small" key={key}>
            <ExpansionCard.Header>
              <ExpansionCard.Title>({productAgreements.length}) produkter uten serietilknytning</ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Tittel</Table.HeaderCell>
                    <Table.HeaderCell scope="col">HMS-nr</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {dtos.map((productAgreement) => {
                    return (
                      <Table.Row key={productAgreement.id}>
                        <Table.DataCell>{productAgreement.title}</Table.DataCell>
                        <Table.DataCell>{productAgreement.hmsArtNr}</Table.DataCell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </ExpansionCard.Content>
          </ExpansionCard>
        );
      })}
    </VStack>
  );
};
