import React, { useState } from "react";
import {
  Alert,
  Button,
  Dropdown,
  Heading,
  HStack,
  LinkPanel,
  Loader,
  Pagination,
  Search,
  VStack,
} from "@navikt/ds-react";
import "./products.scss";
import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from "@navikt/aksel-icons";
import { usePagedProducts, useProducts } from "utils/swr-hooks";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { Link, useNavigate } from "react-router-dom";
import { Avstand } from "felleskomponenter/Avstand";
import { exportProducts } from "api/ImportExportApi";
import { useAuthStore } from "utils/store/useAuthStore";

const Produkter = () => {
  const [pageState, setPageState] = useState(1);
  const pageSize = 10;
  const { loggedInUser } = useAuthStore();
  const { data, isLoading } = usePagedProducts({ page: pageState - 1, pageSize });
  const { data: allData, isLoading: allDataIsLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SeriesRegistrationDTO[] | undefined>();
  const navigate = useNavigate();

  const showPageNavigator = data && data.totalPages && data.totalPages > 1 && searchTerm.length == 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredProducts = allData?.content.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase()),
    );

    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredProducts);
    }
  };

  const renderData = filteredData && filteredData.length > 0 ? filteredData : data?.content;

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
        <Heading level="1" size="medium" spacing>
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
                    <Dropdown.Menu.GroupedList>
                      <Dropdown.Menu.GroupedList.Item
                        onClick={() => {
                          navigate("/produkter/importer-produkter");
                        }}
                      >
                        <FileExcelIcon aria-hidden />
                        Importer produkter
                      </Dropdown.Menu.GroupedList.Item>
                    </Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.Divider />
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
        <VStack className="products-page__products">
          <div className="page__content-container">
            {filteredData?.length === 0 && searchTerm.length ? (
              <Alert variant="info">Ingen produkter funnet.</Alert>
            ) : (
              <div className="panel-list__container">
                {isLoading && <Loader size="3xlarge" title="venter..." />}
                {renderData &&
                  renderData.length > 0 &&
                  renderData.map((product, i) => (
                    <LinkPanel as={Link} to={`/produkter/${product.id}`} className="panel-list__name-panel" key={i}>
                      <LinkPanel.Title className="panel-list__title panel-list__width">
                        {product.title || "Ukjent produktnavn"}
                      </LinkPanel.Title>
                      <LinkPanel.Description className="panel-list__description">
                        Antall artikler: {product.count}
                      </LinkPanel.Description>
                    </LinkPanel>
                  ))}
              </div>
            )}
            {showPageNavigator === true && data && (
              <Pagination
                page={pageState}
                onPageChange={(x) => setPageState(x)}
                count={data.totalPages!}
                size="small"
                prevNextTexts
              />
            )}
          </div>
        </VStack>
      </div>
    </main>
  );
};
export default Produkter;
