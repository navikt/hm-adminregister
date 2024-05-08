import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { CogIcon, TrashIcon } from "@navikt/aksel-icons";

const SupplierActions = ({
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
}: {
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
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
            <Dropdown.Menu.List.Item onClick={() => setDeleteConfirmationModalIsOpen(true)}>
              <TrashIcon aria-hidden />
              Slett
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </HStack>
  );
};

export default SupplierActions;
