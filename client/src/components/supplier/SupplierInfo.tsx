import { Heading, VStack } from '@navikt/ds-react'
import { ArrowUndoIcon, Buldings3Icon } from '@navikt/aksel-icons'
import React from 'react'
import { Supplier } from '../../utils/supplier-util'
import { useAuthStore } from '../../utils/store/useAuthStore'
import DefinitionList from '../definition-list/DefinitionList'
import { formatPhoneNumber } from '../../utils/string-util'
import { Link } from 'react-router-dom'

const SupplierInfo = ({ supplier }: { supplier: Supplier }) => {
  const { loggedInUser } = useAuthStore()
  return (
    <VStack gap='8'>
      <VStack gap='6'>
        {loggedInUser?.isAdmin && (
          <Link className='supplier-profile__parent-page-link' to='/leverandor'>
            <ArrowUndoIcon title='Tilbake til oversikt' fontSize='1.5rem' />
            Tilbake til oversikt
          </Link>
        )}
        <Buldings3Icon title='leverandor' fontSize='2.5rem' aria-hidden />
        <Heading level='1' size='large'>
          {supplier?.name}
        </Heading>
      </VStack>
      <DefinitionList>
        <DefinitionList.Term>E-post</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.email}</DefinitionList.Definition>
        <DefinitionList.Term>Telefon</DefinitionList.Term>
        <DefinitionList.Definition>{supplier.phone && formatPhoneNumber(supplier.phone)}</DefinitionList.Definition>
        <DefinitionList.Term>Nettside</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.homepageUrl}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  )
}

export default SupplierInfo
