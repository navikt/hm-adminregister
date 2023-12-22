import React, { useEffect, useState } from 'react'

import { Loader, HGrid, VStack } from '@navikt/ds-react'

import './supplier-profile.scss'
import { mapSupplier, Supplier, SupplierUser } from "../utils/supplier-util";
import SupplierInfo from "../components/supplier/SupplierInfo";
import SupplierUsers from "../components/supplier/SupplierUsers";
import { useParams } from "react-router-dom";
import { HM_REGISTER_URL } from "../environments";

const LeverandørProfil = () => {
    const [error, setError] = useState<Error | null>(null)
    const [supplier, setSupplier] = useState<Supplier>()
    const [supplierUsers, setSupplierUsers] = useState<SupplierUser[]>([])
    const [isLoading, setLoading] = useState(false)

    const { id } = useParams()

    useEffect(() => {
        setLoading(true)
        fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/supplier/registrations/` + id, {
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
                if (data) {
                    fetch(`${HM_REGISTER_URL}/admreg/admin/api/v1/users/supplierId/` + id, {
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
                }
            })
            .catch((e) => {
                setError(e)
                setLoading(false)
            })

        setLoading(false)
    }, [id])

    if (isLoading) return <Loader size="3xlarge" title="venter..." />

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
    )
}

export default LeverandørProfil
