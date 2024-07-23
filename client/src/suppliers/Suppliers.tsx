import { useState } from "react";
import { Alert, Button, Heading, HStack, LinkPanel, Loader, Search } from "@navikt/ds-react";
import { PlusIcon } from "@navikt/aksel-icons";
import { useSuppliers } from "utils/swr-hooks";
import { Link, useNavigate } from "react-router-dom";
import { SupplierDTO } from "utils/supplier-util";
import ErrorAlert from "error/ErrorAlert";

const Suppliers = () => {
  const { suppliers, isLoading, error } = useSuppliers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SupplierDTO[] | undefined>();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredSuppliers = suppliers?.filter((supplier) =>
      supplier.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredData(filteredSuppliers);
  };

  const renderData = filteredData ? filteredData : suppliers;

  const handleCreateNewSupplier = () => {
    navigate("/leverandor/opprett-leverandor");
  };

  if (error) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  return (
    <main className="show-menu">
      <div className="page__background-container">
        <Heading level="1" size="large" spacing>
          Leverandører
        </Heading>

        <div className="page__content-container">
          <HStack justify="space-between" wrap gap="4">
            <form className="search-box ">
              <Search
                className="search-button"
                label="Søk etter en leverandør"
                variant="primary"
                clearButton={true}
                placeholder="Søk etter leverandørnavn"
                size="medium"
                value={searchTerm}
                onChange={(value) => handleSearch(value)}
              />
            </form>
            <Button
              variant="secondary"
              size="medium"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={handleCreateNewSupplier}
            >
              Opprett ny leverandør
            </Button>
          </HStack>

          <div className="panel-list__container">
            {isLoading && <Loader size="3xlarge" title="venter..." />}
            {renderData?.length === 0 && <Alert variant="info">Ingen leverandører funnet.</Alert>}
            {renderData &&
              renderData.map((supplier, i) => (
                <LinkPanel
                  as={Link}
                  to={`/leverandor/${supplier.id}`}
                  border
                  className="panel-list__name-panel"
                  key={i}
                >
                  <LinkPanel.Title className="panel-list__title">{supplier.name}</LinkPanel.Title>
                </LinkPanel>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Suppliers;
