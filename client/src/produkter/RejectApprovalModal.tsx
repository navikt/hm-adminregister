import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { rejectProducts } from "api/ProductApi";
import { Box, Button, Modal, Textarea } from "@navikt/ds-react";
import { rejectSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { useState } from "react";

export const RejectApprovalModal = ({
  series,
  products,
  mutateProducts,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();

  const [message, setMessage] = useState<string | null>(series.message ?? null);

  async function onRejectApproval(message: string | null) {
    rejectProducts(products?.map((product) => product.id) || [])
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
    rejectSeries(series.id, { message: message })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  return (
    <Modal open={isOpen} header={{ heading: "Avslå produkt" }} onClose={() => setIsOpen(false)}>
      <Box padding="4">
        <Textarea
          label="Melding til leverandør"
          description="Unngå personopplysninger i meldingen"
          value={message || ""}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Box>
      <Modal.Footer>
        <Button
          onClick={() => {
            onRejectApproval(message).then(() => setIsOpen(false));
          }}
        >
          Avslå
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
