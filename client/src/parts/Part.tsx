import { Link, useParams } from "react-router-dom";

import { ArrowLeftIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Heading,
  HGrid,
  HStack,
  Label,
  Link as AkselLink,
  Loader,
  Switch,
  Tabs,
  Tag,
  TextField,
  VStack,
} from "@navikt/ds-react";

import ErrorAlert from "error/ErrorAlert";
import {
  approvePart,
  updateEgnetForBrukerpassbruker,
  updateEgnetForKommunalTekniker,
  updatePart,
  usePartByProductId
} from "api/PartApi";
import { HM_REGISTER_URL } from "environments";
import { SeriesCompabilityTab } from "parts/compatibility/SeriesCompabilityTab";
import { useState } from "react";
import { setPublishedSeriesToDraft, useSeriesV2Conditional } from "api/SeriesApi";
import { numberOfImages } from "products/seriesUtils";
import { TabLabel } from "felleskomponenter/TabLabel";
import ImagesTab from "parts/ImagesTab";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import styles from "products/ProductPage.module.scss";
import StatusPanel from "products/StatusPanel";
import ActionsMenu from "parts/ActionsMenu";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { UpdatePartDTO } from "utils/types/response-types";

const Part = () => {
  const { productId } = useParams();

  const { part, isLoading, error, mutatePart } = usePartByProductId(productId!);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
    mutate: mutateSeries,
  } = useSeriesV2Conditional(part?.seriesUUID || undefined);

  const [isTogglingKT, setIsTogglingKT] = useState(false);

  const { loggedInUser } = useAuthStore();
  const isAdminOrHmsUser = loggedInUser?.isAdminOrHmsUser || false;

  const { setGlobalError } = useErrorStore();

  const [productTitle, setProductTitle] = useState(part?.articleName ?? "");

  const [hmsNr, setHmsNr] = useState(part?.hmsArtNr ?? "");

  const [levartNr, setLevartNr] = useState(part?.supplierRef ?? "");

  const [editProductModalIsOpen, setEditProductModalIsOpen] = useState(false);
  const [confirmApproveModalIsOpen, setConfirmApproveModalIsOpen] = useState<boolean>(false);

  const handleSaveName = () => {
    const updatePartDto = {
      title: productTitle,
    }
    handleSavePartInfo(updatePartDto);
  };

  const handleSaveSupplierRef = () => {
    const updatePartDto = {
      supplierRef: levartNr,
    }
    handleSavePartInfo(updatePartDto);
  };

  const handleSaveHmsNr = () => {
    const updatePartDto = {
      hmsArtNr: hmsNr,
    }
    handleSavePartInfo(updatePartDto);
  };

  const handleSavePartInfo = (updatePartDto: UpdatePartDTO) => {
    updatePart(series!.id, updatePartDto)
      .then(() => {
        mutatePart()
      })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message)
      });
  }


  const toggleEgnetForKommunalTekniker = (checked: boolean, id: string) => {
    setIsTogglingKT(true);
    updateEgnetForKommunalTekniker(id, checked).then(() => {
      mutatePart();
    });
    setIsTogglingKT(false);
  };
  const toggleEgnetForBrukerpassbruker = (checked: boolean, id: string) => {
    updateEgnetForBrukerpassbruker(id, checked).then(() => {
      mutatePart();
    });
  };

  if (isLoading || isLoadingSeries) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!part || error || !productId || !series) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
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

  async function onPublish() {
    if (series) {
      setConfirmApproveModalIsOpen(false);
      approvePart(series.id).then(
        () => {
          mutatePart()
          mutateSeries()
        }
      ).catch((error) => {
        setGlobalError(error.status, error.message);
      });
    }
  }

  const isEditable = series.status === "EDITABLE";


  return (
    <main className="show-menu">
      <ConfirmModal
        title={"Vil du sette delen i redigeringsmodus?"}
        confirmButtonText={"OK"}
        onClick={onEditMode}
        onClose={() => setEditProductModalIsOpen(false)}
        isModalOpen={editProductModalIsOpen}
      />
      <ConfirmModal
        title={"Vil du publisere delen?"}
        confirmButtonText={"Publiser"}
        onClick={onPublish}
        onClose={() => {
          setConfirmApproveModalIsOpen(false);
        }}
        isModalOpen={confirmApproveModalIsOpen}
      />
      <HGrid
        gap="12"
        columns={{ xs: 1, sm: "minmax(16rem, 48rem) 200px", xl: "minmax(16rem, 48rem) 250px" }}
        className={styles.productPage}
      >
        <VStack gap={{ xs: "6", md: "10" }}>
          <VStack gap="6">
            <AkselLink
              as={Link}
              to="/deler"
              onClick={() => {
                history.back();
              }}
            >
              <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
              Tilbake
            </AkselLink>
            <VStack gap="2">
              <Label> Navn på del</Label>
              <HStack gap="1">
                {isEditable && (
                  <TextField
                    defaultValue={part.articleName ?? ""}
                    label={""}
                    aria-label="Rediger tittel"
                    id="title"
                    name="title"
                    onChange={(event) => setProductTitle(event.currentTarget.value)}
                    style={{ width: "20rem" }}
                    onBlur={handleSaveName}
                  />
                )}

                {!isEditable && (
                  <Heading level="1" size="xlarge">
                    {loggedInUser?.isAdmin && series.published ? (
                      <a
                        href={`${HM_REGISTER_URL()}/produkt/${series.id}`}
                        target="_blank"
                        className={styles.headingLink}
                        rel="noreferrer"
                      >
                        {part.articleName ?? ""}
                      </a>
                    ) : (
                      <>{part.articleName ?? ""}</>
                    )}
                  </Heading>
                )}
              </HStack>

              {part.isExpired && (
                <Box>
                  <Tag variant="warning-moderate">Utgått</Tag>
                </Box>
              )}
            </VStack>

            <HGrid gap={{ xs: "8", md: "10" }} columns={{ xs: 1, lg: 2 }}>
              <VStack gap="4">

                <VStack>
                  <Label>Type</Label>
                  <BodyShort>{part.accessory === true ? "Tilbehør" : "Reservedel"}</BodyShort>
                </VStack>

                <VStack>
                  <Label> Lev-artnr</Label>
                  {isEditable && (
                    <TextField
                      defaultValue={part.supplierRef ?? ""}
                      label={""}
                      aria-label="Rediger tittel"
                      id="title"
                      name="title"
                      onChange={(event) => setLevartNr(event.currentTarget.value)}
                      style={{ width: "20rem" }}
                      onBlur={handleSaveSupplierRef}
                    />
                  )}
                  {!isEditable && (
                    <BodyShort>{part.supplierRef ? part.supplierRef : "-"}</BodyShort>
                  )}

                </VStack>

                <VStack>
                  <Label> HMS-nummer</Label>

                  {isAdminOrHmsUser  && isEditable ? (
                    <TextField
                      defaultValue={part.hmsArtNr ?? ""}
                      label={""}
                      aria-label="Rediger tittel"
                      id="title"
                      name="title"
                      onChange={(event) => setHmsNr(event.currentTarget.value)}
                      style={{ width: "20rem" }}
                      onBlur={handleSaveHmsNr}
                    />
                  ) : (
                    <BodyShort>{part.hmsArtNr ? part.hmsArtNr : "-"}</BodyShort>
                  )}
                </VStack>

                {isAdminOrHmsUser && (
                  <>
                      <Switch
                        disabled={isTogglingKT || !isEditable}
                        checked={part.productData.attributes.egnetForKommunalTekniker || false}
                        onChange={(e) => toggleEgnetForKommunalTekniker(e.target.checked, part.id)}
                      >
                        Egnet for kommunal tekniker
                      </Switch>

                      <Switch
                        disabled={!isEditable}
                        checked={part.productData.attributes.egnetForBrukerpass || false}
                        onChange={(e) => toggleEgnetForBrukerpassbruker(e.target.checked, part.id)}
                      >
                        Egnet for brukerpassbruker
                      </Switch>
                  </>
                )}
              </VStack>

            </HGrid>
          </VStack>

          <Tabs defaultValue={"images"}>
            <Tabs.List>
              <Tabs.Tab
                value={"images"}
                label={
                  <TabLabel title="Bilder" numberOfElements={numberOfImages(series)} showAlert={false} isValid={true} />
                }
              />
              <Tabs.Tab
                value={"seriekoblinger"}
                label={`Koblinger til produktserier  (${part.productData.attributes.compatibleWith?.seriesIds.length ?? 0})`}
              />

            </Tabs.List>
            <ImagesTab series={series} isEditable={isEditable} showInputError={false} mutateSeries={mutateSeries} />
            <Tabs.Panel value={"seriekoblinger"}>
              <SeriesCompabilityTab
                partId={productId}
                productIds={part.productData.attributes.compatibleWith?.productIds ?? []}
                seriesIds={part.productData.attributes.compatibleWith?.seriesIds ?? []}
                mutatePart={mutatePart}
                isEditable={ isEditable }
              />
            </Tabs.Panel>

          </Tabs>
        </VStack>
        <VStack gap={{ xs: "6", md: "10" }}>
          <ActionsMenu
            series={series}
            setDeleteConfirmationModalIsOpen={() => {
            }}
            setExpiredSeriesModalIsOpen={() => {
            }}
            setEditProductModalIsOpen={setEditProductModalIsOpen}
            setConfirmApproveModalIsOpen={setConfirmApproveModalIsOpen}
          />
          <StatusPanel series={series} />
        </VStack>
      </HGrid>
    </main>
  );
};
export default Part;
