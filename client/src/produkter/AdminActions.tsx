import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { CogIcon, ExclamationmarkTriangleIcon, TrashIcon } from "@navikt/aksel-icons";
import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { publishProducts, rejectProducts } from "api/ProductApi";
import { approveSeries, rejectSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";

const AdminActions = ({
  series,
  products,
  mutateProducts,
  mutateSeries,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  mutateSeries: () => void;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();
  const isPending = products[0].adminStatus === "PENDING";
  const shouldPublish = products[0].adminStatus !== "APPROVED";

  async function onRejectApproval() {
    rejectProducts(products?.map((product) => product.id) || [])
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
    rejectSeries(series.id)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  async function onPublish() {
    setIsValid(productIsValid());
    if (productIsValid()) {
      publishProducts(products?.map((product) => product.id) || [])
        .then(() => mutateProducts())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
      approveSeries(series.id)
        .then(() => mutateSeries())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
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
