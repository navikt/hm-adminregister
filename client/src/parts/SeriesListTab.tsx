import { Alert, Box, Heading, HGrid, HStack, Loader, Pagination, Search, Select, VStack } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { usePagedProductsForTechnician, useSeriesByVariantIdentifier, useSuppliers } from "utils/swr-hooks";
import ErrorAlert from "error/ErrorAlert";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import { SeriesList } from "parts/series/SeriesList";

const SeriesListTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const { loggedInUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { suppliers } = useSuppliers(loggedInUser?.isAdmin || false);

  const initialPageSize = Number(localStorage.getItem("pageSizeState")) || 10;
  const [pageSizeState, setPageSizeState] = useState(initialPageSize);

  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>();

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedProductsForTechnician({
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
  });

  useEffect(() => {
    localStorage.setItem("pageSizeState", pageSizeState.toString());
  }, [pageSizeState]);

  const { data: seriesByVariantIdentifier } = useSeriesByVariantIdentifier(searchTerm);

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

  const showPageNavigator = pagedData && pagedData.totalPages !== undefined && pagedData.totalPages > 1;

  if (errorPaged) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  const onClickSeries = (id: string) => {
    if (selectedSeriesId === id) {
      setSelectedSeriesId(undefined);
      return;
    } else {
      setSelectedSeriesId(id);
    }
  };

  return (
    <TabPanel value="serier">
      <VStack gap={{ xs: "8", md: "12" }} maxWidth={loggedInUser && loggedInUser.isAdmin ? "80rem" : "64rem"}>
        <VStack gap={{ xs: "4", md: "6" }}>
          <HGrid
            columns={{ xs: "1", md: loggedInUser && !loggedInUser.isAdmin ? "1fr 230px" : "1fr " }}
            gap="4"
            align={"center"}
          >
            <HGrid
              columns={{
                xs: "1",
                md: loggedInUser && loggedInUser.isAdmin && suppliers ? "3fr 2fr 130px" : "2fr 1fr",
              }}
              gap="4"
              align="start"
            >
              <Box role="search" style={{ maxWidth: "475px" }}>
                <Search
                  className="search-button"
                  label="Søk"
                  variant="simple"
                  clearButton={true}
                  placeholder="Navn, hms-art nummer eller artikkelnummer"
                  size="medium"
                  value={searchTerm}
                  onChange={(value) => handleSearch(value)}
                  hideLabel={false}
                />
              </Box>
            </HGrid>
          </HGrid>
        </VStack>

        <VStack gap="4">
          <VStack gap="1-alt">
            {isLoadingPagedData && <Loader />}
            {seriesByVariantIdentifier && <Heading size="medium">Søketreff</Heading>}
            {seriesByVariantIdentifier ? (
              <HGrid columns={1}>
                <SeriesList
                  seriesList={[seriesByVariantIdentifier]}
                  onSeriesClick={onClickSeries}
                  selectedSeriesId={selectedSeriesId}
                />
              </HGrid>
            ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
              <>
                <Heading size="medium">Søketreff</Heading>
                <HGrid columns={1}>
                  <SeriesList
                    seriesList={pagedData.content}
                    onSeriesClick={onClickSeries}
                    selectedSeriesId={selectedSeriesId}
                  />
                </HGrid>
              </>
            ) : (
              !isLoadingPagedData && (
                <Alert variant="info">
                  {searchTerm !== "" ? `Ingen produkter funnet med søket: "${searchTerm}"` : "Ingen produkter funnet."}
                </Alert>
              )
            )}
          </VStack>

          <HStack
            justify={{ xs: "center", md: "space-between" }}
            align="center"
            gap={"4"}
            style={{ flexWrap: "wrap-reverse" }}
          >
            <Select
              label="Ant deler per side"
              size="small"
              defaultValue={pageSizeState}
              onChange={(e) => {
                setPageSizeState(parseInt(e.target.value));
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </Select>
            {showPageNavigator && (
              <Pagination
                page={pageState}
                onPageChange={(x) => {
                  searchParams.set("page", x.toString());
                  setSearchParams(searchParams);
                  setPageState(x);
                }}
                count={pagedData.totalPages!}
                size="small"
              />
            )}
          </HStack>
        </VStack>
      </VStack>
    </TabPanel>
  );
};

export default SeriesListTab;
