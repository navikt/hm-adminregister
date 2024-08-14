import { useState } from "react";

import { Alert, Button, Heading, HGrid, HStack, Label, Loader, Tabs, TextField, VStack } from "@navikt/ds-react";

import { ExclamationmarkTriangleIcon, FloppydiskIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import { updateProductTitle, useSeriesV2 } from "api/SeriesApi";
import { HM_REGISTER_URL } from "environments";
import AdminActions from "products/AdminActions";
import { DeleteConfirmationModal } from "products/DeleteConfirmationModal";
import { EditPublishedProductConfirmationModal } from "products/EditPublishedProductConfirmationModal";
import { RequestApprovalModal } from "products/RequestApprovalModal";
import { numberOfDocuments, numberOfImages, numberOfVideos } from "products/seriesUtils";
import StatusPanel from "products/StatusPanel";
import SupplierActions from "products/SupplierActions";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import "./product-page.scss";
import { SetExpiredSeriesConfirmationModal } from "./SetExpiredSeriesConfirmationModal";
import AboutTab from "./about/AboutTab";
import DocumentTab from "products/files/DocumentsTab";
import ImageTab from "products/files/images/ImagesTab";
import VideosTab from "products/videos/VideosTab";
import VariantsTab from "./variants/VariantsTab";

const Product = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
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
  const activeTab = searchParams.get("tab");

  const [showEditProductTitleMode, setShowEditProductTitleMode] = useState(false);
  const [productTitle, setProductTitle] = useState("");

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  const { series, isLoadingSeries, errorSeries, mutateSeries } = useSeriesV2(seriesId!);

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
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="error">
            Kunne ikke vise produkt. Prøv å laste siden på nytt, eller gå tilbake. Hvis problemet vedvarer, kan du sende
            oss en e-post{" "}
            <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
              digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
            </a>
          </Alert>
        </HGrid>
      </main>
    );
  }

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  const productIsValid = () => {
    return !(!series.text || (!loggedInUser?.isAdmin && numberOfImages(series) === 0) || series.variants.length === 0);
  };

  const handleSaveProductTitle = () => {
    setShowEditProductTitleMode(false);
    updateProductTitle(series!.id, productTitle, loggedInUser?.isAdmin || false)
      .then(() => mutateSeries())
      .catch((error) => setGlobalError(error.status, error.message));
  };

  const isEditable = series.status === "EDITABLE";

  const TabLabel = ({
    title,
    numberOfElements,
    showAlert,
  }: {
    title: string;
    numberOfElements: number;
    showAlert: boolean;
  }) => {
    return (
      <>
        {title}
        {numberOfElements === 0 && !isValid && showAlert ? (
          <span className="product-error-text product-tab-tabel">
            ({numberOfElements})<ExclamationmarkTriangleIcon />
          </span>
        ) : (
          <span>({numberOfElements})</span>
        )}
      </>
    );
  };

  return (
    <main className="show-menu">
      <RequestApprovalModal
        series={series}
        mutateSeries={mutateSeries}
        isValid={isValid}
        isOpen={approvalModalIsOpen}
        setIsOpen={setApprovalModalIsOpen}
      />
      <DeleteConfirmationModal
        series={series}
        mutateSeries={mutateSeries}
        isOpen={deleteConfirmationModalIsOpen}
        setIsOpen={setDeleteConfirmationModalIsOpen}
      />
      <SetExpiredSeriesConfirmationModal
        series={series}
        mutateSeries={mutateSeries}
        params={expiredSeriesModalIsOpen}
        setParams={setExpiredSeriesModalIsOpen}
      />
      <EditPublishedProductConfirmationModal
        series={series}
        mutateSeries={mutateSeries}
        isOpen={editProductModalIsOpen}
        setIsOpen={setEditProductModalIsOpen}
      />
      <HGrid gap="12" columns={{ xs: 1, sm: "minmax(16rem, 55rem) 200px" }} className="product-page">
        <VStack gap={{ xs: "4", md: "8" }}>
          <VStack gap="1">
            <Label> Produktnavn</Label>

            <HStack gap="1">
              {!showEditProductTitleMode && (
                <Heading level="1" size="xlarge">
                  {loggedInUser?.isAdmin && series.published ? (
                    <a
                      href={`${HM_REGISTER_URL()}/produkt/${series.id}`}
                      target="_blank"
                      className="heading-link"
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
                  onClick={() => setShowEditProductTitleMode(true)}
                ></Button>
              )}
            </HStack>
          </VStack>
          <Tabs defaultValue={activeTab || "about"} onChange={updateUrlOnTabChange}>
            <Tabs.List>
              <Tabs.Tab
                value="about"
                label={
                  <>
                    Om produktet
                    {!series.text && !isValid && <ExclamationmarkTriangleIcon className="product-error-text" />}
                  </>
                }
              />
              <Tabs.Tab
                value="variants"
                label={<TabLabel title="Egenskaper" numberOfElements={series.variants.length} showAlert={true} />}
              />
              <Tabs.Tab
                value="images"
                label={<TabLabel title="Bilder" numberOfElements={numberOfImages(series)} showAlert={true} />}
              />
              <Tabs.Tab
                value="documents"
                label={<TabLabel title="Dokumenter" numberOfElements={numberOfDocuments(series)} showAlert={false} />}
              />
              <Tabs.Tab
                value="videos"
                label={<TabLabel title="Videolenker" numberOfElements={numberOfVideos(series)} showAlert={false} />}
              />
            </Tabs.List>
            <AboutTab
              series={series}
              isAdmin={loggedInUser?.isAdmin || false}
              mutateSeries={mutateSeries}
              isoCategory={series.isoCategory}
              isEditable={isEditable}
              showInputError={!isValid}
            />
            <ImageTab series={series} mutateSeries={mutateSeries} isEditable={isEditable} showInputError={!isValid} />
            <DocumentTab
              series={series}
              mutateSeries={mutateSeries}
              isEditable={isEditable}
              showInputError={!isValid}
            />
            <VideosTab series={series} mutateSeries={mutateSeries} isEditable={isEditable} />
            <VariantsTab
              series={series}
              mutateSeries={mutateSeries}
              isEditable={isEditable}
              showInputError={!isValid}
            />
          </Tabs>
        </VStack>
        <VStack gap={{ xs: "2", md: "4" }}>
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
