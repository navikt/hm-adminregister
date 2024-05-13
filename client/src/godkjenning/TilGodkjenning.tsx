import "./til-godkjenning.scss";
import { Alert, Heading, HGrid, Loader, Pagination, Search } from "@navikt/ds-react";
import React, { useState } from "react";
import { useAgreements, usePagedSeriesToApprove, useSeriesToApprove } from "utils/swr-hooks";
import { SeriesTable } from "godkjenning/SeriesTable";
import { SeriesToApproveDto } from "utils/types/response-types";

export const TilGodkjenning = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SeriesToApproveDto[] | undefined>();

  const [pageState, setPageState] = useState(1);
  const pageSize = 10;

  const { data: allData, isLoading: allDataIsLoading } = useSeriesToApprove();
  const { data, isLoading } = usePagedSeriesToApprove({ page: pageState - 1, pageSize });

  const { data: agreements, isLoading: agreementsIsLoading } = useAgreements();

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

  // const handleAgreementFilter = (value: string) => {
  //   if (searchTerm.length > 0 && filteredData) {
  //     const filteredProducts = filteredData.filter((product) => product.agreementId === value);
  //     setFilteredData(filteredProducts);
  //   } else {
  //     const filteredProducts = allData?.content.filter((product) => product.agreementId === value);
  //     setFilteredData(filteredProducts);
  //     if (value.length == 0) {
  //       setFilteredData(undefined);
  //     }
  //   }
  // };

  const renderData = filteredData ? filteredData : allData?.content;

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
                  {/*<Select*/}
                  {/*  size="medium"*/}
                  {/*  id="rammeavtale"*/}
                  {/*  name="rammeavtale"*/}
                  {/*  label={"Filtrer på rammeavtale"}*/}
                  {/*  onChange={(e) => {*/}
                  {/*    handleAgreementFilter(e.target.value);*/}
                  {/*  }}*/}
                  {/*>*/}
                  {/*  <option></option>*/}
                  {/*  {agreements?.content.map((agreement) => (*/}
                  {/*    <option key={agreement.id} value={agreement.id}>*/}
                  {/*      {agreement.title}*/}
                  {/*    </option>*/}
                  {/*  ))}*/}
                  {/*</Select>*/}
                </HGrid>
              </form>
              {filteredData && filteredData.length === 0 ? (
                <Alert variant="info">Ingen produkter funnet.</Alert>
              ) : filteredData && filteredData.length > 0 ? (
                <SeriesTable series={renderData || []} />
              ) : data?.content && data.content.length > 0 && <SeriesTable series={data?.content} /> ? (
                <SeriesTable series={data?.content} />
              ) : (
                <Alert variant="info">Ingen produkter som venter på godkjenning.</Alert>
              )}

              {!filteredData && data && data.totalPages && data.totalPages > 1 && searchTerm.length == 0 ? (
                <Pagination
                  page={pageState}
                  onPageChange={(x) => setPageState(x)}
                  count={data.totalPages}
                  size="small"
                  prevNextTexts
                />
              ) : (
                <div></div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};
