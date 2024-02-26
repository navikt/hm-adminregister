import { Alert, Button, HGrid, Loader, Tabs, VStack } from "@navikt/ds-react";
import { AgreementPostDTO } from "utils/types/response-types";
import { useState } from "react";
import { Avstand } from "felleskomponenter/Avstand";
import NewDelkontraktModal from "./NewDelkontraktModal";
import { useProductVariantsByAgreementId } from "utils/swr-hooks";
import { Delkontrakt } from "../delkontraktdetaljer/Delkontrakt";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";

const DelkontrakterTab = ({
  posts,
  agreementId,
  mutateAgreement,
}: {
  posts: AgreementPostDTO[];
  agreementId: string;
  mutateAgreement: () => void;
}) => {
  const {
    data: delkontrakter,
    isLoading: delkontrakterIsLoading,
    mutate: mutateDelkontrakter,
  } = useProductVariantsByAgreementId(agreementId);
  const [nyRammeavtaleModalIsOpen, setNyRammeavtaleModalIsOpen] = useState(false);
  const isFirstTime = posts.length === 0;

  if (delkontrakterIsLoading)
    return (
      <Tabs.Panel value="delkontrakter" className="tab-panel">
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

      <Tabs.Panel value="delkontrakter" className="tab-panel">
        {isFirstTime && <Alert variant="info">Rammeavtalen trenger delkontrakter.</Alert>}
        {!isFirstTime && (
          <VStack gap="5">
            {posts.length > 0 &&
              posts.map((post, i) => (
                <HGrid columns="auto 60px">
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
                        onClick={() => {}}
                      />
                    )}
                    {i !== posts.length - 1 && (
                      <Button aria-label="sorter-ned" size={"small"} variant="tertiary" icon={<ChevronDownIcon />} />
                    )}
                  </VStack>
                </HGrid>
              ))}
          </VStack>
        )}
        <Avstand marginBottom={5} />
        <Button className="fit-content" variant="secondary" onClick={() => setNyRammeavtaleModalIsOpen(true)}>
          Legg til delkontrakt
        </Button>
      </Tabs.Panel>
    </>
  );
};

export default DelkontrakterTab;
