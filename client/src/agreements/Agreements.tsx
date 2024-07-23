import React, { useState } from "react";
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
  ToggleGroup,
} from "@navikt/ds-react";
import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from "@navikt/aksel-icons";
import { useAgreements, usePagedAgreements } from "utils/swr-hooks";
import { AgreementGroupDto } from "utils/types/response-types";
import { Link, useNavigate } from "react-router-dom";

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
        <Heading level="1" size="large" spacing>
          Rammeavtaler
        </Heading>

        <div className="page__content-container">
          <HStack wrap gap="4">
            <form className="search-box" onSubmit={handleSubmit}>
              <Search
                className="search-button"
                label="Søk etter et produkt"
                variant="primary"
                clearButton={true}
                placeholder="Søk etter rammeavtale"
                size="medium"
                value={searchTerm}
                onChange={(value) => handleSearch(value)}
              />
            </form>
            <HStack gap="1">
              <Dropdown>
                <Button
                  variant="tertiary"
                  icon={<MenuElipsisVerticalIcon title="Importer katalogfil" fontSize="1.5rem" />}
                  as={Dropdown.Toggle}
                />
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
            </HStack>
          </HStack>

          {!inSearchMode && (
            <ToggleGroup
              value={selectedFilterOption}
              onChange={(value) => handeFilterChange(value as AgreementFilterOption)}
              size="small"
              defaultChecked={true}
            >
              <ToggleGroup.Item value={AgreementFilterOption.ALL} defaultChecked>
                Alle
              </ToggleGroup.Item>
              <ToggleGroup.Item value={AgreementFilterOption.ACTIVE}>Aktive</ToggleGroup.Item>
              <ToggleGroup.Item value={AgreementFilterOption.FUTURE}>Fremtidige</ToggleGroup.Item>
              <ToggleGroup.Item value={AgreementFilterOption.EXPIRED}>Utgåtte</ToggleGroup.Item>
            </ToggleGroup>
          )}

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
            <Pagination
              page={pageState}
              onPageChange={(x) => setPageState(x)}
              count={pagedData.totalPages!}
              size="small"
              prevNextTexts
            />
          )}
        </div>
      </div>
    </main>
  );
};
export default Agreements;
