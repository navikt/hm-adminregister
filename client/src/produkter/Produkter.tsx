import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HGrid,
  HStack,
  Loader,
  Pagination,
  Search,
  Select,
  VStack,
} from "@navikt/ds-react";
import "./products.scss";
import { PlusIcon } from "@navikt/aksel-icons";
import { usePagedProducts, useProducts, useSeriesByHmsNr, useSeriesBySupplierRef } from "utils/swr-hooks";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import styles from "produkter/ProductTable.module.scss";
import { SeriesTable } from "produkter/SeriesTable";
type productPropsType = { hiddenStatus?: string };

const Produkter = ({ hiddenStatus = undefined }: productPropsType) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const { loggedInUser } = useAuthStore();
  const [statusFilters, setStatusFilters] = useState([""]);
  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedProducts({
    page: pageState - 1,
    pageSize: pageSizeState,
    statusFilters,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: searchResults,
    isLoading: isLoadingSearchResults,
    error: errorProducts,
  } = useProducts({ titleSearchTerm: searchTerm, statusFilters });
  const [filteredData, setFilteredData] = useState<SeriesRegistrationDTO[] | undefined>();
  const navigate = useNavigate();

  const { seriesByHmsNr } = useSeriesByHmsNr(searchTerm);
  const { seriesBySupplierRef } = useSeriesBySupplierRef(searchTerm);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length == 0) {
      setFilteredData(undefined);
    }
  };

  useEffect(() => {
    if (searchResults && searchResults.content) {
      setFilteredData(searchResults.content);
    }
  }, [searchResults]);

  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set("page", String(pagedData.totalPages));
      setSearchParams(searchParams);
      setPageState(pagedData.totalPages);
    }
  }, [pagedData]);

  const isSearch = searchTerm.length > 0;
  const isSearchResults = filteredData && filteredData.length > 0;

  const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1 && !isSearch;

  if (errorPaged || errorProducts) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="error">
            Kunne ikke vise produkter. Prøv å laste siden på nytt. Hvis problemet vedvarer, kan du sende oss en e-post{" "}
            <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
              digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
            </a>
          </Alert>
        </HGrid>
      </main>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div className="page__background-container">
        {hiddenStatus ? (
          <Heading level="1" size="large" spacing>
            Avslåtte produkter
          </Heading>
        ) : (
          <Heading level="1" size="large" spacing>
            Produkter
          </Heading>
        )}

        <VStack gap="4">
          <div className="page__content-container">
            <HStack justify="space-between" wrap gap="4">
              <form className="search-box" onSubmit={handleSubmit}>
                <Search
                  className="search-button"
                  label="Søk etter et produkt"
                  variant="primary"
                  clearButton={true}
                  placeholder="Søk etter produktnavn"
                  size="medium"
                  value={searchTerm}
                  onChange={(value) => handleSearch(value)}
                />
              </form>
              {loggedInUser && !loggedInUser.isAdmin && !hiddenStatus && (
                <HStack gap="2">
                  <Button
                    variant="secondary"
                    size="medium"
                    icon={<PlusIcon aria-hidden />}
                    iconPosition="left"
                    onClick={() => navigate("/produkter/opprett")}
                  >
                    Nytt produkt
                  </Button>
                </HStack>
              )}
            </HStack>
          </div>
          <CheckboxGroup legend="Filter" hideLegend onChange={setStatusFilters} value={statusFilters}>
            {!hiddenStatus && <Checkbox value="includeInactive">Vis utgåtte</Checkbox>}
          </CheckboxGroup>
          <VStack className="products-page__products">
            <div className="page__content-container">
              {isSearch && isLoadingSearchResults && <Loader size="3xlarge" />}
              {!isSearch && isLoadingPagedData && <Loader size="3xlarge" />}

              {isSearch && seriesByHmsNr && (
                <SeriesTable seriesList={[seriesByHmsNr]} heading={"Treff på HMS-nummer"} hiddenStatus={hiddenStatus} />
              )}
              {isSearch && seriesBySupplierRef && (
                <SeriesTable
                  seriesList={[seriesBySupplierRef]}
                  heading={"Treff på Lev-artnr"}
                  hiddenStatus={hiddenStatus}
                />
              )}
              {isSearch && isSearchResults && <SeriesTable seriesList={filteredData} hiddenStatus={hiddenStatus} />}
              {isSearch && !isSearchResults && !seriesByHmsNr && !seriesBySupplierRef && !isLoadingSearchResults && (
                <Alert variant="info">Ingen produkter funnet.</Alert>
              )}
              {!isSearch && pagedData && <SeriesTable seriesList={pagedData.content} hiddenStatus={hiddenStatus} />}
              <HStack gap="8">
                {showPageNavigator === true && pagedData && (
                  <Pagination
                    page={pageState}
                    onPageChange={(x) => {
                      searchParams.set("page", x.toString());
                      setSearchParams(searchParams);
                      setPageState(x);
                    }}
                    count={pagedData.totalPages!}
                    size="small"
                    prevNextTexts
                  />
                )}
                {searchTerm.length == 0 && !hiddenStatus && (
                  <Select
                    className={styles.pageSize}
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
            </div>
          </VStack>
        </VStack>
      </div>
    </main>
  );
};
export default Produkter;
