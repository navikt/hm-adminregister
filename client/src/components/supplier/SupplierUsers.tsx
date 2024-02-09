import { Button, Heading, Table, VStack } from '@navikt/ds-react'
import { PencilWritingIcon, PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import React from 'react'
import { Supplier, SupplierUser } from 'utils/supplier-util'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from 'utils/store/useAuthStore'
import { formatPhoneNumber } from 'utils/string-util'

const SupplierUsers = ({ users, supplier }: { users: SupplierUser[]; supplier: Supplier }) => {
  const navigate = useNavigate()
  const { loggedInUser } = useAuthStore()
  const handleCreateNewSupplierUser = () => {
    navigate(`/leverandor/opprett-bruker?suppid=${supplier.id}`)
  }
  return (
    <VStack gap='3'>
      <Heading level='2' size='medium' spacing>
        Brukere
      </Heading>
      {users.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope='col'>Navn</Table.HeaderCell>
              <Table.HeaderCell scope='col'>E-post</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Telefonnummer</Table.HeaderCell>
              <Table.HeaderCell scope='col'>Handling</Table.HeaderCell>
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
                      title='Slette bruker'
                      variant='tertiary-neutral'
                      size='small'
                      disabled={true}
                      icon={<TrashIcon aria-hidden />}
                      iconPosition='right'
                      onClick={() => {
                      }}
                    >
                      Slette
                    </Button>
                  </Table.DataCell>
                )}
                <Table.DataCell>
                  {!loggedInUser?.isAdmin && loggedInUser?.userId === user.id && (
                    <Button
                      title='Redigere profil'
                      variant='tertiary-neutral'
                      size='small'
                      disabled={false}
                      icon={<PencilWritingIcon aria-hidden />}
                      iconPosition='right'
                      onClick={() => {
                        navigate('/profil/rediger-brukerprofil')
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
          className='fit-content'
          variant='secondary'
          size='small'
          icon={<PlusIcon aria-hidden />}
          iconPosition='left'
          onClick={handleCreateNewSupplierUser}
        >
          Legg til ny bruker
        </Button>
      )}
    </VStack>
  )
}

export default SupplierUsers
