import { Alert, Button, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { Fragment, useEffect, useState } from "react";
import { Avstand } from "felleskomponenter/Avstand";
import NewDelkontraktModal from "./NewDelkontraktModal";
import { useDelkontrakterByAgreementId } from "utils/swr-hooks";
import { Delkontrakt } from "../delkontraktdetaljer/Delkontrakt";
import { ArrowsUpDownIcon, ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { reorderPosts } from "api/AgreementApi";
import styled from "styled-components";

const DelkontrakterTab = ({ agreementId }: { agreementId: string }) => {
  const [newSortNr, setNewSortNr] = useState<number>(1);

  const reorderDelkontrakt = (post1: number, post2: number) => {
    reorderPosts(agreementId, post1, post2)
      .then((r) => {
        //mutateAgreement();
      })
      .catch((_) => {});
  };

  const {
    data: delkontrakter,
    isLoading: delkontrakterIsLoading,
    mutate: mutateDelkontrakter,
  } = useDelkontrakterByAgreementId(agreementId);

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
                  <Fragment key={i}>
                    <Delkontrakt
                      key={i}
                      delkontraktId={delkontrakt.id}
                      agreementId={agreementId}
                      mutateDelkontrakter={mutateDelkontrakter}
                    />
                    <VStack gap="1" style={{ alignItems: "center" }}>
                      {i !== 0 && (
                        <Button
                          aria-label="sorter-opp"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronUpIcon />}
                          onClick={() => {
                            reorderDelkontrakt(
                              delkontrakt.delkontraktData.sortNr,
                              delkontrakter![i - 1].delkontraktData.sortNr,
                            );
                          }}
                        />
                      )}
                      {i !== delkontrakter!.length - 1 && (
                        <Button
                          aria-label="sorter-ned"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronDownIcon />}
                          onClick={() => {
                            reorderDelkontrakt(
                              delkontrakt.delkontraktData.sortNr,
                              delkontrakter![i + 1].delkontraktData.sortNr,
                            );
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

export const DelkontrakterTabsPanel = styled(Tabs.Panel)`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;
