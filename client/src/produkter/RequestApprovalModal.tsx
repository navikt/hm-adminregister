import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { sendFlereTilGodkjenning } from "api/ProductApi";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { RocketIcon } from "@navikt/aksel-icons";
import { numberOfImages } from "produkter/seriesUtils";
import { sendSeriesToApproval } from "api/SeriesApi";

export const RequestApprovalModal = ({
  series,
  products,
  mutateProducts,
  mutateSeries,
  isValid,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  mutateSeries: () => void;
  isValid: boolean;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  async function onSendTilGodkjenning() {
    sendSeriesToApproval(series.id).then(() => mutateSeries());
    sendFlereTilGodkjenning(products?.map((product) => product.id) || []).then(() => mutateProducts());
  }

  const InvalidProductModal = () => {
    return (
      <Modal open={isOpen} header={{ heading: "Produktet mangler data" }} onClose={() => setIsOpen(false)}>
        <Modal.Body>
          <BodyLong spacing>Det er noen feil som du må rette opp.</BodyLong>
          <BodyLong className="product-error-text">Vennligst rett opp følgende feil:</BodyLong>
          <ul className="product-error-text">
            {!products[0].productData.attributes.text && <li>Produktet mangler en produktbeskrivelse</li>}
            {numberOfImages(series) === 0 && <li>Produktet mangler bilder</li>}
            {series.count === 0 && <li>Produktet mangler teknisk data</li>}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const RequestApprovalModal = () => {
    return (
      <Modal
        open={isOpen}
        header={{ icon: <RocketIcon aria-hidden />, heading: "Klar for godkjenning?" }}
        onClose={() => setIsOpen(false)}
      >
        <Modal.Body>
          <BodyLong>Før du sender til godkjenning, sjekk at:</BodyLong>
          <ul>
            <li>produktbeskrivelsen ikke inneholder tekniske data eller salgsord.</li>
            <li>tekniske data er korrekte.</li>
            <li>produktet inneholder nødvendig brosjyre, bruksanvisning etc.</li>
          </ul>
          <BodyLong>
            <b>Obs:</b> produktet kan ikke endres i perioden det er lagt til godkjenning.
          </BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              onSendTilGodkjenning().then(() => setIsOpen(false));
            }}
          >
            Send til godkjenning
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return isValid ? <RequestApprovalModal /> : <InvalidProductModal />;
};
