import { Alert, Button, Heading, HGrid, Loader, Table, VStack } from "@navikt/ds-react";

import { PencilWritingIcon, PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { formatPhoneNumber } from "utils/string-util";
import { useAdminUsers, useUser } from "utils/swr-hooks";

export default function AdminProfil() {
  const navigate = useNavigate();
  const { loggedInUser } = useAuthStore();
  const { user, userError, userIsLoading } = useUser(loggedInUser);
  const { adminUsers, isLoading, error } = useAdminUsers();

  if (userIsLoading) {
    return <Loader size="3xlarge" title="Henter brukerinformasjon..."></Loader>;
  }

  const handleCreateNewAdminUser = () => {
    navigate("/admin/opprett-admin");
  };

  const handleDeleteAdminUser = (userId: string) => {
    navigate(`/admin/slett-admin?_=${userId}`);
  };

  if (!user) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Alert variant="info">Ingen bruker funnet, prøv å last inn på nytt</Alert>
      </HGrid>
    );
  }

  return (
    <main className="show-menu">
      <HGrid columns="minmax(16rem, 55rem)">
        <Heading level="1" size="large" spacing>
          Admin-profil
        </Heading>
        <VStack gap="10">
          Bruker med epostadresse {user.email} er innlogget med
          {` ${user.roles.includes("ROLE_ADMIN") ? "Admin" : "Supplier"} rolle!`}
          <Heading level="2" size="medium">
            Admin brukere
          </Heading>
          {adminUsers && adminUsers.length > 0 && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                  <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Telefonnummer</Table.HeaderCell>
                  <Table.HeaderCell scope="col" colSpan={2}>
                    Handling
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {adminUsers.map(
                  (user, i) =>
                    user.roles.includes("ROLE_ADMIN") && (
                      <Table.Row key={i}>
                        <Table.DataCell>{user.name}</Table.DataCell>
                        <Table.DataCell>{user.email}</Table.DataCell>
                        <Table.DataCell>
                          {user.attributes.phone && formatPhoneNumber(user?.attributes?.phone)}
                        </Table.DataCell>
                        <Table.DataCell>
                          {loggedInUser?.isAdmin && loggedInUser?.userId != user.id && (
                            <Button
                              title="Slette bruker"
                              variant="tertiary-neutral"
                              size="small"
                              disabled={false}
                              icon={<TrashIcon aria-hidden />}
                              iconPosition="right"
                              onClick={() => handleDeleteAdminUser(user.id)}
                            />
                          )}
                        </Table.DataCell>
                        <Table.DataCell>
                          {loggedInUser?.isAdmin && loggedInUser?.userId === user.id && (
                            <Button
                              title="Redigere profil"
                              variant="tertiary-neutral"
                              size="small"
                              disabled={false}
                              icon={<PencilWritingIcon aria-hidden />}
                              iconPosition="right"
                              onClick={() => {
                                navigate("/admin/rediger-admin");
                              }}
                            />
                          )}
                        </Table.DataCell>
                      </Table.Row>
                    ),
                )}
              </Table.Body>
            </Table>
          )}
          <Button
            variant="secondary"
            size="small"
            icon={<PlusIcon aria-hidden />}
            iconPosition="left"
            onClick={handleCreateNewAdminUser}
            className="fit-content"
          >
            Legg til ny adminbruker
          </Button>
        </VStack>
      </HGrid>
    </main>
  );
}
