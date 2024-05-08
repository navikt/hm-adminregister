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
import { IsoCategoryDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import { updateProduct } from "api/ProductApi";
import StatusPanel from "produkter/StatusPanel";
import { ExclamationmarkTriangleIcon, FloppydiskIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import VideosTab from "./tabs/VideosTab";
import ImageTab from "./tabs/ImagesTab";
import DocumentTab from "./tabs/DocumentsTab";
import { numberOfDocuments, numberOfImages, numberOfVariants, numberOfVideos } from "produkter/productUtils";
import { RequestApprovalModal } from "produkter/RequestApprovalModal";
import { DeleteConfirmationModal } from "produkter/DeleteConfirmationModal";
import AdminActions from "produkter/AdminActions";
import SupplierActions from "produkter/SupplierActions";

export type EditCommonInfoProduct = {
  title: string;
  description: string;
  isoCode: string;
};

const ProductPage = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [approvalModalIsOpen, setApprovalModalIsOpen] = useState(false);
  const [deleteConfirmationModalIsOpen, setDeleteConfirmationModalIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const activeTab = searchParams.get("tab");

  const [showEditProductTitleMode, setShowEditProductTitleMode] = useState(false);

  const handleSaveDescription = () => {
    setShowEditProductTitleMode(false);
    formMethods.handleSubmit(onSubmit)();
  };

  const { seriesId } = useParams();

  const navigate = useNavigate();

  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const seriesIdPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/series/${seriesId}`;

  const {
    data: products,
    error,
    isLoading,
    mutate: mutateProducts,
  } = useSWR<ProductRegistrationDTO[]>(seriesIdPath, fetcherGET);

  const { data: isoCategory } = useSWR<IsoCategoryDTO>(
    products && products[0]?.isoCategory && products[0].isoCategory !== "0"
      ? `${HM_REGISTER_URL()}/admreg/api/v1/isocategories/${products[0].isoCategory}`
      : null,
    fetcherGET,
  );

  const formMethods = useForm<EditCommonInfoProduct>();

  if (error) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        Error
      </HGrid>
    );
  }

  if (isLoading) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!products || products.length === 0) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="info">Ingen data funnet.</Alert>
        </HGrid>
      </main>
    );
  }

  const product = products[0];

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  async function onSubmit(data: EditCommonInfoProduct) {
    updateProduct(product.id, data, loggedInUser?.isAdmin || false)
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  const productIsValid = () => {
    return !(
      !product.productData.attributes.text ||
      numberOfImages(products) === 0 ||
      numberOfVariants(products) === 0
    );
  };

  const isDraft = product.draftStatus === "DRAFT";
  const isPending = product.adminStatus === "PENDING";
  const isActive = product.registrationStatus === "ACTIVE";
  const isEditable = (product.draftStatus === "DRAFT" || (loggedInUser?.isAdmin ?? false)) && isActive;

  const TabLabel = ({
    title,
    numberOfElementsFn,
    showAlert,
  }: {
    title: string;
    numberOfElementsFn: (products: ProductRegistrationDTO[]) => number;
    showAlert: boolean;
  }) => {
    return (
      <>
        {title}
        {numberOfElementsFn(products) === 0 && !isValid && showAlert ? (
          <span className="product-error-text product-tab-tabel">
            ({numberOfElementsFn(products)})<ExclamationmarkTriangleIcon />
          </span>
        ) : (
          <span>({numberOfElementsFn(products)})</span>
        )}
      </>
    );
  };

  return (
    <main className="show-menu">
      <FormProvider {...formMethods}>
        <RequestApprovalModal
          products={products}
          mutateProducts={mutateProducts}
          isValid={isValid}
          isOpen={approvalModalIsOpen}
          setIsOpen={setApprovalModalIsOpen}
        />
        <DeleteConfirmationModal
          products={products}
          mutateProducts={mutateProducts}
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
                    {product.title ?? product.title}
                  </Heading>
                )}

                {showEditProductTitleMode && (
                  <>
                    <TextField
                      defaultValue={product.title ?? (product.title || "")}
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
                      {!product.productData.attributes.text && !isValid && (
                        <ExclamationmarkTriangleIcon className="product-error-text" />
                      )}
                    </>
                  }
                />
                <Tabs.Tab
                  value="variants"
                  label={
                    <>
                      Egenskaper
                      {numberOfVariants(products) === 0 && !isValid && (
                        <ExclamationmarkTriangleIcon className="product-error-text" />
                      )}
                    </>
                  }
                />
                <Tabs.Tab
                  value="images"
                  label={<TabLabel title="Bilder" numberOfElementsFn={numberOfImages} showAlert={true} />}
                />
                <Tabs.Tab
                  value="documents"
                  label={<TabLabel title="Dokumenter" numberOfElementsFn={numberOfDocuments} showAlert={false} />}
                />
                <Tabs.Tab
                  value="videos"
                  label={<TabLabel title="Videolenker" numberOfElementsFn={numberOfVideos} showAlert={false} />}
                />
              </Tabs.List>
              <AboutTab
                product={product}
                onSubmit={onSubmit}
                isoCategory={isoCategory}
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <ImageTab
                products={products}
                mutateProducts={mutateProducts}
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <DocumentTab
                products={products}
                mutateProducts={mutateProducts}
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <VideosTab products={products} mutateProducts={mutateProducts} isEditable={isEditable} />
              <VariantsTab products={products} isEditable={isEditable} showInputError={!isValid} />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: "2", md: "4" }}>
            {loggedInUser?.isAdmin && isActive && (
              <AdminActions
                products={products}
                mutateProducts={mutateProducts}
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
            <StatusPanel product={product} isAdmin={loggedInUser?.isAdmin || false} />
          </VStack>
        </HGrid>
      </FormProvider>
    </main>
  );
};
export default ProductPage;
