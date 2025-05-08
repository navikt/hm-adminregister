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
  deleteSeries,
  setPublishedSeriesToDraft,
  setSeriesToActive,
  setSeriesToInactive,
  updateProductTitle,
  useSeriesV2,
} from "api/SeriesApi";
import { HM_REGISTER_URL } from "environments";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import AdminActions from "products/AdminActions";
import DocumentTab from "products/files/DocumentsTab";
import ImageTab from "products/files/images/ImagesTab";
import { RequestApprovalModal } from "products/RequestApprovalModal";
import { numberOfDocuments, numberOfImages, numberOfVideos } from "products/seriesUtils";
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

const Product = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname, state } = useLocation();
  const oversiktPath = typeof state === "string" ? state : "/produkter";
  const [approvalModalIsOpen, setApprovalModalIsOpen] = useState(false);
  const [deleteConfirmationModalIsOpen, setDeleteConfirmationModalIsOpen] = useState(false);
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
    if (loggedInUser?.isAdmin) {
      return series.variants.length > 0;
    } else {
      const hasDescription = series.text.length > 0;
      const hasImages = series.isPublished ? numberOfImages(series) > 0 : numberOfImages(series) > 1;
      const hasVariants = series.variants.length > 0;

      return hasDescription && hasImages && hasVariants;
    }
  };

  const handleSaveProductTitle = () => {
    setShowEditProductTitleMode(false);
    updateProductTitle(series!.id, productTitle)
      .then(() => mutateSeries())
      .catch((error) => setGlobalError(error.status, error.message));
  };

  const isEditable = series.status === "EDITABLE";

  async function onDelete() {
    setDeleteConfirmationModalIsOpen(false);
    deleteSeries(series!.id)
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
            <DefinitionList fullWidth horizontal>
              <DefinitionList.Term>ISO-kategori</DefinitionList.Term>
              <DefinitionList.Definition>
                {series.isoCategory ? `${series.isoCategory?.isoTitle} (${series.isoCategory?.isoCode})` : "Ingen"}
              </DefinitionList.Definition>
            </DefinitionList>
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
                    showAlert={false}
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
