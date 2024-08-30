import "./til-godkjenning.scss";
import { Alert, Box, Heading, HGrid, HStack, Loader, Pagination, Search, Select, ToggleGroup } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useAgreements, usePagedSeriesToApprove, useSeriesToApprove } from "utils/swr-hooks";
import { SeriesToApproveDto } from "utils/types/response-types";
import { SeriesToApproveTable } from "approval/SeriesToApproveTable";
import { useSearchParams } from "react-router-dom";
import ErrorAlert from "error/ErrorAlert";

export enum ForApprovalFilterOption {
  ALL = "ALL",
  ADMIN = "ADMIN",
  SUPPLIER = "SUPPLIER",
}

export const ForApproval = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SeriesToApproveDto[] | undefined>();

  const [selectedFilterOption, setSelectedFilterOption] = useState<ForApprovalFilterOption>(
    (searchParams.get("filter") as ForApprovalFilterOption) || "ALL",
  );
  const pageSize = 10;
  const inSearchMode = searchTerm.length > 0;

  const { data: allData, isLoading: allDataIsLoading, error: allDataError } = useSeriesToApprove();
  const {
    data: pagedData,
    isLoading,
    mutate: mutatePagedData,
    error: pagedDataError,
  } = usePagedSeriesToApprove({ page: pageState - 1, pageSize: pageSizeState, filter: selectedFilterOption });

  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set("page", String(pagedData.totalPages));
      setSearchParams(searchParams);
      setPageState(pagedData.totalPages);
    }
  }, [pagedData]);

  const { data: agreements, isLoading: agreementsIsLoading } = useAgreements();

  if (allDataError || pagedDataError) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  const handeFilterChange = (filter: ForApprovalFilterOption) => {
    searchParams.set("filter", filter.toString());
    setSearchParams(searchParams);
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
                  <ToggleGroup.Item value={ForApprovalFilterOption.SUPPLIER}>
                    Opprettet av leverandører
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value={ForApprovalFilterOption.ADMIN}>Opprettet av administrator</ToggleGroup.Item>
                </ToggleGroup>
              )}

              <Box role="search">
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
              </Box>
              {filteredData && filteredData.length === 0 ? (
                <Alert variant="info">Ingen produkter funnet.</Alert>
              ) : filteredData && filteredData.length > 0 ? (
                <SeriesToApproveTable
                  mutateSeries={mutatePagedData}
                  series={filteredData || []}
                  seriesToApproveFilter={ForApprovalFilterOption.ALL}
                />
              ) : pagedData?.content && pagedData.content.length > 0 ? (
                <SeriesToApproveTable
                  mutateSeries={mutatePagedData}
                  series={pagedData?.content}
                  seriesToApproveFilter={selectedFilterOption}
                />
              ) : (
                <Alert variant="info">Ingen produkter som venter på godkjenning.</Alert>
              )}

              <HStack gap="8" align={"center"}>
                {!filteredData &&
                pagedData &&
                pagedData.totalPages &&
                pagedData.totalPages > 1 &&
                searchTerm.length == 0 ? (
                  <Pagination
                    page={pageState}
                    onPageChange={(x) => {
                      searchParams.set("page", x.toString());
                      setSearchParams(searchParams);
                      setPageState(x);
                    }}
                    count={pagedData.totalPages}
                    size="small"
                    prevNextTexts
                  />
                ) : (
                  <></>
                )}
                {searchTerm.length == 0 && pagedData?.content.length !== 0 && (
                  <Select
                    label="Antall produkter per side"
                    size="small"
                    defaultValue={pageSizeState}
                    onChange={(e) => {
                      searchParams.set("size", e.target.value);
                      setSearchParams(searchParams);
                      setPageSizeState(parseInt(e.target.value));
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </Select>
                )}
              </HStack>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
