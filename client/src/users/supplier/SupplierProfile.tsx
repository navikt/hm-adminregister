import {Button, HGrid, Loader, VStack} from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import SupplierInfo from "suppliers/SupplierInfo";
import SupplierUsers from "suppliers/SupplierUsers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { mapSupplier, SupplierDTO, SupplierUser } from "utils/supplier-util";
import {PlusIcon} from "@navikt/aksel-icons";

export default function SupplierProfile() {
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDTO>();
  const [isLoading, setLoading] = useState(false);
  const { loggedInUser } = useAuthStore();

  const { setGlobalError } = useErrorStore();

  const handleCreateNewSupplierUser = () => {
    navigate(`/leverandor/opprett-bruker?suppid=${supplier?.id}`, { state: supplier?.name });
  };

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
        if (!res.ok) setGlobalError(res.status, res.statusText);
        else return res.json();
      })
      .then((data) => {
        if (!data) return;
        setSupplier(mapSupplier(data));
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, [setGlobalError]);

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
          <VStack gap="space-12">
            <SupplierInfo supplier={supplier} setIsOpen={() => {}} setIsOpenActivateSupplier={() => {}} />
            <SupplierUsers supplier={supplier} />
            <Button
                variant="secondary"
                size="small"
                icon={<PlusIcon aria-hidden />}
                iconPosition="left"
                onClick={handleCreateNewSupplierUser}
                className="fit-content"
            >
              Opprett bruker
            </Button>
          </VStack>
        )}
      </HGrid>
    </main>
  );
}
