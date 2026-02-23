import { useState } from "react";

import {
  CogIcon,
  CogRotationIcon,
  ExclamationmarkTriangleIcon,
  FileSearchIcon,
  PencilIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import { Button, Dropdown, HStack, VStack } from "@navikt/ds-react";
import { approveSeries, setPublishedSeriesToDraft } from "api/SeriesApi";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { ShowDiffModal } from "products/diff/ShowDiffModal";
import { RejectApprovalModal } from "products/RejectApprovalModal";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesDTO } from "utils/types/response-types";

const AdminActions = ({
  series,
  mutateSeries,
  setIsValid,
  productIsValid,
  setApprovalModalIsOpen,
  setDeleteConfirmationModalIsOpen,
  setSwitchToPartModalIsOpen,
  setExpiredSeriesModalIsOpen,
}: {
  series: SeriesDTO;
  mutateSeries: () => void;
  setIsValid: (newState: boolean) => void;
  productIsValid: () => boolean;
  setApprovalModalIsOpen: (newState: boolean) => void;
  setSwitchToPartModalIsOpen: (newState: boolean) => void;
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
  const canSetExpiredStatus = series.status === "EDITABLE" && series.isPublished;
  const [rejectApprovalModalIsOpen, setRejectApprovalModalIsOpen] = useState(false);
  const [showDiffModalIsOpen, setShowDiffModalIsOpen] = useState(false);
  const [confirmApproveModalIsOpen, setConfirmApproveModalIsOpen] = useState<boolean>(false);
  const [editProductModalIsOpen, setEditProductModalIsOpen] = useState(false);

  const isPendingApproval = series.status === "PENDING_APPROVAL";

  async function onPublish() {
    setIsValid(productIsValid());
    if (productIsValid()) {
      approveSeries(series.id)
        .then(() => mutateSeries())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
      setConfirmApproveModalIsOpen(false);
    } else {
      setApprovalModalIsOpen(true);
    }
  }

  async function onSetToDraft() {
    setPublishedSeriesToDraft(series.id)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
    setEditProductModalIsOpen(false);
  }

  return (
    <VStack gap="2">
      <ConfirmModal
        title={"Vil du publisere produktet?"}
        text=""
        onClick={onPublish}
        onClose={() => {
          setConfirmApproveModalIsOpen(false);
        }}
        isModalOpen={confirmApproveModalIsOpen}
        confirmButtonText={"Publiser"}
        variant="primary"
      />
      <ConfirmModal
        title={"Vil du sette produktet i redigeringsmodus?"}
        text=""
        onClick={onSetToDraft}
        onClose={() => {
          setEditProductModalIsOpen(false);
        }}
        isModalOpen={editProductModalIsOpen}
        confirmButtonText={"OK"}
        variant="primary"
      />
      <ShowDiffModal series={series} isOpen={showDiffModalIsOpen} setIsOpen={setShowDiffModalIsOpen} />
      <RejectApprovalModal
        series={series}
        mutateSeries={mutateSeries}
        isOpen={rejectApprovalModalIsOpen}
        setIsOpen={setRejectApprovalModalIsOpen}
      />
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
      <HStack gap="2">
        {(series.status === "EDITABLE" || isPendingApproval) && (
          <Button
            style={{ flexGrow: 1 }}
            onClick={() => {
              setConfirmApproveModalIsOpen(true);
            }}
          >
            Publiser
          </Button>
        )}
        {
          <Dropdown>
            <Button variant="secondary" icon={<CogIcon title="Avslå eller slett" />} as={Dropdown.Toggle}></Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                {series.status !== "EDITABLE" && (
                  <Dropdown.Menu.List.Item onClick={() => setEditProductModalIsOpen(true)}>
                    Endre produkt
                    <PencilIcon aria-hidden />
                  </Dropdown.Menu.List.Item>
                )}
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
                <Dropdown.Menu.List.Item
                  onClick={() => setSwitchToPartModalIsOpen(true)}
                  disabled={series?.variants.length > 1}
                >
                  Endre til del {series?.variants.length > 1 ? `(krever at det kun er én variant)` : ""}
                  <CogRotationIcon aria-hidden />
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
    </VStack>
  );
};

export default AdminActions;
