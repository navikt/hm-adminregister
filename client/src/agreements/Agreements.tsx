import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Button,
  Dropdown,
  Heading,
  HGrid,
  HStack,
  LinkPanel,
  Loader,
  Pagination,
  Search,
  Show,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";

import { useAgreements, usePagedAgreements } from "utils/swr-hooks";
import { AgreementGroupDto } from "utils/types/response-types";

export enum AgreementFilterOption {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  FUTURE = "FUTURE",
  EXPIRED = "EXPIRED",
}

const Agreements = () => {
  const [selectedFilterOption, setSelectedFilterOption] = useState<AgreementFilterOption>(AgreementFilterOption.ALL);
  const [pageState, setPageState] = useState(1);
  const pageSize = 10;
  const { data: allData, isLoading: allDataIsLoading, error: allError } = useAgreements();
  const {
    data: pagedData,
    isLoading,
    error: pagedError,
  } = usePagedAgreements({
    page: pageState - 1,
    pageSize,
    filter: selectedFilterOption,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<AgreementGroupDto | undefined>();
  const navigate = useNavigate();

  const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1 && searchTerm.length == 0;
  const inSearchMode = searchTerm.length > 0;

  if (allError || pagedError) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="error">
            Kunne ikke vise rammeavtaler. Prøv å laste siden på nytt, eller gå tilbake. Hvis problemet vedvarer, kan du
            sende oss en e-post{" "}
            <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
              digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
            </a>
          </Alert>
        </HGrid>
      </main>
    );
  }

  const handeFilterChange = (filter: AgreementFilterOption) => {
    setSelectedFilterOption(filter);
    setPageState(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredAgreements = allData?.content.filter((agreement) =>
      agreement.title.toLowerCase().includes(value.toLowerCase()),
    );
    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredAgreements);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <VStack gap="12" maxWidth="60rem">
          <Heading level="1" size="xlarge">
            Rammeavtaler
          </Heading>
          <VStack gap="4">
            <HGrid columns={{ xs: "1fr", lg: "5fr 6fr" }} gap="4">
              <form onSubmit={handleSubmit}>
                <Search
                  className="search-button"
                  label="Søk etter et produkt"
                  variant="simple"
                  clearButton={true}
                  placeholder="Søk etter rammeavtale"
                  size="medium"
                  value={searchTerm}
                  onChange={(value) => handleSearch(value)}
                />
              </form>
              <HGrid columns={{ xs: "1fr 32px", md: "1fr 48px", lg: "1fr 48px" }} gap="4">
                {!inSearchMode && (
                  <>
                    <Show above="md">
                      <ToggleGroup
                        value={selectedFilterOption}
                        onChange={(value) => handeFilterChange(value as AgreementFilterOption)}
                        defaultChecked={true}
                      >
                        <ToggleGroup.Item value={AgreementFilterOption.ALL} defaultChecked>
                          Alle
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.ACTIVE}>Aktive</ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.FUTURE}>Fremtidige</ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.EXPIRED}>Utgåtte</ToggleGroup.Item>
                      </ToggleGroup>
                    </Show>
                    <Show below="md">
                      <ToggleGroup
                        value={selectedFilterOption}
                        onChange={(value) => handeFilterChange(value as AgreementFilterOption)}
                        defaultChecked={true}
                        size="small"
                      >
                        <ToggleGroup.Item value={AgreementFilterOption.ALL} defaultChecked>
                          Alle
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.ACTIVE}>Aktive</ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.FUTURE}>Fremtidige</ToggleGroup.Item>
                        <ToggleGroup.Item value={AgreementFilterOption.EXPIRED}>Utgåtte</ToggleGroup.Item>
                      </ToggleGroup>
                    </Show>
                  </>
                )}
                {inSearchMode && <span> </span>}

                <Dropdown>
                  <>
                    <Show above="md">
                      <Button
                        variant="secondary"
                        icon={<MenuElipsisVerticalIcon title="Importer katalogfil" fontSize="1.5rem" />}
                        as={Dropdown.Toggle}
                      />
                    </Show>
                    <Show below="md">
                      <Button
                        variant="secondary"
                        icon={<MenuElipsisVerticalIcon title="Importer katalogfil" fontSize="1.5rem" />}
                        as={Dropdown.Toggle}
                        size="small"
                      />
                    </Show>
                  </>

                  <Dropdown.Menu>
                    <Dropdown.Menu.List>
                      <Dropdown.Menu.List.Item
                        onClick={() => {
                          navigate("/rammeavtaler/opprett");
                        }}
                      >
                        <PlusIcon aria-hidden />
                        Ny rammeavtale
                      </Dropdown.Menu.List.Item>
                      <Dropdown.Menu.List.Item
                        onClick={() => {
                          navigate("/rammeavtaler/importer-katalogfil");
                        }}
                      >
                        <FileExcelIcon aria-hidden />
                        Importer katalogfil
                      </Dropdown.Menu.List.Item>
                    </Dropdown.Menu.List>
                  </Dropdown.Menu>
                </Dropdown>
              </HGrid>
            </HGrid>

            {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
              <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
            ) : filteredData && filteredData.length > 0 ? (
              <div className="panel-list__container">
                {isLoading && <Loader size="3xlarge" title="venter..." />}
                {filteredData &&
                  filteredData.map((rammeavtale, i) => (
                    <>
                      <LinkPanel
                        onClick={() => navigate(`/rammeavtaler/${rammeavtale.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/rammeavtaler/${rammeavtale.id}`);
                          }
                        }}
                        className="panel-list__name-panel"
                        key={i}
                      >
                        <LinkPanel.Title className="panel-list__title panel-list__width">
                          {rammeavtale.title || "Ukjent produktnavn"}
                        </LinkPanel.Title>
                      </LinkPanel>
                    </>
                  ))}
              </div>
            ) : (
              <div className="panel-list__container">
                {isLoading && <Loader size="3xlarge" title="venter..." />}
                {pagedData?.content && pagedData?.content.length === 0 && (
                  <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
                )}
                {pagedData?.content &&
                  pagedData?.content.map((rammeavtale, i) => (
                    <LinkPanel
                      as={Link}
                      to={`/rammeavtaler/${rammeavtale.id}`}
                      className="panel-list__name-panel"
                      key={i}
                    >
                      <LinkPanel.Title className="panel-list__title panel-list__width">
                        {rammeavtale.title || "Ukjent avtalenavn"}
                      </LinkPanel.Title>
                    </LinkPanel>
                  ))}
              </div>
            )}

            {showPageNavigator && (
              <HStack marginBlock="2" justify="end">
                <Pagination page={pageState} onPageChange={(x) => setPageState(x)} count={pagedData.totalPages!} />
              </HStack>
            )}
          </VStack>
        </VStack>
      </div>
    </main>
  );
};
export default Agreements;
