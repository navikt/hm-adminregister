import React, { useState } from "react";
import useSWR from "swr";
import { Alert, BodyShort, Button, Dropdown, Heading, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { CogIcon } from "@navikt/aksel-icons";
import { FormProvider, useForm } from "react-hook-form";
import AboutTab from "./AboutTab";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import { deleteAgreement, publishAgreement, updateAgreementDescription } from "api/AgreementApi";
import { toReadableDateTimeString, toReadableString } from "utils/date-util";
import DelkontrakterTab from "./delkontraktliste/DelkontrakterTab";
import EditAgreementInfoModal from "./EditAgreementInfoModal";
import FileTab from "./vedlegg/FileTab";
import { WordWrappedHeading } from "felleskomponenter/styledcomponents/Heading";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import AgreementStatusTag from "agreements/agreement/AgreementStatusTag";

export type EditCommonInfoAgreement = {
  description: string;
};
const Agreement = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const activeTab = searchParams.get("tab");
  const { agreementId } = useParams();

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
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
  const [publiserRammeavtaleModalIsOpen, setPubliserRammeavtaleModalIsOpen] = useState<boolean>(false);

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

  const handlePublishRammeavtale = () => {
    setPubliserRammeavtaleModalIsOpen(false);
    publishAgreement(agreementId!)
      .then(() => {
        mutateAgreement();
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
    updateAgreementDescription(agreement!.id, data)
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
      <EditAgreementInfoModal
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
        confirmButtonText={"Slett"}
        variant={"danger"}
      />
      <ConfirmModal
        title={"Publiser rammeavtale"}
        text={`Er du sikker på at du vil publisere rammeavtale "${agreement?.title}"`}
        onClick={() => handlePublishRammeavtale()}
        onClose={() => setPubliserRammeavtaleModalIsOpen(false)}
        isModalOpen={publiserRammeavtaleModalIsOpen}
        confirmButtonText={"Publiser"}
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
                <DelkontrakterTab agreementId={agreement.id} agreementDraftStatus={agreement.draftStatus} />
              </Tabs>
            </VStack>

            <VStack gap={{ xs: "2", md: "4" }}>
              <Dropdown>
                <Button
                  className="fit-content"
                  variant="secondary"
                  icon={<CogIcon aria-hidden fontSize={"1.5rem"} />}
                  as={Dropdown.Toggle}
                  title="Endre eller slett"
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
                      disabled={agreement.draftStatus !== "DRAFT"}
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

              {isDraft && <PublishButton onClick={() => setPubliserRammeavtaleModalIsOpen(true)} />}
              <AgreementStatusTag publiseringsdato={agreement.published} isDraft={isDraft} />

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
export default Agreement;

const PublishButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button style={{ marginTop: "20px" }} onClick={onClick}>
      Publiser
    </Button>
  );
};
