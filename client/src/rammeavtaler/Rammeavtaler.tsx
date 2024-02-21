import React, { useState } from "react";
import { Alert, Button, Heading, LinkPanel, Loader, Pagination, Search } from "@navikt/ds-react";
import { PlusIcon } from "@navikt/aksel-icons";
import { useAgreements, usePagedAgreements } from "utils/swr-hooks";
import { AgreementGroupDto } from "utils/types/response-types";
import { Link, useNavigate } from "react-router-dom";

const Rammeavtaler = () => {
  const [pageState, setPageState] = useState(1);
  const pageSize = 10;
  const { data: allData, isLoading: allDataIsLoading } = useAgreements();
  const { data, isLoading } = usePagedAgreements({ page: pageState - 1, pageSize });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<AgreementGroupDto | undefined>();
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredAgreements = allData?.content.filter((agreement) =>
      agreement.title.toLowerCase().includes(value.toLowerCase()),
    );
    if (value.length == 0) {
      setFilteredData(undefined);
    } else {
      setFilteredData(filteredAgreements);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission and page reload
  };

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <Heading level="1" size="medium" spacing>
          Rammeavtaler
        </Heading>

        <div className="page__content-container">
          <div className="search-panel">
            <form className="search-panel__search-box" onSubmit={handleSubmit}>
              <Search
                className="search-button"
                label="Søk etter et produkt"
                variant="primary"
                clearButton={true}
                placeholder="Søk etter rammeavtale"
                size="medium"
                value={searchTerm}
                onChange={(value) => handleSearch(value)}
              />
            </form>
            <div className="search-panel__add-new-button">
              <Button
                variant="secondary"
                size="medium"
                icon={<PlusIcon aria-hidden />}
                iconPosition="left"
                onClick={() => navigate("/rammeavtaler/opprett")}
              >
                Ny rammeavtale
              </Button>
            </div>
          </div>

          {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
            <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
          ) : filteredData && filteredData.length > 0 ? (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {filteredData &&
                filteredData.map((rammeavtale, i) => (
                  <LinkPanel
                    onClick={() => navigate(`/rammeavtaler/${rammeavtale.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        navigate(`/rammeavtaler/${rammeavtale.id}`);
                      }
                    }}
                    className="panel-list__name-panel"
                    key={i}
                  >
                    <LinkPanel.Title className="panel-list__title panel-list__width">
                      {rammeavtale.title || "Ukjent produktnavn"}
                    </LinkPanel.Title>
                  </LinkPanel>
                ))}
            </div>
          ) : (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {data?.content &&
                data?.content.map((rammeavtale, i) => (
                  <LinkPanel
                    as={Link}
                    to={`/rammeavtaler/${rammeavtale.id}`}
                    className="panel-list__name-panel"
                    key={i}
                  >
                    <LinkPanel.Title className="panel-list__title panel-list__width">
                      {rammeavtale.title || "Ukjent produktnavn"}
                    </LinkPanel.Title>
                  </LinkPanel>
                ))}
            </div>
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
export default Rammeavtaler;
