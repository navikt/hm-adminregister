import { Alert, Button, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { AgreementPostDTO } from "utils/types/response-types";
import { useState } from "react";
import { Avstand } from "felleskomponenter/Avstand";
import NewDelkontraktModal from "./NewDelkontraktModal";
import { useProductVariantsByAgreementId } from "utils/swr-hooks";
import { Delkontrakt } from "../delkontraktdetaljer/Delkontrakt";
import { ArrowsUpDownIcon, ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { reorderPosts } from "api/AgreementApi";
import styled from "styled-components";

const DelkontrakterTab = ({
  posts,
  agreementId,
  mutateAgreement,
}: {
  posts: AgreementPostDTO[];
  agreementId: string;
  mutateAgreement: () => void;
}) => {
  const reorderDelkontrakt = (post1: number, post2: number) => {
    reorderPosts(agreementId, post1, post2)
      .then((r) => {
        mutateAgreement();
      })
      .catch((_) => {});
  };

  const {
    data: delkontrakter,
    isLoading: delkontrakterIsLoading,
    mutate: mutateDelkontrakter,
  } = useProductVariantsByAgreementId(agreementId);
  const [nyRammeavtaleModalIsOpen, setNyRammeavtaleModalIsOpen] = useState(false);
  const isFirstTime = posts.length === 0;

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
        mutateAgreement={mutateAgreement}
        mutateDelkontrakter={mutateDelkontrakter}
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
              {posts.length > 0 &&
                posts.map((post, i) => (
                  <>
                    <Delkontrakt
                      key={i}
                      delkontrakt={post}
                      produkter={delkontrakter?.filter((produkt) => produkt.delkontraktNr === post.nr) || []}
                      agreementId={agreementId}
                      mutateDelkontrakter={mutateDelkontrakter}
                      mutateAgreement={mutateAgreement}
                    />
                    <VStack gap="1" style={{ alignItems: "center" }}>
                      {i !== 0 && (
                        <Button
                          aria-label="sorter-opp"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronUpIcon />}
                          onClick={() => {
                            reorderDelkontrakt(post.nr, posts[i - 1].nr);
                          }}
                        />
                      )}
                      {i !== posts.length - 1 && (
                        <Button
                          aria-label="sorter-ned"
                          size={"small"}
                          variant="tertiary"
                          icon={<ChevronDownIcon />}
                          onClick={() => {
                            reorderDelkontrakt(post.nr, posts[i + 1].nr);
                          }}
                        />
                      )}
                    </VStack>
                  </>
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
