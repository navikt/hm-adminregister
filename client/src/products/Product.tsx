import { useState } from "react";

import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ArrowLeftIcon, ExclamationmarkTriangleIcon, FloppydiskIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Button,
  CopyButton,
  Detail,
  Heading,
  HGrid,
  HStack,
  Label,
  Link as AkselLink,
  Loader,
  Tabs,
  Tag,
  TextField,
  VStack,
} from "@navikt/ds-react";

import {
  changeMainProductToPart,
  deleteSeries,
  setPublishedSeriesToDraft,
  setSeriesToActive,
  setSeriesToInactive,
  updateProductIsoCategory,
  updateProductTitle,
  useSeriesV2,
} from "api/SeriesApi";
import { HM_REGISTER_URL } from "environments";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import AdminActions from "products/AdminActions";
import DocumentTab from "products/files/DocumentsTab";
import ImageTab from "products/files/images/ImagesTab";
import { RequestApprovalModal } from "products/RequestApprovalModal";
import { numberOfDocuments, numberOfImages, numberOfVideos, seriesStatus } from "products/seriesUtils";
import StatusPanel from "products/StatusPanel";
import SupplierActions from "products/SupplierActions";
import VideosTab from "products/videos/VideosTab";

import ErrorAlert from "error/ErrorAlert";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import AboutTab from "./about/AboutTab";
import styles from "./ProductPage.module.scss";
import VariantsTab from "./variants/VariantsTab";
import { TabLabel } from "felleskomponenter/TabLabel";
import ChangeProductToPartModal from "products/ChangeProductToPartModal";
import { useIsoCategories } from "utils/swr-hooks";
import IsoComboboxProvider from "products/iso-combobox/IsoComboboxProvider";
import { labelRequired } from "utils/string-util";
import ChangeISOCategoryModal from "products/ChangeISOCategoryModal";

type Error = {
  isoCodeErrorMessage?: string | undefined;
};

const Product = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname, state } = useLocation();
  const oversiktPath = typeof state === "string" ? state : "/produkter";
  const [approvalModalIsOpen, setApprovalModalIsOpen] = useState(false);
  const [deleteConfirmationModalIsOpen, setDeleteConfirmationModalIsOpen] = useState(false);
  const [changeToPartModalIsOpen, setChangeToPartModalIsOpen] = useState(false);
  const [changeToIsoCategoryModalIsOpen, setChangeToIsoCategoryModalIsOpen] = useState(false);
  const [editProductModalIsOpen, setEditProductModalIsOpen] = useState(false);
  const [expiredSeriesModalIsOpen, setExpiredSeriesModalIsOpen] = useState<{
    open: boolean;
    newStatus: "ACTIVE" | "INACTIVE" | undefined;
  }>({
    open: false,
    newStatus: undefined,
  });

  const [isValid, setIsValid] = useState(true);
  const activeTab = searchParams.get("tab") ?? "about";

  const [showEditProductTitleMode, setShowEditProductTitleMode] = useState(false);
  const [productTitle, setProductTitle] = useState("");

  const [showEditIsoCategoryMode, setShowEditIsoCategoryMode] = useState(false);

  const { isoCategories } = useIsoCategories();
  const [isoCategory, setIsoCategory] = useState<string>("");
  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    return parts[parts.length - 1].replace(/\s/g, ""); // Remove spaces
  };

  const onToggleSelected = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setIsoCategory(option);
      setSelectedOptions([option]);
    } else {
      setIsoCategory("");
      setSelectedOptions([]);
    }
  };

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  const { data: series, isLoading: isLoadingSeries, error: errorSeries, mutate: mutateSeries } = useSeriesV2(seriesId!);

  if (isLoadingSeries) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!series || errorSeries) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`, { state: state });
  };

  const productIsValid = () => {
    if (series.expired) {
    }

    if (loggedInUser?.isAdmin) {
      return series.variants.length > 0;
    } else if (series.isExpired) {
      return true;
    } else {
      const hasDescription = series.text.length > 0;
      const hasImages = series.isPublished ? numberOfImages(series) > 0 : numberOfImages(series) > 1;
      const hasVariants = series.variants.length > 0;
      const hasDocuments = numberOfDocuments(series) > 0;

      return hasDescription && hasImages && hasDocuments && hasVariants;
    }
  };

  const handleSaveProductTitle = () => {
    setShowEditProductTitleMode(false);
    updateProductTitle(series!.id, productTitle)
      .then(() => mutateSeries())
      .catch((error) => setGlobalError(error.status, error.message));
  };

  const handleSaveIsoCategory = (isoCategory: string, resetTechnicalData: boolean) => {
    setChangeToIsoCategoryModalIsOpen(false);
    updateProductIsoCategory(series!.id, handleSetFormValueIso(isoCategory), resetTechnicalData)
      .then(() => mutateSeries())
      .catch((error) => setGlobalError(error.status, error.message));
  };

  const isEditable = series.status === "EDITABLE";

  async function onDelete() {
    setDeleteConfirmationModalIsOpen(false);
    deleteSeries(series!.id, series!.isPublished)
      .then(() => {
        mutateSeries();
        navigate("/produkter");
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onEditMode() {
    setEditProductModalIsOpen(false);
    setPublishedSeriesToDraft(series!.id)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onToActive() {
    setExpiredSeriesModalIsOpen({ open: false, newStatus: undefined });
    setSeriesToActive(series!.id)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onToInactive() {
    setExpiredSeriesModalIsOpen({ open: false, newStatus: undefined });
    setSeriesToInactive(series!.id)
      .then(() => {
        mutateSeries();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  async function onSwitchToPart(accessory: boolean, newIsoCode: string) {
    setChangeToPartModalIsOpen(false);

    changeMainProductToPart(series!.id, accessory, newIsoCode, false) //todo: resetTechnicalData
      .then(() => {
        mutateSeries();
        navigate(`/del/${series?.variants[0].id}`);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <main className="show-menu">
      <RequestApprovalModal
        series={series}
        mutateSeries={mutateSeries}
        isValid={isValid}
        isOpen={approvalModalIsOpen}
        setIsOpen={setApprovalModalIsOpen}
      />
      <ConfirmModal
        title={"Er du sikker på at du vil slette produktet?"}
        confirmButtonText={"Slett"}
        onClick={onDelete}
        onClose={() => setDeleteConfirmationModalIsOpen(false)}
        isModalOpen={deleteConfirmationModalIsOpen}
      />
      <ChangeProductToPartModal
        isOpen={changeToPartModalIsOpen}
        setIsOpen={setChangeToPartModalIsOpen}
        onClick={onSwitchToPart}
      />
      <ChangeISOCategoryModal
        isOpen={changeToIsoCategoryModalIsOpen}
        setIsOpen={setChangeToIsoCategoryModalIsOpen}
        onClick={handleSaveIsoCategory}
      />
      {expiredSeriesModalIsOpen.newStatus === "ACTIVE" && (
        <ConfirmModal
          title={"Ønsker du å markere dette produktet og alle dens varianter som aktiv?"}
          confirmButtonText={"Marker som aktiv"}
          onClick={onToActive}
          onClose={() => setExpiredSeriesModalIsOpen({ open: false, newStatus: undefined })}
          isModalOpen={expiredSeriesModalIsOpen.open}
        />
      )}
      {expiredSeriesModalIsOpen.newStatus === "INACTIVE" && (
        <ConfirmModal
          title={"Ønsker du å markere dette produktet og alle dens varianter som utgått?"}
          confirmButtonText={"Marker som utgått"}
          onClick={onToInactive}
          onClose={() => setExpiredSeriesModalIsOpen({ open: false, newStatus: undefined })}
          isModalOpen={expiredSeriesModalIsOpen.open}
        />
      )}
      <ConfirmModal
        title={"Vil du sette produktet i redigeringsmodus?"}
        confirmButtonText={"OK"}
        onClick={onEditMode}
        onClose={() => setEditProductModalIsOpen(false)}
        isModalOpen={editProductModalIsOpen}
      />
      <HGrid
        gap="12"
        columns={{ xs: 1, sm: "minmax(16rem, 48rem) 200px", xl: "minmax(16rem, 48rem) 250px" }}
        className={styles.productPage}
      >
        <VStack gap={{ xs: "6", md: "10" }}>
          <VStack gap="6">
            <AkselLink as={Link} to={oversiktPath}>
              <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
              Tilbake til oversikt
            </AkselLink>
            <VStack gap="2">
              <Label> Produktnavn</Label>

              <HStack gap="1">
                {!showEditProductTitleMode && (
                  <Heading level="1" size="xlarge">
                    {loggedInUser?.isAdmin && series.published ? (
                      <a
                        href={`${HM_REGISTER_URL()}/produkt/${series.id}`}
                        target="_blank"
                        className={styles.headingLink}
                        rel="noreferrer"
                      >
                        {series.title ?? ""}
                      </a>
                    ) : (
                      <>{series.title ?? ""}</>
                    )}
                  </Heading>
                )}
                {showEditProductTitleMode && (
                  <>
                    <TextField
                      defaultValue={series.title ?? ""}
                      label={""}
                      aria-label="Rediger tittel"
                      id="title"
                      name="title"
                      onChange={(event) => setProductTitle(event.currentTarget.value)}
                    />
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<FloppydiskIcon fontSize="1.5rem" aria-hidden />}
                      onClick={handleSaveProductTitle}
                    >
                      Lagre
                    </Button>
                  </>
                )}

                {isEditable && !showEditProductTitleMode && (
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<PencilWritingIcon title="Endre produktnavn" fontSize="1.5rem" />}
                    onClick={() => {
                      setProductTitle(series.title);
                      setShowEditProductTitleMode(true);
                    }}
                  ></Button>
                )}
              </HStack>
              {loggedInUser?.isAdmin && (
                <HStack align="center">
                  <Detail>{series.id}</Detail>
                  <CopyButton size="xsmall" copyText={series.id} />
                </HStack>
              )}

              {series.isExpired && (
                <Box>
                  <Tag variant="warning-moderate">Utgått</Tag>
                </Box>
              )}
              {!series.isExpired && series.status !== "DONE" && (
                <Box
                  paddingInline="4"
                  paddingBlock="1"
                  borderRadius="small"
                  width="fit-content"
                  style={{ backgroundColor: "#EFECF4" }}
                >
                  <HStack gap="2" align="center">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <circle cx="3" cy="3.5" r="3" fill="#8269A2" />
                    </svg>
                    <BodyShort>{series.isPublished ? "Nye endringer" : "Nytt produkt"}</BodyShort>
                  </HStack>
                </Box>
              )}
            </VStack>
            <HStack gap="2" align="center">
              {isEditable && loggedInUser?.isAdmin && showEditIsoCategoryMode && (
                <HStack align="end" gap="2">
                  <IsoComboboxProvider
                    label={labelRequired("Iso-kategori (kode)")}
                    description={"Søk etter isokategori produktet passer best inn i"}
                    selectedOptions={selectedOptions}
                    options={isoCodesAndTitles || []}
                    onToggleSelected={onToggleSelected}
                    // onBlur={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
                    // onFocus={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
                    // error={fieldError?.isoCodeErrorMessage ?? ""}
                    maxSelected={{ limit: 1 }}
                  />
                  <Button
                    className="fit-content"
                    variant="tertiary"
                    icon={<FloppydiskIcon fontSize="1.5rem" aria-hidden />}
                    // onClick={handleSaveIsoCategory}
                  >
                    Lagre
                  </Button>
                </HStack>
              )}
              {!showEditIsoCategoryMode && (
                <DefinitionList fullWidth horizontal>
                  <DefinitionList.Term>ISO-kategori</DefinitionList.Term>
                  <DefinitionList.Definition>
                    {series.isoCategory ? `${series.isoCategory?.isoTitle} (${series.isoCategory?.isoCode})` : "Ingen"}
                  </DefinitionList.Definition>
                </DefinitionList>
              )}
              {isEditable && loggedInUser?.isAdmin && !showEditIsoCategoryMode && (
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PencilWritingIcon title="Endre iso-kategori" fontSize="1.5rem" />}
                  onClick={() => {
                    //setShowEditIsoCategoryMode(true);
                    setChangeToIsoCategoryModalIsOpen(true);
                  }}
                ></Button>
              )}
            </HStack>
          </VStack>
          <Tabs defaultValue={activeTab} value={activeTab} onChange={updateUrlOnTabChange}>
            <Tabs.List>
              <Tabs.Tab
                value="about"
                label={
                  <>
                    Om produktet
                    {!series.text && !isValid && <ExclamationmarkTriangleIcon className={styles.errorText} />}
                  </>
                }
              />
              <Tabs.Tab
                value="variants"
                label={
                  <TabLabel
                    title="Egenskaper"
                    numberOfElements={series.variants.length}
                    showAlert={true}
                    isValid={isValid}
                  />
                }
              />
              <Tabs.Tab
                value="images"
                label={
                  <TabLabel
                    title="Bilder"
                    numberOfElements={numberOfImages(series)}
                    showAlert={true}
                    isValid={isValid}
                  />
                }
              />
              <Tabs.Tab
                value="documents"
                label={
                  <TabLabel
                    title="Dokumenter"
                    numberOfElements={numberOfDocuments(series)}
                    showAlert={true}
                    isValid={isValid}
                  />
                }
              />
              <Tabs.Tab
                value="videos"
                label={
                  <TabLabel
                    title="Videolenker"
                    numberOfElements={numberOfVideos(series)}
                    showAlert={false}
                    isValid={isValid}
                  />
                }
              />
            </Tabs.List>
            <AboutTab series={series} mutateSeries={mutateSeries} isEditable={isEditable} showInputError={!isValid} />
            <ImageTab series={series} isEditable={isEditable} showInputError={!isValid} />
            <DocumentTab series={series} isEditable={isEditable} showInputError={!isValid} />
            <VideosTab series={series} mutateSeries={mutateSeries} isEditable={isEditable} />
            <VariantsTab series={series} mutateSeries={mutateSeries} showInputError={!isValid} />
          </Tabs>
        </VStack>
        <VStack gap={{ xs: "6", md: "10" }}>
          {loggedInUser?.isAdmin && (
            <AdminActions
              series={series}
              mutateSeries={mutateSeries}
              setIsValid={setIsValid}
              productIsValid={productIsValid}
              setApprovalModalIsOpen={setApprovalModalIsOpen}
              setDeleteConfirmationModalIsOpen={setDeleteConfirmationModalIsOpen}
              setExpiredSeriesModalIsOpen={setExpiredSeriesModalIsOpen}
              setSwitchToPartModalIsOpen={setChangeToPartModalIsOpen}
            />
          )}
          {!loggedInUser?.isAdmin && (
            <SupplierActions
              series={series}
              setIsValid={setIsValid}
              productIsValid={productIsValid}
              setApprovalModalIsOpen={setApprovalModalIsOpen}
              setDeleteConfirmationModalIsOpen={setDeleteConfirmationModalIsOpen}
              setExpiredSeriesModalIsOpen={setExpiredSeriesModalIsOpen}
              setEditProductModalIsOpen={setEditProductModalIsOpen}
            />
          )}

          <StatusPanel series={series} />
        </VStack>
      </HGrid>
    </main>
  );
};
export default Product;
