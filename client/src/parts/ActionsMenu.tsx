import { useNavigate } from "react-router-dom";

import { CogIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, HStack, VStack } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { SeriesDTO } from "utils/types/response-types";

const ActionsMenu = ({
  series,
  setDeleteConfirmationModalIsOpen,
  setExpiredSeriesModalIsOpen,
  setEditProductModalIsOpen,
  setConfirmApproveModalIsOpen,
  partIsValid,
}: {
  series: SeriesDTO;
  setDeleteConfirmationModalIsOpen: (newState: boolean) => void;
  setExpiredSeriesModalIsOpen: ({
    open,
    newStatus,
  }: {
    open: boolean;
    newStatus: "ACTIVE" | "INACTIVE" | undefined;
  }) => void;
  setEditProductModalIsOpen: (newState: boolean) => void;
  setConfirmApproveModalIsOpen: (newState: boolean) => void;
  partIsValid: () => boolean;
}) => {
  const isEditable = series.status === "EDITABLE";
  const canSetExpiredStatus = series.status === "EDITABLE" && series.isPublished;
  const canSetToEditMode = series.status !== "EDITABLE";
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = loggedInUser?.isAdmin || false;

  return (
    <VStack gap="2">
      <HStack gap="2">
        {isEditable &&(
          <Button
            style={{ flexGrow: 1, paddingInline: "0.75rem" }}
            onClick={() => {
              setConfirmApproveModalIsOpen(true);
            }}
          >
            Publiser
          </Button>
        )}

        {((isEditable && !series.isPublished) || canSetToEditMode ) && (
          <Dropdown>
            <Button variant="secondary" icon={<CogIcon title="Handlinger" />} as={Dropdown.Toggle}></Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                {(isEditable && !series.isPublished || isAdmin) && (
                  <Dropdown.Menu.List.Item
                    onClick={() => setDeleteConfirmationModalIsOpen(true)}
                  >
                    <TrashIcon aria-hidden />
                    Slett
                  </Dropdown.Menu.List.Item>
                )}
                {canSetToEditMode && (
                  <Dropdown.Menu.List.Item
                    onClick={() => setEditProductModalIsOpen(true)}
                  >
                    Endre del
                    <PencilIcon aria-hidden />
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

export default ActionsMenu;
