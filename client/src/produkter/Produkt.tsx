import { useState } from "react";

import useSWR from "swr";

import {
  Alert,
  BodyLong,
  Button,
  Dropdown,
  Heading,
  HGrid,
  HStack,
  Label,
  Loader,
  Modal,
  Tabs,
  VStack,
} from "@navikt/ds-react";

import "./product-page.scss";
import { FormProvider, useForm } from "react-hook-form";
import AboutTab from "./AboutTab";
import VariantsTab from "./VariantsTab";
import FileTab from "./FileTab";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { IsoCategoryDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import {
  deleteProducts,
  publishProducts,
  rejectProducts,
  sendFlereTilGodkjenning,
  updateProduct,
} from "api/ProductApi";
import StatusPanel from "produkter/StatusPanel";
import { CogIcon, ExclamationmarkTriangleIcon, RocketIcon, TrashIcon } from "@navikt/aksel-icons";
import { isUUID } from "utils/string-util";
import VideosTab from "./VideosTab";

export type EditCommonInfoProduct = {
  description: string;
  isoCode: string;
};

const ProductPage = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const activeTab = searchParams.get("tab");

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
  } = useSWR<ProductRegistrationDTO[]>(loggedInUser ? seriesIdPath : null, fetcherGET);

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

  async function onSendTilGodkjenning() {
    sendFlereTilGodkjenning(products?.map((product) => product.id) || [])
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  async function onRejectApproval() {
    rejectProducts(products?.map((product) => product.id) || [])
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  async function onDelete() {
    deleteProducts(products?.map((product) => product.id) || [])
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  async function onPublish() {
    const validationResult = productIsValid();
    setIsValid(validationResult);
    if (validationResult) {
      publishProducts(products?.map((product) => product.id) || [])
        .then(() => mutateProducts())
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
    } else {
      setModalIsOpen(true);
    }
  }

  const numberOfImages = () => {
    return product.productData.media.filter((media) => media.type == "IMAGE").length;
  };

  const numberOfDocuments = () => {
    return product.productData.media.filter((media) => media.type == "PDF").length;
  };

  const numberOfVideos = () => {
    return product.productData.media.filter((media) => media.type == "VIDEO" && media.source === "EXTERNALURL").length;
  };

  const numberOfVariants = () => {
    if (isUUID(product.supplierRef)) {
      return 0;
    }
    return products.length;
  };

  const productIsValid = () => {
    return !(
      !product.productData.attributes.text ||
      numberOfImages() === 0 ||
      numberOfVariants() === 0
    );
  };

  const isDraft = product.draftStatus === "DRAFT";
  const isPending = product.adminStatus === "PENDING";
  const isEditable = product.draftStatus === "DRAFT" || (loggedInUser?.isAdmin ?? false);

  const InvalidProductModal = () => {
    return (
      <Modal open={modalIsOpen} header={{ heading: "Produktet mangler data" }} onClose={() => setModalIsOpen(false)}>
        <Modal.Body>
          <BodyLong spacing>Det er noen feil som du må rette opp.</BodyLong>
          <BodyLong className="product-error-text">Vennligst rett opp følgende feil:</BodyLong>
          <ul className="product-error-text">
            {!product.productData.attributes.text && <li>Produktet mangler en produktbeskrivelse</li>}
            {numberOfImages() === 0 && <li>Produktet mangler bilder</li>}
            {numberOfDocuments() === 0 && <li>Produktet mangler dokumenter</li>}
            {!numberOfVariants() && <li>Produktet mangler teknisk data</li>}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const GodkjenningModal = () => {
    return isValid ? (
      <Modal
        open={modalIsOpen}
        header={{ icon: <RocketIcon aria-hidden />, heading: "Klar for godkjenning?" }}
        onClose={() => setModalIsOpen(false)}
      >
        <Modal.Body>
          <BodyLong>Før du sender til godkjenning, sjekk at:</BodyLong>
          <ul>
            <li>produktbeskrivelsen ikke inneholder tekniske data eller salgsord.</li>
            <li>tekniske data er korrekte.</li>
            <li>produktet inneholder nødvendig brosjyre, bruksanvisning etc.</li>
          </ul>
          <BodyLong>
            <b>Obs:</b> produktet kan ikke endres i perioden det er lagt til godkjenning.
          </BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              onSendTilGodkjenning().then(() => setModalIsOpen(false));
            }}
          >
            Send til godkjenning
          </Button>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    ) : (
      <InvalidProductModal />
    );
  };

  const TabLabel = ({
    title,
    numberOfElementsFn,
    showAlert,
  }: {
    title: string;
    numberOfElementsFn: () => number;
    showAlert: boolean;
  }) => {
    return (
      <>
        {title}
        {numberOfElementsFn() === 0 && !isValid && showAlert ? (
          <span className="product-error-text product-tab-tabel">
            ({numberOfElementsFn()})<ExclamationmarkTriangleIcon />
          </span>
        ) : (
          <span>({numberOfElementsFn()})</span>
        )}
      </>
    );
  };

  return (
    <main className="show-menu">
      <FormProvider {...formMethods}>
        <GodkjenningModal />
        <HGrid gap="12" columns={{ xs: 1, sm: "minmax(16rem, 55rem) 200px" }} className="product-page">
          <VStack gap={{ xs: "4", md: "8" }}>
            <VStack gap="1">
              <Label>Produktnavn</Label>
              <Heading level="1" size="xlarge">
                {product.title ?? product.title}
              </Heading>
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
                <Tabs.Tab
                  value="variants"
                  label={
                    <TabLabel title="Tekniske data / artikler" numberOfElementsFn={numberOfVariants} showAlert={true} />
                  }
                />
              </Tabs.List>
              <AboutTab
                product={product}
                onSubmit={onSubmit}
                isoCategory={isoCategory}
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <FileTab
                products={products}
                mutateProducts={mutateProducts}
                fileType="images"
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <FileTab
                products={products}
                mutateProducts={mutateProducts}
                fileType="documents"
                isEditable={isEditable}
                showInputError={!isValid}
              />
              <VideosTab products={products} mutateProducts={mutateProducts} isEditable={isEditable} />
              <VariantsTab products={products} isEditable={isEditable} showInputError={!isValid} />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: "2", md: "4" }}>
            {loggedInUser?.isAdmin ? (
              product.adminStatus !== "APPROVED" &&
              product.registrationStatus !== "INACTIVE" &&
              product.registrationStatus !== "DELETED" && (
                <HStack align={"end"} gap="2">
                  <PublishButton isAdmin={true} isPending={isPending} isDraft={isDraft} onClick={onPublish} />
                  <Dropdown>
                    <Button
                      variant="secondary"
                      icon={<CogIcon title="Avslå eller slett" />}
                      as={Dropdown.Toggle}
                    ></Button>
                    <Dropdown.Menu>
                      <Dropdown.Menu.GroupedList>
                        <Dropdown.Menu.GroupedList.Item onClick={onRejectApproval}>
                          <ExclamationmarkTriangleIcon aria-hidden />
                          Avslå
                        </Dropdown.Menu.GroupedList.Item>
                      </Dropdown.Menu.GroupedList>
                      <Dropdown.Menu.Divider />
                      <Dropdown.Menu.List>
                        <Dropdown.Menu.List.Item onClick={onDelete}>
                          <TrashIcon aria-hidden />
                          Slett
                        </Dropdown.Menu.List.Item>
                      </Dropdown.Menu.List>
                    </Dropdown.Menu>
                  </Dropdown>
                </HStack>
              )
            ) : (
              <PublishButton
                isAdmin={false}
                isPending={isPending}
                isDraft={isDraft}
                onClick={() => {
                  setIsValid(productIsValid());
                  setModalIsOpen(true);
                }}
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

const PublishButton = ({
  isAdmin,
  isPending,
  isDraft,
  onClick,
}: {
  isAdmin: boolean;
  isPending: boolean;
  isDraft: boolean;
  onClick: () => void;
}) => {
  if (isAdmin) {
    return (
      <Button style={{ marginTop: "20px" }} onClick={onClick}>
        Publiser
      </Button>
    );
  } else if (isDraft) {
    return (
      <Button style={{ marginTop: "20px" }} onClick={onClick}>
        Send til godkjenning
      </Button>
    );
  } else if (isPending) {
    return (
      <Button style={{ marginTop: "20px" }} disabled={true}>
        Send til godkjenning
      </Button>
    );
  } else {
    return <></>;
  }
};
