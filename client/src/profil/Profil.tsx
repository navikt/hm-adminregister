import { HGrid, Loader, VStack } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import SupplierInfo from "felleskomponenter/supplier/SupplierInfo";
import SupplierUsers from "felleskomponenter/supplier/SupplierUsers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { Supplier, SupplierUser, mapSupplier } from "utils/supplier-util";

export default function Profil() {
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier>();
  const [supplierUsers, setSupplierUsers] = useState<SupplierUser[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { loggedInUser } = useAuthStore();

  useEffect(() => {
    if (loggedInUser?.isAdmin) {
      navigate("/admin/profil");
    }

    setLoading(true);

    fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/supplier/registrations/`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setSupplier(mapSupplier(data));

        fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/users`, {
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
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <Loader size="3xlarge" title="Henter brukeropplysninger" />;
  if (error)
    return (
      <div>
        <span className="auth-dialog-box__error-message">{error?.message}</span>
      </div>
    );

  return (
    <main className="show-menu">
      <HGrid columns="minmax(16rem, 55rem)">
        {supplier && (
          <VStack gap="10">
            <SupplierInfo supplier={supplier} />
            <SupplierUsers users={supplierUsers} supplier={supplier} />
          </VStack>
        )}
      </HGrid>
    </main>
  );
}
