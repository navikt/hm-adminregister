import {
  Alert,
  Box,
  Chips,
  Heading,
  HGrid,
  HStack,
  Label,
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
import { usePagedSeriesToApprove, useSeriesToApproveByVariantIdentifier, useSuppliers } from "utils/swr-hooks";

export const ForApproval = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const sortUrl = searchParams.get("sort");
  const { pathname, search } = useLocation();
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get("supplier") || "");
  const { suppliers } = useSuppliers(true);
  const statusFilters = searchParams.get("filters")?.split(",") || [];

  const initialPageSize = Number(localStorage.getItem("pageSizeState")) || 10;
  const [pageSizeState, setPageSizeState] = useState(initialPageSize);

  useEffect(() => {
    localStorage.setItem("pageSizeState", pageSizeState.toString());
  }, [pageSizeState]);

  const visningStatusfilter = ["Endring", "Nytt produkt"];

  const { data: seriesToApproveByVariantIdentifier } = useSeriesToApproveByVariantIdentifier(searchTerm);

  const {
    data: pagedData,
    isLoading,
    mutate: mutatePagedData,
    error: pagedDataError,
  } = usePagedSeriesToApprove({
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
    supplierFilter: supplierFilter,
    sortUrl: sortUrl,
    filters: [...statusFilters],
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

  const onFilterChange = (filterName: string) => {
    if (statusFilters.includes(filterName)) {
      searchParams.set("filters", statusFilters.filter((x) => x !== filterName).join(","));
      setSearchParams(searchParams);
    } else {
      searchParams.set("filters", [...statusFilters, filterName].join(","));
      setSearchParams(searchParams);
    }
  };

  const showPageNavigator = pagedData && pagedData.totalPages !== undefined && pagedData.totalPages > 1;

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

        <HGrid gap="3" columns={{ xs: 1, md: 2 }}>
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

        <VStack gap="4">
          {seriesToApproveByVariantIdentifier && <Heading size="medium">Treff på Variant</Heading>}
          {isLoading ? (
            <Loader size="3xlarge" />
          ) : seriesToApproveByVariantIdentifier ? (
            <ProductsToApproveTable
              mutatePagedData={mutatePagedData}
              series={[seriesToApproveByVariantIdentifier]}
              oversiktPath={pathname + search}
            />
          ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
            <ProductsToApproveTable
              mutatePagedData={mutatePagedData}
              series={pagedData.content}
              oversiktPath={pathname + search}
            />
          ) : (
            !isLoading && (
              <Alert variant="info">
                {searchTerm !== "" ? `Ingen produkter funnet` : "Ingen produkter som venter på godkjenning."}
              </Alert>
            )
          )}

          {!seriesToApproveByVariantIdentifier && (
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
          )}
        </VStack>
      </VStack>
    </main>
  );
};
