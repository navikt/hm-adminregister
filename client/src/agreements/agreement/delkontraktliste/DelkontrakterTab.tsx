import { Alert, Button, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { Fragment, useEffect, useState } from "react";
import { Avstand } from "felleskomponenter/Avstand";
import NewDelkontraktModal from "./NewDelkontraktModal";
import { Delkontrakt } from "../delkontraktdetaljer/Delkontrakt";
import { ArrowsUpDownIcon, ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import styled from "styled-components";
import { reorderDelkontrakter } from "api/DelkontraktApi";
import { useDelkontrakterByAgreementId } from "utils/swr-hooks";

const DelkontrakterTab = ({
  agreementId,
  agreementDraftStatus,
  agreementExpireDate,
}: {
  agreementId: string;
  agreementDraftStatus: string;
  agreementExpireDate: string;
}) => {
  const [newSortNr, setNewSortNr] = useState<number>(1);

  const {
    data: delkontrakter,
    isLoading: delkontrakterIsLoading,
    mutate: mutateDelkontrakter,
  } = useDelkontrakterByAgreementId(agreementId);

  useEffect(() => {
    mutateDelkontrakter();
  }, [agreementExpireDate]);

  useEffect(() => {
    const newSortNr = delkontrakter?.length ? delkontrakter[delkontrakter.length - 1].delkontraktData.sortNr + 1 : 1;
    setNewSortNr(newSortNr);
  }, [delkontrakter]);

  const [nyRammeavtaleModalIsOpen, setNyRammeavtaleModalIsOpen] = useState(false);
  const isFirstTime = delkontrakter && delkontrakter.length === 0;

  if (delkontrakterIsLoading)
    return (
      <Tabs.Panel value="delkontrakter">
        <Loader size="large" />
      </Tabs.Panel>
    );

  const reorderDelkontrakt = (delkontrakt1Id: string, delkontrakt2Id: string) => {
    reorderDelkontrakter(delkontrakt1Id, delkontrakt2Id)
      .then((_) => {
        mutateDelkontrakter();
      })
      .catch((error) => {
        console.error("Reorder delkontrakt failed", error);
      });
  };

  return (
    <>
      <NewDelkontraktModal
        modalIsOpen={nyRammeavtaleModalIsOpen}
        setModalIsOpen={setNyRammeavtaleModalIsOpen}
        oid={agreementId}
        mutateDelkontrakter={mutateDelkontrakter}
        newSortNr={newSortNr}
      />

      <DelkontrakterTabsPanel value="delkontrakter">
        {isFirstTime && <Alert variant="info">Rammeavtalen trenger delkontrakter.</Alert>}
        {!isFirstTime && (
          <>
            <Avstand marginTop={3} />
            <HGrid columns="auto 60px" gap="5">
              <div />
              <div style={{ margin: "auto" }}>
                <ArrowsUpDownIcon aria-hidden={true} fontSize="1.5rem" />
              </div>
            </HGrid>
            <Avstand marginBottom={3} />
            <HGrid columns="auto 60px" gap="4">
              {delkontrakter!.length > 0 &&
                delkontrakter!.map((delkontrakt, i) => (
                  <Fragment key={delkontrakt.id}>
                    <Delkontrakt
                      key={delkontrakt.id}
                      delkontrakt={delkontrakt}
                      agreementDraftStatus={agreementDraftStatus}
                      mutateDelkontrakter={mutateDelkontrakter}
                      agreementExpireDate={agreementExpireDate}
                    />
                    <VStack gap="1" style={{ alignItems: "center" }}>
                      {i !== 0 && (
                        <Button
                          aria-label="sorter-opp"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronUpIcon title="Sorter opp" />}
                          onClick={() => {
                            reorderDelkontrakt(delkontrakt.id, delkontrakter![i - 1].id);
                          }}
                        />
                      )}
                      {i !== delkontrakter!.length - 1 && (
                        <Button
                          aria-label="sorter-ned"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronDownIcon title="Sorter ned" />}
                          onClick={() => {
                            reorderDelkontrakt(delkontrakt.id, delkontrakter![i + 1].id);
                          }}
                        />
                      )}
                    </VStack>
                  </Fragment>
                ))}
            </HGrid>
          </>
        )}
        <Avstand marginBottom={5} />
        <Button className="fit-content" variant="secondary" onClick={() => setNyRammeavtaleModalIsOpen(true)}>
          Legg til delkontrakt
        </Button>
      </DelkontrakterTabsPanel>
    </>
  );
};

export default DelkontrakterTab;

const DelkontrakterTabsPanel = styled(Tabs.Panel)`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;
