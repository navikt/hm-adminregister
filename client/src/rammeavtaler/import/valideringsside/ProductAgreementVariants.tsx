import { ExpansionCard } from "@navikt/ds-react";
import { ProductAgreementsTable } from "rammeavtaler/import/valideringsside/ProductAgreementsTable";
import React from "react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";

interface Props {
  seriesUuid?: string;
  title?: string;
  variants: ProductAgreementRegistrationDTO[];
}

export const ProductAgreementVariants = ({ seriesUuid, title, variants }: Props) => {
  return (
    <ExpansionCard key={seriesUuid} aria-label="Produktserie med varianter" style={{ width: "90vw" }} size="small">
      <ExpansionCard.Header>
        <ExpansionCard.Title>
          {title} ({variants.length})
        </ExpansionCard.Title>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <ProductAgreementsTable productAgreements={variants} />
      </ExpansionCard.Content>
    </ExpansionCard>
  );
};
