import { CogIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack } from "@navikt/ds-react";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { useEffect } from "react";

const SupplierActions = ({
  series,
  setIsValid,
  productIsValid,
  isInAgreement,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
  setEditProductModalIsOpen,
}: {
  series: SeriesRegistrationDTO;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  isInAgreement: boolean;
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
  const isDraft = series.draftStatus === "DRAFT";
  const canSetExpiredStatus = series.draftStatus === "DONE" && !!series.published;
  const canSetToEditMode =
    series.status !== "DELETED" && series.draftStatus === "DONE" && series.adminStatus !== "PENDING";

  return (
    <HStack align={"end"} gap="2">
      {isDraft && (
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

      {((isDraft && !series.published) || canSetToEditMode || canSetExpiredStatus) && (
        <Dropdown>
          <Button variant="secondary" icon={<CogIcon title="Slett" />} as={Dropdown.Toggle}></Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              {isDraft && !series.published && (
                <Dropdown.Menu.List.Item
                  onClick={() => setDeleteConfirmationModalIsOpen(true)}
                  disabled={isInAgreement}
                >
                  <TrashIcon aria-hidden />
                  Slett
                </Dropdown.Menu.List.Item>
              )}
              {canSetToEditMode && (
                <Dropdown.Menu.List.Item onClick={() => setEditProductModalIsOpen(true)} disabled={isInAgreement}>
                  Endre produkt
                  <PencilIcon aria-hidden />
                </Dropdown.Menu.List.Item>
              )}
              {canSetExpiredStatus &&
                (series.status === "ACTIVE" ? (
                  <Dropdown.Menu.List.Item
                    onClick={() => setExpiredSeriesModalIsOpen({ open: true, newStatus: "INACTIVE" })}
                    disabled={isInAgreement}
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
              {isInAgreement && (
                <Dropdown.Menu.GroupedList.Heading style={{ fontSize: 14, color: "red", lineHeight: "1rem" }}>
                  Produkt er på avtale og må endres i Hjelpemiddeldatabasen per nå
                </Dropdown.Menu.GroupedList.Heading>
              )}
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </HStack>
  );
};

export default SupplierActions;
