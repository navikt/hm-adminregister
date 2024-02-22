import React, { useState } from "react";

import useSWR from "swr";

import { Alert, BodyLong, Button, Heading, HGrid, Label, Loader, Modal, Tabs, VStack } from "@navikt/ds-react";

import "./product-page.scss";
import { FormProvider, useForm } from "react-hook-form";
import AboutTab from "./AboutTab";
import VariantsTab from "./VariantsTab";
import FileTab from "./FileTab";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { IsoCategoryDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { HM_REGISTER_URL } from "environments";
import { sendTilGodkjenning, updateProduct } from "api/ProductApi";
import StatusPanel from "produkter/StatusPanel";
import { RocketIcon } from "@navikt/aksel-icons";
import { isUUID } from "utils/string-util";

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
  const { setGlobalError } = useHydratedErrorStore();
  const seriesIdPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/series/${seriesId}`;

  const {
    data: products,
    error,
    isLoading,
    mutate: mutateProducts
  } = useSWR<ProductRegistrationDTO[]>(loggedInUser ? seriesIdPath : null, fetcherGET);

  const {
    data: isoCategory,
    error: isoError,
    isLoading: isoIsLoading
  } = useSWR<IsoCategoryDTO>(
    products && products[0].isoCategory && products[0].isoCategory !== "0"
      ? `${HM_REGISTER_URL()}/admreg/api/v1/isocategories/${products[0].isoCategory}`
      : null,
    fetcherGET
  );

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  const formMethods = useForm<EditCommonInfoProduct>();

  async function onSubmit(data: EditCommonInfoProduct) {
    updateProduct(products!![0].id, data)
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  async function onSendTilGodkjenning() {
    sendTilGodkjenning(products!![0].id)
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  const hasImage = (): boolean => {
    return products!![0].productData.media.filter((media) => media.type == "IMAGE").length > 0;
  };

  const hasDocument = (): boolean => {
    return products!![0].productData.media.filter((media) => media.type == "PDF").length > 0;
  };

  const hasTechnicalData = (): boolean => {
    return products!!.length > 1 || !isUUID(products!![0].supplierRef);
  };

  const validateProduct = () => {
    if (
      !products!![0].productData.attributes.text ||
      !hasImage() ||
      !hasDocument() ||
      !hasTechnicalData()
    ) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

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
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Alert variant="info">Ingen data funnet.</Alert>
      </HGrid>
    );
  }

  const isDraft = products[0].draftStatus === "DRAFT";
  const isPending = products[0].adminStatus === "PENDING";

  const GodkjenningModal = () => {
    return isValid ?
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
      </Modal> :
      <Modal
        open={modalIsOpen}
        header={{ icon: <RocketIcon aria-hidden />, heading: "Klar for godkjenning?" }}
        onClose={() => setModalIsOpen(false)}
      >
        <Modal.Body>
          <BodyLong>Det ser ut til å være noen feil som du må rette opp før du kan sende produktet til
            godkjenning.</BodyLong>
          <BodyLong>Vennligst rett opp følgende feil:</BodyLong>
          <ul>
            {!products[0].productData.attributes.text && <li>Produktet mangler en produktbeskrivelse</li>}
            {!hasImage() && <li>Produktet mangler bilder</li>}
            {!hasDocument() && <li>Produktet mangler dokumenter</li>}
            {!hasTechnicalData() && <li>Produktet mangler teknisk data</li>}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>;
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
                {products[0].title ?? products[0].title}
              </Heading>
            </VStack>
            <Tabs defaultValue={activeTab || "about"} onChange={updateUrlOnTabChange}>
              <Tabs.List>
                <Tabs.Tab value="about" label="Om produktet" />
                <Tabs.Tab value="images" label="Bilder" />
                <Tabs.Tab value="documents" label="Dokumenter" />
                <Tabs.Tab value="variants" label="Teknisk data / artikler" />
              </Tabs.List>
              <AboutTab product={products[0]} onSubmit={onSubmit} isoCategory={isoCategory} showInputError={!isValid} />
              <FileTab products={products} mutateProducts={mutateProducts} fileType="images"
                       showInputError={!isValid} />
              <FileTab products={products} mutateProducts={mutateProducts} fileType="documents"
                       showInputError={!isValid} />
              <VariantsTab products={products} showInputError={!isValid} />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: "2", md: "4" }}>
            {loggedInUser?.isAdmin ? (
              <PublishButton isAdmin={true} isPending={isPending} isDraft={isDraft} onClick={onSendTilGodkjenning} />
            ) : (
              <PublishButton
                isAdmin={false}
                isPending={isPending}
                isDraft={isDraft}
                onClick={() => {
                  validateProduct();
                  setModalIsOpen(true);
                }}
              />
            )}
            <StatusPanel product={products[0]} isAdmin={loggedInUser?.isAdmin || false} />
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
                         onClick
                       }: {
  isAdmin: boolean;
  isPending: boolean;
  isDraft: boolean;
  onClick: any;
}) => {
  if (isDraft) {
    return (
      <Button style={{ marginTop: "20px" }} disabled={isAdmin} onClick={onClick}>
        Send til godkjenning
      </Button>
    );
  } else if (isAdmin && isPending) {
    return <Button style={{ marginTop: "20px" }}>Publiser</Button>;
  } else if (!isAdmin && isPending) {
    return (
      <Button style={{ marginTop: "20px" }} disabled={true}>
        Send til godkjenning
      </Button>
    );
  } else {
    return (
      <Button style={{ marginTop: "20px" }} disabled={true}>
        Publiser
      </Button>
    );
  }
};
