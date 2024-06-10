import { CogIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";

const SupplierActions = ({
  seriesIsPublished,
  seriesIsExpired,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
}: {
  seriesIsPublished: boolean;
  seriesIsExpired: boolean;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
  setExpiredSeriesModalIsOpen: (newState: boolean) => void;
}) => {
  return (
    <HStack align={"end"} gap="2">
      <Button
        style={{ marginTop: "20px" }}
        onClick={() => {
          setIsValid(productIsValid());
          setApprovalModalIsOpen(true);
        }}
      >
        Send til godkjenning
      </Button>

      <Dropdown>
        <Button variant="secondary" icon={<CogIcon title="Slett" />} as={Dropdown.Toggle}></Button>
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            {!seriesIsPublished && (
              <Dropdown.Menu.List.Item onClick={() => setDeleteConfirmationModalIsOpen(true)}>
                <TrashIcon aria-hidden />
                Slett
              </Dropdown.Menu.List.Item>
            )}
            {seriesIsPublished && (
              <Dropdown.Menu.List.Item disabled={seriesIsExpired} onClick={() => setExpiredSeriesModalIsOpen(true)}>
                Marker som utgått
              </Dropdown.Menu.List.Item>
            )}
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </HStack>
  );
};

export default SupplierActions;
