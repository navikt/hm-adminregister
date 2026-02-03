import {
  Alert,
  Box,
  Chips,
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
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useSuppliers } from "utils/swr-hooks";
import ErrorAlert from "error/ErrorAlert";
import { PartList } from "./PartList";
import { usePagedParts, usePartByVariantIdentifier } from "api/PartApi";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";

const PartsListTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const { loggedInUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { pathname, search } = useLocation();
  const { suppliers } = useSuppliers(loggedInUser?.isAdmin || false);
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get("supplier") || "");

  const [agreementFilter, setAgreementFilter] = useState<string | null>(() => {
    return searchParams.get("inAgreement");
  });

  const missingMediaType = searchParams.get("missingMediaType");

  const initialPageSize = Number(localStorage.getItem("pageSizeState")) || 10;
  const [pageSizeState, setPageSizeState] = useState(initialPageSize);

  useEffect(() => {
    setSupplierFilter(searchParams.get("supplier") || "");
  }, [searchParams]);

  useEffect(() => {
    if (supplierFilter) {
      searchParams.set("supplier", supplierFilter);
    } else {
      searchParams.delete("supplier");
    }
    setSearchParams(searchParams);
  }, [supplierFilter]);

  useEffect(() => {
    if (agreementFilter !== null) {
      searchParams.set("inAgreement", agreementFilter);
    } else {
      searchParams.delete("inAgreement");
    }
    setSearchParams(searchParams);
  }, [agreementFilter]);

  useEffect(() => {
    localStorage.setItem("pageSizeState", pageSizeState.toString());
  }, [pageSizeState]);

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedParts({
    page: pageState - 1,
    pageSize: pageSizeState,
    titleSearchTerm: searchTerm,
    supplierFilter: supplierFilter,
    agreementFilter,
    missingMediaType,
  });

  const { data: partByVariantIdentifier } = usePartByVariantIdentifier(searchTerm);

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

  const onToggleSelected = (option: string, isSelected: boolean) => {
    const uuid = suppliers?.find((supplier) => supplier.name === option)?.id;
    if (!uuid) return;
    if (isSelected) {
      setSupplierFilter(uuid);
    } else if (supplierFilter === uuid) {
      setSupplierFilter("");
    }
  };

  const removeMissingMediaTypeFilter = () => {
    searchParams.delete("missingMediaType");
    setSearchParams(searchParams);
  };

  if (errorPaged) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  return (
    <TabPanel value="deler">
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
                md: loggedInUser && loggedInUser.isAdmin && suppliers ? "3fr 2fr 250px" : "2fr 250px",
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
              {loggedInUser && loggedInUser.isAdmin && suppliers && (
                <Box asChild style={{ maxWidth: "475px" }}>
                  <UNSAFE_Combobox
                    clearButton
                    clearButtonLabel="Tøm"
                    label="Leverandører"
                    selectedOptions={
                      supplierFilter
                        ? suppliers
                        ?.filter((supplier) => supplier.id === supplierFilter)
                        .map((supplier) => supplier.name) || []
                        : []
                    }
                    onToggleSelected={onToggleSelected}
                    options={suppliers?.map((supplier) => supplier.name) || []}
                  />
                </Box>
              )}
              <Box>
                <Select
                  label="Avtalefilter"
                  size="medium"
                  value={agreementFilter === null ? "all" : agreementFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAgreementFilter(value === "all" ? null : value);
                  }}
                >
                  <option value="all">Alle deler</option>
                  <option value="true">Kun deler på avtale</option>
                  <option value="false">Kun deler ikke på avtale</option>
                </Select>
              </Box>
            </HGrid>
          </HGrid>
          {missingMediaType && (
            <Box>
              <Chips>
                <Chips.Removable
                  variant="action"
                  onDelete={removeMissingMediaTypeFilter}
                >
                  Mangler bilder
                </Chips.Removable>
              </Chips>
            </Box>
          )}
        </VStack>

        <VStack gap="4">
          <VStack gap="1-alt">
            {isLoadingPagedData && <Loader />}
            {partByVariantIdentifier && <Heading size="medium">Søketreff</Heading>}
            {partByVariantIdentifier ? (
              <PartList partsList={[partByVariantIdentifier]} oversiktPath={pathname + search} />
            ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
              <>
                <Heading size="medium">Søketreff</Heading>
                <PartList partsList={pagedData.content} oversiktPath={pathname + search} />
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

export default PartsListTab;