import { ExpansionCard, HStack, Tag } from "@navikt/ds-react";
import { ProductAgreementsTable } from "agreements/import/valideringsside/ProductAgreementsTable";
import React from "react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";

interface Props {
  seriesUuid?: string;
  title?: string;
  accessory: boolean;
  sparePart: boolean;
  newProduct: boolean;
  variants: ProductAgreementRegistrationDTO[];
}

export const ProductAgreementVariants = ({ seriesUuid, title, variants, accessory, sparePart, newProduct }: Props) => {
  return (
    <ExpansionCard key={seriesUuid} aria-label="Produktserie med varianter" style={{ width: "90vw" }} size="small">
      <ExpansionCard.Header>
        <ExpansionCard.Title>
          <HStack gap="2">
            {title} ({variants.length})
            {newProduct ? <Tag variant="success">Nytt produkt</Tag> : <Tag variant="alt2">Eksisterende produkt</Tag>}
            <Tag variant={"info"}>{accessory ? "Tilbehør" : sparePart ? "Reservedel" : "Hovedprodukt"}</Tag>
          </HStack>
        </ExpansionCard.Title>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <ProductAgreementsTable productAgreements={variants} />
      </ExpansionCard.Content>
    </ExpansionCard>
  );
};
