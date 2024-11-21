import { Button, Heading, Loader, Table, VStack } from "@navikt/ds-react";
import { PencilWritingIcon, PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import React from "react";
import { SupplierDTO } from "utils/supplier-util";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { formatPhoneNumber } from "utils/string-util";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { deleteUser, useSupplierUsers } from "api/UserApi";

const SupplierUsers = ({ supplier }: { supplier: SupplierDTO }) => {
  const navigate = useNavigate();
  const { loggedInUser } = useAuthStore();
  const [confirmDeleteUserModalIsOpen, setConfirmDeleteUserModalIsOpen] = React.useState(false);
  const [userIdToDelete, setUserIdToDelete] = React.useState<string>("");

  const { users, isLoading, mutate } = useSupplierUsers(supplier.id);

  const handleCreateNewSupplierUser = () => {
    navigate(`/leverandor/opprett-bruker?suppid=${supplier.id}`, { state: supplier.name });
  };
  const handleDeleteUser = () => {
    deleteUser(userIdToDelete).then(() => {
      mutate();
    });

    setConfirmDeleteUserModalIsOpen(false);
  };

  if (isLoading) return <Loader />;

  if (!users) return null;

  return (
    <VStack gap="3">
      <ConfirmModal
        title={"Bekreft sletting av bruker"}
        confirmButtonText={"Slett bruker"}
        onClick={handleDeleteUser}
        onClose={() => setConfirmDeleteUserModalIsOpen(false)}
        isModalOpen={confirmDeleteUserModalIsOpen}
      />
      <Heading level="2" size="medium" spacing>
        Brukere
      </Heading>
      {users.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
              <Table.HeaderCell scope="col">Telefonnummer</Table.HeaderCell>
              <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.map((user, i) => (
              <Table.Row key={i}>
                <Table.DataCell>{user.name}</Table.DataCell>
                <Table.DataCell>{user.email}</Table.DataCell>
                <Table.DataCell>{user.attributes?.phone && formatPhoneNumber(user.attributes.phone)}</Table.DataCell>
                {loggedInUser?.isAdmin && (
                  <Table.DataCell>
                    <Button
                      title="Slette bruker"
                      variant="tertiary-neutral"
                      size="small"
                      icon={<TrashIcon aria-hidden />}
                      iconPosition="right"
                      onClick={() => {
                        setUserIdToDelete(user.id);
                        setConfirmDeleteUserModalIsOpen(true);
                      }}
                    >
                      Slette
                    </Button>
                  </Table.DataCell>
                )}
                <Table.DataCell>
                  {!loggedInUser?.isAdmin && loggedInUser?.userId === user.id && (
                    <Button
                      title="Redigere profil"
                      variant="tertiary-neutral"
                      size="small"
                      disabled={false}
                      icon={<PencilWritingIcon aria-hidden />}
                      iconPosition="right"
                      onClick={() => {
                        navigate("/profil/rediger-brukerprofil");
                      }}
                    />
                  )}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {loggedInUser?.isAdmin && (
        <Button
          className="fit-content"
          variant="secondary"
          size="small"
          icon={<PlusIcon aria-hidden />}
          iconPosition="left"
          onClick={handleCreateNewSupplierUser}
        >
          Legg til ny bruker
        </Button>
      )}
    </VStack>
  );
};

export default SupplierUsers;
