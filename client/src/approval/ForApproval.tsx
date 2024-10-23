import {
  Alert,
  Box,
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
import { ProductsToApproveTable } from "approval/ProductsToApproveTable";
import ErrorAlert from "error/ErrorAlert";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { usePagedProductsToApprove, useSuppliers } from "utils/swr-hooks";

export enum CreatedByFilter {
  ALL = "ALL",
  ADMIN = "ADMIN",
  SUPPLIER = "SUPPLIER",
}

export const ForApproval = () => {
  const { suppliers } = useSuppliers();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const sortUrl = searchParams.get("sort");
  const { pathname, search } = useLocation();
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get("supplier") || "");

  const [selectedFilterOption, setSelectedFilterOption] = useState<CreatedByFilter>(
    (searchParams.get("filter") as CreatedByFilter) || "ALL",
  );

  const {
    data: pagedData,
    isLoading,
    mutate: mutatePagedData,
    error: pagedDataError,
  } = usePagedProductsToApprove({
    page: pageState - 1,
    pageSize: pageSizeState,
    createdByFilter: selectedFilterOption,
    titleSearchTerm: searchTerm,
    supplierFilter: supplierFilter,
    sortUrl: sortUrl,
  });

  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set("page", String(pagedData.totalPages));
      setSearchParams(searchParams);
      setPageState(pagedData.totalPages);
    }
  }, [pagedData]);

  if (pagedDataError) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }
  const showPageNavigator = pagedData && pagedData.totalPages !== undefined && pagedData.totalPages > 1;

  const handeFilterChange = (filter: CreatedByFilter) => {
    searchParams.set("filter", filter.toString());
    setSearchParams(searchParams);
    setSelectedFilterOption(filter);
    setPageState(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
          Godkjenning av produkter
        </Heading>

        <HGrid gap="3" columns={{ xs: 1, md: 3 }}>
          <Search
            className="search-button"
            label="Søk"
            variant="simple"
            hideLabel={false}
            clearButton={true}
            placeholder="Søk etter produktnavn"
            size="medium"
            value={searchTerm}
            onChange={(value) => handleSearch(value)}
          />
          {suppliers && (
            <Box asChild style={{ maxWidth: "475px" }}>
              <UNSAFE_Combobox
                clearButton
                clearButtonLabel="Tøm"
                label="Leverandør"
                selectedOptions={searchParams
                  .getAll("supplier")
                  .map((uuid) => suppliers.find((supplier) => supplier.id === uuid)?.name || "")}
                onToggleSelected={onToggleSelected}
                options={suppliers?.map((supplier) => supplier.name) || []}
              />
            </Box>
          )}

          <Select
            value={selectedFilterOption}
            label="Opprettet av"
            onChange={(e) => handeFilterChange(e.target.value as CreatedByFilter)}
          >
            <option value="ALLE">Velg</option>
            <option value="ADMIN">Administrator</option>
            <option value="SUPPLIER">Leverandør</option>
          </Select>
        </HGrid>
        <VStack gap="4">
          {isLoading ? (
            <Loader size="3xlarge" />
          ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
            <ProductsToApproveTable
              mutatePagedData={mutatePagedData}
              series={pagedData.content}
              createdByFilter={selectedFilterOption}
              oversiktPath={pathname + search}
            />
          ) : (
            !isLoading && (
              <Alert variant="info">
                {searchTerm !== "" && selectedFilterOption !== CreatedByFilter.ALL
                  ? `Ingen produkter funnet`
                  : "Ingen produkter som venter på godkjenning."}
              </Alert>
            )
          )}

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
