import {
  Alert,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Chips,
  Heading,
  HGrid,
  HStack,
  Label,
  Pagination,
  Search,
  Select,
  UNSAFE_Combobox,
  VStack,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { usePagedProducts, useSeriesByHmsNr, useSeriesBySupplierRef, useSuppliers } from "utils/swr-hooks";

import { PlusIcon } from "@navikt/aksel-icons";
import ErrorAlert from "error/ErrorAlert";
import { ProductList } from "./ProductList";

const ProductListWrapper = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get("supplier") || "");
  const { loggedInUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const statusFilters = searchParams.get("filters")?.split(",") || [];
  const { pathname, search } = useLocation();
  const { suppliers } = useSuppliers(loggedInUser?.isAdmin || false);

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedProducts({
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
    filters: [...statusFilters],
    supplierFilter: supplierFilter,
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

  const showPageNavigator = pagedData && pagedData.totalPages !== undefined && pagedData.totalPages > 1;

  if (errorPaged) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  const visningStatusfilter = ["Under endring", "Venter på godkjenning", "Avslått", "Publisert"];

  const onToggleSelected = (option: string, isSelected: boolean) => {
    const uuid = suppliers?.find((supplier) => supplier.name === option)?.id;

    if (uuid) {
      if (isSelected) {
        if (!searchParams.getAll("supplier").includes(uuid)) {
          searchParams.set("supplier", uuid);
        }
      } else {
        if (searchParams.getAll("supplier").includes(uuid)) {
          const updated = searchParams.getAll("supplier").filter((supplier) => supplier !== uuid);
          searchParams.delete("supplier");
          updated.forEach((supplier) => searchParams.set("supplier", supplier));
        }
      }
      setSearchParams(searchParams);
      setSupplierFilter(searchParams.get("supplier") || "");
    }
  };

  const onFilterChange = (filterName: string) => {
    if (statusFilters.includes(filterName)) {
      searchParams.set("filters", statusFilters.filter((x) => x !== filterName).join(","));
      setSearchParams(searchParams);
    } else {
      searchParams.set("filters", [...statusFilters, filterName].join(","));
      setSearchParams(searchParams);
    }
  };

  return (
    <main className="show-menu">
      <VStack gap={{ xs: "8", md: "12" }} maxWidth={"64rem"}>
        <Heading level="1" size="large" spacing>
          Produkter
        </Heading>
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
                  placeholder="Søk etter produktnavn"
                  size="medium"
                  value={searchTerm}
                  onChange={(value) => handleSearch(value)}
                  hideLabel={false}
                />
              </Box>

              {loggedInUser && loggedInUser.isAdmin && suppliers && (
                <Box asChild style={{ maxWidth: "475px" }}>
                  <UNSAFE_Combobox
                    clearButton
                    clearButtonLabel="Tøm"
                    label="Leverandører"
                    selectedOptions={searchParams
                      .getAll("supplier")
                      .map((uuid) => suppliers.find((supplier) => supplier.id === uuid)?.name || "")}
                    onToggleSelected={onToggleSelected}
                    options={suppliers?.map((supplier) => supplier.name) || []}
                  />
                </Box>
              )}
              <Box paddingBlock={{ xs: "2", md: "8" }}>
                <CheckboxGroup
                  legend="Filter"
                  hideLegend
                  onChange={() => onFilterChange("Vis utgåtte")}
                  value={statusFilters}
                >
                  <Checkbox value="Vis utgåtte">Vis utgåtte</Checkbox>
                </CheckboxGroup>
              </Box>
            </HGrid>

            {loggedInUser && (
              <Box>
                <Button
                  variant="secondary"
                  icon={<PlusIcon aria-hidden />}
                  iconPosition="left"
                  onClick={() => navigate("/produkter/opprett")}
                  style={{ maxHeight: "3rem" }}
                >
                  Opprett nytt produkt
                </Button>
              </Box>
            )}
          </HGrid>
          <VStack gap="3">
            <Label>Filter</Label>
            <Chips>
              {visningStatusfilter.map((filterName) => (
                <Chips.Toggle
                  key={filterName}
                  selected={statusFilters.includes(filterName)}
                  onClick={() => onFilterChange(filterName)}
                >
                  {filterName}
                </Chips.Toggle>
              ))}
            </Chips>
          </VStack>
        </VStack>

        <VStack gap="4">
          <VStack gap="1-alt">
            {seriesByHmsNr && <Heading size="medium">Treff på HMS-nummer</Heading>}
            {seriesBySupplierRef && <Heading size="medium">Treff på Lev-artnr</Heading>}
            <HGrid
              columns={{ xs: ".7fr 3.6fr 2.1fr .8fr", md: ".7fr 3.6fr 2.1fr .9fr 0.4fr" }}
              paddingBlock={"2"}
              gap={"2"}
            >
              <b>Produktnavn</b>
              <span />
              <b>Status</b>
              <b>Varianter</b>
              <b>Endret</b>
              <b>Endret av</b>
              <span />
            </HGrid>
            {/* {isLoadingPagedData && <Loader size="3xlarge" />} */}
            {seriesByHmsNr ? (
              <ProductList seriesList={[seriesByHmsNr]} oversiktPath={pathname + search} />
            ) : seriesBySupplierRef ? (
              <ProductList seriesList={[seriesBySupplierRef]} oversiktPath={pathname + search} />
            ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
              <ProductList seriesList={pagedData.content} oversiktPath={pathname + search} />
            ) : (
              !isLoadingPagedData && (
                <Alert variant="info">
                  {searchTerm !== "" ? `Ingen produkter funnet med søket: "${searchTerm}"` : "Ingen produkter funnet."}
                </Alert>
              )
            )}
          </VStack>

          {showPageNavigator && (
            <HStack
              justify={{ xs: "center", md: "space-between" }}
              align="center"
              gap={"4"}
              style={{ flexWrap: "wrap-reverse" }}
            >
              <Select
                label="Ant produkter per side"
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
            </HStack>
          )}
        </VStack>
      </VStack>
    </main>
  );
};

export default ProductListWrapper;
