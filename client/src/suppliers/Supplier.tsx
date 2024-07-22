import { useEffect, useState } from "react";

import { HGrid, Loader, VStack } from "@navikt/ds-react";

import "./supplier-info.scss";
import { mapSupplier, SupplierDTO, SupplierUser } from "utils/supplier-util";
import { useParams } from "react-router-dom";
import { HM_REGISTER_URL } from "environments";
import SupplierInfo from "suppliers/SupplierInfo";
import SupplierUsers from "suppliers/SupplierUsers";
import { useErrorStore } from "utils/store/useErrorStore";
import { useAuthStore } from "utils/store/useAuthStore";
import { DeactivateSupplierConfirmationModal } from "suppliers/DeactivateSupplierConfirmationModal";
import { getSupplier } from "api/SupplierApi";
import SupplierInventoryInfo from "suppliers/SupplierInventoryInfo";

const Supplier = () => {
  const [supplier, setSupplier] = useState<SupplierDTO>();
  const [supplierUsers, setSupplierUsers] = useState<SupplierUser[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { setGlobalError } = useErrorStore();
  const { loggedInUser } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);

  const { id } = useParams();

  const fetchSupplier = () => {
    setLoading(true);
    getSupplier(loggedInUser?.isAdmin ?? false, id!)
      .then((data) => {
        if (!data) return;
        setSupplier(mapSupplier(data));
        if (data) {
          fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/users/supplierId/` + id, {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              setSupplierUsers(data);
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        setGlobalError(error);
      });

    setLoading(false);
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  if (isLoading || !supplier) return <Loader size="3xlarge" title="venter..." />;

  return (
    <main className="show-menu">
      <DeactivateSupplierConfirmationModal
        supplier={supplier}
        mutateSupplier={fetchSupplier}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <HGrid columns="minmax(16rem, 55rem)">
        {supplier && (
          <VStack gap="10">
            <SupplierInfo supplier={supplier} setIsOpen={setIsOpen} />
            <SupplierUsers users={supplierUsers} supplier={supplier} />
            <SupplierInventoryInfo supplier={supplier} />
          </VStack>
        )}
      </HGrid>
    </main>
  );
};

export default Supplier;
