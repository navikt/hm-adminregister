import "./til-godkjenning.scss";
import { Alert, Heading, HGrid, Loader, Search, Select } from "@navikt/ds-react";
import React, { useState } from "react";
import { useAgreements, useUnpagedProductsTilGodkjenning } from "utils/swr-hooks";
import { ProductTable } from "godkjenning/ProductTable";
import { ProductToApproveDto } from "utils/types/response-types";

export const TilGodkjenningUtenPaging = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<ProductToApproveDto[] | undefined>();

  const { data, isLoading: allDataIsLoading } = useUnpagedProductsTilGodkjenning();

  const { data: agreements, isLoading: agreementsIsLoading } = useAgreements();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredProducts = data?.filter((product) => product.title.toLowerCase().includes(value.toLowerCase()));

    setFilteredData(filteredProducts);
    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredProducts);
    }
  };

  const handleAgreementFilter = (value: string) => {
    if (searchTerm.length > 0 && filteredData) {
      const filteredProducts = filteredData.filter((product) => product.agreementId === value);
      setFilteredData(filteredProducts);
    } else {
      const filteredProducts = data?.filter((product) => product.agreementId === value);
      setFilteredData(filteredProducts);
      if (value.length == 0) {
        setFilteredData(undefined);
      }
    }
  };

  const renderData = filteredData ? filteredData : data;

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
          {allDataIsLoading || agreementsIsLoading ? (
            <Loader size="3xlarge" />
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <HGrid gap="6" columns={{ xs: 1, sm: 1, md: 2 }}>
                  <Search
                    className="search-button"
                    label="Søk etter et produkt"
                    hideLabel={false}
                    clearButton={true}
                    size="medium"
                    value={searchTerm}
                    onChange={(value) => handleSearch(value)}
                  />
                  <Select
                    size="medium"
                    id="rammeavtale"
                    name="rammeavtale"
                    label={"Filtrer på rammeavtale"}
                    onChange={(e) => {
                      handleAgreementFilter(e.target.value);
                    }}
                  >
                    <option></option>
                    {agreements?.content.map((agreement) => (
                      <option key={agreement.id} value={agreement.id}>
                        {agreement.title}
                      </option>
                    ))}
                  </Select>
                </HGrid>
              </form>
              {filteredData && filteredData.length === 0 ? (
                <Alert variant="info">Ingen produkter funnet.</Alert>
              ) : filteredData && filteredData.length > 0 ? (
                <ProductTable products={renderData || []} />
              ) : data && data.length > 0 && <ProductTable products={data} /> ? (
                <ProductTable products={data} />
              ) : (
                <Alert variant="info">Ingen produkter som venter på godkjenning.</Alert>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};
