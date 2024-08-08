import "./til-godkjenning.scss";
import { Alert, Heading, HGrid, Loader, Pagination, Search, ToggleGroup } from "@navikt/ds-react";
import React, { useState } from "react";
import { useAgreements, usePagedSeriesToApprove, useSeriesToApprove } from "utils/swr-hooks";
import { SeriesToApproveDto } from "utils/types/response-types";
import { SeriesToApproveTable } from "approval/SeriesToApproveTable";

export enum ForApprovalFilterOption {
  ALL = "ALL",
  ADMIN = "ADMIN",
  SUPPLIER = "SUPPLIER",
}

export const ForApproval = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SeriesToApproveDto[] | undefined>();
  const [selectedFilterOption, setSelectedFilterOption] = useState<ForApprovalFilterOption>(
    ForApprovalFilterOption.ALL,
  );

  const [pageState, setPageState] = useState(1);
  const pageSize = 10;
  const inSearchMode = searchTerm.length > 0;

  const { data: allData, isLoading: allDataIsLoading, error: allDataError } = useSeriesToApprove();
  const {
    data: pagedData,
    isLoading,
    error: pagedDataError,
  } = usePagedSeriesToApprove({ page: pageState - 1, pageSize: pageSize, filter: selectedFilterOption });

  const { data: agreements, isLoading: agreementsIsLoading } = useAgreements();

  if (allDataError || pagedDataError) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="error">
            Kunne ikke vise produkter til godkjenning. Prøv å laste siden på nytt, eller gå tilbake. Hvis problemet
            vedvarer, kan du sende oss en e-post{" "}
            <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
              digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
            </a>
          </Alert>
        </HGrid>
      </main>
    );
  }

  const handeFilterChange = (filter: ForApprovalFilterOption) => {
    setSelectedFilterOption(filter);
    setPageState(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredProducts = allData?.content.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredData(filteredProducts);
    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredProducts);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div>
        <Heading level="1" size="large" spacing>
          Godkjenning av produkter
        </Heading>
        <div className="page__content-container">
          {allDataIsLoading || agreementsIsLoading ? (
            <Loader size="3xlarge" />
          ) : (
            <>
              {!inSearchMode && (
                <ToggleGroup
                  value={selectedFilterOption}
                  onChange={(value) => handeFilterChange(value as ForApprovalFilterOption)}
                  size="small"
                  defaultChecked={true}
                >
                  <ToggleGroup.Item value={ForApprovalFilterOption.ALL} defaultChecked>
                    Alle
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value={ForApprovalFilterOption.ADMIN}>Opprettet av administrator</ToggleGroup.Item>
                  <ToggleGroup.Item value={ForApprovalFilterOption.SUPPLIER}>
                    Opprettet av leverandører
                  </ToggleGroup.Item>
                </ToggleGroup>
              )}

              <form onSubmit={handleSubmit}>
                <HGrid gap="6" columns={{ xs: 1, sm: 1, md: 2 }}>
                  <Search
                    className="search-button"
                    label="Søk etter et produkt"
                    hideLabel={false}
                    clearButton={true}
                    placeholder="Søk etter produktnavn"
                    size="medium"
                    value={searchTerm}
                    onChange={(value) => handleSearch(value)}
                  />
                </HGrid>
              </form>
              {filteredData && filteredData.length === 0 ? (
                <Alert variant="info">Ingen produkter funnet.</Alert>
              ) : filteredData && filteredData.length > 0 ? (
                <SeriesToApproveTable series={filteredData || []} />
              ) : pagedData?.content && pagedData.content.length > 0 ? (
                <SeriesToApproveTable series={pagedData?.content} />
              ) : (
                <Alert variant="info">Ingen produkter som venter på godkjenning.</Alert>
              )}

              {!filteredData &&
              pagedData &&
              pagedData.totalPages &&
              pagedData.totalPages > 1 &&
              searchTerm.length == 0 ? (
                <Pagination
                  page={pageState}
                  onPageChange={(x) => setPageState(x)}
                  count={pagedData.totalPages}
                  size="small"
                  prevNextTexts
                />
              ) : (
                <div></div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};
