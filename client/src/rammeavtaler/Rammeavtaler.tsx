import React, { useState } from "react";
import { Alert, Button, Dropdown, Heading, HStack, LinkPanel, Loader, Pagination, Search } from "@navikt/ds-react";
import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from "@navikt/aksel-icons";
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
          <HStack justify="space-between" wrap gap="4">
            <form className="search-box" onSubmit={handleSubmit}>
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
            <HStack gap="2">
              <Button
                style={{ marginLeft: "auto" }}
                variant="secondary"
                size="medium"
                icon={<PlusIcon aria-hidden />}
                iconPosition="left"
                onClick={() => navigate("/rammeavtaler/opprett")}
              >
                Ny rammeavtale
              </Button>
              <Dropdown>
                <Button
                  variant="tertiary"
                  icon={<MenuElipsisVerticalIcon title="Importer katalogfil" fontSize="1.5rem" />}
                  as={Dropdown.Toggle}
                />
                <Dropdown.Menu>
                  <Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.GroupedList.Item
                      onClick={() => {
                        navigate("/rammeavtaler/importer-katalogfil");
                      }}
                    >
                      <FileExcelIcon aria-hidden />
                      Importer katalogfil
                    </Dropdown.Menu.GroupedList.Item>
                  </Dropdown.Menu.GroupedList>
                </Dropdown.Menu>
              </Dropdown>
            </HStack>
          </HStack>

          {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
            <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
          ) : filteredData && filteredData.length > 0 ? (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {filteredData &&
                filteredData.map((rammeavtale, i) => (
                  <>
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
                    <div></div>
                  </>
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
