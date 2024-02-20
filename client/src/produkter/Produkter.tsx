import React, { useState } from "react";
import { Alert, Button, Heading, HStack, LinkPanel, Loader, Search } from "@navikt/ds-react";
import "./products.scss";
import { FileExcelIcon, PlusIcon } from "@navikt/aksel-icons";
import { useProducts } from "utils/swr-hooks";
import { SeriesGroupDTO } from "utils/response-types";
import { Link, useNavigate } from "react-router-dom";

const Produkter = () => {
  const { data, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SeriesGroupDTO | undefined>();
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredProducts = data?.content.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredData(filteredProducts);
  };

  const renderData = filteredData && filteredData.length > 0 ? filteredData : data?.content;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <Heading level="1" size="medium" spacing>
          Produkter
        </Heading>

        <div className="page__content-container">
          <div className="search-panel">
            <form className="search-panel__search-box" onSubmit={handleSubmit}>
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
            <HStack gap="2" className="search-panel__add-new-button">
              <Button
                variant="secondary"
                size="medium"
                icon={<PlusIcon aria-hidden />}
                iconPosition="left"
                onClick={() => navigate("/produkter/opprett")}
              >
                Nytt produkt
              </Button>
              <Button
                variant="secondary"
                size="medium"
                icon={<FileExcelIcon aria-hidden />}
                iconPosition="left"
                onClick={() => navigate("/produkter/importer-produkter")}
              >
                Import
              </Button>
            </HStack>
          </div>

          {filteredData?.length === 0 && searchTerm.length ? (
            <Alert variant="info">Ingen produkter funnet.</Alert>
          ) : (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {renderData &&
                renderData.map((product, i) => (
                  <LinkPanel as={Link} to={`/produkter/${product.seriesId}`} className="panel-list__name-panel" key={i}>
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
        </div>
      </div>
    </main>
  );
};
export default Produkter;
