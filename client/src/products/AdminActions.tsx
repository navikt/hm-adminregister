import { CogIcon, ExclamationmarkTriangleIcon, FileSearchIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { publishProducts } from "api/ProductApi";
import { approveSeries } from "api/SeriesApi";
import { RejectApprovalModal } from "products/RejectApprovalModal";
import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import { ShowDiffModal } from "products/diff/ShowDiffModal";

const AdminActions = ({
  series,
  mutateSeries,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
}: {
  series: SeriesRegistrationDTOV2;
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
  const canSetExpiredStatus = series.status === "DONE" && series.isPublished;
  const [rejectApprovalModalIsOpen, setRejectApprovalModalIsOpen] = useState(false);

  const [showDiffModalIsOpen, setShowDiffModalIsOpen] = useState(false);

  const isPendingApproval = series.status === "PENDING_APPROVAL";

  async function onPublish() {
    setIsValid(productIsValid());
    if (productIsValid()) {
      approveSeries(series.id)
        .then(() => mutateSeries())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
      publishProducts(series.variants.map((variant) => variant.id) || []).catch((error) => {
        setGlobalError(error.status, error.message);
      });
    } else {
      setApprovalModalIsOpen(true);
    }
  }

  return (
    <HStack align={"end"} gap="2">
      <ShowDiffModal series={series} isOpen={showDiffModalIsOpen} setIsOpen={setShowDiffModalIsOpen} />
      <RejectApprovalModal
        series={series}
        mutateSeries={mutateSeries}
        isOpen={rejectApprovalModalIsOpen}
        setIsOpen={setRejectApprovalModalIsOpen}
      />
      {series.status === "EDITABLE" && (
        <Button
          style={{ marginTop: "20px" }}
          onClick={() => {
            setIsValid(productIsValid());
            setApprovalModalIsOpen(true);
          }}
        >
          Send til godkjenning
        </Button>
      )}
      {isPendingApproval && series.isPublished && (
        <Button
          onClick={() => {
            setShowDiffModalIsOpen(true);
          }}
          variant="secondary"
          icon={<FileSearchIcon fontSize="1.5rem" aria-hidden />}
        >
          Se endringer
        </Button>
      )}

      {isPendingApproval && <Button onClick={onPublish}>Publiser</Button>}
      {
        <Dropdown>
          <Button variant="secondary" icon={<CogIcon title="Avslå eller slett" />} as={Dropdown.Toggle}></Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              {isPendingApproval && (
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
                (series.isExpired ? (
                  <Dropdown.Menu.List.Item
                    onClick={() => setExpiredSeriesModalIsOpen({ open: true, newStatus: "ACTIVE" })}
                  >
                    Marker som aktiv
                  </Dropdown.Menu.List.Item>
                ) : (
                  <Dropdown.Menu.List.Item
                    onClick={() => setExpiredSeriesModalIsOpen({ open: true, newStatus: "INACTIVE" })}
                  >
                    Marker som utgått
                  </Dropdown.Menu.List.Item>
                ))}
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      }
    </HStack>
  );
};

export default AdminActions;
