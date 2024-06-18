import { useState } from "react";

import useSWR from "swr";

import { Alert, Button, Heading, HGrid, HStack, Label, Loader, Tabs, TextField, VStack } from "@navikt/ds-react";

import { ExclamationmarkTriangleIcon, FloppydiskIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import { updateSeries } from "api/SeriesApi";
import { HM_REGISTER_URL } from "environments";
import AdminActions from "produkter/AdminActions";
import { DeleteConfirmationModal } from "produkter/DeleteConfirmationModal";
import { EditPublishedProductConfirmationModal } from "produkter/EditPublishedProductConfirmationModal";
import { RequestApprovalModal } from "produkter/RequestApprovalModal";
import { numberOfDocuments, numberOfImages, numberOfVideos } from "produkter/seriesUtils";
import StatusPanel from "produkter/StatusPanel";
import SupplierActions from "produkter/SupplierActions";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { fetcherGET, userProductVariantsBySeriesId, useSeries } from "utils/swr-hooks";
import { IsoCategoryDTO } from "utils/types/response-types";
import "./product-page.scss";
import { SetExpiredSeriesConfirmationModal } from "./SetExpiredSeriesConfirmationModal";
import AboutTab from "./tabs/AboutTab";
import DocumentTab from "./tabs/DocumentsTab";
import ImageTab from "./tabs/ImagesTab";
import VideosTab from "./tabs/VideosTab";
import VariantsTab from "./variants/VariantsTab";

export type EditSeriesInfo = {
  title: string;
  description: string;
  isoCode: string;
  url?: string;
};

const ProductPage = () => {
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

  if (isLoadingSeries || isLoadingVariants) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!series || errorVariants || errorSeries) {
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

  async function onSubmit(data: EditSeriesInfo) {
    updateSeries(series!.id, data, loggedInUser?.isAdmin || false)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  const productIsValid = () => {
    return !(!series.text || series.formattedText || numberOfImages(series) === 0 || series.count === 0);
  };

  const handleSaveDescription = () => {
    setShowEditProductTitleMode(false);
    formMethods.handleSubmit(onSubmit)();
  };

  const isEditable = series.draftStatus === "DRAFT" && series.status !== "DELETED";

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
        <SetExpiredSeriesConfirmationModal
          series={series}
          mutateSeries={mutateSeries}
          params={expiredSeriesModalIsOpen}
          setParams={setExpiredSeriesModalIsOpen}
        />
        <EditPublishedProductConfirmationModal
          series={series}
          mutateProducts={mutateVariants}
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
                        href={`${HM_REGISTER_URL()}/produkt/${series.identifier}`}
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
                      {!series.text && !series.formattedText && !isValid && (
                        <ExclamationmarkTriangleIcon className="product-error-text" />
                      )}
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
                mutateSeries={mutateSeries}
                products={variants || []}
                isEditable={isEditable}
                showInputError={!isValid}
              />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: "2", md: "4" }}>
            {loggedInUser?.isAdmin && (
              <AdminActions
                series={series}
                products={variants || []}
                mutateProducts={mutateVariants}
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
                isAdmin={loggedInUser?.isAdmin ?? false}
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
      </FormProvider>
    </main>
  );
};
export default ProductPage;
