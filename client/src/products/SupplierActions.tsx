import { useNavigate } from "react-router-dom";

import { CogIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack, VStack } from "@navikt/ds-react";
import { exportProducts } from "api/ImportExportApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";

const SupplierActions = ({
  series,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
  setEditProductModalIsOpen,
}: {
  series: SeriesRegistrationDTOV2;
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
  const isEditable = series.status === "EDITABLE";
  const canSetExpiredStatus = series.status === "EDITABLE" && series.isPublished;
  const canSetToEditMode = series.status !== "EDITABLE";
  const isPendingApproval = series.status === "PENDING_APPROVAL";
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();

  const exportProductsForSupplier = () => {
    exportProducts(loggedInUser?.isAdmin || false, series.id).then((response) => {
      const bytes = new Uint8Array(response); // pass your byte response to this constructor
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <VStack gap="2">
      {/* Todo: legg inn "Se endringer" knapp */}
      <HStack gap="2">
        {isEditable && (
          <Button
            style={{ flexGrow: 1, paddingInline: "0.75rem" }}
            onClick={() => {
              setIsValid(productIsValid());
              setApprovalModalIsOpen(true);
            }}
          >
            Send til godkjenning
          </Button>
        )}

        {((isEditable && !series.isPublished) || canSetToEditMode || canSetExpiredStatus) && (
          <Dropdown>
            <Button variant="secondary" icon={<CogIcon title="Slett" />} as={Dropdown.Toggle}></Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                {isEditable && !series.isPublished && (
                  <Dropdown.Menu.List.Item
                    onClick={() => setDeleteConfirmationModalIsOpen(true)}
                    // disabled={isInAgreement && !supplierCanChangeAgreementProduct(loggedInUser)}
                  >
                    <TrashIcon aria-hidden />
                    Slett
                  </Dropdown.Menu.List.Item>
                )}
                {canSetToEditMode && (
                  <Dropdown.Menu.List.Item
                    onClick={() => setEditProductModalIsOpen(true)}
                    // disabled={isInAgreement && !supplierCanChangeAgreementProduct(loggedInUser)}
                  >
                    Endre produkt
                    <PencilIcon aria-hidden />
                  </Dropdown.Menu.List.Item>
                )}
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
                      // disabled={isInAgreement && !supplierCanChangeAgreementProduct(loggedInUser)}
                    >
                      Marker som utgått
                    </Dropdown.Menu.List.Item>
                  ))}
                {/*{isInAgreement && !supplierCanChangeAgreementProduct(loggedInUser) && (*/}
                {/*  <Dropdown.Menu.GroupedList.Heading style={{ fontSize: 14, color: "red", lineHeight: "1rem" }}>*/}
                {/*    Produkt er på avtale og må endres i Hjelpemiddeldatabasen per nå*/}
                {/*  </Dropdown.Menu.GroupedList.Heading>*/}
                {/*)}*/}
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.List.Item onClick={() => exportProductsForSupplier()}>
                  Eksporter varianter
                </Dropdown.Menu.List.Item>
                {!isPendingApproval && (
                  <Dropdown.Menu.List.Item onClick={() => navigate(`/produkt/${series.id}/importer-produkter`)}>
                    Importer varianter
                  </Dropdown.Menu.List.Item>
                )}
              </Dropdown.Menu.List>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </HStack>
    </VStack>
  );
};

export default SupplierActions;
