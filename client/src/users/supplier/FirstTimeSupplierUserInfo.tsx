import { ComponentIcon } from "@navikt/aksel-icons";
import { Heading, Loader } from "@navikt/ds-react";
import { useUser } from "utils/swr-hooks";
import { useAuthStore } from "utils/store/useAuthStore";
import React from "react";
import FirstTimeUserInfoForm from "users/FirstTimeUserInfoForm";

const FirstTimeSupplierUserInfo = () => {
  const { loggedInUser } = useAuthStore();
  const { user, userIsLoading } = useUser(loggedInUser);

  //TODO: Mulig vi må gjøre noe tilsvarende her som i ConfirmSupplierInfo med loadingen
  if (userIsLoading) {
    return <Loader size="3xlarge" title="venter..."></Loader>;
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

        {user && <FirstTimeUserInfoForm user={user} isAdmin={false} />}
      </div>
    </main>
  );
};

export default FirstTimeSupplierUserInfo;
