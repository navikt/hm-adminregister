import { MenuElipsisHorizontalCircleIcon, PencilIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import { Alert, Box, Button, Dropdown, Pagination, Table, Tabs, Tag, VStack } from "@navikt/ds-react";
import { deleteDraftProducts, setVariantToActive, setVariantToExpired } from "api/ProductApi";
import { DeleteVariantConfirmationModal } from "products/variants/DeleteVariantConfirmationModal";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAllUniqueTechDataKeys } from "utils/product-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { isUUID, toValueAndUnit } from "utils/string-util";
import { userProductVariantsBySeriesId } from "utils/swr-hooks";
import { ProductRegistrationDTOV2, SeriesRegistrationDTOV2 } from "utils/types/response-types";

const VariantsTab = ({
  series,
  isEditable,
  showInputError,
  mutateSeries,
}: {
  series: SeriesRegistrationDTOV2;
  isEditable: boolean;
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
  const totalPages = Math.ceil(series.variants.length / columnsPerPage);
  const [pageState, setPageState] = useState(Number(searchParams.get("page")) || 1);

  const [deleteVariantConfirmationModalIsOpen, setDeleteVariantConfirmationModalIsOpen] = useState<{
    open: boolean;
    variantId: string | undefined;
  }>({
    open: false,
    variantId: undefined,
  });

  const { mutateVariants } = userProductVariantsBySeriesId(series.id);

  const hasNoVariants = series.variants.length === 0;

  const techValue = (product: ProductRegistrationDTOV2, key: string): string | undefined => {
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

  const paginatedVariants = series.variants.slice((pageState - 1) * columnsPerPage, pageState * columnsPerPage);

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

  const showDropdownMenu = series.status === "EDITABLE" || series.status === "DONE";

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
                      {paginatedVariants.map((product) => (
                        <Table.HeaderCell scope="row" key={`edit-${product.id}-i`}>
                          {showDropdownMenu && (
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
                                    <Dropdown.Menu.List.Item
                                      onClick={() => {
                                        navigate(`${pathname}/rediger-variant/${product.id}?page=${pageState}`);
                                      }}
                                      disabled={series.inAgreement}
                                    >
                                      Endre
                                      <PencilIcon aria-hidden />
                                    </Dropdown.Menu.List.Item>
                                  )}
                                  {series.status === "EDITABLE" && !series.isPublised && (
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
                                  )}
                                  {series.isPublised &&
                                    (product.isExpired ? (
                                      <Dropdown.Menu.List.Item onClick={() => setAsActive(product)}>
                                        Marker variant som aktiv
                                      </Dropdown.Menu.List.Item>
                                    ) : (
                                      <Dropdown.Menu.List.Item onClick={() => setAsExpired(product)}>
                                        Marker variant som utgått
                                      </Dropdown.Menu.List.Item>
                                    ))}
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
                }`
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
