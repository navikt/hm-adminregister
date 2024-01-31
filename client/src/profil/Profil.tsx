import React, { useEffect, useState } from 'react'
import { HGrid, Loader, VStack } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import { mapSupplier, Supplier, SupplierUser } from '../utils/supplier-util'
import { useAuthStore } from '../utils/store/useAuthStore'
import SupplierInfo from '../components/supplier/SupplierInfo'
import SupplierUsers from '../components/supplier/SupplierUsers'
import { HM_REGISTER_URL } from '../environments'

export default function Profil() {
  const [error, setError] = useState<Error | null>(null)
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState<Supplier>()
  const [supplierUsers, setSupplierUsers] = useState<SupplierUser[]>([])
  const [isLoading, setLoading] = useState(false)
  const { loggedInUser } = useAuthStore()

  useEffect(() => {
    if (loggedInUser?.isAdmin) {
      navigate('/admin/profil')
    }

    setLoading(true)

    fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/supplier/registrations/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        setSupplier(mapSupplier(data))

        fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/users`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
          .then((res) => {
            return res.json()
          })
          .then((data) => {
            setSupplierUsers(data)
            setLoading(false)
          })
      })
      .catch((e) => {
        setError(e)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <Loader size='3xlarge' title='Henter brukeropplysninger' />
  if (error)
    return (
      <div>
        <span className='auth-dialog-box__erorr-message'>{error?.message}</span>
      </div>
    )

  return (
    <main className='show-menu'>
      <HGrid columns='minmax(16rem, 55rem)'>
        {supplier && (
          <VStack gap='10'>
            <SupplierInfo supplier={supplier} />
            <SupplierUsers users={supplierUsers} supplier={supplier} />
          </VStack>
        )}
      </HGrid>
    </main>
  )
}
