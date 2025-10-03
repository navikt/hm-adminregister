import {
  ArrowsSquarepathIcon,
  MenuElipsisHorizontalCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import { Alert, Box, Button, Dropdown, Pagination, Search, Table, Tabs, Tag, VStack } from "@navikt/ds-react";
import { deleteProducts, setVariantToActive, setVariantToExpired } from "api/ProductApi";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAllUniqueTechDataKeys } from "utils/product-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { isUUID, toValueAndUnit } from "utils/string-util";
import { userProductVariantsBySeriesId } from "utils/swr-hooks";
import { ProductRegistrationDTOV2, SeriesDTO } from "utils/types/response-types";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import styles from "../ProductPage.module.scss";
import { moveProductsToSeries } from "api/SeriesApi";
import MoveProductVariantsModal from "products/variants/MoveProductVariantsModal";
import product from "products/Product";

const VariantsTab = ({
  series,
  showInputError,
  mutateSeries,
}: {
  series: SeriesDTO;
  showInputError: boolean;
  mutateSeries: () => void;
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const techKeys = getAllUniqueTechDataKeys(series.variants);
  const columnsPerPage = 5;
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [variant, setVariant] = useState<undefined | ProductRegistrationDTOV2>(undefined);
  const [deleteVariantConfirmationModalIsOpen, setDeleteVariantConfirmationModalIsOpen] = useState<boolean>(false);
  useState<boolean>(false);
  const [moveProductVariantModalIsOpen, setMoveProductVariantModalIsOpen] = useState<boolean>(false);
  const [variantFilterString, setVariantFilterString] = useState<string>("");

  const { mutateVariants } = userProductVariantsBySeriesId(series.id);

  const hasNoVariants = series.variants.length === 0;

  const variantsToShow =
    variantFilterString === ""
      ? series.variants
      : series.variants.filter(
          (variant) =>
            variant.articleName?.toLowerCase().includes(variantFilterString.toLowerCase()) ||
            variant.hmsArtNr?.toLowerCase().includes(variantFilterString.toLowerCase()) ||
            variant.supplierRef?.toLowerCase().includes(variantFilterString.toLowerCase()),
        );

  const totalPages = Math.ceil(variantsToShow.length / columnsPerPage);

  const techValue = (product: ProductRegistrationDTOV2, key: string): string | undefined => {
    const data = product.productData.techData.find((data) => data.key === key);
    if (data && data.value) {
      return toValueAndUnit(data.value, data.unit);
    }
    return undefined;
  };

  async function onDelete() {
    if (!variant) return;

    deleteProducts(loggedInUser?.isAdmin ?? true, [variant.id], variant.isPublished)
      .then(() => {
        mutateVariants();
        mutateSeries();

        const deletingSingleVariantOnPage =
          pageState > 1 && pageState == totalPages && series.variants.length % columnsPerPage == 1;

        if (deletingSingleVariantOnPage) {
          searchParams.set("page", (pageState - 1).toString());
          setSearchParams(searchParams);
          setPageState(pageState - 1);
        }
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onMoveProductVariantToOtherSeries(seriesId: string, productVariantIds: string[]) {
    moveProductsToSeries(seriesId, productVariantIds)
      .then(() => {
        mutateVariants();
        mutateSeries();
        setMoveProductVariantModalIsOpen(false);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const paginatedVariants = variantsToShow.slice((pageState - 1) * columnsPerPage, pageState * columnsPerPage);

  const anyExpired = series.variants.some((variant) => variant.isExpired);

  const setAsExpired = (product: ProductRegistrationDTOV2) => {
    setVariantToExpired(product.id, loggedInUser?.isAdmin || false)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  };

  const setAsActive = (product: ProductRegistrationDTOV2) => {
    setVariantToActive(product.id, loggedInUser?.isAdmin || false)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  };

  const resetPageState = () => {
    searchParams.set("page", "1");
    setSearchParams(searchParams);
    setPageState(1);
  };

  return (
    <>
      <ConfirmModal
        title={"Er du sikker på at du vil slette varianten?"}
        confirmButtonText={"Slett"}
        onClick={() => onDelete().then(() => setDeleteVariantConfirmationModalIsOpen(false))}
        onClose={() => setDeleteVariantConfirmationModalIsOpen(false)}
        isModalOpen={deleteVariantConfirmationModalIsOpen}
      />
      <MoveProductVariantsModal
        seriesId={series.id}
        variants={series.variants}
        seriesFromIso={series.isoCategory?.isoCode ?? ""}
        onClick={onMoveProductVariantToOtherSeries}
        onClose={() => setMoveProductVariantModalIsOpen(false)}
        isModalOpen={moveProductVariantModalIsOpen}
      />
      <Tabs.Panel value="variants" className={styles.tabPanel}>
        {hasNoVariants && (
          <Alert variant={showInputError ? "error" : "info"}>
            Produktet trenger en eller flere varianter. Her kan man legge inn varianter som varierer for eksempel i
            størrelse eller farge. Alle variantene skal ha eget navn som skiller variantene fra hverandre,
            artikkelnummer fra leverandør og teknisk data.
          </Alert>
        )}
        {!hasNoVariants && (
          <Box background="surface-default" padding={{ xs: "2", md: "6" }} borderRadius="xlarge">
            <VStack gap="4">
              {series.variants.length > columnsPerPage && (
                <Box role="search" style={{ maxWidth: "475px" }}>
                  <Search
                    className="search-button"
                    label="Søk"
                    variant="simple"
                    clearButton={true}
                    onClear={() => {
                      setVariantFilterString("");
                      resetPageState();
                    }}
                    placeholder="Filtrer på hms-nr, lev-artnr, variantnavn"
                    size="medium"
                    value={variantFilterString}
                    onChange={(value) => {
                      setVariantFilterString(value);
                      resetPageState();
                    }}
                    hideLabel={true}
                  />
                </Box>
              )}
              <div className={styles.variantTable}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="row"></Table.HeaderCell>
                      {paginatedVariants.map((product) => (
                        <Table.HeaderCell scope="row" key={`edit-${product.id}-i`}>
                          {series.status === "EDITABLE" && (
                            <Dropdown>
                              <Button
                                variant="tertiary"
                                size="small"
                                icon={<MenuElipsisHorizontalCircleIcon title="Meny" />}
                                as={Dropdown.Toggle}
                              ></Button>
                              <Dropdown.Menu>
                                <Dropdown.Menu.List>
                                  {series.status === "EDITABLE" && (
                                    <>
                                      <Dropdown.Menu.List.Item
                                        onClick={() => {
                                          navigate(`${pathname}/rediger-variant/${product.id}?page=${pageState}`);
                                        }}
                                      >
                                        Endre
                                        <PencilIcon aria-hidden />
                                      </Dropdown.Menu.List.Item>
                                      {!product.isPublished ? (
                                        <Dropdown.Menu.List.Item
                                          onClick={() => {
                                            setVariant(product);
                                            setDeleteVariantConfirmationModalIsOpen(true);
                                          }}
                                        >
                                          Slett
                                          <TrashIcon aria-hidden />
                                        </Dropdown.Menu.List.Item>
                                      ) : product.isExpired ? (
                                        <Dropdown.Menu.List.Item onClick={() => setAsActive(product)}>
                                          Marker variant som aktiv
                                        </Dropdown.Menu.List.Item>
                                      ) : (
                                        <Dropdown.Menu.List.Item onClick={() => setAsExpired(product)}>
                                          Marker variant som utgått
                                        </Dropdown.Menu.List.Item>
                                      )}
                                      {product.isPublished && loggedInUser?.isAdmin && (
                                        <Dropdown.Menu.List.Item
                                          onClick={() => {
                                            setVariant(product);
                                            setDeleteVariantConfirmationModalIsOpen(true);
                                          }}
                                        >
                                          Slett
                                          <TrashIcon aria-hidden />
                                        </Dropdown.Menu.List.Item>
                                      )}
                                    </>
                                  )}
                                </Dropdown.Menu.List>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </Table.HeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.HeaderCell scope="row">Variantnavn:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`articleName-${i}`}>{product.articleName || "-"}</Table.DataCell>
                      ))}
                    </Table.Row>
                    {anyExpired && (
                      <Table.Row>
                        <Table.HeaderCell scope="row">Status:</Table.HeaderCell>
                        {paginatedVariants.map((product, i) => (
                          <Table.DataCell key={`expired-${i}`}>
                            {product.isExpired && <Tag variant="warning-moderate">Utgått</Tag>}
                          </Table.DataCell>
                        ))}
                      </Table.Row>
                    )}
                    <Table.Row>
                      <Table.HeaderCell scope="row">Lev-artnr:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`levart-${i}`}>
                          {product.supplierRef ? (isUUID(product.supplierRef) ? "-" : product.supplierRef) : "-"}
                        </Table.DataCell>
                      ))}
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell scope="row">Hms-nr:</Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`hms-${i}`}>{product.hmsArtNr || "-"}</Table.DataCell>
                      ))}
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell scope="row">Passer med</Table.HeaderCell>

                      {paginatedVariants.map((product, i) => (
                        <Table.DataCell key={`hms-${i}`}>
                          {series.status === "EDITABLE" && loggedInUser?.isAdmin ? (
                            <Link to={`${pathname}/rediger-passer-med/${product.id}?page=${pageState}`}>
                              {noWorksWith(product)} produkter <PencilIcon />
                            </Link>
                          ) : (
                            <Link to={`${pathname}/se-passer-med/${product.id}?page=${pageState}`}>
                              {noWorksWith(product)} produkter
                            </Link>
                          )}
                        </Table.DataCell>
                      ))}
                    </Table.Row>
                    {techKeys.map((key) => (
                      <Table.Row key={key}>
                        <Table.HeaderCell scope="row">{key}</Table.HeaderCell>
                        {paginatedVariants.map((product, i) => (
                          <Table.DataCell key={`${key}-${i}`}>{techValue(product, key) || "-"}</Table.DataCell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination
                  page={pageState}
                  onPageChange={(x) => {
                    searchParams.set("page", x.toString());
                    setSearchParams(searchParams);
                    setPageState(x);
                  }}
                  count={totalPages}
                  size="small"
                />
              )}
            </VStack>
          </Box>
        )}
        {series.status === "EDITABLE" && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            style={{ marginTop: "16px" }}
            onClick={() => {
              navigate(
                `${pathname}/opprett-variant/${series.id}?page=${
                  Math.floor(series.variants.length / columnsPerPage) + 1
                }`,
              );
            }}
          >
            Legg til ny variant
          </Button>
        )}
        {series.status === "EDITABLE" && loggedInUser?.isAdmin && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<ArrowsSquarepathIcon fontSize="1.5rem" aria-hidden />}
            style={{ marginTop: "16'px" }}
            onClick={() => setMoveProductVariantModalIsOpen(true)}
          >
            Flytt varianter til annen serie
          </Button>
        )}
      </Tabs.Panel>
    </>
  );
};

const noWorksWith = (product: ProductRegistrationDTOV2) => {
  return product.productData.attributes.worksWith?.productIds.length ?? 0;
};

export default VariantsTab;
