import { MenuElipsisHorizontalCircleIcon, PencilIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, Box, Button, Dropdown, Pagination, Table, Tabs, Tag, VStack } from "@navikt/ds-react";
import { deleteDraftProducts, updateProductVariant } from "api/ProductApi";
import { DeleteVariantConfirmationModal } from "produkter/variants/DeleteVariantConfirmationModal";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { tenYearsFromTodayTimestamp, todayTimestamp } from "utils/date-util";
import { getAllUniqueTechDataKeys } from "utils/product-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { isUUID, toValueAndUnit } from "utils/string-util";
import { userProductVariantsBySeriesId } from "utils/swr-hooks";
import { ProductRegistrationDTO } from "utils/types/response-types";

const VariantsTab = ({
  seriesUUID,
  products,
  isEditable,
  showInputError,
  mutateSeries,
}: {
  seriesUUID: string;
  products: ProductRegistrationDTO[];
  isEditable: boolean;
  showInputError: boolean;
  mutateSeries: () => void;
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const techKeys = getAllUniqueTechDataKeys(products);
  const columnsPerPage = 5;
  const totalPages = Math.ceil(products.length / columnsPerPage);
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);

  const [deleteVariantConfirmationModalIsOpen, setDeleteVariantConfirmationModalIsOpen] = useState<{
    open: boolean;
    variantId: string | undefined;
  }>({
    open: false,
    variantId: undefined,
  });

  const { mutateVariants } = userProductVariantsBySeriesId(seriesUUID!);

  const hasNoVariants = products.length === 0;

  const techValue = (product: ProductRegistrationDTO, key: string): string | undefined => {
    const data = product.productData.techData.find((data) => data.key === key);
    if (data && data.value) {
      return toValueAndUnit(data.value, data.unit);
    }
    return undefined;
  };

  async function onDelete(productId: string) {
    deleteDraftProducts(loggedInUser?.isAdmin ?? true, [productId])
      .then(() => {
        mutateVariants();
        mutateSeries();

        const deletingSingleVariantOnPage =
          pageState > 1 && pageState == totalPages && products.length % columnsPerPage == 1;

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

  const paginatedVariants = products.slice((pageState - 1) * columnsPerPage, pageState * columnsPerPage);

  const anyExpired = products.some((product) => product.registrationStatus === "INACTIVE");

  const setAsExpired = (product: ProductRegistrationDTO) => {
    const productRegistrationUpdated: ProductRegistrationDTO = {
      ...product,
      registrationStatus: "INACTIVE",
      expired: todayTimestamp(),
    };

    updateProductVariant(loggedInUser?.isAdmin || false, productRegistrationUpdated)
      .then(() => {
        mutateVariants();
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  };

  const setAsActive = (product: ProductRegistrationDTO) => {
    const productRegistrationUpdated: ProductRegistrationDTO = {
      ...product,
      registrationStatus: "ACTIVE",
      expired: tenYearsFromTodayTimestamp(),
    };

    updateProductVariant(loggedInUser?.isAdmin || false, productRegistrationUpdated)
      .then(() => {
        mutateVariants();
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  };

  return (
    <>
      <DeleteVariantConfirmationModal
        onDelete={onDelete}
        params={deleteVariantConfirmationModalIsOpen}
        setParams={setDeleteVariantConfirmationModalIsOpen}
      ></DeleteVariantConfirmationModal>
      <Tabs.Panel value="variants" className="tab-panel">
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
              <div className="variant-table">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="row"></Table.HeaderCell>
                      {paginatedVariants.map((product, i) => (
                        <Table.HeaderCell scope="row" key={`edit-${product.id}-i`}>
                          <Dropdown>
                            <Button
                              variant="tertiary"
                              size="small"
                              icon={<MenuElipsisHorizontalCircleIcon title="Meny" />}
                              as={Dropdown.Toggle}
                            ></Button>
                            <Dropdown.Menu>
                              <Dropdown.Menu.List>
                                {isEditable && (
                                  <Dropdown.Menu.List.Item
                                    onClick={() => {
                                      navigate(`${pathname}/rediger-variant/${product.id}?page=${pageState}`);
                                    }}
                                  >
                                    Endre
                                    <PencilIcon aria-hidden />
                                  </Dropdown.Menu.List.Item>
                                )}
                                {product.draftStatus === "DRAFT" && product.published == null ? (
                                  <Dropdown.Menu.List.Item
                                    onClick={() =>
                                      setDeleteVariantConfirmationModalIsOpen({
                                        open: true,
                                        variantId: product.id,
                                      })
                                    }
                                  >
                                    Slett
                                    <TrashIcon aria-hidden />
                                  </Dropdown.Menu.List.Item>
                                ) : product.registrationStatus === "ACTIVE" ? (
                                  <Dropdown.Menu.List.Item
                                    disabled={product.draftStatus === "DRAFT"}
                                    onClick={() => setAsExpired(product)}
                                  >
                                    Sett som utgått
                                  </Dropdown.Menu.List.Item>
                                ) : (
                                  <Dropdown.Menu.List.Item onClick={() => setAsActive(product)}>
                                    Sett som aktiv
                                  </Dropdown.Menu.List.Item>
                                )}
                              </Dropdown.Menu.List>
                            </Dropdown.Menu>
                          </Dropdown>
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
                            {product.registrationStatus === "INACTIVE" && <Tag variant="warning-moderate">Utgått</Tag>}
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
        {isEditable && (
          //Sender med siste siden
          <Button
            as="a"
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon title="Legg til beskrivelse" fontSize="1.5rem" />}
            style={{ marginTop: "16px" }}
            onClick={() => {
              navigate(
                `${pathname}/opprett-variant/${seriesUUID}?page=${Math.floor(products.length / columnsPerPage) + 1}`,
              );
            }}
          >
            Legg til ny variant
          </Button>
        )}
      </Tabs.Panel>
    </>
  );
};

export default VariantsTab;
