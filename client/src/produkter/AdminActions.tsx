import {
  CogIcon,
  ExclamationmarkTriangleIcon,
  FileSearchIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { publishProducts } from "api/ProductApi";
import { approveSeries } from "api/SeriesApi";
import { RejectApprovalModal } from "produkter/RejectApprovalModal";
import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { ShowDiffModal } from "produkter/diff/ShowDiffModal";

const AdminActions = ({
  series,
  products,
  mutateProducts,
  mutateSeries,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  mutateSeries: () => void;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
  setExpiredSeriesModalIsOpen: ({
    open,
    newStatus,
  }: {
    open: boolean;
    newStatus: "ACTIVE" | "INACTIVE" | undefined;
  }) => void;
}) => {
  const { setGlobalError } = useErrorStore();
  const canSetExpiredStatus = series.draftStatus === "DONE" && !!series.published;
  const [rejectApprovalModalIsOpen, setRejectApprovalModalIsOpen] = useState(false);

  const [showDiffModalIsOpen, setShowDiffModalIsOpen] = useState(false);

  const isPending = series.adminStatus === "PENDING";
  const shouldPublish = series.adminStatus !== "APPROVED" && series.draftStatus === "DONE";
  const isPublished = series.published ?? false;

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
      <ShowDiffModal
        series={series}
        products={products}
        isOpen={showDiffModalIsOpen}
        setIsOpen={setShowDiffModalIsOpen}
      />
      <RejectApprovalModal
        series={series}
        products={products}
        mutateProducts={mutateProducts}
        mutateSeries={mutateSeries}
        isOpen={rejectApprovalModalIsOpen}
        setIsOpen={setRejectApprovalModalIsOpen}
      />
      {shouldPublish && isPublished && (
        <Button
          onClick={() => {
            setShowDiffModalIsOpen(true);
          }}
          variant="secondary"
          icon={<FileSearchIcon title="se endring" fontSize="1.5rem" />}
        >
          Se endringer
        </Button>
      )}

      {shouldPublish && <Button onClick={onPublish}>Publiser</Button>}
      <Dropdown>
        <Button variant="secondary" icon={<CogIcon title="Avslå eller slett" />} as={Dropdown.Toggle}></Button>
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            {isPending && shouldPublish && (
              <>
                <Dropdown.Menu.List.Item onClick={() => setRejectApprovalModalIsOpen(true)}>
                  Avslå
                  <ExclamationmarkTriangleIcon aria-hidden />
                </Dropdown.Menu.List.Item>
                <Dropdown.Menu.Divider />
              </>
            )}
            <Dropdown.Menu.List.Item onClick={() => setDeleteConfirmationModalIsOpen(true)}>
              Slett
              <TrashIcon aria-hidden />
            </Dropdown.Menu.List.Item>
            {canSetExpiredStatus &&
              (series.status === "ACTIVE" ? (
                <Dropdown.Menu.List.Item
                  onClick={() => setExpiredSeriesModalIsOpen({ open: true, newStatus: "INACTIVE" })}
                >
                  Marker som utgått
                </Dropdown.Menu.List.Item>
              ) : (
                <Dropdown.Menu.List.Item
                  onClick={() => setExpiredSeriesModalIsOpen({ open: true, newStatus: "ACTIVE" })}
                >
                  Marker som aktiv
                </Dropdown.Menu.List.Item>
              ))}
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </HStack>
  );
};

export default AdminActions;
