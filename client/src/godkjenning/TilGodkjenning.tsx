import "./til-godkjenning.scss";
import { Heading, Search } from "@navikt/ds-react";
import React, { useState } from "react";
import { useProductsTilGodkjenning } from "utils/swr-hooks";
import { ProductTable } from "godkjenning/ProductTable";
import { ProduktTilGodkjenning } from "utils/types/types";

export const TilGodkjenning = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ProduktTilGodkjenning[] | undefined>();

  const { data, isLoading } = useProductsTilGodkjenning();
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

          <ProductTable products={renderData || []} />
        </div>
      </div>
    </main>
  );
};
