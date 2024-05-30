import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";

const ChangePublishedProductAction = ({
  setEditProductModalIsOpen,
}: {
  setEditProductModalIsOpen: (newState: boolean) => void;
}) => {
  return (
    <HStack align={"end"} gap="2">
      <Dropdown>
        <Button variant="secondary" icon={<PencilWritingIcon title="Endre" />} as={Dropdown.Toggle}></Button>
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item onClick={() => setEditProductModalIsOpen(true)}>
              <TrashIcon aria-hidden />
              Endre produkt
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </HStack>
  );
};

export default ChangePublishedProductAction;
