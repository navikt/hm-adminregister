import React, { useState } from "react";
import useSWR from "swr";
import { Alert, BodyShort, Button, Dropdown, Heading, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { CogIcon } from "@navikt/aksel-icons";
import { FormProvider, useForm } from "react-hook-form";
import AboutTab from "./AboutTab";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { AgreementRegistrationDTO } from "utils/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import { deleteAgreement, updateAgreementDescription } from "api/AgreementApi";
import { toDate, toReadableDateTimeString, toReadableString } from "utils/date-util";
import StatusTagAgreement from "../../components/StatusTagAgreement";
import DelkontrakterTab from "./delkontraktliste/DelkontrakterTab";
import EditRammeavtaleInfoModal from "./EditRammeavtaleInfoModal";
import FileTab from "./vedlegg/FileTab";
import { WordWrappedHeading } from "components/styledcomponents/Heading";
import ConfirmModal from "components/ConfirmModal";

export type EditCommonInfoAgreement = {
  description: string;
};
const AgreementPage = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const activeTab = searchParams.get("tab");
  const { agreementId } = useParams();

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useHydratedErrorStore();
  const agreementPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations/${agreementId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/agreement/registrations/${agreementId}`;

  const {
    data: agreement,
    error,
    isLoading,
    mutate: mutateAgreement,
  } = useSWR<AgreementRegistrationDTO>(loggedInUser ? agreementPath : null, fetcherGET);

  const [isEditAgreementModalOpen, setIsEditAgreementModalOpen] = React.useState<boolean>(false);

  const [slettRammeavtaleModalIsOpen, setSlettRammeavtaleModalIsOpen] = useState<boolean>(false);

  const handleSlettRammeavtale = () => {
    setSlettRammeavtaleModalIsOpen(false);
    navigate("/rammeavtaler");

    deleteAgreement(agreementId!)
      .then(() => {
        setSlettRammeavtaleModalIsOpen(false);
        mutateAgreement().then(() => {
          navigate("/rammeavtaler");
        });
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
  };
  const navigate = useNavigate();

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  const formMethods = useForm<EditCommonInfoAgreement>();

  async function onSubmit(data: EditCommonInfoAgreement) {
    updateAgreementDescription(agreement!!.id, data)
      .then((agreement) => mutateAgreement(agreement))
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  if (error) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        Error
      </HGrid>
    );
  }

  if (isLoading) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!agreement) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Alert variant="info">Ingen data funnet.</Alert>
      </HGrid>
    );
  }

  const isDraft = agreement.draftStatus === "DRAFT";

  return (
    <>
      <EditRammeavtaleInfoModal
        modalIsOpen={isEditAgreementModalOpen}
        agreement={agreement}
        setModalIsOpen={setIsEditAgreementModalOpen}
        mutateAgreement={mutateAgreement}
      />
      <ConfirmModal
        title={"Slett rammeavtale"}
        text={`Er du sikker på at du vil slette rammeavtale "${agreement?.title}"`}
        onClick={() => handleSlettRammeavtale()}
        onClose={() => setSlettRammeavtaleModalIsOpen(false)}
        isModalOpen={slettRammeavtaleModalIsOpen}
      />

      <main className="show-menu">
        <FormProvider {...formMethods}>
          <HGrid gap="12" columns={{ xs: 1, sm: "minmax(16rem, 55rem) 200px" }} className="agreement-page">
            <VStack gap={{ xs: "4", md: "8" }}>
              <WordWrappedHeading level="1" size="xlarge">
                {agreement.title ?? agreement.title}
              </WordWrappedHeading>
              <div>
                <div>
                  <b>Periode:</b> {toReadableString(agreement.published)} - {toReadableString(agreement.expired)}
                </div>
                <div>
                  <b>Anbudsnr:</b> {agreement.reference}
                </div>
              </div>
              <Tabs defaultValue={activeTab || "about"} onChange={updateUrlOnTabChange}>
                <Tabs.List>
                  <Tabs.Tab value="about" label="Om avtalen" />
                  <Tabs.Tab value="delkontrakter" label="Delkontrakter" />
                  <Tabs.Tab value="documents" label="Dokumenter" />
                </Tabs.List>
                <AboutTab agreement={agreement} onSubmit={onSubmit} />
                <FileTab agreement={agreement} mutateAgreement={mutateAgreement} />
                <DelkontrakterTab
                  mutateAgreement={mutateAgreement}
                  agreementId={agreement.id}
                  posts={agreement.agreementData.posts}
                />
              </Tabs>
            </VStack>

            <VStack gap={{ xs: "2", md: "4" }}>
              <Dropdown>
                <Button
                  className="fit-content"
                  variant="secondary"
                  icon={<CogIcon aria-hidden fontSize={"1.5rem"} />}
                  as={Dropdown.Toggle}
                ></Button>
                <Dropdown.Menu>
                  <Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.GroupedList.Item
                      onClick={() => {
                        setIsEditAgreementModalOpen(true);
                      }}
                    >
                      Endre rammeavtale
                    </Dropdown.Menu.GroupedList.Item>
                  </Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.Divider />
                  <Dropdown.Menu.List>
                    <Dropdown.Menu.List.Item
                      onClick={() => {
                        setSlettRammeavtaleModalIsOpen(true);
                      }}
                    >
                      Slett rammeavtale
                    </Dropdown.Menu.List.Item>
                  </Dropdown.Menu.List>
                </Dropdown.Menu>
              </Dropdown>
              <Heading level="1" size="small">
                Status
              </Heading>
              <StatusTagAgreement publiseringsdato={toDate(agreement.published)} isDraft={isDraft} />
              <div>
                <BodyShort>
                  <b>Opprettet</b>
                </BodyShort>
                {toReadableDateTimeString(agreement.created)}
              </div>
            </VStack>
          </HGrid>
        </FormProvider>
      </main>
    </>
  );
};
export default AgreementPage;
