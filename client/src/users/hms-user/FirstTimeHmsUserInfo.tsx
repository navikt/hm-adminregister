import { ComponentIcon } from "@navikt/aksel-icons";
import { Heading, Loader } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useUser } from "utils/swr-hooks";
import FirstTimeUserInfoForm from "users/FirstTimeUserInfoForm";

const FirstTimeHmsUSerInfo = () => {
  const { loggedInUser } = useAuthStore();
  const { user, userIsLoading } = useUser(loggedInUser);

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
            <span>HMS-bruker</span>
          </Heading>
        </span>
        {user && <FirstTimeUserInfoForm user={user} isAdmin={false} isHmsUser={true} />}
      </div>
    </main>
  );
};

export default FirstTimeHmsUSerInfo;
