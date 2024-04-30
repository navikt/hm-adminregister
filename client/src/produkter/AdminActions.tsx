import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { CogIcon, ExclamationmarkTriangleIcon, TrashIcon } from "@navikt/aksel-icons";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { publishProducts, rejectProducts } from "api/ProductApi";

const AdminActions = ({
  products,
  mutateProducts,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
}: {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
}) => {
  const isPending = products[0].adminStatus === "PENDING";
  const shouldPublish = products[0].adminStatus !== "APPROVED";

  async function onRejectApproval() {
    rejectProducts(products?.map((product) => product.id) || []).then(() => mutateProducts());
  }

  async function onPublish() {
    setIsValid(productIsValid());
    if (productIsValid()) {
      publishProducts(products?.map((product) => product.id) || []).then(() => mutateProducts());
    } else {
      setApprovalModalIsOpen(true);
    }
  }

  return (
    <HStack align={"end"} gap="2">
      {shouldPublish && (
        <Button style={{ marginTop: "20px" }} onClick={onPublish}>
          Publiser
        </Button>
      )}
      <Dropdown>
        <Button variant="secondary" icon={<CogIcon title="Avslå eller slett" />} as={Dropdown.Toggle}></Button>
        <Dropdown.Menu>
          {isPending && (
            <>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item onClick={onRejectApproval}>
                  <ExclamationmarkTriangleIcon aria-hidden />
                  Avslå
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
              <Dropdown.Menu.Divider />
            </>
          )}
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

export default AdminActions;
