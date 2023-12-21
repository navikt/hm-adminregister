import { PersonCrossIcon } from '@navikt/aksel-icons'
import { Button, ConfirmationPanel, Heading, Loader } from '@navikt/ds-react'
import React, { useState } from 'react'
import useSWR from 'swr'
import './slett-admin.scss'
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserDTO } from "../utils/response-types";
import { fetcherGET } from "../utils/swr-hooks";

const DeleteAdminUser = () => {
    const [searchParams] = useSearchParams()
    const userId = String(searchParams.get('_')) || ''
    const path = '/admreg/admin/api/v1/users/'
    const { data, error, isLoading } = useSWR<UserDTO>(userId ? path + userId : null, fetcherGET)

    if (!data || isLoading) return <Loader size="3xlarge" title="venter..."></Loader>

    return (
        <main>
            <div className="auth-page">
                <div className="auth-dialog-box__container">
                    <PersonCrossIcon title="Slette bruker" fontSize="1.5rem" />
                    <Heading spacing level="2" size="small" align="center">
                        Slette bruker
                    </Heading>
                    <DeleteUserForm user={data} />
                </div>
            </div>
        </main>
    )
}

export default DeleteAdminUser

const DeleteUserForm = ({ user }: { user: UserDTO }) => {
    const navigate = useNavigate()
    const [error, setError] = useState<Error | null>(null)
    const [showError, setShowError] = useState<boolean>(false)
    const [isLoading, setLoading] = useState(false)
    const [state, setState] = useState(false)

    async function onSubmit() {
        if (!state) {
            setShowError(true)
        } else if (state) {
            try {
                setLoading(true)
                const response = await fetch(`/admreg/admin/api/v1/users/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        accept: 'application/json',
                    },
                    credentials: 'include',
                })
                if (response.ok) {
                    navigate('/admin/profil')
                }

                if (!response.ok) {
                    throw Error('Error from post')
                }
                setLoading(false)
            } catch (e: any) {
                setError(e)
                setLoading(false)
            }
        }
    }

    if (isLoading) {
        return <Loader size="3xlarge" title="Sender..."></Loader>
    }

    return (
        <form className="form form--max-width-small" onSubmit={onSubmit}>
            <ConfirmationPanel
                checked={state}
                label="Jeg bekrefter at jeg vil slette denne adminbrukeren."
                onChange={() => {
                    setState((x) => !x)
                    if (state) {
                        setShowError(false)
                    }
                }}
                className="confirmation-panel-overwrite"
                error={showError && 'Du må bekrefte før du kan fortsette.'}
            >
                <Heading level="2" size="xsmall">
                    Bekrefte handling!
                </Heading>
                <p>
                    Admin-bruker <b>{user?.name}</b> med epost <b className="break">{user?.email}</b> blir slettet?
                </p>
            </ConfirmationPanel>

            <div className="button-container">
                <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
                    Avbryt
                </Button>
                <Button type="submit" size="medium">
                    Slett
                </Button>
            </div>
        </form>
    )
}
