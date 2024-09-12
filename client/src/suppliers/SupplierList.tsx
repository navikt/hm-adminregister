import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { ChevronRightIcon, PlusIcon } from "@navikt/aksel-icons";
import { Alert, Box, Button, Heading, HStack, Loader, Pagination, Search } from "@navikt/ds-react";
import ErrorAlert from "error/ErrorAlert";
import LocalTag, { colors } from "felleskomponenter/LocalTag";
import { SupplierDTO } from "utils/supplier-util";
import { useSuppliers } from "utils/swr-hooks";
import styles from "./SupplierList.module.scss";

const Suppliers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const { suppliers, isLoading, error } = useSuppliers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<SupplierDTO[] | undefined>();
  const itemsPerPage = 10;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filteredSuppliers = suppliers?.filter((supplier) =>
      supplier.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredData(filteredSuppliers);
  };

  const renderData = filteredData ? filteredData : suppliers;

  const paginatedData = renderData?.slice((pageState - 1) * itemsPerPage, pageState * itemsPerPage);

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

        <div className={styles.supplierPanelContainer}>
          <HStack justify="space-between" wrap gap="4" marginBlock="8 0">
            <Box role="search" className="search-box ">
              <Search
                className="search-button"
                label="Søk etter en leverandør"
                variant="simple"
                placeholder="Søk etter en leverandør"
                size="medium"
                value={searchTerm}
                onChange={(value) => handleSearch(value)}
              />
            </Box>
            <Button
              variant="secondary"
              size="medium"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={handleCreateNewSupplier}
            >
              Opprett leverandør
            </Button>
          </HStack>

          <div className="panel-list__container">
            {isLoading && <Loader size="3xlarge" title="venter..." />}
            {renderData?.length === 0 && <Alert variant="info">Ingen leverandører funnet.</Alert>}
            {paginatedData &&
              paginatedData.map((supplier) => (
                <Link to={`/leverandor/${supplier.id}`} className={styles.supplierPanel} key={supplier.id}>
                  <p>
                    <strong>{supplier.name}</strong> {supplier.postNr} {supplier.postLocation}
                  </p>
                  <div>
                    {supplier.status === "INACTIVE" && <LocalTag icon={<></>} text="Inaktiv" color={colors.GREY} />}
                    {supplier.status === "ACTIVE" && <LocalTag icon={<></>} text="Aktiv" color={colors.GREEN} />}
                  </div>
                  <ChevronRightIcon className={styles.chevron} aria-hidden fontSize="24px" />
                </Link>
              ))}
          </div>
          {renderData && renderData?.length > itemsPerPage && (
            <Pagination
              page={pageState}
              onPageChange={(x) => {
                searchParams.set("page", x.toString());
                setSearchParams(searchParams);
                setPageState(x);
              }}
              count={Math.ceil(renderData.length / itemsPerPage)}
              boundaryCount={1}
              siblingCount={0}
              size="small"
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Suppliers;
