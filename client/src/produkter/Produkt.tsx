import { useState } from "react";

import useSWR from "swr";

import { Alert, Button, Heading, HGrid, HStack, Label, Loader, Tabs, TextField, VStack } from "@navikt/ds-react";

import "./product-page.scss";
import { FormProvider, useForm } from "react-hook-form";
import AboutTab from "./tabs/AboutTab";
import VariantsTab from "./variants/VariantsTab";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { IsoCategoryDTO } from "utils/types/response-types";
import { fetcherGET, userProductVariantsBySeriesId, useSeries } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import StatusPanel from "produkter/StatusPanel";
import { ExclamationmarkTriangleIcon, FloppydiskIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import VideosTab from "./tabs/VideosTab";
import ImageTab from "./tabs/ImagesTab";
import DocumentTab from "./tabs/DocumentsTab";
import { numberOfDocuments, numberOfImages, numberOfVideos } from "produkter/seriesUtils";
import { RequestApprovalModal } from "produkter/RequestApprovalModal";
import { DeleteConfirmationModal } from "produkter/DeleteConfirmationModal";
import AdminActions from "produkter/AdminActions";
import SupplierActions from "produkter/SupplierActions";
import { updateSeries } from "api/SeriesApi";

export type EditSeriesInfo = {
  title: string;
  description: string;
  isoCode: string;
};

const ProductPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [approvalModalIsOpen, setApprovalModalIsOpen] = useState(false);
  const [deleteConfirmationModalIsOpen, setDeleteConfirmationModalIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const activeTab = searchParams.get("tab");

  const [showEditProductTitleMode, setShowEditProductTitleMode] = useState(false);

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  const { variants, isLoadingVariants, errorVariants, mutateVariants } = userProductVariantsBySeriesId(seriesId!);
  const { series, isLoadingSeries, errorSeries, mutateSeries } = useSeries(seriesId!);

  const { data: isoCategory } = useSWR<IsoCategoryDTO>(
    series?.isoCategory && series.isoCategory !== "0"
      ? `${HM_REGISTER_URL()}/admreg/api/v1/isocategories/${series.isoCategory}`
      : null,
    fetcherGET,
  );

  const formMethods = useForm<EditSeriesInfo>();

  if (errorSeries || errorVariants) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        Error
      </HGrid>
    );
  }

  if (isLoadingSeries || isLoadingVariants) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!series) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="info">Ingen data funnet.</Alert>
        </HGrid>
      </main>
    );
  }

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  async function onSubmit(data: EditSeriesInfo) {
    updateSeries(series!.id, data, loggedInUser?.isAdmin || false)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  const productIsValid = () => {
    return !(!series.text || numberOfImages(series) === 0 || series.count === 0);
  };

  const handleSaveDescription = () => {
    setShowEditProductTitleMode(false);
    formMethods.handleSubmit(onSubmit)();
  };

  const isDraft = series.draftStatus === "DRAFT";
  const isPending = series.adminStatus === "PENDING";
  const isActive = series.status === "ACTIVE";
  const isEditable = (series.draftStatus === "DRAFT" || (loggedInUser?.isAdmin ?? false)) && isActive;

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
      <FormProvider {...formMethods}>
        <RequestApprovalModal
          series={series}
          products={variants ?? []}
          mutateProducts={mutateVariants}
          mutateSeries={mutateSeries}
          isValid={isValid}
          isOpen={approvalModalIsOpen}
          setIsOpen={setApprovalModalIsOpen}
        />
        <DeleteConfirmationModal
          series={series}
          products={variants ?? []}
          mutateProducts={mutateVariants}
          mutateSeries={mutateSeries}
          isOpen={deleteConfirmationModalIsOpen}
          setIsOpen={setDeleteConfirmationModalIsOpen}
        />
        <HGrid gap="12" columns={{ xs: 1, sm: "minmax(16rem, 55rem) 200px" }} className="product-page">
          <VStack gap={{ xs: "4", md: "8" }}>
            <VStack gap="1">
              <Label>Produktnavn</Label>

              <HStack gap="1">
                {!showEditProductTitleMode && (
                  <Heading level="1" size="xlarge">
                    {series.title ?? ""}
                  </Heading>
                )}

                {showEditProductTitleMode && (
                  <>
                    <TextField
                      defaultValue={series.title ?? ""}
                      label={""}
                      id="title"
                      name="title"
                      onChange={(event) => formMethods.setValue("title", event.currentTarget.value)}
                    />
                    <Button
                      className="fit-content"
                      variant="tertiary"
                      icon={<FloppydiskIcon title="Lagre tittel" fontSize="1.5rem" />}
                      onClick={handleSaveDescription}
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
                  label={<TabLabel title="Egenskaper" numberOfElements={series.count} showAlert={true} />}
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
                onSubmit={onSubmit}
                isoCategory={isoCategory}
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
                seriesUUID={series.id}
                products={variants || []}
                isEditable={isEditable}
                showInputError={!isValid}
              />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: "2", md: "4" }}>
            {loggedInUser?.isAdmin && isActive && (
              <AdminActions
                series={series}
                products={variants || []}
                mutateProducts={mutateVariants}
                mutateSeries={mutateSeries}
                setIsValid={setIsValid}
                productIsValid={productIsValid}
                setApprovalModalIsOpen={setApprovalModalIsOpen}
                setDeleteConfirmationModalIsOpen={setDeleteConfirmationModalIsOpen}
              />
            )}
            {!loggedInUser?.isAdmin && isDraft && isActive && (
              <SupplierActions
                setIsValid={setIsValid}
                productIsValid={productIsValid}
                setApprovalModalIsOpen={setApprovalModalIsOpen}
                setDeleteConfirmationModalIsOpen={setDeleteConfirmationModalIsOpen}
              />
            )}
            <StatusPanel series={series} isAdmin={loggedInUser?.isAdmin || false} />
          </VStack>
        </HGrid>
      </FormProvider>
    </main>
  );
};
export default ProductPage;
