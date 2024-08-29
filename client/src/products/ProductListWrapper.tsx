import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { usePagedProducts, useSeriesByHmsNr, useSeriesBySupplierRef, useSuppliers } from "utils/swr-hooks";
import {
  Alert,
  Box,
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
  UNSAFE_Combobox,
  VStack,
} from "@navikt/ds-react";

import { PlusIcon } from "@navikt/aksel-icons";
import { ProductList } from "./ProductList";
import ErrorAlert from "error/ErrorAlert";

type productPropsType = {
  isRejectedPage: boolean;
};

const ProductListWrapper = ({ isRejectedPage = false }: productPropsType) => {
  const { suppliers } = useSuppliers();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get("supplier") || "");
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

  const isSearch = searchTerm.length > 0;

  const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1 && !isSearch;

  if (errorPaged) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

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

  return (
    <main className="show-menu">
      <VStack gap={{ xs: "8", md: "12" }} maxWidth={"64rem"}>
        <Heading level="1" size="large" spacing>
          {isRejectedPage ? "Avslåtte produkter" : "Produkter"}
        </Heading>
        <VStack gap="4">
          <HGrid columns={{ xs: "1", md: "1fr 230px" }} gap="4">
            <HStack gap="4">
              <Box role="search" style={{ flex: 4, maxWidth: "475px", minWidth: "250px" }}>
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
              </Box>
              <CheckboxGroup
                legend="Filter"
                hideLegend
                onChange={setStatusFilters}
                value={statusFilters}
                style={{ minWidth: "111px", flex: 1 }}
              >
                {!isRejectedPage && <Checkbox value="includeInactive">Vis utgåtte</Checkbox>}
              </CheckboxGroup>
              {loggedInUser && loggedInUser.isAdmin && suppliers && (
                <UNSAFE_Combobox
                  clearButton
                  clearButtonLabel="Tøm"
                  label="Filtrer på leverandører"
                  selectedOptions={searchParams
                    .getAll("supplier")
                    .map((uuid) => suppliers.find((supplier) => supplier.id === uuid)?.name || "")}
                  onToggleSelected={onToggleSelected}
                  options={suppliers?.map((supplier) => supplier.name) || []}
                  style={{ flex: 1, maxWidth: "475px" }}
                />
              )}
            </HStack>

            {loggedInUser && !loggedInUser.isAdmin && !isRejectedPage && (
              <Button
                variant="secondary"
                icon={<PlusIcon aria-hidden />}
                iconPosition="left"
                onClick={() => navigate("/produkter/opprett")}
                style={{ maxHeight: "3rem" }}
              >
                Opprett nytt produkt
              </Button>
            )}
          </HGrid>
        </VStack>

        {isLoadingPagedData && <Loader size="3xlarge" />}

        <VStack gap="4">
          {seriesByHmsNr ? (
            <ProductList seriesList={[seriesByHmsNr]} heading={"Treff på HMS-nummer"} />
          ) : seriesBySupplierRef ? (
            <ProductList seriesList={[seriesBySupplierRef]} heading={"Treff på Lev-artnr"} />
          ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
            <ProductList seriesList={pagedData.content} />
          ) : (
            <Alert variant="info">
              {searchTerm !== ""
                ? `Ingen produkter funnet med søket: "${searchTerm}"`
                : isRejectedPage
                  ? "Ingen avslåtte produkter funnet."
                  : "Ingen produkter funnet."}
            </Alert>
          )}

          <HStack
            justify={{ xs: "center", md: "space-between" }}
            align="center"
            gap={"4"}
            style={{ flexWrap: "wrap-reverse" }}
          >
            {searchTerm.length == 0 && pagedData?.content.length !== 0 && (
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
            )}
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
              />
            )}
          </HStack>
        </VStack>
      </VStack>
    </main>
  );
};

export default ProductListWrapper;
