import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import {
  usePagedProducts,
  useSeriesByHmsNr,
  useSeriesBySupplierRef,
} from "utils/swr-hooks";
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
import { SeriesTable } from "products/SeriesTable";
import { PlusIcon } from "@navikt/aksel-icons";

type productPropsType = { isRejectedPage: boolean };

const ProductListWrapper = ({ isRejectedPage = false }: productPropsType) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const { loggedInUser } = useAuthStore();
  const [statusFilters, setStatusFilters] = useState([""]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedProducts({
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
    statusFilters,
    isRejectedPage,
  });

  const navigate = useNavigate();

  const { seriesByHmsNr } = useSeriesByHmsNr(searchTerm);
  const { seriesBySupplierRef } = useSeriesBySupplierRef(searchTerm);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };


  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set("page", String(pagedData.totalPages));
      setSearchParams(searchParams);
      setPageState(pagedData.totalPages);
    }
  }, [pagedData]);

  const isSearch = searchTerm.length > 0;

  const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1 && !isSearch;

  if (errorPaged) {
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
        <Heading level="1" size="large" spacing>
          {isRejectedPage ? "Avslåtte produkter" : "Produkter"}
        </Heading>
        <VStack gap="4">
          <div className="page__content-container">
            <HStack justify="space-between" wrap gap="4">
              <form className="search-box" onSubmit={handleSubmit}>
                <Search
                  className="search-button"
                  label="Søk etter et produkt"
                  variant="simple"
                  clearButton={true}
                  placeholder="Søk etter produktnavn"
                  size="medium"
                  value={searchTerm}
                  onChange={(value) => handleSearch(value)}
                />
              </form>
              {loggedInUser && !loggedInUser.isAdmin && !isRejectedPage && (
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
            {!isRejectedPage && <Checkbox value="includeInactive">Vis utgåtte</Checkbox>}
          </CheckboxGroup>
          <VStack className="products-page__products">
            <div className="page__content-container">
              {isLoadingPagedData && <Loader size="3xlarge" />}


              {seriesByHmsNr ? (
                <SeriesTable seriesList={[seriesByHmsNr]} heading={"Treff på HMS-nummer"} />
              ) : seriesBySupplierRef ? (
                <SeriesTable seriesList={[seriesBySupplierRef]} heading={"Treff på Lev-artnr"} />
              ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
                <SeriesTable seriesList={pagedData.content} />
              ) :
                <Alert variant="info">{searchTerm !== "" ? `Ingen produkter funnet med søket: "${searchTerm}"` : isRejectedPage ? "Ingen avslåtte produkter funnet." : "Ingen produkter funnet."}</Alert>
              }

              <HStack gap="8" align={"center"}>
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
            </div>
          </VStack>
        </VStack>
      </div>
    </main>
  );
};

export default ProductListWrapper;
