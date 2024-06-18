import { CogIcon, ExclamationmarkTriangleIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { publishProducts } from "api/ProductApi";
import { approveSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { RejectApprovalModal } from "produkter/RejectApprovalModal";
import { useState } from "react";

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
  const [rejectApprovalModalIsOpen, setRejectApprovalModalIsOpen] = useState(false);

  const isPending = series.adminStatus === "PENDING";
  const shouldPublish = series.adminStatus !== "APPROVED" && series.draftStatus === "DONE";

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
      <RejectApprovalModal
        series={series}
        products={products}
        mutateProducts={mutateProducts}
        mutateSeries={mutateSeries}
        isOpen={rejectApprovalModalIsOpen}
        setIsOpen={setRejectApprovalModalIsOpen}
      />
      {shouldPublish && (
        <Button style={{ marginTop: "20px" }} onClick={onPublish}>
          Publiser
        </Button>
      )}
      <Dropdown>
        <Button variant="secondary" icon={<CogIcon title="Avslå eller slett" />} as={Dropdown.Toggle}></Button>
        <Dropdown.Menu>
          {isPending && shouldPublish && (
            <>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item onClick={() => setRejectApprovalModalIsOpen(true)}>
                  Avslå
                  <ExclamationmarkTriangleIcon aria-hidden />
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
              <Dropdown.Menu.Divider />
            </>
          )}
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item onClick={() => setDeleteConfirmationModalIsOpen(true)}>
              Slett
              <TrashIcon aria-hidden />
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </HStack>
  );
};

export default AdminActions;
