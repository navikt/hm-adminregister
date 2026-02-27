import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { ChevronRightIcon, PlusIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HGrid,
  Loader,
  Pagination,
  Search,
} from "@navikt/ds-react";
import ErrorAlert from "error/ErrorAlert";
import LocalTag, { colors } from "felleskomponenter/LocalTag";
import { SupplierDTO } from "utils/supplier-util";
import { useSuppliers } from "utils/swr-hooks";
import styles from "./SupplierList.module.scss";

const Suppliers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);

  const showInactiveParam = searchParams.get("showInactive");
  const showInactive = showInactiveParam === "true";

  const { suppliers, isLoading, error } = useSuppliers(true, showInactive);
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

  const onShowInactiveChange = (values: string[]) => {
    const isChecked = values.includes("Vis inaktive");

    searchParams.set("showInactive", isChecked ? "true" : "false");
    searchParams.set("page", "1");
    setPageState(1);
    setSearchParams(searchParams);
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
          <HGrid
            columns={{
              xs: "space-1",
              md: "3fr 2fr 130px",
            }}
            gap="space-4"
            align="start"
          >
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
            <CheckboxGroup
              legend="Filter"
              hideLegend
              value={showInactive ? ["Vis inaktive"] : []}
              onChange={onShowInactiveChange}
            >
              <Checkbox value="Vis inaktive">Vis inaktive</Checkbox>
            </CheckboxGroup>
          </HGrid>

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
