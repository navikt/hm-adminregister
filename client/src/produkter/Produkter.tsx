import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Dropdown,
  Heading,
  HStack,
  Loader,
  Pagination,
  Search,
  Select,
  Table,
  VStack,
} from "@navikt/ds-react";
import "./products.scss";
import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from "@navikt/aksel-icons";
import { usePagedProducts, useProducts } from "utils/swr-hooks";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Avstand } from "felleskomponenter/Avstand";
import { exportProducts } from "api/ImportExportApi";
import { useAuthStore } from "utils/store/useAuthStore";
import styles from "produkter/ProductTable.module.scss";
import { StatusTagProductList } from "felleskomponenter/StatusTagProductList";

const Produkter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [pageSizeState, setPageSizeState] = useState(Number(searchParams.get("size")) || 10);
  const { loggedInUser } = useAuthStore();
  const [statusFilters, setStatusFilters] = useState([""]);
  const { data: pagedData, isLoading } = usePagedProducts({
    page: pageState - 1,
    pageSize: pageSizeState,
    statusFilters,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data: allData, isLoading: allDataIsLoading } = useProducts({ titleSearchTerm: searchTerm, statusFilters });
  const [filteredData, setFilteredData] = useState<SeriesRegistrationDTO[] | undefined>();
  const navigate = useNavigate();

  const showPageNavigator = pagedData && pagedData.totalPages && pagedData.totalPages > 1 && searchTerm.length == 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length == 0) {
      setFilteredData(undefined);
    }
  };

  useEffect(() => {
    if (allData && allData.content) {
      setFilteredData(allData.content);
    }
  }, [allData]);

  useEffect(() => {
    if (pagedData?.totalPages && pagedData?.totalPages < pageState) {
      searchParams.set("page", String(pagedData.totalPages));
      setSearchParams(searchParams);
      setPageState(pagedData.totalPages);
    }
  }, [pagedData]);

  const renderData = filteredData && filteredData.length > 0 ? filteredData : pagedData?.content;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  const exportProductsForSupplier = () => {
    exportProducts(loggedInUser?.isAdmin || false).then((response) => {
      const bytes = new Uint8Array(response); // pass your byte response to this constructor
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <Heading level="1" size="large" spacing>
          Produkter
        </Heading>
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
            {loggedInUser && !loggedInUser.isAdmin && (
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
                <Dropdown>
                  <Button
                    style={{ marginLeft: "auto" }}
                    variant="tertiary"
                    icon={<MenuElipsisVerticalIcon title="Importer eller eksporter produkter" fontSize="1.5rem" />}
                    as={Dropdown.Toggle}
                  ></Button>
                  <Dropdown.Menu>
                    {/*todo: Disable import until we have a working import with validation*/}
                    {/*<Dropdown.Menu.GroupedList>*/}
                    {/*  <Dropdown.Menu.GroupedList.Item*/}
                    {/*    onClick={() => {*/}
                    {/*      navigate("/produkter/importer-produkter");*/}
                    {/*    }}*/}
                    {/*  >*/}
                    {/*    <FileExcelIcon aria-hidden />*/}
                    {/*    Importer produkter*/}
                    {/*  </Dropdown.Menu.GroupedList.Item>*/}
                    {/*</Dropdown.Menu.GroupedList>*/}
                    {/*<Dropdown.Menu.Divider />*/}
                    <Dropdown.Menu.List>
                      <Dropdown.Menu.List.Item
                        onClick={() => {
                          exportProductsForSupplier();
                        }}
                      >
                        <FileExcelIcon aria-hidden />
                        Eksporter produkter
                      </Dropdown.Menu.List.Item>
                    </Dropdown.Menu.List>
                  </Dropdown.Menu>
                </Dropdown>
              </HStack>
            )}
          </HStack>
        </div>
        <Avstand marginBottom={4} />
        <HStack gap="4">
          <CheckboxGroup legend="Filter" hideLegend onChange={setStatusFilters} value={statusFilters}>
            <Checkbox value="includeInactive">Vis utgåtte</Checkbox>
          </CheckboxGroup>
        </HStack>
        <Avstand marginBottom={4} />
        <VStack className="products-page__products">
          <div className="page__content-container">
            {filteredData?.length === 0 && searchTerm.length ? (
              <Alert variant="info">Ingen produkter funnet.</Alert>
            ) : (
              <div className="panel-list__container">
                {isLoading && <Loader size="3xlarge" title="venter..." />}
                {renderData && renderData.length > 0 && !isLoading && (
                  <div className={styles.productTable}>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Antall varianter</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {renderData.map((product, i) => (
                          <Table.Row
                            key={i + product.id}
                            onClick={() => {
                              navigate(`/produkter/${product.id}`);
                            }}
                          >
                            <Table.HeaderCell scope="row">
                              <b>{product.title}</b>
                            </Table.HeaderCell>
                            <Table.DataCell>
                              <StatusTagProductList
                                isDraft={product.draftStatus === "DRAFT"}
                                isPublished={product.adminStatus === "APPROVED"}
                                isPending={product.adminStatus === "PENDING"}
                                isRejected={product.adminStatus === "REJECTED"}
                              />
                            </Table.DataCell>
                            <Table.DataCell>{product.count}</Table.DataCell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </div>
            )}
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
              {searchTerm.length == 0 && (
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
      </div>
    </main>
  );
};
export default Produkter;
