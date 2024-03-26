import "./til-godkjenning.scss";
import { Alert, Heading, Pagination, Search } from "@navikt/ds-react";
import React, { useState } from "react";
import { usePagedProductsTilGodkjenning, useProductsTilGodkjenning } from "utils/swr-hooks";
import { ProductTable } from "godkjenning/ProductTable";
import { ProduktTilGodkjenning } from "utils/types/types";
import { Avstand } from "felleskomponenter/Avstand";

export const TilGodkjenning = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ProduktTilGodkjenning[] | undefined>();

  const [pageState, setPageState] = useState(1);
  const pageSize = 10;

  const { data: allData, isLoading: allDataIsLoading } = useProductsTilGodkjenning();
  const { data, isLoading } = usePagedProductsTilGodkjenning({ page: pageState - 1, pageSize });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredProducts = allData?.content.filter((product) =>
      product.title.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredData(filteredProducts);
    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredProducts);
    }
  };

  const renderData = filteredData && filteredData.length > 0 ? filteredData : allData?.content;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div>
        <Heading level="1" size="medium" spacing>
          Godkjenning av produkter
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
          </div>

          {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
            <Alert variant="info">Ingen produkter funnet.</Alert>
          ) : filteredData && filteredData.length > 0 ? (
            <ProductTable products={renderData || []} />
          ) : (
            <ProductTable products={data?.content || []} />
          )}

          {data && data.totalPages && data.totalPages > 1 && searchTerm.length == 0 && (
            <Pagination
              page={pageState}
              onPageChange={(x) => setPageState(x)}
              count={data.totalPages}
              size="small"
              prevNextTexts
            />
          )}
        </div>
      </div>
    </main>
  );
};
