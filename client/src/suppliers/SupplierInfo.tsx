import { BodyShort, Button, Heading, HStack, VStack } from "@navikt/ds-react";
import { ArrowUndoIcon, Buldings3Icon, PencilWritingIcon } from "@navikt/aksel-icons";
import { SupplierDTO } from "utils/supplier-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { formatPhoneNumber } from "utils/string-util";
import { Link, useNavigate } from "react-router-dom";
import styles from "./SupplierInfo.module.scss";

const SupplierInfo = ({ supplier, setIsOpen }: { supplier: SupplierDTO; setIsOpen: (newState: boolean) => void }) => {
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();
  return (
    <VStack gap="8">
      <VStack gap="6">
        {loggedInUser?.isAdmin && (
          <Link className="supplier-info__parent-page-link" to="/leverandor">
            <ArrowUndoIcon fontSize="1.5rem" aria-hidden />
            Tilbake til oversikt
          </Link>
        )}
        <Buldings3Icon title="leverandor" fontSize="2.5rem" aria-hidden />
        <Heading level="1" size="large">
          {supplier?.name}
        </Heading>
        {supplier?.status === "INACTIVE" && <BodyShort>(INAKTIV)</BodyShort>}
      </VStack>
      <dl className={styles.descriptionList}>
        <dt>E-post</dt>
        <dd>{supplier?.email}</dd>
        <dt>Telefon</dt>
        <dd>{supplier.phone && formatPhoneNumber(supplier.phone)}</dd>
        <dt>Nettside</dt>
        <dd>{supplier?.homepageUrl}</dd>
      </dl>
      <HStack gap="4">
        {loggedInUser?.isAdmin && (
          <Button
            className="fit-content"
            variant="secondary"
            size="small"
            icon={<PencilWritingIcon aria-hidden />}
            iconPosition="left"
            onClick={() => {
              navigate(`/leverandor/endre-leverandor/${supplier.id}`);
            }}
          >
            Endre leverandørinformasjon
          </Button>
        )}
        {loggedInUser?.isAdmin && supplier.status === "ACTIVE" && (
          <Button
            className="fit-content"
            variant="secondary"
            size="small"
            icon={<PencilWritingIcon aria-hidden />}
            iconPosition="left"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Deaktiver leverandør
          </Button>
        )}
      </HStack>
    </VStack>
  );
};

export default SupplierInfo;
