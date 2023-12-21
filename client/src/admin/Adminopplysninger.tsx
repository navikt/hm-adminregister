import { ComponentIcon } from '@navikt/aksel-icons'
import { Heading, Loader } from '@navikt/ds-react'
import { useHydratedAuthStore } from "../utils/store/useAuthStore";
import { useUser } from "../utils/swr-hooks";
import FirstTimeUserInfoForm from "../components/forms/FirstTimeUserInfoForm";

const FirstTimeAdminInfo = () => {
    const { loggedInUser } = useHydratedAuthStore()
    const { user, userIsLoading } = useUser(loggedInUser)

    if (userIsLoading) {
        return <Loader size="3xlarge" title="venter..."></Loader>
    }

    return (
        <main>
            <div className="auth-page">
              <span className="logo-and-name-container">
                <ComponentIcon aria-hidden fontSize="3rem" />
                <Heading level="1" size="small" className="name">
                  <span>FinnHjelpemiddel</span>
                  <span>Admin</span>
                </Heading>
              </span>
                {user && <FirstTimeUserInfoForm user={user} isAdmin={true} />}
            </div>
        </main>
    )
}

export default FirstTimeAdminInfo
