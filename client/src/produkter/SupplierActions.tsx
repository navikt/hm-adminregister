import { CogIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { SeriesRegistrationDTO } from "utils/types/response-types";

const SupplierActions = ({
  series,
  isAdmin,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
  setEditProductModalIsOpen,
}: {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
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
  setEditProductModalIsOpen: (newState: boolean) => void;
}) => {
  const canDelete = series.draftStatus === "DRAFT" || isAdmin;
  const canSetExpiredStatus = series.draftStatus === "DONE" && !!series.published;
  const canSetToEditMode =
    series.status !== "DELETED" && ((series.draftStatus === "DONE" && series.adminStatus !== "PENDING") || isAdmin);

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

      {(canDelete || canSetToEditMode || canSetExpiredStatus) && (
        <Dropdown>
          <Button variant="secondary" icon={<CogIcon title="Slett" />} as={Dropdown.Toggle}></Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              {canDelete && (
                <Dropdown.Menu.List.Item onClick={() => setDeleteConfirmationModalIsOpen(true)}>
                  <TrashIcon aria-hidden />
                  Slett
                </Dropdown.Menu.List.Item>
              )}
              {canSetToEditMode && (
                <Dropdown.Menu.List.Item onClick={() => setEditProductModalIsOpen(true)}>
                  Endre produkt
                  <PencilIcon aria-hidden />
                </Dropdown.Menu.List.Item>
              )}
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
      )}
    </HStack>
  );
};

export default SupplierActions;
