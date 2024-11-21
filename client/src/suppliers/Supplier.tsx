import { useEffect, useState } from "react";

import { HGrid, Loader, VStack } from "@navikt/ds-react";

import { activateSupplier, deactivateSupplier, getSupplier } from "api/SupplierApi";
import { useParams } from "react-router-dom";
import SupplierInfo from "suppliers/SupplierInfo";
import SupplierInventoryInfo from "suppliers/SupplierInventoryInfo";
import SupplierUsers from "suppliers/SupplierUsers";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { mapSupplier, SupplierDTO } from "utils/supplier-util";
import ConfirmModal from "felleskomponenter/ConfirmModal";

const Supplier = () => {
  const [supplier, setSupplier] = useState<SupplierDTO>();
  const [isLoading, setLoading] = useState(false);
  const { setGlobalError } = useErrorStore();
  const { loggedInUser } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenActivateSupplier, setIsOpenActivateSupplier] = useState(false);

  const { id } = useParams();

  const fetchSupplier = () => {
    setLoading(true);
    getSupplier(loggedInUser?.isAdmin ?? false, id!)
      .then((data) => {
        if (!data) return;
        setSupplier(mapSupplier(data));
      })
      .catch((error) => {
        setGlobalError(error);
      });

    setLoading(false);
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  async function onDeactivate() {
    setIsOpen(false);
    deactivateSupplier(loggedInUser?.isAdmin ?? true, supplier!.id)
      .then(() => fetchSupplier())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onActivate() {
    setIsOpenActivateSupplier(false);
    activateSupplier(loggedInUser?.isAdmin ?? true, supplier!.id)
      .then(() => fetchSupplier())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  if (isLoading || !supplier) return <Loader size="3xlarge" title="venter..." />;

  return (
    <main className="show-menu">
      <ConfirmModal
        title={"Er du sikker på at du vil deaktivere leverandøren?"}
        confirmButtonText={"Deaktiver"}
        onClick={onDeactivate}
        onClose={() => setIsOpen(false)}
        isModalOpen={isOpen}
      />
      <ConfirmModal
        title={"Er du sikker på at du vil aktivere leverandøren?"}
        confirmButtonText={"Aktiver"}
        onClick={onActivate}
        onClose={() => setIsOpenActivateSupplier(false)}
        isModalOpen={isOpenActivateSupplier}
      />
      <HGrid columns="minmax(16rem, 55rem)">
        {supplier && (
          <VStack gap="10">
            <SupplierInfo
              supplier={supplier}
              setIsOpen={setIsOpen}
              setIsOpenActivateSupplier={setIsOpenActivateSupplier}
            />
            <SupplierUsers supplier={supplier} />
            {loggedInUser?.isAdmin && <SupplierInventoryInfo supplier={supplier} />}
          </VStack>
        )}
      </HGrid>
    </main>
  );
};

export default Supplier;
